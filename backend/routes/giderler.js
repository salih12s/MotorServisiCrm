const express = require('express');
const pool = require('../config/db');
const { logAktivite, getRequestInfo, ISLEM_TIPLERI } = require('../config/activityLogger');

const router = express.Router();

// Tüm giderleri getir
router.get('/', async (req, res) => {
  try {
    const { tarih, kategori } = req.query;
    
    let query = 'SELECT * FROM giderler';
    const params = [];
    const conditions = [];
    
    if (tarih) {
      params.push(tarih);
      conditions.push(`tarih = $${params.length}`);
    }
    
    if (kategori) {
      params.push(kategori);
      conditions.push(`kategori = $${params.length}`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY tarih DESC, created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Gider listesi hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Gider ekle
router.post('/', async (req, res) => {
  try {
    const { aciklama, tutar, kategori, tarih } = req.body;
    
    const result = await pool.query(
      'INSERT INTO giderler (aciklama, tutar, kategori, tarih) VALUES ($1, $2, $3, $4) RETURNING *',
      [aciklama, tutar, kategori, tarih || new Date().toISOString().split('T')[0]]
    );
    
    // Aktivite logla
    if (req.user?.id) {
      logAktivite(
        req.user.id,
        ISLEM_TIPLERI.GIDER_EKLE,
        `Yeni gider eklendi - ${aciklama}, Tutar: ${tutar}₺, Kategori: ${kategori}`,
        { giderId: result.rows[0].id, aciklama, tutar, kategori },
        getRequestInfo(req)
      );
    }
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Gider ekleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Gider güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { aciklama, tutar, kategori, tarih } = req.body;
    
    const result = await pool.query(
      'UPDATE giderler SET aciklama = $1, tutar = $2, kategori = $3, tarih = $4 WHERE id = $5 RETURNING *',
      [aciklama, tutar, kategori, tarih, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Gider bulunamadı' });
    }
    
    // Aktivite logla
    if (req.user?.id) {
      logAktivite(
        req.user.id,
        ISLEM_TIPLERI.GIDER_GUNCELLE,
        `Gider güncellendi - ${aciklama}, Tutar: ${tutar}₺`,
        { giderId: id, aciklama, tutar, kategori },
        getRequestInfo(req)
      );
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Gider güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Gider sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM giderler WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Gider bulunamadı' });
    }
    
    // Aktivite logla
    const silinenGider = result.rows[0];
    if (req.user?.id) {
      logAktivite(
        req.user.id,
        ISLEM_TIPLERI.GIDER_SIL,
        `Gider silindi - ${silinenGider.aciklama}, Tutar: ${silinenGider.tutar}₺`,
        { giderId: id, aciklama: silinenGider.aciklama, tutar: silinenGider.tutar },
        getRequestInfo(req)
      );
    }
    
    res.json({ message: 'Gider silindi' });
  } catch (error) {
    console.error('Gider silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
