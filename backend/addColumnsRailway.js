const { Pool } = require('pg');

const pool = new Pool({
  host: 'mainline.proxy.rlwy.net',
  port: 19436,
  database: 'railway',
  user: 'postgres',
  password: 'AujMSGZWwRuSBMkdnbDzYUtYEXuDqfHK',
  ssl: { rejectUnauthorized: false }
});

async function checkAndAddAllColumns() {
  try {
    console.log('Railway veritabanına bağlanılıyor...\n');
    
    // Mevcut tabloları kontrol et
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('📋 Mevcut tablolar:', tablesResult.rows.map(r => r.table_name).join(', '));
    console.log('');
    
    // ============ KULLANICILAR TABLOSU ============
    console.log('🔍 Kullanıcılar tablosu kontrol ediliyor...');
    const kullanicilarCols = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'kullanicilar'
    `);
    const kullanicilarColNames = kullanicilarCols.rows.map(r => r.column_name);
    console.log('  Mevcut kolonlar:', kullanicilarColNames.join(', '));
    
    if (!kullanicilarColNames.includes('aksesuar_yetkisi')) {
      await pool.query(`ALTER TABLE kullanicilar ADD COLUMN aksesuar_yetkisi BOOLEAN DEFAULT FALSE`);
      console.log('  ✅ aksesuar_yetkisi kolonu eklendi');
    } else {
      console.log('  ✓ aksesuar_yetkisi zaten var');
    }
    
    if (!kullanicilarColNames.includes('plain_sifre')) {
      await pool.query(`ALTER TABLE kullanicilar ADD COLUMN plain_sifre VARCHAR(255)`);
      console.log('  ✅ plain_sifre kolonu eklendi');
    } else {
      console.log('  ✓ plain_sifre zaten var');
    }
    
    if (!kullanicilarColNames.includes('onay_durumu')) {
      await pool.query(`ALTER TABLE kullanicilar ADD COLUMN onay_durumu VARCHAR(20) DEFAULT 'beklemede'`);
      console.log('  ✅ onay_durumu kolonu eklendi');
    } else {
      console.log('  ✓ onay_durumu zaten var');
    }
    
    console.log('');
    
    // ============ IS_EMIRLERI TABLOSU ============
    console.log('🔍 İş emirleri tablosu kontrol ediliyor...');
    const isEmirleriCols = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'is_emirleri'
    `);
    const isEmirleriColNames = isEmirleriCols.rows.map(r => r.column_name);
    console.log('  Mevcut kolonlar:', isEmirleriColNames.join(', '));
    
    if (!isEmirleriColNames.includes('tamamlama_tarihi')) {
      await pool.query(`ALTER TABLE is_emirleri ADD COLUMN tamamlama_tarihi TIMESTAMP`);
      console.log('  ✅ tamamlama_tarihi kolonu eklendi');
    } else {
      console.log('  ✓ tamamlama_tarihi zaten var');
    }
    
    if (!isEmirleriColNames.includes('odeme_detaylari')) {
      await pool.query(`ALTER TABLE is_emirleri ADD COLUMN odeme_detaylari TEXT`);
      console.log('  ✅ odeme_detaylari kolonu eklendi');
    } else {
      console.log('  ✓ odeme_detaylari zaten var');
    }
    
    if (!isEmirleriColNames.includes('olusturan_kullanici_id')) {
      await pool.query(`ALTER TABLE is_emirleri ADD COLUMN olusturan_kullanici_id INTEGER`);
      console.log('  ✅ olusturan_kullanici_id kolonu eklendi');
    } else {
      console.log('  ✓ olusturan_kullanici_id zaten var');
    }
    
    if (!isEmirleriColNames.includes('km')) {
      await pool.query(`ALTER TABLE is_emirleri ADD COLUMN km INTEGER`);
      console.log('  ✅ km kolonu eklendi');
    } else {
      console.log('  ✓ km zaten var');
    }
    
    if (!isEmirleriColNames.includes('kar')) {
      await pool.query(`ALTER TABLE is_emirleri ADD COLUMN kar DECIMAL(10, 2) DEFAULT 0`);
      console.log('  ✅ kar kolonu eklendi');
    } else {
      console.log('  ✓ kar zaten var');
    }
    
    if (!isEmirleriColNames.includes('toplam_maliyet')) {
      await pool.query(`ALTER TABLE is_emirleri ADD COLUMN toplam_maliyet DECIMAL(10, 2) DEFAULT 0`);
      console.log('  ✅ toplam_maliyet kolonu eklendi');
    } else {
      console.log('  ✓ toplam_maliyet zaten var');
    }
    
    console.log('');
    
    // ============ AKSESUARLAR TABLOSU ============
    console.log('🔍 Aksesuarlar tablosu kontrol ediliyor...');
    const aksesuarlarExists = tablesResult.rows.some(r => r.table_name === 'aksesuarlar');
    
    if (!aksesuarlarExists) {
      await pool.query(`
        CREATE TABLE aksesuarlar (
          id SERIAL PRIMARY KEY,
          ad_soyad VARCHAR(100),
          telefon VARCHAR(20),
          urun_adi VARCHAR(255),
          odeme_tutari DECIMAL(10, 2) DEFAULT 0,
          odeme_sekli VARCHAR(50),
          aciklama TEXT,
          durum VARCHAR(50) DEFAULT 'beklemede',
          olusturan_kullanici_id INTEGER REFERENCES kullanicilar(id),
          olusturan_kisi VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('  ✅ Aksesuarlar tablosu oluşturuldu');
    } else {
      const aksesuarlarCols = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'aksesuarlar'
      `);
      const aksesuarlarColNames = aksesuarlarCols.rows.map(r => r.column_name);
      console.log('  Mevcut kolonlar:', aksesuarlarColNames.join(', '));
      
      if (!aksesuarlarColNames.includes('durum')) {
        await pool.query(`ALTER TABLE aksesuarlar ADD COLUMN durum VARCHAR(50) DEFAULT 'beklemede'`);
        console.log('  ✅ durum kolonu eklendi');
      } else {
        console.log('  ✓ durum zaten var');
      }
      
      if (!aksesuarlarColNames.includes('odeme_sekli')) {
        await pool.query(`ALTER TABLE aksesuarlar ADD COLUMN odeme_sekli VARCHAR(50)`);
        console.log('  ✅ odeme_sekli kolonu eklendi');
      } else {
        console.log('  ✓ odeme_sekli zaten var');
      }
      
      if (!aksesuarlarColNames.includes('toplam_maliyet')) {
        await pool.query(`ALTER TABLE aksesuarlar ADD COLUMN toplam_maliyet DECIMAL(10, 2) DEFAULT 0`);
        console.log('  ✅ toplam_maliyet kolonu eklendi');
      } else {
        console.log('  ✓ toplam_maliyet zaten var');
      }
      
      if (!aksesuarlarColNames.includes('toplam_satis')) {
        await pool.query(`ALTER TABLE aksesuarlar ADD COLUMN toplam_satis DECIMAL(10, 2) DEFAULT 0`);
        console.log('  ✅ toplam_satis kolonu eklendi');
      } else {
        console.log('  ✓ toplam_satis zaten var');
      }
      
      if (!aksesuarlarColNames.includes('kar')) {
        await pool.query(`ALTER TABLE aksesuarlar ADD COLUMN kar DECIMAL(10, 2) DEFAULT 0`);
        console.log('  ✅ kar kolonu eklendi');
      } else {
        console.log('  ✓ kar zaten var');
      }
      
      if (!aksesuarlarColNames.includes('odeme_detaylari')) {
        await pool.query(`ALTER TABLE aksesuarlar ADD COLUMN odeme_detaylari TEXT`);
        console.log('  ✅ odeme_detaylari kolonu eklendi');
      } else {
        console.log('  ✓ odeme_detaylari zaten var');
      }
      
      if (!aksesuarlarColNames.includes('satis_tarihi')) {
        await pool.query(`ALTER TABLE aksesuarlar ADD COLUMN satis_tarihi DATE DEFAULT CURRENT_DATE`);
        console.log('  ✅ satis_tarihi kolonu eklendi');
      } else {
        console.log('  ✓ satis_tarihi zaten var');
      }
      
      if (!aksesuarlarColNames.includes('tamamlama_tarihi')) {
        await pool.query(`ALTER TABLE aksesuarlar ADD COLUMN tamamlama_tarihi TIMESTAMP`);
        console.log('  ✅ tamamlama_tarihi kolonu eklendi');
      } else {
        console.log('  ✓ tamamlama_tarihi zaten var');
      }

      if (!aksesuarlarColNames.includes('olusturan_kullanici_id')) {
        await pool.query(`ALTER TABLE aksesuarlar ADD COLUMN olusturan_kullanici_id INTEGER REFERENCES kullanicilar(id)`);
        console.log('  ✅ olusturan_kullanici_id kolonu eklendi');
      } else {
        console.log('  ✓ olusturan_kullanici_id zaten var');
      }

      if (!aksesuarlarColNames.includes('olusturan_kisi')) {
        await pool.query(`ALTER TABLE aksesuarlar ADD COLUMN olusturan_kisi VARCHAR(100)`);
        console.log('  ✅ olusturan_kisi kolonu eklendi');
      } else {
        console.log('  ✓ olusturan_kisi zaten var');
      }
    }
    
    console.log('');
    
    // ============ AKSESUAR_PARCALAR TABLOSU ============
    console.log('🔍 Aksesuar parçaları tablosu kontrol ediliyor...');
    const aksesuarParcalarExists = tablesResult.rows.some(r => r.table_name === 'aksesuar_parcalar');
    
    if (!aksesuarParcalarExists) {
      await pool.query(`
        CREATE TABLE aksesuar_parcalar (
          id SERIAL PRIMARY KEY,
          aksesuar_id INTEGER REFERENCES aksesuarlar(id) ON DELETE CASCADE,
          urun_adi VARCHAR(255),
          adet INTEGER DEFAULT 1,
          maliyet DECIMAL(10, 2) DEFAULT 0,
          satis_fiyati DECIMAL(10, 2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('  ✅ Aksesuar parçaları tablosu oluşturuldu');
    } else {
      console.log('  ✓ Aksesuar parçaları tablosu zaten var');
    }
    
    console.log('');
    
    // ============ PARCALAR TABLOSU ============
    console.log('🔍 Parçalar tablosu kontrol ediliyor...');
    const parcalarExists = tablesResult.rows.some(r => r.table_name === 'parcalar');
    
    if (!parcalarExists) {
      await pool.query(`
        CREATE TABLE parcalar (
          id SERIAL PRIMARY KEY,
          is_emri_id INTEGER REFERENCES is_emirleri(id) ON DELETE CASCADE,
          parca_kodu VARCHAR(50),
          takilan_parca VARCHAR(200),
          adet INTEGER DEFAULT 1,
          birim_fiyat DECIMAL(10, 2) DEFAULT 0,
          maliyet DECIMAL(10, 2) DEFAULT 0,
          toplam_fiyat DECIMAL(10, 2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('  ✅ Parçalar tablosu oluşturuldu');
    } else {
      const parcalarCols = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'parcalar'
      `);
      const parcalarColNames = parcalarCols.rows.map(r => r.column_name);
      console.log('  Mevcut kolonlar:', parcalarColNames.join(', '));
      
      if (!parcalarColNames.includes('maliyet')) {
        await pool.query(`ALTER TABLE parcalar ADD COLUMN maliyet DECIMAL(10, 2) DEFAULT 0`);
        console.log('  ✅ maliyet kolonu eklendi');
      } else {
        console.log('  ✓ maliyet zaten var');
      }
    }
    
    console.log('');
    
    // ============ AKTIVITE_LOG TABLOSU ============
    console.log('🔍 Aktivite log tablosu kontrol ediliyor...');
    const aktiviteLogExists = tablesResult.rows.some(r => r.table_name === 'aktivite_log');
    
    if (!aktiviteLogExists) {
      await pool.query(`
        CREATE TABLE aktivite_log (
          id SERIAL PRIMARY KEY,
          kullanici_id INTEGER,
          kullanici_adi VARCHAR(50),
          islem_tipi VARCHAR(50) NOT NULL,
          islem_detay TEXT,
          hedef_tablo VARCHAR(50),
          hedef_id INTEGER,
          ip_adresi VARCHAR(45),
          tarayici_bilgisi TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('  ✅ Aktivite log tablosu oluşturuldu');
    } else {
      console.log('  ✓ Aktivite log tablosu zaten var');
    }
    
    console.log('');
    
    // ============ YAZICI_AYARLARI TABLOSU ============
    console.log('🔍 Yazıcı ayarları tablosu kontrol ediliyor...');
    const yaziciAyarlariExists = tablesResult.rows.some(r => r.table_name === 'yazici_ayarlari');
    
    if (!yaziciAyarlariExists) {
      await pool.query(`
        CREATE TABLE yazici_ayarlari (
          id SERIAL PRIMARY KEY,
          ayar_adi VARCHAR(50) UNIQUE NOT NULL DEFAULT 'default',
          ayarlar JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('  ✅ Yazıcı ayarları tablosu oluşturuldu');
    } else {
      console.log('  ✓ Yazıcı ayarları tablosu zaten var');
    }
    
    console.log('');
    
    // ============ GIDERLER TABLOSU ============
    console.log('🔍 Giderler tablosu kontrol ediliyor...');
    const giderlerExists = tablesResult.rows.some(r => r.table_name === 'giderler');
    
    if (!giderlerExists) {
      await pool.query(`
        CREATE TABLE giderler (
          id SERIAL PRIMARY KEY,
          aciklama VARCHAR(255) NOT NULL,
          tutar DECIMAL(10, 2) NOT NULL,
          kategori VARCHAR(50),
          tarih DATE DEFAULT CURRENT_DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('  ✅ Giderler tablosu oluşturuldu');
    } else {
      console.log('  ✓ Giderler tablosu zaten var');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Veritabanı şema kontrolü tamamlandı!');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

checkAndAddAllColumns();
