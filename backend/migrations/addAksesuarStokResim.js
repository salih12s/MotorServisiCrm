const pool = require('../config/db');

async function addAksesuarStokResim() {
  try {
    console.log('Aksesuar stok resim sütunu ekleniyor...');

    // Resim sütunu ekle (base64 data URL olarak saklanır)
    await pool.query(`
      ALTER TABLE aksesuar_stok 
      ADD COLUMN IF NOT EXISTS resim TEXT
    `);
    console.log('✓ resim sütunu eklendi');

    console.log('\n✅ Aksesuar stok resim sütunu başarıyla eklendi!');
    process.exit(0);
  } catch (error) {
    console.error('Migration hatası:', error);
    process.exit(1);
  }
}

addAksesuarStokResim();
