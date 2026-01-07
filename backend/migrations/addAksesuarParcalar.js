const pool = require('../config/db');

async function migrate() {
  try {
    console.log('Aksesuar parçalar tablosu oluşturuluyor...');
    
    // Aksesuar parçaları tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS aksesuar_parcalar (
        id SERIAL PRIMARY KEY,
        aksesuar_id INTEGER REFERENCES aksesuarlar(id) ON DELETE CASCADE,
        urun_adi VARCHAR(255),
        adet INTEGER DEFAULT 1,
        maliyet DECIMAL(10, 2) DEFAULT 0,
        satis_fiyati DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ aksesuar_parcalar tablosu oluşturuldu');

    // Aksesuarlar tablosuna toplam alanları ekle
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='aksesuarlar' AND column_name='toplam_maliyet') THEN
          ALTER TABLE aksesuarlar ADD COLUMN toplam_maliyet DECIMAL(10, 2) DEFAULT 0;
        END IF;
      END $$;
    `);
    console.log('✅ aksesuarlar.toplam_maliyet kolonu eklendi');

    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='aksesuarlar' AND column_name='toplam_satis') THEN
          ALTER TABLE aksesuarlar ADD COLUMN toplam_satis DECIMAL(10, 2) DEFAULT 0;
        END IF;
      END $$;
    `);
    console.log('✅ aksesuarlar.toplam_satis kolonu eklendi');

    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='aksesuarlar' AND column_name='kar') THEN
          ALTER TABLE aksesuarlar ADD COLUMN kar DECIMAL(10, 2) DEFAULT 0;
        END IF;
      END $$;
    `);
    console.log('✅ aksesuarlar.kar kolonu eklendi');

    console.log('\n✅ Migration tamamlandı!');
  } catch (error) {
    console.error('❌ Migration hatası:', error.message);
  } finally {
    process.exit(0);
  }
}

migrate();
