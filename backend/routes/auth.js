const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { logAktivite, getRequestInfo, ISLEM_TIPLERI } = require('../config/activityLogger');

const router = express.Router();

// Middleware - Token doğrulama
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token bulunamadı' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Geçersiz token' });
  }
};

// Admin kontrolü middleware
const isAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
  }
  next();
};

// Kayıt ol
router.post('/register', async (req, res) => {
  try {
    const { kullanici_adi, sifre, ad_soyad } = req.body;
    const { ip_adresi, tarayici_bilgisi } = getRequestInfo(req);

    // Kullanıcı adı kontrolü
    const existingUser = await pool.query(
      'SELECT * FROM kullanicilar WHERE kullanici_adi = $1',
      [kullanici_adi]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanılıyor' });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(sifre, 10);

    // Kullanıcıyı ekle (onay bekliyor durumunda) - plain_sifre de kaydet
    const result = await pool.query(
      'INSERT INTO kullanicilar (kullanici_adi, sifre, plain_sifre, ad_soyad, rol, onay_durumu) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, kullanici_adi, ad_soyad, rol, onay_durumu',
      [kullanici_adi, hashedPassword, sifre, ad_soyad, 'personel', 'beklemede']
    );

    // Aktivite logla
    await logAktivite({
      kullanici_id: result.rows[0].id,
      kullanici_adi: kullanici_adi,
      islem_tipi: ISLEM_TIPLERI.REGISTER,
      islem_detay: `Yeni kullanıcı kaydı: ${ad_soyad}`,
      hedef_tablo: 'kullanicilar',
      hedef_id: result.rows[0].id,
      ip_adresi,
      tarayici_bilgisi
    });

    res.status(201).json({
      message: 'Kayıt başarılı! Admin onayı bekleniyor.',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { kullanici_adi, sifre } = req.body;
    const { ip_adresi, tarayici_bilgisi } = getRequestInfo(req);

    const result = await pool.query(
      'SELECT * FROM kullanicilar WHERE kullanici_adi = $1',
      [kullanici_adi]
    );

    if (result.rows.length === 0) {
      // Başarısız giriş logla
      await logAktivite({
        kullanici_id: null,
        kullanici_adi: kullanici_adi,
        islem_tipi: ISLEM_TIPLERI.LOGIN_FAILED,
        islem_detay: `Başarısız giriş denemesi - Kullanıcı bulunamadı`,
        ip_adresi,
        tarayici_bilgisi
      });
      return res.status(401).json({ message: 'Kullanıcı adı veya şifre hatalı' });
    }

    const user = result.rows[0];
    
    // Şifre kontrolü
    const isValidPassword = await bcrypt.compare(sifre, user.sifre);

    if (!isValidPassword) {
      // Başarısız giriş logla
      await logAktivite({
        kullanici_id: user.id,
        kullanici_adi: kullanici_adi,
        islem_tipi: ISLEM_TIPLERI.LOGIN_FAILED,
        islem_detay: `Başarısız giriş denemesi - Yanlış şifre`,
        ip_adresi,
        tarayici_bilgisi
      });
      return res.status(401).json({ message: 'Kullanıcı adı veya şifre hatalı' });
    }
    
    // Admin değilse onay durumu kontrolü
    if (user.rol !== 'admin') {
      if (user.onay_durumu === 'beklemede') {
        await logAktivite({
          kullanici_id: user.id,
          kullanici_adi: kullanici_adi,
          islem_tipi: ISLEM_TIPLERI.LOGIN_FAILED,
          islem_detay: `Giriş engellendi - Hesap onay bekliyor`,
          ip_adresi,
          tarayici_bilgisi
        });
        return res.status(403).json({ message: 'Hesabınız henüz onaylanmadı. Lütfen admin onayını bekleyin.' });
      }
      
      if (user.onay_durumu === 'reddedildi') {
        await logAktivite({
          kullanici_id: user.id,
          kullanici_adi: kullanici_adi,
          islem_tipi: ISLEM_TIPLERI.LOGIN_FAILED,
          islem_detay: `Giriş engellendi - Hesap reddedilmiş`,
          ip_adresi,
          tarayici_bilgisi
        });
        return res.status(403).json({ message: 'Hesabınız reddedildi. Lütfen yönetici ile iletişime geçin.' });
      }
      
      if (user.onay_durumu !== 'onaylandi') {
        return res.status(403).json({ message: 'Hesabınızın onay durumu geçersiz. Lütfen yönetici ile iletişime geçin.' });
      }
    }

    const token = jwt.sign(
      { id: user.id, kullanici_adi: user.kullanici_adi, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Başarılı giriş logla
    await logAktivite({
      kullanici_id: user.id,
      kullanici_adi: user.kullanici_adi,
      islem_tipi: ISLEM_TIPLERI.LOGIN,
      islem_detay: `Başarılı giriş - ${user.ad_soyad} (${user.rol})`,
      ip_adresi,
      tarayici_bilgisi
    });

    res.json({
      token,
      user: {
        id: user.id,
        kullanici_adi: user.kullanici_adi,
        ad_soyad: user.ad_soyad,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Login hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Token doğrulama
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token bulunamadı' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await pool.query(
      'SELECT id, kullanici_adi, ad_soyad, rol FROM kullanicilar WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Geçersiz token' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(401).json({ message: 'Geçersiz token' });
  }
});

// Tüm kullanıcıları getir (sadece admin)
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, kullanici_adi, ad_soyad, rol, onay_durumu, plain_sifre, created_at FROM kullanicilar ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Kullanıcıları getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı onaylama (sadece admin)
router.patch('/users/:id/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE kullanicilar SET onay_durumu = 'onaylandi' WHERE id = $1 RETURNING id, kullanici_adi, ad_soyad, rol, onay_durumu",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json({ message: 'Kullanıcı onaylandı', user: result.rows[0] });
  } catch (error) {
    console.error('Kullanıcı onaylama hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı reddetme (sadece admin)
router.patch('/users/:id/reject', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE kullanicilar SET onay_durumu = 'reddedildi' WHERE id = $1 RETURNING id, kullanici_adi, ad_soyad, rol, onay_durumu",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json({ message: 'Kullanıcı reddedildi', user: result.rows[0] });
  } catch (error) {
    console.error('Kullanıcı reddetme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı silme (sadece admin)
router.delete('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Admin kendini silemesin
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Kendinizi silemezsiniz' });
    }
    
    const result = await pool.query(
      'DELETE FROM kullanicilar WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json({ message: 'Kullanıcı silindi' });
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı aktiviteleri (iş emirleri) - sadece admin
router.get('/users/:id/activities', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT ie.id, ie.fis_no, ie.musteri_ad_soyad, ie.model_tip, ie.marka, ie.durum, ie.created_at, ie.updated_at,
              k.ad_soyad as olusturan_ad_soyad
       FROM is_emirleri ie
       LEFT JOIN kullanicilar k ON ie.olusturan_kullanici_id = k.id
       WHERE ie.olusturan_kullanici_id = $1
       ORDER BY ie.created_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Aktivite getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı aktivite logları (detaylı) - sadece admin
router.get('/users/:id/activity-logs', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 100 } = req.query;
    
    const result = await pool.query(
      `SELECT al.*, k.ad_soyad as kullanici_ad
       FROM aktivite_log al
       LEFT JOIN kullanicilar k ON al.kullanici_id = k.id
       WHERE al.kullanici_id = $1
       ORDER BY al.created_at DESC
       LIMIT $2`,
      [id, parseInt(limit)]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Aktivite log getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Tüm aktivite logları - sadece admin
router.get('/activity-logs', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { limit = 200, islem_tipi, kullanici_id } = req.query;
    
    let query = `
      SELECT al.*, k.ad_soyad as kullanici_ad
      FROM aktivite_log al
      LEFT JOIN kullanicilar k ON al.kullanici_id = k.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    
    if (islem_tipi) {
      query += ` AND al.islem_tipi = $${paramIndex}`;
      params.push(islem_tipi);
      paramIndex++;
    }
    
    if (kullanici_id) {
      query += ` AND al.kullanici_id = $${paramIndex}`;
      params.push(parseInt(kullanici_id));
      paramIndex++;
    }
    
    query += ` ORDER BY al.created_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Tüm aktivite logları getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Tüm kullanıcı aktiviteleri (iş emirleri) - sadece admin
router.get('/activities', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ie.id, ie.fis_no, ie.musteri_ad_soyad, ie.model_tip, ie.marka, ie.durum, ie.created_at, ie.updated_at,
              k.id as kullanici_id, k.ad_soyad as olusturan_ad_soyad, k.kullanici_adi
       FROM is_emirleri ie
       LEFT JOIN kullanicilar k ON ie.olusturan_kullanici_id = k.id
       ORDER BY ie.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Tüm aktiviteleri getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Belirli kullanıcının oluşturduğu iş emirlerini getir - sadece admin
router.get('/user-work-orders/:userId', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      `SELECT ie.id, ie.fis_no, ie.musteri_ad_soyad, ie.telefon, ie.marka, ie.model_tip, ie.km,
              ie.ariza_sikayetler, ie.aciklama, ie.durum, ie.gercek_toplam_ucret, ie.toplam_maliyet, 
              ie.kar, ie.tahmini_toplam_ucret, ie.tahmini_teslim_tarihi, ie.created_at, ie.updated_at,
              k.ad_soyad as olusturan_ad_soyad, k.kullanici_adi
       FROM is_emirleri ie
       LEFT JOIN kullanicilar k ON ie.olusturan_kullanici_id = k.id
       WHERE ie.olusturan_kullanici_id = $1
       ORDER BY ie.created_at DESC`,
      [userId]
    );
    
    // Her iş emri için parçaları da getir
    const workOrdersWithParts = await Promise.all(
      result.rows.map(async (order) => {
        const partsResult = await pool.query(
          'SELECT * FROM parcalar WHERE is_emri_id = $1 ORDER BY id',
          [order.id]
        );
        return {
          ...order,
          parcalar: partsResult.rows
        };
      })
    );
    
    res.json(workOrdersWithParts);
  } catch (error) {
    console.error('Kullanıcı iş emirleri getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Logout logla
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { ip_adresi, tarayici_bilgisi } = getRequestInfo(req);
    
    await logAktivite({
      kullanici_id: req.user.id,
      kullanici_adi: req.user.kullanici_adi,
      islem_tipi: ISLEM_TIPLERI.LOGOUT,
      islem_detay: 'Kullanıcı çıkış yaptı',
      ip_adresi,
      tarayici_bilgisi
    });
    
    res.json({ message: 'Çıkış başarılı' });
  } catch (error) {
    console.error('Logout hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yazıcı ayarlarını getir
router.get('/print-settings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT ayarlar FROM yazici_ayarlari WHERE ayar_adi = 'default'"
    );
    
    if (result.rows.length === 0) {
      return res.json({ ayarlar: null });
    }
    
    res.json({ ayarlar: result.rows[0].ayarlar });
  } catch (error) {
    console.error('Yazıcı ayarları getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yazıcı ayarlarını kaydet
router.post('/print-settings', authenticateToken, async (req, res) => {
  try {
    const { ayarlar } = req.body;
    
    // Upsert - varsa güncelle, yoksa ekle
    const result = await pool.query(`
      INSERT INTO yazici_ayarlari (ayar_adi, ayarlar, updated_at)
      VALUES ('default', $1, CURRENT_TIMESTAMP)
      ON CONFLICT (ayar_adi) 
      DO UPDATE SET ayarlar = $1, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [JSON.stringify(ayarlar)]);
    
    res.json({ message: 'Ayarlar kaydedildi', data: result.rows[0] });
  } catch (error) {
    console.error('Yazıcı ayarları kaydetme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
