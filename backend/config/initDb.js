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

    // Kullanıcılar tablosuna aksesuar_yetkisi sütunu ekle (eğer yoksa)
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kullanicilar' AND column_name='aksesuar_yetkisi') THEN
          ALTER TABLE kullanicilar ADD COLUMN aksesuar_yetkisi BOOLEAN DEFAULT FALSE;
        END IF;
      END $$;
    `);
    console.log('✓ Kullanıcılar tablosuna aksesuar_yetkisi sütunu eklendi');

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

    // İş emirlerine olusturan_kisi kolonu ekle (eğer yoksa)
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='is_emirleri' AND column_name='olusturan_kisi') THEN
          ALTER TABLE is_emirleri ADD COLUMN olusturan_kisi VARCHAR(100);
        END IF;
      END $$;
    `);
    console.log('✓ İş emirlerine olusturan_kisi kolonu eklendi');

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
        durum VARCHAR(50) DEFAULT 'beklemede',
        toplam_maliyet DECIMAL(10, 2) DEFAULT 0,
        toplam_satis DECIMAL(10, 2) DEFAULT 0,
        kar DECIMAL(10, 2) DEFAULT 0,
        odeme_detaylari TEXT,
        satis_tarihi DATE DEFAULT CURRENT_DATE,
        olusturan_kullanici_id INTEGER REFERENCES kullanicilar(id),
        olusturan_kisi VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Aksesuarlar tablosu oluşturuldu');

    // Aksesuarlar tablosuna eksik kolonları ekle
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='aksesuarlar' AND column_name='durum') THEN
          ALTER TABLE aksesuarlar ADD COLUMN durum VARCHAR(50) DEFAULT 'beklemede';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='aksesuarlar' AND column_name='toplam_maliyet') THEN
          ALTER TABLE aksesuarlar ADD COLUMN toplam_maliyet DECIMAL(10, 2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='aksesuarlar' AND column_name='toplam_satis') THEN
          ALTER TABLE aksesuarlar ADD COLUMN toplam_satis DECIMAL(10, 2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='aksesuarlar' AND column_name='kar') THEN
          ALTER TABLE aksesuarlar ADD COLUMN kar DECIMAL(10, 2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='aksesuarlar' AND column_name='odeme_detaylari') THEN
          ALTER TABLE aksesuarlar ADD COLUMN odeme_detaylari TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='aksesuarlar' AND column_name='satis_tarihi') THEN
          ALTER TABLE aksesuarlar ADD COLUMN satis_tarihi DATE DEFAULT CURRENT_DATE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name='aksesuarlar' AND column_name='tamamlama_tarihi') THEN
          ALTER TABLE aksesuarlar ADD COLUMN tamamlama_tarihi TIMESTAMP;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name='aksesuarlar' AND column_name='olusturan_kullanici_id') THEN
          ALTER TABLE aksesuarlar ADD COLUMN olusturan_kullanici_id INTEGER REFERENCES kullanicilar(id);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name='aksesuarlar' AND column_name='olusturan_kisi') THEN
          ALTER TABLE aksesuarlar ADD COLUMN olusturan_kisi VARCHAR(100);
        END IF;
      END $$;
    `);
    console.log('✓ Aksesuarlar tablosuna yeni kolonlar eklendi');

    // Aksesuar Parçaları tablosu
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
    console.log('✓ Aksesuar Parçaları tablosu oluşturuldu');

    // Motor Modelleri tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS motor_modelleri (
        id SERIAL PRIMARY KEY,
        model_adi VARCHAR(255) NOT NULL,
        cc VARCHAR(50),
        otv_orani DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Motor Modelleri tablosu oluşturuldu');

    // Motor Satışları tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS motor_satislari (
        id SERIAL PRIMARY KEY,
        tarih DATE DEFAULT CURRENT_DATE,
        sase_no VARCHAR(100) NOT NULL,
        motor_modeli_id INTEGER REFERENCES motor_modelleri(id) ON DELETE SET NULL,
        iskonto DECIMAL(12,2) DEFAULT 0,
        alis_fiyati DECIMAL(12,2) DEFAULT 0,
        satis_fiyati DECIMAL(12,2) DEFAULT 0,
        fatura_fiyati DECIMAL(12,2) DEFAULT 0,
        kar DECIMAL(12,2) DEFAULT 0,
        odeme_sekli VARCHAR(50) DEFAULT 'nakit',
        nakit_tutar DECIMAL(12,2) DEFAULT 0,
        kart_tutar DECIMAL(12,2) DEFAULT 0,
        havale_tutar DECIMAL(12,2) DEFAULT 0,
        musteri_adi VARCHAR(255),
        musteri_telefon VARCHAR(50),
        tc_kimlik_no VARCHAR(20),
        adres TEXT,
        aciklama TEXT,
        iskonto_tutari DECIMAL(12,2) DEFAULT 0,
        iskontolu_alis_fiyati DECIMAL(12,2) DEFAULT 0,
        matrah_satis DECIMAL(12,2) DEFAULT 0,
        kdv_tutari DECIMAL(12,2) DEFAULT 0,
        kdvsiz_tutar DECIMAL(12,2) DEFAULT 0,
        otv_tutari DECIMAL(12,2) DEFAULT 0,
        damga_vergisi DECIMAL(12,2) DEFAULT 791,
        vergiler_toplami DECIMAL(12,2) DEFAULT 0,
        durum VARCHAR(50) DEFAULT 'beklemede',
        olusturan_kullanici_id INTEGER REFERENCES kullanicilar(id),
        olusturan_kisi VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Motor Satışları tablosu oluşturuldu');

    // Motor satışları tablosuna eksik kolonları ekle (mevcut tablolar için)
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='motor_satislari' AND column_name='fatura_fiyati') THEN
          ALTER TABLE motor_satislari ADD COLUMN fatura_fiyati DECIMAL(12,2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='motor_satislari' AND column_name='nakit_tutar') THEN
          ALTER TABLE motor_satislari ADD COLUMN nakit_tutar DECIMAL(12,2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='motor_satislari' AND column_name='kart_tutar') THEN
          ALTER TABLE motor_satislari ADD COLUMN kart_tutar DECIMAL(12,2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='motor_satislari' AND column_name='havale_tutar') THEN
          ALTER TABLE motor_satislari ADD COLUMN havale_tutar DECIMAL(12,2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='motor_satislari' AND column_name='tc_kimlik_no') THEN
          ALTER TABLE motor_satislari ADD COLUMN tc_kimlik_no VARCHAR(20);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='motor_satislari' AND column_name='adres') THEN
          ALTER TABLE motor_satislari ADD COLUMN adres TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='motor_satislari' AND column_name='iskonto_tutari') THEN
          ALTER TABLE motor_satislari ADD COLUMN iskonto_tutari DECIMAL(12,2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='motor_satislari' AND column_name='iskontolu_alis_fiyati') THEN
          ALTER TABLE motor_satislari ADD COLUMN iskontolu_alis_fiyati DECIMAL(12,2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='motor_satislari' AND column_name='matrah_satis') THEN
          ALTER TABLE motor_satislari ADD COLUMN matrah_satis DECIMAL(12,2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='motor_satislari' AND column_name='kdv_tutari') THEN
          ALTER TABLE motor_satislari ADD COLUMN kdv_tutari DECIMAL(12,2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='motor_satislari' AND column_name='kdvsiz_tutar') THEN
          ALTER TABLE motor_satislari ADD COLUMN kdvsiz_tutar DECIMAL(12,2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='motor_satislari' AND column_name='otv_tutari') THEN
          ALTER TABLE motor_satislari ADD COLUMN otv_tutari DECIMAL(12,2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='motor_satislari' AND column_name='damga_vergisi') THEN
          ALTER TABLE motor_satislari ADD COLUMN damga_vergisi DECIMAL(12,2) DEFAULT 791;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='motor_satislari' AND column_name='vergiler_toplami') THEN
          ALTER TABLE motor_satislari ADD COLUMN vergiler_toplami DECIMAL(12,2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='motor_satislari' AND column_name='durum') THEN
          ALTER TABLE motor_satislari ADD COLUMN durum VARCHAR(50) DEFAULT 'beklemede';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='motor_satislari' AND column_name='olusturan_kullanici_id') THEN
          ALTER TABLE motor_satislari ADD COLUMN olusturan_kullanici_id INTEGER REFERENCES kullanicilar(id);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='motor_satislari' AND column_name='olusturan_kisi') THEN
          ALTER TABLE motor_satislari ADD COLUMN olusturan_kisi VARCHAR(100);
        END IF;
      END $$;
    `);
    console.log('✓ Motor Satışları tablosuna eksik kolonlar eklendi');

    // Kullanıcılar tablosuna motor_satis_yetkisi sütunu ekle (eğer yoksa)
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kullanicilar' AND column_name='motor_satis_yetkisi') THEN
          ALTER TABLE kullanicilar ADD COLUMN motor_satis_yetkisi BOOLEAN DEFAULT FALSE;
        END IF;
      END $$;
    `);
    console.log('✓ Kullanıcılar tablosuna motor_satis_yetkisi sütunu eklendi');

    // Aksesuar Stok tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS aksesuar_stok (
        id SERIAL PRIMARY KEY,
        stok_kodu VARCHAR(20) UNIQUE NOT NULL,
        stok_adi VARCHAR(255) NOT NULL,
        giren_miktar INTEGER DEFAULT 0,
        cikan_miktar INTEGER DEFAULT 0,
        mevcut INTEGER DEFAULT 0,
        birimi VARCHAR(20) DEFAULT 'Adet',
        alis_fiyati DECIMAL(10, 2) DEFAULT 0,
        satis_fiyati DECIMAL(10, 2) DEFAULT 0,
        envanter_degeri DECIMAL(12, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Aksesuar Stok tablosu oluşturuldu');

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
