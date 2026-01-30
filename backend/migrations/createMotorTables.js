const pool = require('../config/db');

async function createMotorTables() {
  try {
    console.log('Motor tabloları oluşturuluyor...');

    // Motor modelleri tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS motor_modelleri (
        id SERIAL PRIMARY KEY,
        model_adi VARCHAR(255) NOT NULL,
        cc VARCHAR(50),
        otv_orani DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ motor_modelleri tablosu oluşturuldu');

    // Motor satışları tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS motor_satislari (
        id SERIAL PRIMARY KEY,
        tarih DATE DEFAULT CURRENT_DATE,
        sase_no VARCHAR(100) NOT NULL,
        motor_modeli_id INTEGER REFERENCES motor_modelleri(id) ON DELETE SET NULL,
        iskonto DECIMAL(12,2) DEFAULT 0,
        alis_fiyati DECIMAL(12,2) DEFAULT 0,
        satis_fiyati DECIMAL(12,2) DEFAULT 0,
        kar DECIMAL(12,2) DEFAULT 0,
        odeme_sekli VARCHAR(50) DEFAULT 'nakit',
        musteri_adi VARCHAR(255),
        musteri_telefon VARCHAR(50),
        aciklama TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ motor_satislari tablosu oluşturuldu');

    console.log('\n✅ Tüm motor tabloları başarıyla oluşturuldu!');
    
  } catch (error) {
    console.error('Tablo oluşturma hatası:', error);
    throw error;
  }
}

// Direkt çalıştır
createMotorTables()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

module.exports = { createMotorTables };
