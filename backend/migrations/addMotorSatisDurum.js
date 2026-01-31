const pool = require('../config/db');

async function addMotorSatisDurum() {
  try {
    console.log('Motor satış durum sütunu ekleniyor...');

    // Durum sütunu ekle
    await pool.query(`
      ALTER TABLE motor_satislari 
      ADD COLUMN IF NOT EXISTS durum VARCHAR(50) DEFAULT 'beklemede'
    `);
    console.log('✓ durum sütunu eklendi');

    console.log('\n✅ Motor satış durum sütunu başarıyla eklendi!');
    process.exit(0);
  } catch (error) {
    console.error('Migration hatası:', error);
    process.exit(1);
  }
}

addMotorSatisDurum();
