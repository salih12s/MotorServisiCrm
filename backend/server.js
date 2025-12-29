const express = require('express');
const cors = require('cors');
require('dotenv').config();

const initDatabase = require('./config/initDb');

// Routes
const authRoutes = require('./routes/auth');
const musteriRoutes = require('./routes/musteriler');
const isEmriRoutes = require('./routes/isEmirleri');
const raporRoutes = require('./routes/raporlar');
const giderRoutes = require('./routes/giderler');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://demirkanmotorluaraclar.com', 'https://demirkanmotorluaraclar.com', 'http://www.demirkanmotorluaraclar.com', 'https://www.demirkanmotorluaraclar.com']
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
      giderler: '/api/giderler'
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
console.log('DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('DB_PORT:', process.env.DB_PORT || '5432');
console.log('DB_NAME:', process.env.DB_NAME || 'not set');
console.log('DB_USER:', process.env.DB_USER || 'not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
console.log('PORT:', PORT);
console.log('');

// Veritabanını başlat ve sunucuyu çalıştır
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor`);
      console.log('📦 API Endpoints:');
      console.log('   - POST /api/auth/login');
      console.log('   - GET  /api/musteriler');
      console.log('   - GET  /api/is-emirleri');
      console.log('   - GET  /api/raporlar/gunluk');
      console.log('   - GET  /api/raporlar/genel');
    });
  })
  .catch((err) => {
    console.error('Sunucu başlatılamadı:', err);
    process.exit(1);
  });
