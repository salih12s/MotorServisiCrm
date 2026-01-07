const pool = require('./config/db');

async function test() {
  try {
    // Tabloları listele
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Mevcut tablolar:', tables.rows.map(x => x.table_name));
    
    // Aksesuarlar tablosu var mı?
    const hasAksesuarlar = tables.rows.some(x => x.table_name === 'aksesuarlar');
    console.log('Aksesuarlar tablosu var mı:', hasAksesuarlar ? 'EVET ✅' : 'HAYIR ❌');
    
    if (!hasAksesuarlar) {
      console.log('Tablo oluşturuluyor...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS aksesuarlar (
          id SERIAL PRIMARY KEY,
          ad_soyad VARCHAR(255) NOT NULL,
          telefon VARCHAR(20),
          urun_adi VARCHAR(255) NOT NULL,
          odeme_tutari DECIMAL(10, 2) NOT NULL DEFAULT 0,
          odeme_sekli VARCHAR(50) DEFAULT 'Nakit',
          aciklama TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Aksesuarlar tablosu oluşturuldu ✅');
    }
    
    process.exit(0);
  } catch (e) {
    console.error('Hata:', e);
    process.exit(1);
  }
}

test();
