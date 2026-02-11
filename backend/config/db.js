const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'motor_servisi_crm',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: isProduction ? 5 : 10,                // Railway için az bağlantı
  min: 1,                                      // Minimum idle bağlantı
  connectionTimeoutMillis: 15000,              // Bağlantı timeout
  idleTimeoutMillis: 30000,                    // Idle bağlantı timeout
  allowExitOnIdle: false,                      // Pool kapanmasın
  keepAlive: true,                             // TCP keepAlive - Railway proxy kopmasını önler
  keepAliveInitialDelayMillis: 10000,          // KeepAlive başlangıç gecikmesi
});

// Sadece bir kere log bas, her bağlantıda değil
let connectionLogged = false;
pool.on('connect', () => {
  if (!connectionLogged) {
    connectionLogged = true;
    console.log('✅ PostgreSQL veritabanına bağlandı');
    console.log(`📊 Database: ${process.env.DB_NAME || 'motor_servisi_crm'}`);
    console.log(`🌐 Host: ${process.env.DB_HOST || 'localhost'}`);
  }
});

pool.on('error', (err) => {
  console.error('❌ Veritabanı pool hatası:', err.message);
  // Pool kendini otomatik yönetir, process.exit yapmıyoruz
});

// Retry mekanizmalı query wrapper
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Orijinal query fonksiyonunu sakla
const originalQuery = pool.query.bind(pool);

const queryWithRetry = async (text, params, retries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await originalQuery(text, params);
    } catch (err) {
      const isConnectionError = 
        err.code === 'ECONNRESET' || 
        err.code === 'ECONNREFUSED' ||
        err.code === 'EPIPE' ||
        err.code === 'ETIMEDOUT' ||
        err.code === '57P01' || // admin_shutdown
        err.code === '57P03' || // cannot_connect_now
        err.message?.includes('Connection terminated') ||
        err.message?.includes('connection lost') ||
        err.message?.includes('read ECONNRESET');

      if (isConnectionError && attempt < retries) {
        console.warn(`⚠️ DB bağlantı hatası (deneme ${attempt}/${retries}): ${err.message}`);
        await sleep(RETRY_DELAY * attempt); // Her denemede daha uzun bekle
        continue;
      }
      throw err;
    }
  }
};

// Test connection on startup
originalQuery('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection test failed:', err.message);
  } else {
    console.log('✅ Database connection test successful');
  }
});

// pool.query'yi retry wrapper ile değiştir - tüm route'lar otomatik faydalanır
pool.query = queryWithRetry;

module.exports = pool;
