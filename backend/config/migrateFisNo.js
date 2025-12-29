// Fiş numarası kolonunu VARCHAR'dan INTEGER'a çevirmek için migration
const pool = require('./db');

async function migrateFisNo() {
  const client = await pool.connect();
  
  try {
    console.log('Fiş numarası migration başlatılıyor...');
    
    // Mevcut fis_no kolonunu silip yeni INTEGER tipinde oluştur
    await client.query(`
      ALTER TABLE is_emirleri 
      DROP COLUMN IF EXISTS fis_no
    `);
    console.log('✓ Eski fis_no kolonu silindi');
    
    await client.query(`
      ALTER TABLE is_emirleri 
      ADD COLUMN fis_no INTEGER UNIQUE
    `);
    console.log('✓ Yeni fis_no kolonu eklendi (INTEGER)');
    
    console.log('✓ Migration tamamlandı!');
  } catch (error) {
    console.error('Migration hatası:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrateFisNo();
