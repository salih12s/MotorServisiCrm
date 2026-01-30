const pool = require('../config/db');

async function addMotorSatisDetayColumns() {
  try {
    console.log('Motor satışları detay sütunları ekleniyor...');

    // Yeni sütunları ekle
    const columns = [
      { name: 'fatura_fiyati', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'tc_kimlik_no', type: 'VARCHAR(11)' },
      { name: 'adres', type: 'TEXT' },
      { name: 'iskonto_tutari', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'iskontolu_alis_fiyati', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'matrah_satis', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'kdv_tutari', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'kdvsiz_tutar', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'otv_tutari', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'damga_vergisi', type: 'DECIMAL(12,2) DEFAULT 791' },
      { name: 'vergiler_toplami', type: 'DECIMAL(12,2) DEFAULT 0' },
    ];

    for (const col of columns) {
      try {
        await pool.query(`
          ALTER TABLE motor_satislari 
          ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}
        `);
        console.log(`✓ ${col.name} sütunu eklendi`);
      } catch (err) {
        if (err.code === '42701') {
          console.log(`- ${col.name} sütunu zaten mevcut`);
        } else {
          throw err;
        }
      }
    }

    console.log('\n✅ Tüm detay sütunları başarıyla eklendi!');
    
  } catch (error) {
    console.error('Sütun ekleme hatası:', error);
    throw error;
  }
}

// Direkt çalıştır
addMotorSatisDetayColumns()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

module.exports = { addMotorSatisDetayColumns };
