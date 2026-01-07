const pool = require('./config/db');

async function addDurumColumn() {
  try {
    await pool.query(`
      ALTER TABLE aksesuarlar 
      ADD COLUMN IF NOT EXISTS durum VARCHAR(50) DEFAULT 'beklemede'
    `);
    console.log('Durum sütunu eklendi ✅');
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

addDurumColumn();
