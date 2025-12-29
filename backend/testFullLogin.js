const pool = require('./config/db');
const bcrypt = require('bcryptjs');

const BASE_URL = 'http://localhost:5000/api';

async function testFullLogin() {
  try {
    console.log('🚀 Tam Giriş Testi Başlatılıyor...\n');
    
    // 1. Test kullanıcısı oluştur
    console.log('1️⃣ Test kullanıcısı oluşturuluyor...');
    const testUsername = 'testuser' + Date.now();
    const testPassword = 'test123456';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    const userResult = await pool.query(
      'INSERT INTO kullanicilar (kullanici_adi, sifre, ad_soyad, rol, onay_durumu) VALUES ($1, $2, $3, $4, $5) RETURNING id, kullanici_adi, ad_soyad, rol, onay_durumu',
      [testUsername, hashedPassword, 'Test Kullanıcı', 'personel', 'onaylandi']
    );
    
    const testUser = userResult.rows[0];
    console.log('✅ Test kullanıcısı oluşturuldu:');
    console.log(`   Kullanıcı Adı: ${testUser.kullanici_adi}`);
    console.log(`   Şifre: ${testPassword}`);
    console.log(`   Rol: ${testUser.rol}`);
    console.log(`   Onay Durumu: ${testUser.onay_durumu}\n`);
    
    // 2. Veritabanından kontrol et
    console.log('2️⃣ Veritabanından kontrol ediliyor...');
    const dbCheck = await pool.query(
      'SELECT id, kullanici_adi, ad_soyad, rol, onay_durumu FROM kullanicilar WHERE kullanici_adi = $1',
      [testUsername]
    );
    
    if (dbCheck.rows.length > 0) {
      console.log('✅ Veritabanında kullanıcı bulundu:');
      console.log('   ', dbCheck.rows[0]);
    } else {
      console.log('❌ Veritabanında kullanıcı bulunamadı!');
      return;
    }
    
    // 3. Şifre kontrolü
    console.log('\n3️⃣ Şifre hash kontrolü yapılıyor...');
    const storedHash = (await pool.query('SELECT sifre FROM kullanicilar WHERE kullanici_adi = $1', [testUsername])).rows[0].sifre;
    const passwordMatch = await bcrypt.compare(testPassword, storedHash);
    
    if (passwordMatch) {
      console.log('✅ Şifre doğru hash\'lendi ve eşleşiyor');
    } else {
      console.log('❌ Şifre eşleşmiyor!');
      return;
    }
    
    // 4. API üzerinden giriş testi
    console.log('\n4️⃣ API üzerinden giriş testi yapılıyor...');
    console.log(`   URL: ${BASE_URL}/auth/login`);
    console.log(`   Body: { username: "${testUsername}", password: "${testPassword}" }`);
    
    try {
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          kullanici_adi: testUsername,
          sifre: testPassword
        })
      });
      
      const loginData = await loginResponse.json();
      
      if (loginResponse.ok) {
        console.log('\n✅ GİRİŞ BAŞARILI!');
        console.log('   Token alındı:', loginData.token ? 'Evet' : 'Hayır');
        console.log('   Kullanıcı Bilgisi:');
        console.log('   ', loginData.user);
        
        // 5. Token doğrulama
        if (loginData.token) {
          console.log('\n5️⃣ Token doğrulama testi...');
          const verifyResponse = await fetch(`${BASE_URL}/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${loginData.token}`
            }
          });
          
          const verifyData = await verifyResponse.json();
          
          if (verifyResponse.ok) {
            console.log('✅ Token geçerli!');
            console.log('   Doğrulanan Kullanıcı:', verifyData.user);
          } else {
            console.log('❌ Token doğrulama başarısız:', verifyData.message);
          }
        }
      } else {
        console.log('\n❌ GİRİŞ BAŞARISIZ!');
        console.log('   HTTP Status:', loginResponse.status);
        console.log('   Hata Mesajı:', loginData.message);
        console.log('   Tam Yanıt:', JSON.stringify(loginData, null, 2));
      }
      
    } catch (loginError) {
      console.log('\n❌ GİRİŞ BAŞARISIZ!');
      if (loginError.code === 'ECONNREFUSED') {
        console.log('   Backend sunucusu yanıt vermiyor!');
        console.log('   Lütfen backend sunucusunun çalıştığından emin olun:');
        console.log('   cd backend && npm start');
      } else {
        console.log('   Hata:', loginError.message);
      }
    }
    
    // Temizlik
    console.log('\n6️⃣ Test kullanıcısı siliniyor...');
    await pool.query('DELETE FROM kullanicilar WHERE kullanici_adi = $1', [testUsername]);
    console.log('✅ Test kullanıcısı silindi\n');
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Test tamamlandı!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test sırasında hata oluştu:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Backend bağlantı kontrolü
async function checkBackend() {
  try {
    const response = await fetch(`${BASE_URL}/auth/verify`);
    // Backend yanıt veriyor (401 bile olsa bağlantı var)
  } catch (error) {
    console.log('⚠️  UYARI: Backend sunucusu çalışmıyor!');
    console.log('   Lütfen önce backend\'i başlatın:');
    console.log('   cd backend && npm start\n');
    process.exit(1);
  }
}

// Başlat
checkBackend().then(() => testFullLogin());
