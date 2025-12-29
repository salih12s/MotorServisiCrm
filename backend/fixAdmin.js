const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function fixAdmin() {
  try {
    console.log('🔧 Admin kullanıcısı düzeltiliyor...\n');
    
    // Admin var mı kontrol et
    const adminCheck = await pool.query("SELECT * FROM kullanicilar WHERE kullanici_adi = 'admin'");
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    if (adminCheck.rows.length === 0) {
      // Admin yoksa oluştur
      await pool.query(
        "INSERT INTO kullanicilar (kullanici_adi, sifre, ad_soyad, rol, onay_durumu) VALUES ($1, $2, $3, $4, $5)",
        ['admin', hashedPassword, 'Sistem Yöneticisi', 'admin', 'onaylandi']
      );
      console.log('✅ Admin kullanıcısı oluşturuldu!');
    } else {
      // Admin varsa güncelle
      await pool.query(
        "UPDATE kullanicilar SET sifre = $1, rol = 'admin', onay_durumu = 'onaylandi' WHERE kullanici_adi = 'admin'",
        [hashedPassword]
      );
      console.log('✅ Admin kullanıcısı güncellendi!');
    }
    
    // Admin bilgilerini göster
    const admin = await pool.query("SELECT id, kullanici_adi, ad_soyad, rol, onay_durumu FROM kullanicilar WHERE kullanici_adi = 'admin'");
    console.log('\n📝 Admin Bilgileri:');
    console.log(admin.rows[0]);
    console.log('\n🔑 Giriş Bilgileri:');
    console.log('   Kullanıcı Adı: admin');
    console.log('   Şifre: admin123');
    console.log('   Rol: admin');
    
    // Tüm kullanıcıları listele
    console.log('\n📋 Tüm Kullanıcılar:');
    const allUsers = await pool.query('SELECT kullanici_adi, ad_soyad, rol, onay_durumu FROM kullanicilar ORDER BY id');
    allUsers.rows.forEach(user => {
      console.log(`   ${user.kullanici_adi} - ${user.ad_soyad} (${user.rol}) - ${user.onay_durumu}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

fixAdmin();
