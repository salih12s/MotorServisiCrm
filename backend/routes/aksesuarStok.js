const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Tüm stok kayıtlarını getir
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const search = String(req.query.search || '').trim();
    const offset = (page - 1) * limit;
    const searchParam = `%${search}%`;
    const whereClause = search ? 'WHERE stok_kodu ILIKE $1 OR stok_adi ILIKE $1' : '';
    const queryParams = search ? [searchParam, limit, offset] : [limit, offset];
    const limitIndex = search ? 2 : 1;
    const offsetIndex = search ? 3 : 2;

    const [result, summaryResult] = await Promise.all([
      pool.query(
      `SELECT id, stok_kodu, stok_adi, giren_miktar, cikan_miktar, mevcut,
              birimi, alis_fiyati, satis_fiyati, envanter_degeri, aciklama,
              created_at, updated_at,
              CASE WHEN resim IS NOT NULL AND resim <> '' THEN TRUE ELSE FALSE END AS resim_var
       FROM aksesuar_stok
       ${whereClause}
       ORDER BY stok_kodu ASC
       LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
        queryParams
      ),
      pool.query(
        `SELECT COUNT(*)::int AS total,
                COALESCE(SUM(envanter_degeri), 0) AS toplam_envanter
         FROM aksesuar_stok ${whereClause}`,
        search ? [searchParam] : []
      ),
    ]);
    const summary = summaryResult.rows[0];
    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total: summary.total,
        totalPages: Math.max(Math.ceil(summary.total / limit), 1),
      },
      toplamEnvanter: summary.toplam_envanter,
    });
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
      `SELECT id, stok_kodu, stok_adi, giren_miktar, cikan_miktar, mevcut,
              birimi, alis_fiyati, satis_fiyati, envanter_degeri, aciklama
       FROM aksesuar_stok
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

// Fotoğraflar büyük base64 verileridir; yalnızca düzenleme açıldığında yüklenir.
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM aksesuar_stok WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Stok kaydı bulunamadı' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Stok detayı hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni stok kaydı oluştur
router.post('/', async (req, res) => {
  try {
    const { stok_kodu, stok_adi, giren_miktar, cikan_miktar, birimi, alis_fiyati, satis_fiyati, resim, resimler, aciklama } = req.body;

    if (!stok_kodu || !stok_adi) {
      return res.status(400).json({ message: 'Stok kodu ve stok adı zorunludur' });
    }

    const mevcut = (parseInt(giren_miktar) || 0) - (parseInt(cikan_miktar) || 0);
    const envanter_degeri = mevcut * (parseFloat(satis_fiyati) || 0);
    const resimlerStr = Array.isArray(resimler) ? JSON.stringify(resimler) : (resimler || null);

    const result = await pool.query(
      `INSERT INTO aksesuar_stok (stok_kodu, stok_adi, giren_miktar, cikan_miktar, mevcut, birimi, alis_fiyati, satis_fiyati, envanter_degeri, resim, resimler, aciklama)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [stok_kodu, stok_adi, parseInt(giren_miktar) || 0, parseInt(cikan_miktar) || 0, mevcut, birimi || 'Adet', parseFloat(alis_fiyati) || 0, parseFloat(satis_fiyati) || 0, envanter_degeri, resim || null, resimlerStr, aciklama || null]
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
    const { stok_kodu, stok_adi, giren_miktar, cikan_miktar, birimi, alis_fiyati, satis_fiyati, resim, resimler, aciklama } = req.body;

    const mevcut = (parseInt(giren_miktar) || 0) - (parseInt(cikan_miktar) || 0);
    const envanter_degeri = mevcut * (parseFloat(satis_fiyati) || 0);
    const resimlerStr = Array.isArray(resimler) ? JSON.stringify(resimler) : (resimler || null);

    const result = await pool.query(
      `UPDATE aksesuar_stok 
       SET stok_kodu = $1, stok_adi = $2, giren_miktar = $3, cikan_miktar = $4, 
           mevcut = $5, birimi = $6, alis_fiyati = $7, satis_fiyati = $8, 
           envanter_degeri = $9, resim = $10, resimler = $11, aciklama = $12, updated_at = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING *`,
      [stok_kodu, stok_adi, parseInt(giren_miktar) || 0, parseInt(cikan_miktar) || 0, mevcut, birimi || 'Adet', parseFloat(alis_fiyati) || 0, parseFloat(satis_fiyati) || 0, envanter_degeri, resim || null, resimlerStr, aciklama || null, id]
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
