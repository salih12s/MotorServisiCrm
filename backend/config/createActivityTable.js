const pool = require('./db');

async function createTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS aktivite_log (
        id SERIAL PRIMARY KEY,
        kullanici_id INTEGER REFERENCES kullanicilar(id),
        islem_tipi VARCHAR(50) NOT NULL,
        aciklama TEXT,
        detaylar JSONB,
        ip_adresi VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('aktivite_log tablosu oluşturuldu/kontrol edildi');
    
    // Index ekle
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_aktivite_log_kullanici ON aktivite_log(kullanici_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_aktivite_log_islem_tipi ON aktivite_log(islem_tipi);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_aktivite_log_created_at ON aktivite_log(created_at);
    `);
    console.log('Indexler oluşturuldu');
    
    process.exit(0);
  } catch(e) {
    console.error('Hata:', e);
    process.exit(1);
  }
}

createTable();
