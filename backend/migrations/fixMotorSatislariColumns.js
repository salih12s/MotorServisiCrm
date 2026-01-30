require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function fixMotorSatislariColumns() {
  try {
    console.log('Motor Satışları tablosu kontrol ediliyor...');
    
    // Mevcut sütunları kontrol et
    const existingColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'motor_satislari'
    `);
    
    const columnNames = existingColumns.rows.map(r => r.column_name);
    console.log('Mevcut sütunlar:', columnNames);
    
    // Eklenmesi gereken sütunlar
    const columnsToAdd = [
      { name: 'tarih', type: 'DATE' },
      { name: 'sase_no', type: 'VARCHAR(100)' },
      { name: 'motor_modeli_id', type: 'INTEGER' },
      { name: 'iskonto', type: 'DECIMAL(5,2) DEFAULT 0' },
      { name: 'alis_fiyati', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'satis_fiyati', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'fatura_fiyati', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'odeme_sekli', type: 'VARCHAR(50)' },
      { name: 'musteri_adi', type: 'VARCHAR(255)' },
      { name: 'musteri_telefon', type: 'VARCHAR(20)' },
      { name: 'tc_kimlik_no', type: 'VARCHAR(20)' },
      { name: 'adres', type: 'TEXT' },
      { name: 'aciklama', type: 'TEXT' },
      { name: 'iskonto_tutari', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'iskontolu_alis_fiyati', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'matrah_satis', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'kdv_tutari', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'kdvsiz_tutar', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'otv_tutari', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'damga_vergisi', type: 'DECIMAL(12,2) DEFAULT 791' },
      { name: 'vergiler_toplami', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'kar', type: 'DECIMAL(12,2) DEFAULT 0' },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ];
    
    let addedCount = 0;
    for (const col of columnsToAdd) {
      if (!columnNames.includes(col.name)) {
        console.log(`  Ekleniyor: ${col.name} (${col.type})`);
        await pool.query(`ALTER TABLE motor_satislari ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
        addedCount++;
      }
    }
    
    if (addedCount > 0) {
      console.log(`\n✅ ${addedCount} sütun başarıyla eklendi!`);
    } else {
      console.log('\n✅ Tüm sütunlar zaten mevcut.');
    }
    
    // Son durumu göster
    const finalColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'motor_satislari'
      ORDER BY ordinal_position
    `);
    
    console.log('\nGüncel tablo yapısı:');
    finalColumns.rows.forEach(r => {
      console.log(`  - ${r.column_name}: ${r.data_type}`);
    });
    
  } catch (error) {
    console.error('Hata:', error.message);
  } finally {
    await pool.end();
  }
}

fixMotorSatislariColumns();
