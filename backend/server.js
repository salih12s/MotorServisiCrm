const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const initDatabase = require('./config/initDb');
const pool = require('./config/db');

// Routes
const authRoutes = require('./routes/auth');
const musteriRoutes = require('./routes/musteriler');
const isEmriRoutes = require('./routes/isEmirleri');
const raporRoutes = require('./routes/raporlar');
const giderRoutes = require('./routes/giderler');
const aksesuarRoutes = require('./routes/aksesuarlar');
const aksesuarStokRoutes = require('./routes/aksesuarStok');
const bisikletStokRoutes = require('./routes/bisikletStok');
const bisikletSatisRoutes = require('./routes/bisikletSatislari');
const motorSatisRoutes = require('./routes/motorSatislari');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'http://demirkanmotorluaraclar.com',
        'https://demirkanmotorluaraclar.com',
        'http://www.demirkanmotorluaraclar.com',
        'https://www.demirkanmotorluaraclar.com',
        'https://motorservisicrm.railway.internal',
        'http://motorservisicrm.railway.internal',
        'https://motorservisicrm-production.up.railway.app',
        'http://motorservisicrm-production.up.railway.app'
      ]
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
// Çoklu ürün fotoğrafları sıkıştırılmış base64 olarak gönderildiği için makul bir üst sınır tanı.
app.use(express.json({ limit: '20mb' }));

// JWT Middleware (korumalı rotalar için)
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Yetkilendirme token\'ı gerekli' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Geçersiz token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.use('/api/auth', authRoutes);

// Açık (public) aksesuar satış kataloğu - giriş gerektirmez
app.get('/api/public/aksesuarlar', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 24, 1), 100);
    const search = String(req.query.search || '').trim();
    const stokta = req.query.stokta === 'true';
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(stok_adi ILIKE $${params.length} OR stok_kodu ILIKE $${params.length})`);
    }
    if (stokta) conditions.push('mevcut > 0');

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countParams = [...params];
    params.push(limit, (page - 1) * limit);

    const [result, countResult] = await Promise.all([
      pool.query(
      `SELECT id, stok_kodu, stok_adi, satis_fiyati, mevcut, birimi, aciklama, updated_at,
              CASE WHEN resim IS NOT NULL AND resim <> '' THEN TRUE ELSE FALSE END AS resim_var,
              CASE WHEN resimler IS NULL OR resimler = '' THEN 0
                   ELSE GREATEST((SELECT COUNT(*) FROM json_array_elements_text(resimler::json)), 1)
              END AS resim_sayisi
       FROM aksesuar_stok
       ${whereClause}
       ORDER BY stok_adi ASC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
       params
      ),
      pool.query(`SELECT COUNT(*)::int AS total FROM aksesuar_stok ${whereClause}`, countParams),
    ]);
    const total = countResult.rows[0].total;
    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (error) {
    console.error('Public aksesuar listesi hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Liste JSON'unu şişirmemek için ana görsel ayrı ve tarayıcı önbelleğine uygun sunulur.
app.get('/api/public/aksesuarlar/:id/resim', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT resim, updated_at FROM aksesuar_stok WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0 || !result.rows[0].resim) return res.status(404).end();

    const match = result.rows[0].resim.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s);
    if (!match) return res.status(404).end();

    const etag = `W/\"aksesuar-${req.params.id}-${new Date(result.rows[0].updated_at).getTime()}\"`;
    if (req.headers['if-none-match'] === etag) return res.status(304).end();

    res.set({
      'Content-Type': match[1],
      // Kısa max-age + revalidate: vitrin fotoğrafı değişince (ETag updated_at'e bağlı)
      // tarayıcı en geç birkaç dakika içinde yeni görseli alır. URL'deki ?v= parametresi
      // ile birlikte güncel görsel anında yansır.
      'Cache-Control': 'public, max-age=300, must-revalidate',
      ETag: etag,
    });
    res.send(Buffer.from(match[2], 'base64'));
  } catch (error) {
    console.error('Public aksesuar görsel hatası:', error);
    res.status(500).end();
  }
});

app.get('/api/public/aksesuarlar/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, stok_kodu, stok_adi, satis_fiyati, mevcut, birimi, resim, resimler, aciklama
       FROM aksesuar_stok WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Ürün bulunamadı' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Public aksesuar detay hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Açık (public) hobi grup bisiklet & e-bike kataloğu - giriş gerektirmez
app.get('/api/public/bisikletler', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 24, 1), 100);
    const search = String(req.query.search || '').trim();
    const stokta = req.query.stokta === 'true';
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(stok_adi ILIKE $${params.length} OR stok_kodu ILIKE $${params.length})`);
    }
    if (stokta) conditions.push('mevcut > 0');

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countParams = [...params];
    params.push(limit, (page - 1) * limit);

    const [result, countResult] = await Promise.all([
      pool.query(
      `SELECT id, stok_kodu, stok_adi, satis_fiyati, mevcut, birimi, aciklama, updated_at,
              CASE WHEN resim IS NOT NULL AND resim <> '' THEN TRUE ELSE FALSE END AS resim_var,
              CASE WHEN resimler IS NULL OR resimler = '' THEN 0
                   ELSE GREATEST((SELECT COUNT(*) FROM json_array_elements_text(resimler::json)), 1)
              END AS resim_sayisi
       FROM bisiklet_stok
       ${whereClause}
       ORDER BY stok_adi ASC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
       params
      ),
      pool.query(`SELECT COUNT(*)::int AS total FROM bisiklet_stok ${whereClause}`, countParams),
    ]);
    const total = countResult.rows[0].total;
    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (error) {
    console.error('Public bisiklet listesi hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Liste JSON'unu şişirmemek için ana görsel ayrı ve tarayıcı önbelleğine uygun sunulur.
app.get('/api/public/bisikletler/:id/resim', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT resim, updated_at FROM bisiklet_stok WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0 || !result.rows[0].resim) return res.status(404).end();

    const match = result.rows[0].resim.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s);
    if (!match) return res.status(404).end();

    const etag = `W/\"bisiklet-${req.params.id}-${new Date(result.rows[0].updated_at).getTime()}\"`;
    if (req.headers['if-none-match'] === etag) return res.status(304).end();

    res.set({
      'Content-Type': match[1],
      'Cache-Control': 'public, max-age=300, must-revalidate',
      ETag: etag,
    });
    res.send(Buffer.from(match[2], 'base64'));
  } catch (error) {
    console.error('Public bisiklet görsel hatası:', error);
    res.status(500).end();
  }
});

app.get('/api/public/bisikletler/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, stok_kodu, stok_adi, satis_fiyati, mevcut, birimi, resim, resimler, aciklama
       FROM bisiklet_stok WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Ürün bulunamadı' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Public bisiklet detay hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

app.use('/api/musteriler', authenticateToken, musteriRoutes);
app.use('/api/is-emirleri', authenticateToken, isEmriRoutes);
app.use('/api/raporlar', authenticateToken, raporRoutes);
app.use('/api/giderler', authenticateToken, giderRoutes);
app.use('/api/aksesuarlar', authenticateToken, aksesuarRoutes);
app.use('/api/aksesuar-stok', authenticateToken, aksesuarStokRoutes);
app.use('/api/bisiklet-stok', authenticateToken, bisikletStokRoutes);
app.use('/api/bisiklet-satislari', authenticateToken, bisikletSatisRoutes);
app.use('/api/motor-satislari', authenticateToken, motorSatisRoutes);

// Ana sayfa
app.get('/', (req, res) => {
  res.json({ 
    message: 'Demirkan Motorlu Araçlar API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      musteriler: '/api/musteriler',
      isEmirleri: '/api/is-emirleri',
      raporlar: '/api/raporlar',
      giderler: '/api/giderler',
      aksesuarlar: '/api/aksesuarlar',
      motorSatislari: '/api/motor-satislari'
    }
  });
});

// Hata yakalama
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Sunucu hatası', error: err.message });
});

const PORT = process.env.PORT || 5000;

// Environment bilgilerini logla (debug için)
console.log('\n🔧 Environment Configuration:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
console.log('DB_HOST:', process.env.DB_HOST || 'not set');
console.log('DB_PORT:', process.env.DB_PORT || 'not set');
console.log('DB_NAME:', process.env.DB_NAME || 'not set');
console.log('DB_USER:', process.env.DB_USER || 'not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
console.log('PORT:', PORT);
console.log('');

// Veritabanını başlat ve sunucuyu çalıştır
// DB bağlanamasa bile sunucu ayakta kalsın, arka planda tekrar denesin
const startServer = async () => {
  // Sunucuyu hemen başlat (DB'den bağımsız)
  app.listen(PORT, () => {
    console.log(`\n🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor`);
  });

  // DB init'i arka planda dene (max 10 deneme, artan bekleme)
  const MAX_INIT_RETRIES = 10;
  for (let attempt = 1; attempt <= MAX_INIT_RETRIES; attempt++) {
    try {
      await initDatabase();
      console.log('✅ Veritabanı başarıyla başlatıldı!');
      return;
    } catch (err) {
      console.error(`❌ DB init denemesi ${attempt}/${MAX_INIT_RETRIES} başarısız: ${err.message}`);
      if (attempt < MAX_INIT_RETRIES) {
        const waitSec = Math.min(attempt * 5, 30); // 5s, 10s, 15s... max 30s
        console.log(`⏳ ${waitSec} saniye sonra tekrar denenecek...`);
        await new Promise(r => setTimeout(r, waitSec * 1000));
      } else {
        console.error('❌ Veritabanı başlatılamadı! Sunucu çalışmaya devam ediyor, DB gelince istekler çalışacak.');
      }
    }
  }
};

startServer();
