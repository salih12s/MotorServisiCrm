const express = require('express');
const pool = require('../config/db');
const { logAktivite, getRequestInfo, ISLEM_TIPLERI } = require('../config/activityLogger');

const router = express.Router();

// Tüm aksesuar kayıtlarını getir
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM aksesuarlar ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Aksesuar listesi hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Tek aksesuar kaydı getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM aksesuarlar WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Aksesuar kaydı bulunamadı' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Aksesuar detay hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni aksesuar kaydı oluştur
router.post('/', async (req, res) => {
  try {
    const { ad_soyad, telefon, urun_adi, odeme_tutari, odeme_sekli, aciklama, durum } = req.body;
    
    const result = await pool.query(
      `INSERT INTO aksesuarlar (ad_soyad, telefon, urun_adi, odeme_tutari, odeme_sekli, aciklama, durum)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [ad_soyad, telefon, urun_adi, odeme_tutari || 0, odeme_sekli, aciklama, durum || 'beklemede']
    );
    
    // Aktivite logu
    try {
      const { kullaniciId, kullaniciAdi, ipAdresi, tarayiciBilgisi } = getRequestInfo(req);
      await logAktivite({
        kullaniciId,
        kullaniciAdi,
        islemTipi: 'AKSESUAR_OLUSTURMA',
        islemDetay: `Yeni aksesuar satışı: ${ad_soyad} - ${urun_adi}`,
        hedefTablo: 'aksesuarlar',
        hedefId: result.rows[0].id,
        ipAdresi,
        tarayiciBilgisi
      });
    } catch (logError) {
      console.error('Aktivite log hatası:', logError);
    }
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Aksesuar oluşturma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Aksesuar kaydını güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ad_soyad, telefon, urun_adi, odeme_tutari, odeme_sekli, aciklama, durum } = req.body;
    
    const result = await pool.query(
      `UPDATE aksesuarlar 
       SET ad_soyad = $1, telefon = $2, urun_adi = $3, odeme_tutari = $4, 
           odeme_sekli = $5, aciklama = $6, durum = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [ad_soyad, telefon, urun_adi, odeme_tutari || 0, odeme_sekli, aciklama, durum || 'beklemede', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Aksesuar kaydı bulunamadı' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Aksesuar güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
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
        COALESCE(SUM(odeme_tutari), 0) as toplam_tutar
      FROM aksesuarlar
    `);
    
    const bugunResult = await pool.query(`
      SELECT 
        COUNT(*) as bugun_satis,
        COALESCE(SUM(odeme_tutari), 0) as bugun_tutar
      FROM aksesuarlar
      WHERE DATE(created_at) = CURRENT_DATE
    `);
    
    res.json({
      toplam_satis: parseInt(result.rows[0].toplam_satis),
      toplam_tutar: parseFloat(result.rows[0].toplam_tutar),
      bugun_satis: parseInt(bugunResult.rows[0].bugun_satis),
      bugun_tutar: parseFloat(bugunResult.rows[0].bugun_tutar)
    });
  } catch (error) {
    console.error('Aksesuar istatistik hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
