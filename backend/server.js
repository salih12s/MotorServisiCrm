const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const initDatabase = require('./config/initDb');

// Routes
const authRoutes = require('./routes/auth');
const musteriRoutes = require('./routes/musteriler');
const isEmriRoutes = require('./routes/isEmirleri');
const raporRoutes = require('./routes/raporlar');
const giderRoutes = require('./routes/giderler');
const aksesuarRoutes = require('./routes/aksesuarlar');
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
app.use(express.json());

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
app.use('/api/musteriler', authenticateToken, musteriRoutes);
app.use('/api/is-emirleri', authenticateToken, isEmriRoutes);
app.use('/api/raporlar', authenticateToken, raporRoutes);
app.use('/api/giderler', authenticateToken, giderRoutes);
app.use('/api/aksesuarlar', authenticateToken, aksesuarRoutes);
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
