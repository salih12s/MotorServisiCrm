const express = require('express');
const pool = require('../config/db');
const { logAktivite, getRequestInfo } = require('../config/activityLogger');
const { sourcePaymentJoin, sourcePaymentColumns } = require('../domain/sourcePaymentSummary');

const router = express.Router();

const validatePayments = (total, values) => {
  const parsed = values.map((value) => Number(value || 0));
  if (parsed.some((value) => !Number.isFinite(value) || value < 0)) return { error: 'Ödeme tutarları geçersiz olamaz.' };
  const paid = parsed.reduce((sum, value) => sum + value, 0);
  if (paid > Number(total || 0) + 0.005) return { error: 'Girilen ödemeler satış tutarını aşamaz.' };
  return { values: parsed, paid };
};

const ensureCustomer = async (client, name, phone) => {
  const normalized = String(phone || '').replace(/[^0-9]/g, '');
  if (!normalized) return;
  const existing = await client.query("SELECT id FROM musteriler WHERE REGEXP_REPLACE(COALESCE(telefon, ''), '[^0-9]', '', 'g') = $1 ORDER BY id LIMIT 1", [normalized]);
  if (!existing.rowCount) await client.query('INSERT INTO musteriler (ad_soyad, telefon, aktif) VALUES ($1, $2, TRUE)', [name || 'Aksesuar Müşterisi', phone]);
};

// Tüm aksesuar kayıtlarını parçalarıyla birlikte getir
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.id, a.ad_soyad, a.telefon, a.odeme_sekli, a.aciklama, a.durum, a.odeme_detaylari,
       TO_CHAR(a.satis_tarihi, 'YYYY-MM-DD') as satis_tarihi,
       a.toplam_maliyet, a.toplam_satis, a.kar, a.odeme_tutari, a.created_at,
       a.olusturan_kisi, k.ad_soyad as olusturan_ad_soyad, k.kullanici_adi as olusturan_kullanici_adi,
       ${sourcePaymentColumns('a', 'COALESCE(a.toplam_satis, 0)', "CASE WHEN a.odeme_bilgisi_girildi THEN 0 ELSE COALESCE(a.odeme_tutari, 0) END")}
       FROM aksesuarlar a
       LEFT JOIN kullanicilar k ON a.olusturan_kullanici_id = k.id
       ${sourcePaymentJoin('AKSESUAR', 'a')}
       ORDER BY a.created_at DESC`
    );
    
    // Her aksesuar için parçaları getir
    const aksesuarlar = await Promise.all(result.rows.map(async (aksesuar) => {
      const parcalarResult = await pool.query(
        'SELECT * FROM aksesuar_parcalar WHERE aksesuar_id = $1 ORDER BY id',
        [aksesuar.id]
      );
      return {
        ...aksesuar,
        parcalar: parcalarResult.rows
      };
    }));
    
    res.json(aksesuarlar);
  } catch (error) {
    console.error('Aksesuar listesi hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Tek aksesuar kaydı parçalarıyla birlikte getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT a.id, a.ad_soyad, a.telefon, a.odeme_sekli, a.aciklama, a.durum, a.odeme_detaylari,
       TO_CHAR(a.satis_tarihi, 'YYYY-MM-DD') as satis_tarihi,
       a.toplam_maliyet, a.toplam_satis, a.kar, a.odeme_tutari, a.created_at,
       a.olusturan_kisi, k.ad_soyad as olusturan_ad_soyad, k.kullanici_adi as olusturan_kullanici_adi,
       ${sourcePaymentColumns('a', 'COALESCE(a.toplam_satis, 0)', "CASE WHEN a.odeme_bilgisi_girildi THEN 0 ELSE COALESCE(a.odeme_tutari, 0) END")}
       FROM aksesuarlar a
       LEFT JOIN kullanicilar k ON a.olusturan_kullanici_id = k.id
       ${sourcePaymentJoin('AKSESUAR', 'a')}
       WHERE a.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Aksesuar kaydı bulunamadı' });
    }
    
    // Parçaları getir
    const parcalarResult = await pool.query(
      'SELECT * FROM aksesuar_parcalar WHERE aksesuar_id = $1 ORDER BY id',
      [id]
    );
    
    res.json({
      ...result.rows[0],
      parcalar: parcalarResult.rows
    });
  } catch (error) {
    console.error('Aksesuar detay hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni aksesuar kaydı oluştur
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { ad_soyad, telefon, odeme_sekli, nakit_tutar, kart_tutar, havale_tutar, aciklama, durum, odeme_detaylari, satis_tarihi, olusturan_kisi, parcalar = [] } = req.body;
    const olusturan_kullanici_id = req.user?.id || null;
    await ensureCustomer(client, ad_soyad, telefon);
    
    // Toplamları hesapla
    let toplam_maliyet = 0;
    let toplam_satis = 0;
    
    parcalar.forEach(p => {
      const adet = parseInt(p.adet) || 1;
      toplam_maliyet += adet * (parseFloat(p.maliyet) || 0);
      toplam_satis += adet * (parseFloat(p.satis_fiyati) || 0);
    });
    
    const kar = toplam_satis - toplam_maliyet;
    const payment = validatePayments(toplam_satis, [nakit_tutar, kart_tutar, havale_tutar]);
    if (payment.error) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: payment.error });
    }
    
    // Ana aksesuar kaydını oluştur
    const result = await client.query(
      `INSERT INTO aksesuarlar (ad_soyad, telefon, odeme_sekli, aciklama, durum, odeme_detaylari, satis_tarihi, toplam_maliyet, toplam_satis, kar, odeme_tutari, olusturan_kullanici_id, olusturan_kisi, nakit_tutar, kart_tutar, havale_tutar, odeme_bilgisi_girildi)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, TRUE)
       RETURNING *`,
      [ad_soyad, telefon, odeme_sekli, aciklama, durum || 'beklemede', odeme_detaylari, satis_tarihi || new Date(), toplam_maliyet, toplam_satis, kar, payment.paid, olusturan_kullanici_id, olusturan_kisi || null, ...payment.values]
    );
    
    const aksesuarId = result.rows[0].id;
    
    // Parçaları ekle
    for (const parca of parcalar) {
      await client.query(
        `INSERT INTO aksesuar_parcalar (aksesuar_id, urun_adi, adet, maliyet, satis_fiyati)
         VALUES ($1, $2, $3, $4, $5)`,
        [aksesuarId, parca.urun_adi, parseInt(parca.adet) || 1, parseFloat(parca.maliyet) || 0, parseFloat(parca.satis_fiyati) || 0]
      );
    }

    // Sadece durum 'tamamlandi' ise stoktan düş
    if ((durum || 'beklemede') === 'tamamlandi') {
      for (const parca of parcalar) {
        const adet = parseInt(parca.adet) || 1;
        await client.query(
          `UPDATE aksesuar_stok 
           SET cikan_miktar = cikan_miktar + $1,
               mevcut = giren_miktar - (cikan_miktar + $1),
               envanter_degeri = (giren_miktar - (cikan_miktar + $1)) * satis_fiyati,
               updated_at = CURRENT_TIMESTAMP
           WHERE stok_adi = $2`,
          [adet, parca.urun_adi]
        );
      }
    }
    
    await client.query('COMMIT');
    
    // Parçaları dahil ederek yanıt ver
    const parcalarResult = await pool.query(
      'SELECT * FROM aksesuar_parcalar WHERE aksesuar_id = $1 ORDER BY id',
      [aksesuarId]
    );
    
    // Aktivite logu
    try {
      const { kullaniciId, kullaniciAdi, ipAdresi, tarayiciBilgisi } = getRequestInfo(req);
      await logAktivite({
        kullaniciId,
        kullaniciAdi,
        islemTipi: 'AKSESUAR_OLUSTURMA',
        islemDetay: `Yeni aksesuar satışı: ${ad_soyad}`,
        hedefTablo: 'aksesuarlar',
        hedefId: aksesuarId,
        ipAdresi,
        tarayiciBilgisi
      });
    } catch (logError) {
      console.error('Aktivite log hatası:', logError);
    }
    
    res.status(201).json({
      ...result.rows[0],
      parcalar: parcalarResult.rows
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Aksesuar oluşturma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  } finally {
    client.release();
  }
});

// Aksesuar kaydını güncelle
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { ad_soyad, telefon, odeme_sekli, nakit_tutar, kart_tutar, havale_tutar, aciklama, durum, odeme_detaylari, satis_tarihi, olusturan_kisi, parcalar = [] } = req.body;
    await ensureCustomer(client, ad_soyad, telefon);
    
    // Mevcut durumu al
    const mevcutDurum = await client.query('SELECT durum FROM aksesuarlar WHERE id = $1', [id]);
    const eskiDurum = mevcutDurum.rows[0]?.durum;
    
    // Toplamları hesapla
    let toplam_maliyet = 0;
    let toplam_satis = 0;
    
    parcalar.forEach(p => {
      const adet = parseInt(p.adet) || 1;
      toplam_maliyet += adet * (parseFloat(p.maliyet) || 0);
      toplam_satis += adet * (parseFloat(p.satis_fiyati) || 0);
    });
    
    const kar = toplam_satis - toplam_maliyet;
    const payment = validatePayments(toplam_satis, [nakit_tutar, kart_tutar, havale_tutar]);
    if (payment.error) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: payment.error });
    }
    
    // Tamamlama tarihi mantığı
    let tamamlamaTarihiQuery = '';
    if (durum === 'tamamlandi' && eskiDurum !== 'tamamlandi') {
      // Yeni tamamlandı, tarihi ayarla
      tamamlamaTarihiQuery = ', tamamlama_tarihi = CURRENT_TIMESTAMP';
    } else if (durum !== 'tamamlandi') {
      // Tamamlandı değilse, tarihi sıfırla
      tamamlamaTarihiQuery = ', tamamlama_tarihi = NULL';
    }
    
    // Ana aksesuar kaydını güncelle
    const result = await client.query(
      `UPDATE aksesuarlar 
       SET ad_soyad = $1, telefon = $2, odeme_sekli = $3, aciklama = $4, 
           durum = $5, odeme_detaylari = $6, satis_tarihi = $7, toplam_maliyet = $8, toplam_satis = $9, 
           kar = $10, odeme_tutari = $11, olusturan_kisi = COALESCE($12, olusturan_kisi),
           olusturan_kullanici_id = COALESCE(olusturan_kullanici_id, $13),
           nakit_tutar = $14, kart_tutar = $15, havale_tutar = $16, odeme_bilgisi_girildi = TRUE,
           updated_at = CURRENT_TIMESTAMP${tamamlamaTarihiQuery}
       WHERE id = $17
       RETURNING *`,
      [ad_soyad, telefon, odeme_sekli, aciklama, durum || 'beklemede', odeme_detaylari, satis_tarihi, toplam_maliyet, toplam_satis, kar, payment.paid, olusturan_kisi || null, req.user?.id || null, ...payment.values, id]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Aksesuar kaydı bulunamadı' });
    }
    
    // Eski durum tamamlandı ise eski parçaları stoğa geri ekle
    if (eskiDurum === 'tamamlandi') {
      const eskiParcalar = await client.query('SELECT urun_adi, adet FROM aksesuar_parcalar WHERE aksesuar_id = $1', [id]);
      for (const eskiParca of eskiParcalar.rows) {
        const adet = parseInt(eskiParca.adet) || 1;
        await client.query(
          `UPDATE aksesuar_stok 
           SET cikan_miktar = GREATEST(cikan_miktar - $1, 0),
               mevcut = giren_miktar - GREATEST(cikan_miktar - $1, 0),
               envanter_degeri = (giren_miktar - GREATEST(cikan_miktar - $1, 0)) * satis_fiyati,
               updated_at = CURRENT_TIMESTAMP
           WHERE stok_adi = $2`,
          [adet, eskiParca.urun_adi]
        );
      }
    }

    // Mevcut parçaları sil
    await client.query('DELETE FROM aksesuar_parcalar WHERE aksesuar_id = $1', [id]);
    
    // Yeni parçaları ekle
    for (const parca of parcalar) {
      await client.query(
        `INSERT INTO aksesuar_parcalar (aksesuar_id, urun_adi, adet, maliyet, satis_fiyati)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, parca.urun_adi, parseInt(parca.adet) || 1, parseFloat(parca.maliyet) || 0, parseFloat(parca.satis_fiyati) || 0]
      );
    }

    // Yeni durum tamamlandı ise stoktan düş
    if (durum === 'tamamlandi') {
      for (const parca of parcalar) {
        const adet = parseInt(parca.adet) || 1;
        await client.query(
          `UPDATE aksesuar_stok 
           SET cikan_miktar = cikan_miktar + $1,
               mevcut = giren_miktar - (cikan_miktar + $1),
               envanter_degeri = (giren_miktar - (cikan_miktar + $1)) * satis_fiyati,
               updated_at = CURRENT_TIMESTAMP
           WHERE stok_adi = $2`,
          [adet, parca.urun_adi]
        );
      }
    }
    
    await client.query('COMMIT');
    
    // Parçaları dahil ederek yanıt ver
    const parcalarResult = await pool.query(
      'SELECT * FROM aksesuar_parcalar WHERE aksesuar_id = $1 ORDER BY id',
      [id]
    );
    
    res.json({
      ...result.rows[0],
      parcalar: parcalarResult.rows
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Aksesuar güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  } finally {
    client.release();
  }
});

// Aksesuar kaydını sil
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    // Mevcut durumu ve parçaları al
    const mevcutKayit = await client.query('SELECT durum FROM aksesuarlar WHERE id = $1', [id]);
    if (mevcutKayit.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Aksesuar kaydı bulunamadı' });
    }

    const eskiDurum = mevcutKayit.rows[0].durum;

    // Tamamlandı ise stokları geri ekle
    if (eskiDurum === 'tamamlandi') {
      const eskiParcalar = await client.query('SELECT urun_adi, adet FROM aksesuar_parcalar WHERE aksesuar_id = $1', [id]);
      for (const parca of eskiParcalar.rows) {
        const adet = parseInt(parca.adet) || 1;
        await client.query(
          `UPDATE aksesuar_stok 
           SET cikan_miktar = GREATEST(cikan_miktar - $1, 0),
               mevcut = giren_miktar - GREATEST(cikan_miktar - $1, 0),
               envanter_degeri = (giren_miktar - GREATEST(cikan_miktar - $1, 0)) * satis_fiyati,
               updated_at = CURRENT_TIMESTAMP
           WHERE stok_adi = $2`,
          [adet, parca.urun_adi]
        );
      }
    }

    await client.query('DELETE FROM aksesuarlar WHERE id = $1', [id]);
    await client.query('COMMIT');
    
    res.json({ message: 'Aksesuar kaydı silindi' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Aksesuar silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  } finally {
    client.release();
  }
});

// İstatistikler
router.get('/stats/genel', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as toplam_satis,
        COALESCE(SUM(toplam_satis), 0) as toplam_tutar,
        COALESCE(SUM(kar), 0) as toplam_kar
      FROM aksesuarlar
    `);
    
    const bugunResult = await pool.query(`
      SELECT 
        COUNT(*) as bugun_satis,
        COALESCE(SUM(toplam_satis), 0) as bugun_tutar
      FROM aksesuarlar
      WHERE DATE(created_at) = CURRENT_DATE
    `);
    
    res.json({
      toplam_satis: parseInt(result.rows[0].toplam_satis),
      toplam_tutar: parseFloat(result.rows[0].toplam_tutar),
      toplam_kar: parseFloat(result.rows[0].toplam_kar),
      bugun_satis: parseInt(bugunResult.rows[0].bugun_satis),
      bugun_tutar: parseFloat(bugunResult.rows[0].bugun_tutar)
    });
  } catch (error) {
    console.error('Aksesuar istatistik hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
