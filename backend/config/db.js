const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';

// Railway DATABASE_URL varsa onu kullan (daha güvenilir), yoksa ayrı parametreler
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'motor_servisi_crm',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool({
  ...poolConfig,
  max: isProduction ? 3 : 10,                 // Railway için çok az bağlantı (free tier)
  min: 0,                                      // Gerektiğinde bağlantı aç
  connectionTimeoutMillis: 30000,              // 30sn bağlantı timeout
  idleTimeoutMillis: 20000,                    // 20sn idle sonra kapat
  allowExitOnIdle: true,                       // İşlem yoksa bağlantıları kapat
  keepAlive: true,                             // TCP keepAlive
  keepAliveInitialDelayMillis: 10000,
});

// Sadece bir kere log bas
let connectionLogged = false;
pool.on('connect', () => {
  if (!connectionLogged) {
    connectionLogged = true;
    const dbName = process.env.DB_NAME || (process.env.DATABASE_URL ? 'railway' : 'motor_servisi_crm');
    const dbHost = process.env.DB_HOST || (process.env.DATABASE_URL ? 'Railway' : 'localhost');
    console.log('✅ PostgreSQL veritabanına bağlandı');
    console.log(`📊 Database: ${dbName}`);
    console.log(`🌐 Host: ${dbHost}`);
  }
});

pool.on('error', (err) => {
  console.error('❌ Veritabanı pool hatası:', err.message);
});

// Retry mekanizmalı query wrapper
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // ms

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
        err.code === '57P01' ||
        err.code === '57P03' ||
        err.message?.includes('Connection terminated') ||
        err.message?.includes('connection lost') ||
        err.message?.includes('read ECONNRESET') ||
        err.message?.includes('connect ECONNREFUSED');

      if (isConnectionError && attempt < retries) {
        console.warn(`⚠️ DB bağlantı hatası (deneme ${attempt}/${retries}): ${err.message}`);
        await sleep(RETRY_DELAY * attempt);
        continue;
      }
      throw err;
    }
  }
};

pool.query = queryWithRetry;

module.exports = pool;
