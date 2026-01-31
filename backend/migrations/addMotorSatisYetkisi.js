const pool = require('../config/db');

async function addMotorSatisYetkisi() {
  try {
    console.log('Motor satış yetkisi sütunu ekleniyor...');
    
    // motor_satis_yetkisi sütunu ekle
    await pool.query(`
      ALTER TABLE kullanicilar 
      ADD COLUMN IF NOT EXISTS motor_satis_yetkisi BOOLEAN DEFAULT FALSE
    `);
    
    console.log('motor_satis_yetkisi sütunu başarıyla eklendi!');
    
  } catch (error) {
    console.error('Migration hatası:', error);
    throw error;
  }
}

// Eğer doğrudan çalıştırılırsa
if (require.main === module) {
  addMotorSatisYetkisi()
    .then(() => {
      console.log('Migration tamamlandı');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration başarısız:', err);
      process.exit(1);
    });
}

module.exports = addMotorSatisYetkisi;
