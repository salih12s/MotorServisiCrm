const pool = require('../config/db');

async function addMotorSatisColumns() {
  try {
    console.log('Motor satış tablosuna yeni sütunlar ekleniyor...');
    
    // Eksik sütunları ekle
    const columns = [
      { name: 'fatura_fiyati', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'iskonto_tutari', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'iskontolu_alis_fiyati', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'matrah_satis', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'kdv_tutari', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'kdvsiz_tutar', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'otv_tutari', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'damga_vergisi', type: 'DECIMAL(12,2) DEFAULT 791' },
      { name: 'vergiler_toplami', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'kar', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'aciklama', type: 'TEXT' }
    ];
    
    for (const col of columns) {
      try {
        await pool.query(`ALTER TABLE motor_satislari ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
        console.log(`✅ ${col.name} sütunu eklendi veya zaten mevcut`);
      } catch (err) {
        if (err.code === '42701') {
          console.log(`⚠️ ${col.name} sütunu zaten mevcut`);
        } else {
          console.error(`❌ ${col.name} sütunu eklenirken hata:`, err.message);
        }
      }
    }
    
    console.log('\n✅ Migration tamamlandı!');
    process.exit(0);
  } catch (error) {
    console.error('Migration hatası:', error);
    process.exit(1);
  }
}

addMotorSatisColumns();
