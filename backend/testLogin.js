const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    console.log('🔍 Kullanıcıları kontrol ediyorum...\n');
    
    // Tüm kullanıcıları listele
    const users = await pool.query('SELECT id, kullanici_adi, ad_soyad, rol, onay_durumu FROM kullanicilar');
    
    console.log('📋 Mevcut Kullanıcılar:');
    console.log('═══════════════════════════════════════════════════════════');
    users.rows.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Kullanıcı Adı: ${user.kullanici_adi}`);
      console.log(`Ad Soyad: ${user.ad_soyad}`);
      console.log(`Rol: ${user.rol}`);
      console.log(`Onay Durumu: ${user.onay_durumu || 'NULL'}`);
      console.log('───────────────────────────────────────────────────────────');
    });
    
    // Admin dışındaki onaylı olmayan kullanıcıları onayla
    const updateResult = await pool.query(
      "UPDATE kullanicilar SET onay_durumu = 'onaylandi' WHERE onay_durumu != 'onaylandi' OR onay_durumu IS NULL"
    );
    
    if (updateResult.rowCount > 0) {
      console.log(`\n✅ ${updateResult.rowCount} kullanıcı onaylandı!`);
    }
    
    // Güncellenmiş listeyi göster
    const updatedUsers = await pool.query('SELECT id, kullanici_adi, ad_soyad, rol, onay_durumu FROM kullanicilar');
    
    console.log('\n📋 Güncellenmiş Kullanıcılar:');
    console.log('═══════════════════════════════════════════════════════════');
    updatedUsers.rows.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Kullanıcı Adı: ${user.kullanici_adi}`);
      console.log(`Ad Soyad: ${user.ad_soyad}`);
      console.log(`Rol: ${user.rol}`);
      console.log(`Onay Durumu: ${user.onay_durumu}`);
      console.log('───────────────────────────────────────────────────────────');
    });
    
    console.log('\n✅ Tüm kullanıcılar artık giriş yapabilir!');
    console.log('\n💡 Not: Backend sunucusunu yeniden başlatın.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

testLogin();
