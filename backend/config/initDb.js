const pool = require('./db');
const bcrypt = require('bcryptjs');

const initDatabase = async () => {
  try {
    // Kullanıcılar tablosu (Login için)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kullanicilar (
        id SERIAL PRIMARY KEY,
        kullanici_adi VARCHAR(50) UNIQUE NOT NULL,
        sifre VARCHAR(255) NOT NULL,
        ad_soyad VARCHAR(100) NOT NULL,
        rol VARCHAR(20) DEFAULT 'personel',
        onay_durumu VARCHAR(20) DEFAULT 'beklemede',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Kullanıcılar tablosu oluşturuldu');

    // Onay durumu kolonunu ekle (eğer yoksa)
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='kullanicilar' AND column_name='onay_durumu') THEN
          ALTER TABLE kullanicilar ADD COLUMN onay_durumu VARCHAR(20) DEFAULT 'beklemede';
        END IF;
      END $$;
    `);

    // İş emirlerine oluşturan kullanıcı kolonunu ekle (eğer yoksa)
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='is_emirleri' AND column_name='olusturan_kullanici_id') THEN
          ALTER TABLE is_emirleri ADD COLUMN olusturan_kullanici_id INTEGER REFERENCES kullanicilar(id);
        END IF;
      END $$;
    `);

    // İş emirlerine km kolonunu ekle (eğer yoksa)
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='is_emirleri' AND column_name='km') THEN
          ALTER TABLE is_emirleri ADD COLUMN km INTEGER;
        END IF;
      END $$;
    `);

    // NOT NULL kısıtlamalarını kaldır (mevcut tablolar için)
    await pool.query(`
      DO $$
      BEGIN
        -- is_emirleri tablosunda musteri_ad_soyad NOT NULL kısıtlamasını kaldır
        ALTER TABLE is_emirleri ALTER COLUMN musteri_ad_soyad DROP NOT NULL;
      EXCEPTION
        WHEN others THEN NULL;
      END $$;
    `);

    await pool.query(`
      DO $$
      BEGIN
        -- musteriler tablosunda ad_soyad NOT NULL kısıtlamasını kaldır
        ALTER TABLE musteriler ALTER COLUMN ad_soyad DROP NOT NULL;
      EXCEPTION
        WHEN others THEN NULL;
      END $$;
    `);

    await pool.query(`
      DO $$
      BEGIN
        -- parcalar tablosunda takilan_parca NOT NULL kısıtlamasını kaldır
        ALTER TABLE parcalar ALTER COLUMN takilan_parca DROP NOT NULL;
      EXCEPTION
        WHEN others THEN NULL;
      END $$;
    `);
    console.log('✓ NOT NULL kısıtlamaları kaldırıldı (tüm alanlar opsiyonel)');

    // Müşteriler tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS musteriler (
        id SERIAL PRIMARY KEY,
        ad_soyad VARCHAR(100),
        adres TEXT,
        telefon VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Müşteriler tablosu oluşturuldu');

    // İş Emirleri tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS is_emirleri (
        id SERIAL PRIMARY KEY,
        fis_no INTEGER UNIQUE,
        musteri_id INTEGER REFERENCES musteriler(id),
        musteri_ad_soyad VARCHAR(100),
        adres TEXT,
        telefon VARCHAR(20),
        model_tip VARCHAR(100),
        marka VARCHAR(100),
        aciklama TEXT,
        ariza_sikayetler TEXT,
        tahmini_teslim_tarihi DATE,
        tahmini_toplam_ucret DECIMAL(10, 2) DEFAULT 0,
        gercek_toplam_ucret DECIMAL(10, 2) DEFAULT 0,
        toplam_maliyet DECIMAL(10, 2) DEFAULT 0,
        kar DECIMAL(10, 2) DEFAULT 0,
        durum VARCHAR(20) DEFAULT 'acik',
        musteri_imza BOOLEAN DEFAULT FALSE,
        teslim_alan_ad_soyad VARCHAR(100),
        teslim_eden_teknisyen VARCHAR(100),
        teslim_tarihi DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ İş Emirleri tablosu oluşturuldu');

    // Parçalar tablosu (İş emrine eklenen parçalar)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS parcalar (
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
    console.log('✓ Parçalar tablosu oluşturuldu');

    // Giderler tablosu (Genel giderler için)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS giderler (
        id SERIAL PRIMARY KEY,
        aciklama VARCHAR(255) NOT NULL,
        tutar DECIMAL(10, 2) NOT NULL,
        kategori VARCHAR(50),
        tarih DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Giderler tablosu oluşturuldu');

    // Aktivite Log tablosu (Kullanıcı aktivitelerini takip için)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS aktivite_log (
        id SERIAL PRIMARY KEY,
        kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE SET NULL,
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
    console.log('✓ Aktivite Log tablosu oluşturuldu');

    // Yazıcı Ayarları tablosu (Yazdırma pozisyonları için)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS yazici_ayarlari (
        id SERIAL PRIMARY KEY,
        ayar_adi VARCHAR(50) UNIQUE NOT NULL DEFAULT 'default',
        ayarlar JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Yazıcı Ayarları tablosu oluşturuldu');

    // Kullanıcılar tablosuna plain_sifre kolonu ekle (eğer yoksa)
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='kullanicilar' AND column_name='plain_sifre') THEN
          ALTER TABLE kullanicilar ADD COLUMN plain_sifre VARCHAR(255);
        END IF;
      END $$;
    `);
    console.log('✓ Kullanıcılar tablosuna plain_sifre kolonu eklendi');

    // İş emirlerine odeme_detaylari kolonu ekle (eğer yoksa)
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='is_emirleri' AND column_name='odeme_detaylari') THEN
          ALTER TABLE is_emirleri ADD COLUMN odeme_detaylari TEXT;
        END IF;
      END $$;
    `);
    console.log('✓ İş emirlerine odeme_detaylari kolonu eklendi');

    // İş emirlerine tamamlama_tarihi kolonu ekle (eğer yoksa)
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='is_emirleri' AND column_name='tamamlama_tarihi') THEN
          ALTER TABLE is_emirleri ADD COLUMN tamamlama_tarihi TIMESTAMP;
        END IF;
      END $$;
    `);
    console.log('✓ İş emirlerine tamamlama_tarihi kolonu eklendi');

    // Aksesuarlar tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS aksesuarlar (
        id SERIAL PRIMARY KEY,
        ad_soyad VARCHAR(100),
        telefon VARCHAR(20),
        urun_adi VARCHAR(255),
        odeme_tutari DECIMAL(10, 2) DEFAULT 0,
        odeme_sekli VARCHAR(50),
        aciklama TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Aksesuarlar tablosu oluşturuldu');

    // Varsayılan admin kullanıcısı oluştur
    const adminExists = await pool.query(
      'SELECT * FROM kullanicilar WHERE kullanici_adi = $1',
      ['demirkan1']
    );

    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('demirkan1', 10);
      await pool.query(
        'INSERT INTO kullanicilar (kullanici_adi, sifre, plain_sifre, ad_soyad, rol, onay_durumu) VALUES ($1, $2, $3, $4, $5, $6)',
        ['demirkan1', hashedPassword, 'demirkan1', 'Demirkan Yönetici', 'admin', 'onaylandi']
      );
      console.log('✓ Varsayılan admin kullanıcısı oluşturuldu (demirkan1 / demirkan1)');
    } else {
      // Admin kullanıcısının onay durumunu güncelle
      await pool.query(
        "UPDATE kullanicilar SET onay_durumu = 'onaylandi' WHERE kullanici_adi = 'demirkan1'"
      );
    }

    console.log('\n✅ Veritabanı başarıyla başlatıldı!');
  } catch (error) {
    console.error('Veritabanı başlatma hatası:', error);
    throw error;
  }
};

module.exports = initDatabase;
