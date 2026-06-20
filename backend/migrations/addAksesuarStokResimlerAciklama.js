const pool = require('../config/db');

async function addAksesuarStokResimlerAciklama() {
  try {
    console.log('Aksesuar stok resimler ve aciklama sütunları ekleniyor...');

    // Çoklu fotoğraflar (JSON array of base64 data URL) ve opsiyonel açıklama
    await pool.query(`
      ALTER TABLE aksesuar_stok 
      ADD COLUMN IF NOT EXISTS resimler TEXT
    `);
    console.log('✓ resimler sütunu eklendi');

    await pool.query(`
      ALTER TABLE aksesuar_stok 
      ADD COLUMN IF NOT EXISTS aciklama TEXT
    `);
    console.log('✓ aciklama sütunu eklendi');

    console.log('\n✅ Aksesuar stok resimler/aciklama sütunları başarıyla eklendi!');
    process.exit(0);
  } catch (error) {
    console.error('Migration hatası:', error);
    process.exit(1);
  }
}

addAksesuarStokResimlerAciklama();
