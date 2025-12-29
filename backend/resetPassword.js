const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  try {
    const username = 'salih012';
    const newPassword = '123456';
    
    console.log(`🔄 ${username} kullanıcısının şifresi sıfırlanıyor...`);
    
    // Kullanıcıyı kontrol et
    const userCheck = await pool.query(
      'SELECT id, kullanici_adi, ad_soyad, rol, onay_durumu FROM kullanicilar WHERE kullanici_adi = $1',
      [username]
    );
    
    if (userCheck.rows.length === 0) {
      console.log(`❌ ${username} kullanıcısı bulunamadı!`);
      process.exit(1);
    }
    
    console.log('✅ Kullanıcı bulundu:');
    console.log(userCheck.rows[0]);
    
    // Yeni şifreyi hash'le
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Şifreyi güncelle ve onay durumunu kontrol et
    await pool.query(
      "UPDATE kullanicilar SET sifre = $1, onay_durumu = 'onaylandi' WHERE kullanici_adi = $2",
      [hashedPassword, username]
    );
    
    console.log('\n✅ Şifre başarıyla sıfırlandı!');
    console.log(`📝 Yeni Giriş Bilgileri:`);
    console.log(`   Kullanıcı Adı: ${username}`);
    console.log(`   Şifre: ${newPassword}`);
    console.log(`   Onay Durumu: onaylandi`);
    
    // Diğer kullanıcıları da göster
    console.log('\n📋 Tüm Kullanıcılar:');
    const allUsers = await pool.query(
      'SELECT kullanici_adi, ad_soyad, rol, onay_durumu FROM kullanicilar ORDER BY id'
    );
    
    allUsers.rows.forEach(user => {
      console.log(`   ${user.kullanici_adi} - ${user.ad_soyad} (${user.rol}) - ${user.onay_durumu}`);
    });
    
    console.log('\n💡 Diğer kullanıcıların şifresini de sıfırlamak ister misiniz?');
    console.log('   Tüm personel şifrelerini "123456" yapmak için:');
    console.log('   node resetAllPasswords.js\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

resetPassword();
