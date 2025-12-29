const express = require('express');
const pool = require('../config/db');
const { logAktivite, getRequestInfo, ISLEM_TIPLERI } = require('../config/activityLogger');

const router = express.Router();

// Tüm müşterileri getir
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM musteriler ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Müşteri listesi hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Tek müşteri getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM musteriler WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Müşteri bulunamadı' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Müşteri detay hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Müşteri ekle
router.post('/', async (req, res) => {
  try {
    const { ad_soyad, adres, telefon } = req.body;
    
    const result = await pool.query(
      'INSERT INTO musteriler (ad_soyad, adres, telefon) VALUES ($1, $2, $3) RETURNING *',
      [ad_soyad, adres, telefon]
    );
    
    // Aktivite logla
    if (req.user?.id) {
      logAktivite(
        req.user.id,
        ISLEM_TIPLERI.MUSTERI_EKLE,
        `Yeni müşteri eklendi - ${ad_soyad}, Tel: ${telefon}`,
        { musteriId: result.rows[0].id, adSoyad: ad_soyad, telefon },
        getRequestInfo(req)
      );
    }
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Müşteri ekleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Müşteri güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ad_soyad, adres, telefon } = req.body;
    
    const result = await pool.query(
      'UPDATE musteriler SET ad_soyad = $1, adres = $2, telefon = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [ad_soyad, adres, telefon, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Müşteri bulunamadı' });
    }
    
    // Aktivite logla
    if (req.user?.id) {
      logAktivite(
        req.user.id,
        ISLEM_TIPLERI.MUSTERI_GUNCELLE,
        `Müşteri güncellendi - ${ad_soyad}`,
        { musteriId: id, adSoyad: ad_soyad, telefon },
        getRequestInfo(req)
      );
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Müşteri güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Müşteri sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM musteriler WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Müşteri bulunamadı' });
    }
    
    // Aktivite logla
    const silinenMusteri = result.rows[0];
    if (req.user?.id) {
      logAktivite(
        req.user.id,
        ISLEM_TIPLERI.MUSTERI_SIL,
        `Müşteri silindi - ${silinenMusteri.ad_soyad}`,
        { musteriId: id, adSoyad: silinenMusteri.ad_soyad },
        getRequestInfo(req)
      );
    }
    
    res.json({ message: 'Müşteri silindi' });
  } catch (error) {
    console.error('Müşteri silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Müşteri ara
router.get('/ara/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const result = await pool.query(
      `SELECT * FROM musteriler 
       WHERE ad_soyad ILIKE $1 OR telefon ILIKE $1 
       ORDER BY ad_soyad`,
      [`%${query}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Müşteri arama hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
