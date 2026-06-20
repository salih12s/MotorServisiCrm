const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Tüm stok kayıtlarını getir
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM aksesuar_stok ORDER BY stok_kodu ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Stok listesi hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Stok arama (stok kodu veya isim ile)
router.get('/ara', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json([]);
    }
    const result = await pool.query(
      `SELECT * FROM aksesuar_stok 
       WHERE stok_kodu ILIKE $1 OR stok_adi ILIKE $1 
       ORDER BY stok_adi ASC LIMIT 20`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Stok arama hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni stok kaydı oluştur
router.post('/', async (req, res) => {
  try {
    const { stok_kodu, stok_adi, giren_miktar, cikan_miktar, birimi, alis_fiyati, satis_fiyati, resim } = req.body;

    if (!stok_kodu || !stok_adi) {
      return res.status(400).json({ message: 'Stok kodu ve stok adı zorunludur' });
    }

    const mevcut = (parseInt(giren_miktar) || 0) - (parseInt(cikan_miktar) || 0);
    const envanter_degeri = mevcut * (parseFloat(satis_fiyati) || 0);

    const result = await pool.query(
      `INSERT INTO aksesuar_stok (stok_kodu, stok_adi, giren_miktar, cikan_miktar, mevcut, birimi, alis_fiyati, satis_fiyati, envanter_degeri, resim)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [stok_kodu, stok_adi, parseInt(giren_miktar) || 0, parseInt(cikan_miktar) || 0, mevcut, birimi || 'Adet', parseFloat(alis_fiyati) || 0, parseFloat(satis_fiyati) || 0, envanter_degeri, resim || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Bu stok kodu zaten mevcut' });
    }
    console.error('Stok oluşturma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Stok kaydını güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stok_kodu, stok_adi, giren_miktar, cikan_miktar, birimi, alis_fiyati, satis_fiyati, resim } = req.body;

    const mevcut = (parseInt(giren_miktar) || 0) - (parseInt(cikan_miktar) || 0);
    const envanter_degeri = mevcut * (parseFloat(satis_fiyati) || 0);

    const result = await pool.query(
      `UPDATE aksesuar_stok 
       SET stok_kodu = $1, stok_adi = $2, giren_miktar = $3, cikan_miktar = $4, 
           mevcut = $5, birimi = $6, alis_fiyati = $7, satis_fiyati = $8, 
           envanter_degeri = $9, resim = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [stok_kodu, stok_adi, parseInt(giren_miktar) || 0, parseInt(cikan_miktar) || 0, mevcut, birimi || 'Adet', parseFloat(alis_fiyati) || 0, parseFloat(satis_fiyati) || 0, envanter_degeri, resim || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Stok kaydı bulunamadı' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Bu stok kodu zaten mevcut' });
    }
    console.error('Stok güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Stok kaydını sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM aksesuar_stok WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Stok kaydı bulunamadı' });
    }

    res.json({ message: 'Stok kaydı silindi' });
  } catch (error) {
    console.error('Stok silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Toplu stok ekleme (ilk veri yüklemesi için)
router.post('/toplu', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { stoklar } = req.body;

    if (!Array.isArray(stoklar) || stoklar.length === 0) {
      return res.status(400).json({ message: 'Stok listesi boş' });
    }

    const results = [];
    for (const stok of stoklar) {
      const mevcut = (parseInt(stok.giren_miktar) || 0) - (parseInt(stok.cikan_miktar) || 0);
      const envanter_degeri = mevcut * (parseFloat(stok.satis_fiyati) || 0);

      const result = await client.query(
        `INSERT INTO aksesuar_stok (stok_kodu, stok_adi, giren_miktar, cikan_miktar, mevcut, birimi, alis_fiyati, satis_fiyati, envanter_degeri)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (stok_kodu) DO UPDATE SET
           stok_adi = EXCLUDED.stok_adi,
           giren_miktar = EXCLUDED.giren_miktar,
           cikan_miktar = EXCLUDED.cikan_miktar,
           mevcut = EXCLUDED.mevcut,
           alis_fiyati = EXCLUDED.alis_fiyati,
           satis_fiyati = EXCLUDED.satis_fiyati,
           envanter_degeri = EXCLUDED.envanter_degeri,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [stok.stok_kodu, stok.stok_adi, parseInt(stok.giren_miktar) || 0, parseInt(stok.cikan_miktar) || 0, mevcut, stok.birimi || 'Adet', parseFloat(stok.alis_fiyati) || 0, parseFloat(stok.satis_fiyati) || 0, envanter_degeri]
      );
      results.push(result.rows[0]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: `${results.length} stok kaydı eklendi`, data: results });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Toplu stok ekleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  } finally {
    client.release();
  }
});

module.exports = router;
