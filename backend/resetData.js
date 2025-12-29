require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'motor_servisi',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

async function resetData() {
  try {
    console.log('🔄 Veritabanı bağlantısı kuruluyor...');
    
    // Veritabanı bağlantısını test et
    await pool.query('SELECT NOW()');
    console.log('✅ Veritabanına bağlandı\n');

    console.log('⚠️  UYARI: Kullanıcılar hariç TÜM VERİLER SİLİNECEK!');
    console.log('📋 Silinecek tablolar:');
    console.log('   - parcalar (parçalar)');
    console.log('   - is_emirleri (iş emirleri)');
    console.log('   - giderler');
    console.log('   - musteriler (müşteriler)');
    console.log('   - aktivite_log');
    console.log('   - yazici_ayarlari\n');

    // Foreign key ilişkisi nedeniyle sırayla sil
    console.log('🗑️  parcalar tablosu temizleniyor...');
    const parcalarResult = await pool.query('DELETE FROM parcalar');
    console.log(`   ✓ ${parcalarResult.rowCount} kayıt silindi`);

    console.log('🗑️  is_emirleri tablosu temizleniyor...');
    const isEmirleriResult = await pool.query('DELETE FROM is_emirleri');
    console.log(`   ✓ ${isEmirleriResult.rowCount} kayıt silindi`);

    console.log('🗑️  giderler tablosu temizleniyor...');
    const giderlerResult = await pool.query('DELETE FROM giderler');
    console.log(`   ✓ ${giderlerResult.rowCount} kayıt silindi`);

    console.log('🗑️  musteriler tablosu temizleniyor...');
    const musterilerResult = await pool.query('DELETE FROM musteriler');
    console.log(`   ✓ ${musterilerResult.rowCount} kayıt silindi`);

    console.log('🗑️  aktivite_log tablosu temizleniyor...');
    const aktiviteResult = await pool.query('DELETE FROM aktivite_log');
    console.log(`   ✓ ${aktiviteResult.rowCount} kayıt silindi`);

    console.log('🗑️  yazici_ayarlari tablosu temizleniyor...');
    const yaziciResult = await pool.query('DELETE FROM yazici_ayarlari');
    console.log(`   ✓ ${yaziciResult.rowCount} kayıt silindi`);

    // Sequence'leri sıfırla (ID'ler 1'den başlasın)
    console.log('\n🔄 ID sıralamaları sıfırlanıyor...');
    await pool.query("SELECT setval('is_emirleri_id_seq', 1, false)");
    await pool.query("SELECT setval('musteriler_id_seq', 1, false)");
    await pool.query("SELECT setval('parcalar_id_seq', 1, false)");
    await pool.query("SELECT setval('giderler_id_seq', 1, false)");
    await pool.query("SELECT setval('aktivite_log_id_seq', 1, false)");
    console.log('   ✓ Tüm ID sıralamaları sıfırlandı');

    console.log('\n✅ VERİTABANI TEMİZLEME TAMAMLANDI!');
    console.log('ℹ️  kullanicilar tablosu korundu (kullanıcılar silinmedi)\n');

    // Kullanıcı sayısını göster
    const kullanicilarResult = await pool.query('SELECT COUNT(*) FROM kullanicilar');
    console.log(`👥 Mevcut kullanıcı sayısı: ${kullanicilarResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ HATA:', error.message);
    console.error(error);
  } finally {
    await pool.end();
    console.log('\n🔌 Veritabanı bağlantısı kapatıldı');
    process.exit(0);
  }
}

resetData();
