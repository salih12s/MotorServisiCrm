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
  if (!existing.rowCount) await client.query('INSERT INTO musteriler (ad_soyad, telefon, aktif) VALUES ($1, $2, TRUE)', [name || 'Hobi Grup Müşterisi', phone]);
};

// Tüm bisiklet satış kayıtlarını parçalarıyla birlikte getir
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.ad_soyad, b.telefon, b.odeme_sekli, b.aciklama, b.durum, b.odeme_detaylari,
       TO_CHAR(b.satis_tarihi, 'YYYY-MM-DD') as satis_tarihi,
       b.toplam_maliyet, b.toplam_satis, b.kar, b.odeme_tutari, b.created_at,
       b.olusturan_kisi, k.ad_soyad as olusturan_ad_soyad, k.kullanici_adi as olusturan_kullanici_adi,
       ${sourcePaymentColumns('b', 'COALESCE(b.toplam_satis, 0)', "CASE WHEN b.odeme_bilgisi_girildi THEN 0 ELSE COALESCE(b.odeme_tutari, 0) END")}
       FROM bisiklet_satislar b
       LEFT JOIN kullanicilar k ON b.olusturan_kullanici_id = k.id
       ${sourcePaymentJoin('HOBI_GRUP', 'b')}
       ORDER BY b.created_at DESC`
    );

    // Her satış için parçaları getir
    const satislar = await Promise.all(result.rows.map(async (satis) => {
      const parcalarResult = await pool.query(
        'SELECT * FROM bisiklet_satis_parcalar WHERE bisiklet_satis_id = $1 ORDER BY id',
        [satis.id]
      );
      return {
        ...satis,
        parcalar: parcalarResult.rows
      };
    }));

    res.json(satislar);
  } catch (error) {
    console.error('Bisiklet satış listesi hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Tek bisiklet satış kaydı parçalarıyla birlikte getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT b.id, b.ad_soyad, b.telefon, b.odeme_sekli, b.aciklama, b.durum, b.odeme_detaylari,
       TO_CHAR(b.satis_tarihi, 'YYYY-MM-DD') as satis_tarihi,
       b.toplam_maliyet, b.toplam_satis, b.kar, b.odeme_tutari, b.created_at,
       b.olusturan_kisi, k.ad_soyad as olusturan_ad_soyad, k.kullanici_adi as olusturan_kullanici_adi,
       ${sourcePaymentColumns('b', 'COALESCE(b.toplam_satis, 0)', "CASE WHEN b.odeme_bilgisi_girildi THEN 0 ELSE COALESCE(b.odeme_tutari, 0) END")}
       FROM bisiklet_satislar b
       LEFT JOIN kullanicilar k ON b.olusturan_kullanici_id = k.id
       ${sourcePaymentJoin('HOBI_GRUP', 'b')}
       WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Satış kaydı bulunamadı' });
    }

    const parcalarResult = await pool.query(
      'SELECT * FROM bisiklet_satis_parcalar WHERE bisiklet_satis_id = $1 ORDER BY id',
      [id]
    );

    res.json({
      ...result.rows[0],
      parcalar: parcalarResult.rows
    });
  } catch (error) {
    console.error('Bisiklet satış detay hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni bisiklet satış kaydı oluştur
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

    const result = await client.query(
      `INSERT INTO bisiklet_satislar (ad_soyad, telefon, odeme_sekli, aciklama, durum, odeme_detaylari, satis_tarihi, toplam_maliyet, toplam_satis, kar, odeme_tutari, olusturan_kullanici_id, olusturan_kisi, nakit_tutar, kart_tutar, havale_tutar, odeme_bilgisi_girildi)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, TRUE)
       RETURNING *`,
      [ad_soyad, telefon, odeme_sekli, aciklama, durum || 'beklemede', odeme_detaylari, satis_tarihi || new Date(), toplam_maliyet, toplam_satis, kar, payment.paid, olusturan_kullanici_id, olusturan_kisi || null, ...payment.values]
    );

    const satisId = result.rows[0].id;

    // Parçaları ekle
    for (const parca of parcalar) {
      await client.query(
        `INSERT INTO bisiklet_satis_parcalar (bisiklet_satis_id, urun_adi, adet, maliyet, satis_fiyati)
         VALUES ($1, $2, $3, $4, $5)`,
        [satisId, parca.urun_adi, parseInt(parca.adet) || 1, parseFloat(parca.maliyet) || 0, parseFloat(parca.satis_fiyati) || 0]
      );
    }

    // Sadece durum 'tamamlandi' ise stoktan düş
    if ((durum || 'beklemede') === 'tamamlandi') {
      for (const parca of parcalar) {
        const adet = parseInt(parca.adet) || 1;
        await client.query(
          `UPDATE bisiklet_stok
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

    const parcalarResult = await pool.query(
      'SELECT * FROM bisiklet_satis_parcalar WHERE bisiklet_satis_id = $1 ORDER BY id',
      [satisId]
    );

    // Aktivite logu
    try {
      const { kullaniciId, kullaniciAdi, ipAdresi, tarayiciBilgisi } = getRequestInfo(req);
      await logAktivite({
        kullaniciId,
        kullaniciAdi,
        islemTipi: 'BISIKLET_SATIS_OLUSTURMA',
        islemDetay: `Yeni hobi grup satışı: ${ad_soyad}`,
        hedefTablo: 'bisiklet_satislar',
        hedefId: satisId,
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
    console.error('Bisiklet satış oluşturma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  } finally {
    client.release();
  }
});

// Bisiklet satış kaydını güncelle
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { ad_soyad, telefon, odeme_sekli, nakit_tutar, kart_tutar, havale_tutar, aciklama, durum, odeme_detaylari, satis_tarihi, olusturan_kisi, parcalar = [] } = req.body;
    await ensureCustomer(client, ad_soyad, telefon);

    // Mevcut durumu al
    const mevcutDurum = await client.query('SELECT durum FROM bisiklet_satislar WHERE id = $1', [id]);
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
      tamamlamaTarihiQuery = ', tamamlama_tarihi = CURRENT_TIMESTAMP';
    } else if (durum !== 'tamamlandi') {
      tamamlamaTarihiQuery = ', tamamlama_tarihi = NULL';
    }

    const result = await client.query(
      `UPDATE bisiklet_satislar
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
      return res.status(404).json({ message: 'Satış kaydı bulunamadı' });
    }

    // Eski durum tamamlandı ise eski parçaları stoğa geri ekle
    if (eskiDurum === 'tamamlandi') {
      const eskiParcalar = await client.query('SELECT urun_adi, adet FROM bisiklet_satis_parcalar WHERE bisiklet_satis_id = $1', [id]);
      for (const eskiParca of eskiParcalar.rows) {
        const adet = parseInt(eskiParca.adet) || 1;
        await client.query(
          `UPDATE bisiklet_stok
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
    await client.query('DELETE FROM bisiklet_satis_parcalar WHERE bisiklet_satis_id = $1', [id]);

    // Yeni parçaları ekle
    for (const parca of parcalar) {
      await client.query(
        `INSERT INTO bisiklet_satis_parcalar (bisiklet_satis_id, urun_adi, adet, maliyet, satis_fiyati)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, parca.urun_adi, parseInt(parca.adet) || 1, parseFloat(parca.maliyet) || 0, parseFloat(parca.satis_fiyati) || 0]
      );
    }

    // Yeni durum tamamlandı ise stoktan düş
    if (durum === 'tamamlandi') {
      for (const parca of parcalar) {
        const adet = parseInt(parca.adet) || 1;
        await client.query(
          `UPDATE bisiklet_stok
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

    const parcalarResult = await pool.query(
      'SELECT * FROM bisiklet_satis_parcalar WHERE bisiklet_satis_id = $1 ORDER BY id',
      [id]
    );

    res.json({
      ...result.rows[0],
      parcalar: parcalarResult.rows
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Bisiklet satış güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  } finally {
    client.release();
  }
});

router.patch('/bulk/complete', async (req, res) => {
  if (req.user?.rol !== 'admin') return res.status(403).json({ message: 'Bu işlem için yönetici yetkisi gereklidir.' });
  const ids = [...new Set((Array.isArray(req.body.ids) ? req.body.ids : []).map(Number))];
  if (!ids.length || ids.length > 500 || ids.some((id) => !Number.isSafeInteger(id) || id <= 0)) {
    return res.status(400).json({ message: '1-500 geçerli Hobi Grup satışı seçilmelidir.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const locked = await client.query('SELECT id FROM bisiklet_satislar WHERE id = ANY($1::int[]) FOR UPDATE', [ids]);
    if (locked.rowCount !== ids.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Seçilen Hobi Grup satışlarından biri bulunamadı.' });
    }
    const quantities = await client.query(`
      SELECT p.urun_adi, SUM(p.adet)::int AS adet
      FROM bisiklet_satis_parcalar p
      JOIN bisiklet_satislar b ON b.id = p.bisiklet_satis_id
      WHERE b.id = ANY($1::int[]) AND LOWER(COALESCE(b.durum, '')) NOT IN ('tamamlandi', 'iptal', 'iptal_edildi')
      GROUP BY p.urun_adi
    `, [ids]);
    for (const item of quantities.rows) {
      await client.query(`
        UPDATE bisiklet_stok
        SET cikan_miktar = cikan_miktar + $1,
            mevcut = giren_miktar - (cikan_miktar + $1),
            envanter_degeri = (giren_miktar - (cikan_miktar + $1)) * satis_fiyati,
            updated_at = CURRENT_TIMESTAMP
        WHERE stok_adi = $2
      `, [item.adet, item.urun_adi]);
    }
    const result = await client.query(`
      UPDATE bisiklet_satislar
      SET durum = 'tamamlandi', tamamlama_tarihi = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($1::int[]) AND LOWER(COALESCE(durum, '')) NOT IN ('tamamlandi', 'iptal', 'iptal_edildi')
      RETURNING id
    `, [ids]);
    await client.query('COMMIT');
    res.json({ message: `${result.rowCount} Hobi Grup satışı tamamlandı.`, count: result.rowCount, ids: result.rows.map((row) => row.id) });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Toplu Hobi Grup tamamlama hatası:', error);
    res.status(500).json({ message: 'Hobi Grup satışları tamamlanamadı.' });
  } finally {
    client.release();
  }
});

// Bisiklet satış kaydını sil
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    const mevcutKayit = await client.query('SELECT durum FROM bisiklet_satislar WHERE id = $1', [id]);
    if (mevcutKayit.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Satış kaydı bulunamadı' });
    }

    const eskiDurum = mevcutKayit.rows[0].durum;

    // Tamamlandı ise stokları geri ekle
    if (eskiDurum === 'tamamlandi') {
      const eskiParcalar = await client.query('SELECT urun_adi, adet FROM bisiklet_satis_parcalar WHERE bisiklet_satis_id = $1', [id]);
      for (const parca of eskiParcalar.rows) {
        const adet = parseInt(parca.adet) || 1;
        await client.query(
          `UPDATE bisiklet_stok
           SET cikan_miktar = GREATEST(cikan_miktar - $1, 0),
               mevcut = giren_miktar - GREATEST(cikan_miktar - $1, 0),
               envanter_degeri = (giren_miktar - GREATEST(cikan_miktar - $1, 0)) * satis_fiyati,
               updated_at = CURRENT_TIMESTAMP
           WHERE stok_adi = $2`,
          [adet, parca.urun_adi]
        );
      }
    }

    await client.query('DELETE FROM bisiklet_satislar WHERE id = $1', [id]);
    await client.query('COMMIT');

    res.json({ message: 'Satış kaydı silindi' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Bisiklet satış silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  } finally {
    client.release();
  }
});

module.exports = router;
