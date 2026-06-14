const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const isProduction = process.env.NODE_ENV === 'production';

// Railway DATABASE_URL varsa onu kullan, yoksa ayrı parametreler
let poolConfig;

if (process.env.DATABASE_URL) {
  // DATABASE_URL varsa (Railway otomatik sağlar)
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  };
  console.log('🔗 DATABASE_URL ile bağlanılıyor...');
} else if (process.env.DB_HOST) {
  // Ayrı parametreler varsa
  poolConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'motor_servisi_crm',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };
  console.log(`🔗 ${process.env.DB_HOST}:${process.env.DB_PORT} ile bağlanılıyor...`);
} else {
  // Lokal geliştirme
  poolConfig = {
    host: 'localhost',
    port: 5432,
    database: 'motor_servisi_crm',
    user: 'postgres',
    password: 'postgres',
    ssl: false,
  };
  console.log('🔗 Lokal veritabanına bağlanılıyor...');
}

const pool = new Pool({
  ...poolConfig,
  max: isProduction ? 10 : 10,
  min: 0,
  // Railway edge proxy 15sn'de 502 döner; bağlantı timeout'u ondan kısa olmalı
  connectionTimeoutMillis: 8000,
  idleTimeoutMillis: 20000,
  allowExitOnIdle: false,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Sadece bir kere log bas
let connectionLogged = false;
pool.on('connect', () => {
  if (!connectionLogged) {
    connectionLogged = true;
    console.log('✅ PostgreSQL veritabanına bağlandı');
  }
});

pool.on('error', (err) => {
  console.error('❌ Veritabanı pool hatası:', err.message);
});

// Retry mekanizmalı query wrapper
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000;

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
        err.message?.includes('connect ECONNREFUSED') ||
        err.message?.includes('SSL') ||
        err.message?.includes('socket hang up');

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
