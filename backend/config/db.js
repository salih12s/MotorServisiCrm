const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'motor_servisi_crm',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL veritabanına bağlandı');
  console.log(`📊 Database: ${process.env.DB_NAME || 'motor_servisi_crm'}`);
  console.log(`🌐 Host: ${process.env.DB_HOST || 'localhost'}`);
});

pool.on('error', (err) => {
  console.error('❌ Veritabanı bağlantı hatası:', err);
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection test failed:', err.message);
  } else {
    console.log('✅ Database connection test successful');
  }
});

module.exports = pool;
