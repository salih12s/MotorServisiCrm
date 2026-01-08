const express = require('express');
const pool = require('../config/db');
const { logAktivite, getRequestInfo } = require('../config/activityLogger');

const router = express.Router();

// Tüm aksesuar kayıtlarını parçalarıyla birlikte getir
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, ad_soyad, telefon, odeme_sekli, aciklama, durum, odeme_detaylari,
       TO_CHAR(satis_tarihi, 'YYYY-MM-DD') as satis_tarihi,
       toplam_maliyet, toplam_satis, kar, odeme_tutari, created_at
       FROM aksesuarlar ORDER BY created_at DESC`
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
      `SELECT id, ad_soyad, telefon, odeme_sekli, aciklama, durum, odeme_detaylari,
       TO_CHAR(satis_tarihi, 'YYYY-MM-DD') as satis_tarihi,
       toplam_maliyet, toplam_satis, kar, odeme_tutari, created_at
       FROM aksesuarlar WHERE id = $1`,
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
    
    const { ad_soyad, telefon, odeme_sekli, aciklama, durum, odeme_detaylari, satis_tarihi, parcalar = [] } = req.body;
    
    // Toplamları hesapla
    let toplam_maliyet = 0;
    let toplam_satis = 0;
    
    parcalar.forEach(p => {
      const adet = parseInt(p.adet) || 1;
      toplam_maliyet += adet * (parseFloat(p.maliyet) || 0);
      toplam_satis += adet * (parseFloat(p.satis_fiyati) || 0);
    });
    
    const kar = toplam_satis - toplam_maliyet;
    
    // Ana aksesuar kaydını oluştur
    const result = await client.query(
      `INSERT INTO aksesuarlar (ad_soyad, telefon, odeme_sekli, aciklama, durum, odeme_detaylari, satis_tarihi, toplam_maliyet, toplam_satis, kar, odeme_tutari)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [ad_soyad, telefon, odeme_sekli, aciklama, durum || 'beklemede', odeme_detaylari, satis_tarihi || new Date(), toplam_maliyet, toplam_satis, kar, toplam_satis]
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
    const { ad_soyad, telefon, odeme_sekli, aciklama, durum, odeme_detaylari, satis_tarihi, parcalar = [] } = req.body;
    
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
           kar = $10, odeme_tutari = $11, updated_at = CURRENT_TIMESTAMP${tamamlamaTarihiQuery}
       WHERE id = $12
       RETURNING *`,
      [ad_soyad, telefon, odeme_sekli, aciklama, durum || 'beklemede', odeme_detaylari, satis_tarihi, toplam_maliyet, toplam_satis, kar, toplam_satis, id]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Aksesuar kaydı bulunamadı' });
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
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM aksesuarlar WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Aksesuar kaydı bulunamadı' });
    }
    
    res.json({ message: 'Aksesuar kaydı silindi' });
  } catch (error) {
    console.error('Aksesuar silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
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
