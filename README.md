# Demirkan Motorlu Araçlar - Servis Yönetim Sistemi (CRM)

> **Bu README, bu projenin birebir referans olarak kullanılabileceği bir sonraki proje için hazırlanmıştır. Tüm mimari, yapı, teknik detaylar ve iş mantığı burada eksiksiz dokümante edilmiştir.**

---

## 📌 PROJE ÖZETİ

Motorsiklet bayisi için fullstack CRM sistemi. İş emirleri, aksesuar satışları, motor satışları, müşteri yönetimi, gider takibi, finansal raporlama ve kullanıcı yönetimi modüllerini içerir.

**Canlı URL:** `demirkanmotorluaraclar.com`
**Backend URL:** `motorservisicrm-production.up.railway.app`

---

## 🛠️ TEKNOLOJİ STACK'İ

| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| **Frontend** | React | 19.2.3 |
| **UI Kit** | Material-UI (MUI) | 7.3.6 |
| **Routing** | React Router DOM | 7.11.0 |
| **HTTP Client** | Axios | 1.13.2 |
| **Tarih** | date-fns | 4.1.0 |
| **Yazdırma** | react-to-print | 3.2.0 |
| **Backend** | Express.js | 4.18.2 |
| **Veritabanı** | PostgreSQL | (pg 8.11.3) |
| **Auth** | JWT (jsonwebtoken) | 9.0.2 |
| **Şifreleme** | bcryptjs | 2.4.3 |
| **CORS** | cors | 2.8.5 |
| **Env** | dotenv | 16.3.1 |
| **Deploy** | Railway.app | Nixpacks |
| **Node** | Node.js | >=18.0.0 |

---

## 📁 PROJE KLASÖR YAPISI

```
project-root/
├── package.json              ← Root: dev script'leri ve concurrently
├── railway.json              ← Railway deploy config
├── nixpacks.toml             ← Nixpacks build config
├── Procfile                  ← Heroku/Railway start komutları
├── set-local-env.bat         ← Yerel ortam .env dosyalarını oluşturur
├── set-production-env.bat    ← Production ortam .env dosyalarını oluşturur
├── .env                      ← Root env (backend okur)
│
├── backend/
│   ├── package.json
│   ├── server.js             ← Express app, CORS, middleware, route mounting
│   ├── .env                  ← Backend env (DB, JWT)
│   ├── config/
│   │   ├── db.js             ← PostgreSQL pool + retry mekanizması
│   │   ├── initDb.js         ← Tüm tablo oluşturma + migration'lar
│   │   ├── activityLogger.js ← Aktivite log fonksiyonu + işlem tipleri
│   │   ├── createActivityTable.js
│   │   └── migrateFisNo.js
│   ├── routes/
│   │   ├── auth.js           ← Login, register, kullanıcı yönetimi, yetki
│   │   ├── isEmirleri.js     ← İş emirleri CRUD + parça yönetimi
│   │   ├── musteriler.js     ← Müşteri CRUD + arama
│   │   ├── giderler.js       ← Gider CRUD
│   │   ├── aksesuarlar.js    ← Aksesuar satış CRUD + stok düşme
│   │   ├── aksesuarStok.js   ← Stok yönetimi CRUD + toplu ekleme
│   │   ├── motorSatislari.js ← Motor satış + model CRUD + vergi hesapları
│   │   └── raporlar.js       ← Günlük/aralık/genel/fiş-kâr raporları
│   └── migrations/           ← DB migration script'leri
│       ├── createMotorTables.js
│       ├── addMotorSatisColumns.js
│       ├── addMotorSatisDetayColumns.js
│       ├── addMotorSatisDurum.js
│       ├── addMotorSatisYetkisi.js
│       ├── addAksesuarParcalar.js
│       ├── fixMotorSatislariColumns.js
│       ├── seedAksesuarStok.js    ← 300+ ürün seed data
│       └── seedAksesuarStok2.js
│
├── frontend/
│   ├── package.json
│   ├── .env                  ← REACT_APP_API_URL
│   ├── public/
│   │   ├── index.html
│   │   ├── _redirects        ← SPA routing redirect
│   │   └── vercel.json       ← Vercel SPA rewrites
│   ├── src/
│   │   ├── index.jsx         ← React entry point
│   │   ├── App.jsx           ← Route tanımları + route guard'lar
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── theme.js          ← MUI tema tanımı (turkuaz temel)
│   │   ├── services/
│   │   │   └── api.js        ← Axios instance + tüm API servis fonksiyonları
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   ← JWT auth state management
│   │   │   └── ThemeContext.jsx  ← Dinamik tema değiştirme (3 tema)
│   │   ├── components/       ← Paylaşılan bileşenler (Layout, modal, nav, footer)
│   │   │   ├── Layout.jsx    ← Sidebar + AppBar + tema değişimi
│   │   │   ├── AksesuarModal.jsx
│   │   │   ├── IsEmriModal.jsx
│   │   │   ├── PublicNav.jsx
│   │   │   └── SiteFooter.jsx
│   │   └── pages/            ← Her modül kendi alt klasöründe (alan-bazlı)
│   │       ├── dashboard/        → Dashboard.jsx
│   │       ├── isEmirleri/       → IsEmirleri (liste), IsEmriForm, IsEmriDetay
│   │       │   ├── isEmriForm/       → IsEmriMusteriArac, IsEmriParcalar, utils
│   │       │   └── isEmriDetay/      → KarAnaliziKartlari, DuzenlemePaneli,
│   │       │                           FisYazdirmaAlani, printSettings
│   │       ├── aksesuarlar/      → Aksesuarlar (kabuk) + AksesuarHeader,
│   │       │                       AksesuarFiltreler, AksesuarTablo,
│   │       │                       AksesuarDetayDialog, aksesuarlarUtils
│   │       ├── motorSatislari/   → MotorSatislari + alt bileşenler
│   │       ├── musteriler/       → Musteriler.jsx
│   │       ├── giderler/         → Giderler.jsx
│   │       ├── kullanicilar/     → Kullanicilar (kabuk) + alt bileşenler
│   │       ├── raporlar/         → Raporlar (kabuk) + 4 rapor sekmesi +
│   │       │                       gunlukRapor/ alt bileşenleri + StatCard
│   │       └── public/           → LandingPage, MotorlarPage, HakkimizdaPage,
│   │           │                   BasindaPage, Login
│   │           └── motorlar/         → MotorCard, MotorDetailDialog, sabitler
│   └── build/                ← Production build output
```

> **Not (Mimari):** `pages/` klasörü **alan-bazlı (feature-based)** organize
> edilmiştir. Büyük sayfa bileşenleri ince bir **kompozisyon kabuğu** (state +
> handler'lar) + aynı klasör altında sunum alt bileşenleri olarak ayrıştırılmıştır.
> Detaylar için bkz. [REFACTOR.md](REFACTOR.md).

---

## 🗄️ VERİTABANI ŞEMASI (PostgreSQL)

### 12 Tablo

#### 1. `kullanicilar` - Kullanıcı Yönetimi
```sql
CREATE TABLE kullanicilar (
  id SERIAL PRIMARY KEY,
  kullanici_adi VARCHAR(50) UNIQUE NOT NULL,
  sifre VARCHAR(255) NOT NULL,          -- bcrypt hash
  plain_sifre VARCHAR(255),             -- Admin görebilsin diye (opsiyonel)
  ad_soyad VARCHAR(100) NOT NULL,
  rol VARCHAR(20) DEFAULT 'personel',   -- 'admin' | 'personel'
  onay_durumu VARCHAR(20) DEFAULT 'beklemede', -- 'beklemede' | 'onaylandi' | 'reddedildi'
  aksesuar_yetkisi BOOLEAN DEFAULT FALSE,
  motor_satis_yetkisi BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `musteriler` - Müşteriler
```sql
CREATE TABLE musteriler (
  id SERIAL PRIMARY KEY,
  ad_soyad VARCHAR(100),
  adres TEXT,
  telefon VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. `is_emirleri` - İş Emirleri (Ana Modül)
```sql
CREATE TABLE is_emirleri (
  id SERIAL PRIMARY KEY,
  fis_no INTEGER UNIQUE,                -- Otomatik artan (1, 2, 3...)
  musteri_id INTEGER REFERENCES musteriler(id),
  musteri_ad_soyad VARCHAR(100),
  adres TEXT,
  telefon VARCHAR(20),
  km INTEGER,
  model_tip VARCHAR(100),
  marka VARCHAR(100),
  aciklama TEXT,
  ariza_sikayetler TEXT,
  tahmini_teslim_tarihi DATE,
  tahmini_toplam_ucret DECIMAL(10, 2) DEFAULT 0,
  gercek_toplam_ucret DECIMAL(10, 2) DEFAULT 0,  -- Parçalardan otomatik hesaplanır
  toplam_maliyet DECIMAL(10, 2) DEFAULT 0,        -- Parçalardan otomatik hesaplanır
  kar DECIMAL(10, 2) DEFAULT 0,                    -- gercek_toplam_ucret - toplam_maliyet
  durum VARCHAR(20) DEFAULT 'acik',     -- 'beklemede' | 'devam_ediyor' | 'tamamlandi'
  musteri_imza BOOLEAN DEFAULT FALSE,
  teslim_alan_ad_soyad VARCHAR(100),
  teslim_eden_teknisyen VARCHAR(100),
  teslim_tarihi DATE,
  olusturan_kullanici_id INTEGER REFERENCES kullanicilar(id),
  olusturan_kisi VARCHAR(100),
  odeme_detaylari TEXT,
  tamamlama_tarihi TIMESTAMP,          -- 'tamamlandi' yapılınca otomatik set edilir
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. `parcalar` - İş Emri Parçaları
```sql
CREATE TABLE parcalar (
  id SERIAL PRIMARY KEY,
  is_emri_id INTEGER REFERENCES is_emirleri(id) ON DELETE CASCADE,
  parca_kodu VARCHAR(50),
  takilan_parca VARCHAR(200),
  adet INTEGER DEFAULT 1,
  birim_fiyat DECIMAL(10, 2) DEFAULT 0,    -- Satış fiyatı
  maliyet DECIMAL(10, 2) DEFAULT 0,        -- Maliyet fiyatı
  toplam_fiyat DECIMAL(10, 2) DEFAULT 0,   -- adet * birim_fiyat
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. `giderler` - Genel Giderler
```sql
CREATE TABLE giderler (
  id SERIAL PRIMARY KEY,
  aciklama VARCHAR(255) NOT NULL,
  tutar DECIMAL(10, 2) NOT NULL,
  kategori VARCHAR(50),
  tarih DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. `aksesuarlar` - Aksesuar Satışları
```sql
CREATE TABLE aksesuarlar (
  id SERIAL PRIMARY KEY,
  ad_soyad VARCHAR(100),
  telefon VARCHAR(20),
  urun_adi VARCHAR(255),
  odeme_tutari DECIMAL(10, 2) DEFAULT 0,
  odeme_sekli VARCHAR(50),
  aciklama TEXT,
  durum VARCHAR(50) DEFAULT 'beklemede',   -- 'beklemede' | 'tamamlandi'
  toplam_maliyet DECIMAL(10, 2) DEFAULT 0,
  toplam_satis DECIMAL(10, 2) DEFAULT 0,
  kar DECIMAL(10, 2) DEFAULT 0,            -- toplam_satis - toplam_maliyet
  odeme_detaylari TEXT,
  satis_tarihi DATE DEFAULT CURRENT_DATE,
  tamamlama_tarihi TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 7. `aksesuar_parcalar` - Aksesuar Parçaları
```sql
CREATE TABLE aksesuar_parcalar (
  id SERIAL PRIMARY KEY,
  aksesuar_id INTEGER REFERENCES aksesuarlar(id) ON DELETE CASCADE,
  urun_adi VARCHAR(255),
  adet INTEGER DEFAULT 1,
  maliyet DECIMAL(10, 2) DEFAULT 0,
  satis_fiyati DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 8. `aksesuar_stok` - Aksesuar Stok Yönetimi
```sql
CREATE TABLE aksesuar_stok (
  id SERIAL PRIMARY KEY,
  stok_kodu VARCHAR(20) UNIQUE NOT NULL,
  stok_adi VARCHAR(255) NOT NULL,
  giren_miktar INTEGER DEFAULT 0,
  cikan_miktar INTEGER DEFAULT 0,
  mevcut INTEGER DEFAULT 0,               -- giren_miktar - cikan_miktar
  birimi VARCHAR(20) DEFAULT 'Adet',
  alis_fiyati DECIMAL(10, 2) DEFAULT 0,
  satis_fiyati DECIMAL(10, 2) DEFAULT 0,
  envanter_degeri DECIMAL(12, 2) DEFAULT 0, -- mevcut * satis_fiyati
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 9. `motor_modelleri` - Motor Modelleri
```sql
CREATE TABLE motor_modelleri (
  id SERIAL PRIMARY KEY,
  model_adi VARCHAR(255) NOT NULL,
  cc VARCHAR(50),                          -- Motor hacmi
  otv_orani DECIMAL(5,2),                 -- ÖTV oranı (%)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 10. `motor_satislari` - Motor Satışları
```sql
CREATE TABLE motor_satislari (
  id SERIAL PRIMARY KEY,
  tarih DATE DEFAULT CURRENT_DATE,
  sase_no VARCHAR(100) NOT NULL,
  motor_modeli_id INTEGER REFERENCES motor_modelleri(id) ON DELETE SET NULL,
  iskonto DECIMAL(12,2) DEFAULT 0,
  alis_fiyati DECIMAL(12,2) DEFAULT 0,
  satis_fiyati DECIMAL(12,2) DEFAULT 0,
  fatura_fiyati DECIMAL(12,2) DEFAULT 0,
  kar DECIMAL(12,2) DEFAULT 0,
  odeme_sekli VARCHAR(50) DEFAULT 'nakit', -- 'nakit' | 'kredi_karti' | 'havale' | 'parcali'
  nakit_tutar DECIMAL(12,2) DEFAULT 0,
  kart_tutar DECIMAL(12,2) DEFAULT 0,
  havale_tutar DECIMAL(12,2) DEFAULT 0,
  musteri_adi VARCHAR(255),
  musteri_telefon VARCHAR(50),
  tc_kimlik_no VARCHAR(20),
  adres TEXT,
  aciklama TEXT,
  -- VERGİ HESAPLAMA ALANLARI
  iskonto_tutari DECIMAL(12,2) DEFAULT 0,
  iskontolu_alis_fiyati DECIMAL(12,2) DEFAULT 0,
  matrah_satis DECIMAL(12,2) DEFAULT 0,   -- KDV matrahı
  kdv_tutari DECIMAL(12,2) DEFAULT 0,     -- %20 KDV
  kdvsiz_tutar DECIMAL(12,2) DEFAULT 0,
  otv_tutari DECIMAL(12,2) DEFAULT 0,     -- Değişken ÖTV oranı
  damga_vergisi DECIMAL(12,2) DEFAULT 791, -- Sabit damga vergisi
  vergiler_toplami DECIMAL(12,2) DEFAULT 0,
  durum VARCHAR(50) DEFAULT 'beklemede',   -- 'beklemede' | 'tamamlandi' | 'iptal'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 11. `aktivite_log` - Aktivite Logları
```sql
CREATE TABLE aktivite_log (
  id SERIAL PRIMARY KEY,
  kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE SET NULL,
  kullanici_adi VARCHAR(50),
  islem_tipi VARCHAR(50) NOT NULL,    -- LOGIN, LOGOUT, IS_EMRI_OLUSTUR, vb.
  islem_detay TEXT,
  hedef_tablo VARCHAR(50),
  hedef_id INTEGER,
  ip_adresi VARCHAR(45),
  tarayici_bilgisi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 12. `yazici_ayarlari` - Yazdırma Ayarları
```sql
CREATE TABLE yazici_ayarlari (
  id SERIAL PRIMARY KEY,
  ayar_adi VARCHAR(50) UNIQUE NOT NULL DEFAULT 'default',
  ayarlar JSONB NOT NULL,             -- Drag-drop pozisyon verileri
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tablo İlişkileri

```
kullanicilar ──┬──> is_emirleri (olusturan_kullanici_id)
               └──> aktivite_log (kullanici_id)

musteriler ────> is_emirleri (musteri_id)

is_emirleri ───> parcalar (is_emri_id, ON DELETE CASCADE)

aksesuarlar ───> aksesuar_parcalar (aksesuar_id, ON DELETE CASCADE)

aksesuar_stok ←── aksesuarlar (stok düşme/ekleme mantığı, urun_adi üzerinden)

motor_modelleri ──> motor_satislari (motor_modeli_id)
```

---

## 🔐 KİMLİK DOĞRULAMA (Authentication) SİSTEMİ

### JWT Auth Flow

```
1. Kullanıcı register olur → onay_durumu: 'beklemede'
2. Admin onaylar → onay_durumu: 'onaylandi'
3. Kullanıcı login olur → JWT token (24 saat geçerli)
4. Her istekte Authorization header: "Bearer <token>"
5. Token expire → 401 → otomatik logout + /login'e redirect
```

### Şifreleme
```javascript
// Kayıt
const hashedPassword = await bcrypt.hash(sifre, 10); // salt rounds: 10
// Login
const isValid = await bcrypt.compare(sifre, user.sifre);
// Token
const token = jwt.sign(
  { id: user.id, kullanici_adi: user.kullanici_adi, rol: user.rol },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

### Middleware Yapısı (server.js)
```javascript
// authenticateToken → Token doğrulama (tüm korumalı route'larda)
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Yetkilendirme token\'ı gerekli' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Geçersiz token' });
    req.user = user;
    next();
  });
};
```

### Route Guard Tipleri (Frontend - App.jsx)

| Guard | Açıklama |
|-------|----------|
| `ProtectedRoute` | Login olmuş kullanıcı gerekli |
| `AdminRoute` | Sadece `rol === 'admin'` erişir |
| `AksesuarRoute` | Admin veya `aksesuar_yetkisi === true` |
| `MotorSatisRoute` | Admin veya `motor_satis_yetkisi === true` |
| `NormalRoute` | Özel yetkili kullanıcıları kendi sayfalarına yönlendirir |
| `PublicRoute` | Login olmuş kullanıcıları ana sayfaya yönlendirir |

### Yetki Sistemi

```
ROL: 'admin' → Her şeye erişir
ROL: 'personel' →
  ├── aksesuar_yetkisi: true  → Sadece aksesuar sayfaları
  ├── motor_satis_yetkisi: true → Sadece motor satış sayfası
  ├── İkisi de true → Aksesuar + Motor satış sayfaları
  └── İkisi de false → Servis (iş emirleri), müşteriler
```

---

## 🌐 API ENDPOİNTLERİ

### Auth Routes (`/api/auth`)
```
POST   /register                          → Kayıt ol
POST   /login                             → Giriş yap
POST   /logout                            → Çıkış yap (aktivite logla)
GET    /verify                             → Token doğrula
GET    /users                              → Tüm kullanıcılar [ADMIN]
PATCH  /users/:id/approve                  → Kullanıcı onayla [ADMIN]
PATCH  /users/:id/reject                   → Kullanıcı reddet [ADMIN]
DELETE /users/:id                          → Kullanıcı sil [ADMIN]
PATCH  /users/:id/aksesuar-yetkisi         → Aksesuar yetkisi ver/al [ADMIN]
PATCH  /users/:id/motor-satis-yetkisi      → Motor satış yetkisi ver/al [ADMIN]
GET    /users/:id/activities               → Kullanıcı iş emirleri [ADMIN]
GET    /users/:id/activity-logs            → Kullanıcı aktivite logları [ADMIN]
GET    /user-work-orders/:userId           → Kullanıcının iş emirleri [ADMIN]
GET    /activities                         → Tüm aktiviteler [ADMIN]
GET    /activity-logs                      → Tüm aktivite logları [ADMIN]
```

### İş Emirleri Routes (`/api/is-emirleri`) [AUTH]
```
GET    /                                   → Tüm iş emirleri (filter: tarih, durum)
GET    /next-fis-no/preview                → Sonraki fiş numarasını al
GET    /:id                                → Tek iş emri + parçaları
POST   /                                   → İş emri oluştur (+ parçalar + müşteri)
PUT    /:id                                → İş emri güncelle (tamamlandı ise admin gerekli)
DELETE /:id                                → İş emri sil [ADMIN]
POST   /:id/parcalar                       → Parça ekle
DELETE /:id/parcalar/:parcaId              → Parça sil
```

### Müşteriler Routes (`/api/musteriler`) [AUTH]
```
GET    /                                   → Tüm müşteriler
GET    /:id                                → Tek müşteri
POST   /                                   → Müşteri ekle
PUT    /:id                                → Müşteri güncelle
DELETE /:id                                → Müşteri sil
GET    /ara/:query                         → Müşteri ara (ad veya telefon, ILIKE)
```

### Giderler Routes (`/api/giderler`) [AUTH]
```
GET    /                                   → Tüm giderler (filter: tarih, kategori)
POST   /                                   → Gider ekle
PUT    /:id                                → Gider güncelle
DELETE /:id                                → Gider sil
```

### Aksesuarlar Routes (`/api/aksesuarlar`) [AUTH]
```
GET    /                                   → Tüm aksesuar kayıtları + parçaları
GET    /:id                                → Tek aksesuar + parçaları
POST   /                                   → Aksesuar satışı oluştur (stok düşme mantığı)
PUT    /:id                                → Aksesuar güncelle (stok geri ekleme/düşme)
DELETE /:id                                → Aksesuar sil (stok geri ekleme)
GET    /stats/genel                        → Aksesuar istatistikleri
```

### Aksesuar Stok Routes (`/api/aksesuar-stok`) [AUTH]
```
GET    /                                   → Tüm stok kayıtları
GET    /ara?q=...                          → Stok ara (kod veya isim, ILIKE, min 2 karakter)
POST   /                                   → Stok kaydı oluştur
PUT    /:id                                → Stok güncelle
DELETE /:id                                → Stok sil
POST   /toplu                              → Toplu stok ekleme (ON CONFLICT UPDATE)
```

### Motor Satışları Routes (`/api/motor-satislari`) [AUTH]
```
GET    /modeller                           → Motor modelleri listesi
POST   /modeller                           → Motor modeli ekle
PUT    /modeller/:id                       → Motor modeli güncelle
DELETE /modeller/:id                       → Motor modeli sil
GET    /                                   → Tüm motor satışları (+ model bilgisi JOIN)
GET    /:id                                → Tek motor satışı
POST   /                                   → Motor satışı ekle
PUT    /:id                                → Motor satışı güncelle
DELETE /:id                                → Motor satışı sil
GET    /stats/ozet                         → Motor satış istatistikleri
```

### Raporlar Routes (`/api/raporlar`) [AUTH]
```
GET    /gunluk?tarih=YYYY-MM-DD            → Günlük rapor (tamamlanan + giderler)
GET    /aralik?baslangic=...&bitis=...     → Tarih aralığı raporu
GET    /genel                              → Genel özet rapor
GET    /fis-kar?baslangic=...&bitis=...    → Fiş bazlı kâr raporu
GET    /is-emri/:id                        → Tek iş emri detaylı rapor
GET    /aksesuar/aralik?baslangic=...&bitis=...  → Aksesuar tarih aralığı raporu
GET    /aksesuar/:id                       → Tek aksesuar detaylı rapor
```

---

## 💡 TEMEL İŞ MANTIKLARI

### 1. İş Emri Oluşturma Flow

```
İş Emri Oluştur →
  1. Fiş numarası otomatik: MAX(fis_no) + 1 (1'den başlar)
  2. Telefon numarasına göre müşteri aranır:
     - Varsa: müşteri bilgileri güncellenir
     - Yoksa: yeni müşteri oluşturulur
  3. İş emri INSERT edilir
  4. Parçalar eklenir (for loop)
  5. Toplam fiyat ve maliyet hesaplanır (parçalardan)
  6. Kâr = gercek_toplam_ucret - toplam_maliyet
  7. COMMIT (Transaction kullanılır!)
```

### 2. İş Emri Güncelleme + Tamamlama
```
İş Emri Güncelle →
  1. Tamamlanan iş emrini personel düzenleyemez (403)
  2. Durum 'tamamlandi' yapılırsa → tamamlama_tarihi = CURRENT_TIMESTAMP
  3. Eski parçalar silinir, yeni parçalar INSERT edilir
  4. Toplamlar yeniden hesaplanır
```

### 3. Aksesuar Satış + Stok Mantığı
```
Aksesuar Oluştur/Güncelle →
  1. Parçaların toplam maliyet ve satış fiyatı hesaplanır
  2. Kâr = toplam_satis - toplam_maliyet
  3. Durum 'tamamlandi' ise → stoktan düşülür (cikan_miktar += adet)
  4. Güncelleme sırasında:
     - Eski durum 'tamamlandi' ise → eski parçalar stoğa geri ekle
     - Yeni durum 'tamamlandi' ise → yeni parçalar stoktan düş
  5. Silme sırasında → 'tamamlandi' ise stokları geri ekle
```

### 4. Motor Satış Vergi Hesaplaması
```
Motor Satış →
  - İskonto tutarı = alis_fiyati * (iskonto / 100)
  - İskontolu alış fiyatı = alis_fiyati - iskonto_tutari
  - KDVsiz tutar hesabı
  - KDV = %20
  - ÖTV = model bazlı değişken oran
  - Damga vergisi = 791 TL (sabit)
  - Vergiler toplamı = KDV + ÖTV + Damga vergisi
  - Ödeme: nakit + kart + havale ayrı takip
  - Kâr hesaplanır
```

### 5. Rapor Hesaplama Mantığı
```
Günlük Rapor →
  - Sadece 'tamamlandi' durumundaki iş emirleri dahil
  - tamamlama_tarihi'ne göre filtreleme
  - Toplam gelir, maliyet, gider hesaplanır
  - Brüt Kâr = Gelir - Maliyet
  - Net Kâr = Brüt Kâr - Giderler
```

---

## 🎨 TEMA SİSTEMİ

### 3 Dinamik Tema (ThemeContext.jsx)

```javascript
// Varsayılan - Turkuaz (Servis sayfaları)
{ primary: '#04A7B8', secondary: '#036B74' }

// Aksesuar - Mor (Aksesuar sayfaları)
{ primary: '#630094', secondary: '#4A006F' }

// Motor Satış - Turuncu (Motor satış sayfası)
{ primary: '#E65100', secondary: '#E65100' }
```

### Otomatik Tema Değişimi (Layout.jsx)
```javascript
useEffect(() => {
  if (pathname === '/aksesuarlar' || pathname === '/aksesuar-stok') {
    setAksesuarTheme();
  } else if (pathname === '/motor-satislari') {
    setMotorSatisTheme();
  } else {
    setDefaultTheme();
  }
}, [location.pathname]);
```

### Yapı
```
CustomThemeProvider → ThemeContext (tema state)
  └── ThemedApp → ThemeProvider (MUI teması uygular)
       └── BrowserRouter → AuthProvider → Routes
```

---

## 🔗 FRONTEND API SERVİS YAPISI (services/api.js)

### Axios Instance Konfigürasyonu
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request Interceptor: Her isteğe token ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response Interceptor: 401 → otomatik logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Servis Exports
```javascript
export const authService = { login, register, logout, verify, getUsers, ... };
export const musteriService = { getAll, getById, create, update, delete, search };
export const isEmriService = { getAll, getById, create, update, delete, addParca, deleteParca };
export const raporService = { getGunluk, getAralik, getGenel, getFisKar, ... };
export const giderService = { getAll, create, update, delete };
export const aksesuarService = { getAll, getById, create, update, delete, getStats };
export const aksesuarStokService = { getAll, search, create, update, delete, topluEkle };
export const motorSatisService = { getAll, getById, create, update, delete, getStats, getModeller, ... };
```

---

## 📦 VERİTABANI BAĞLANTI (config/db.js)

### Bağlantı Hiyerarşisi
```
1. DATABASE_URL varsa → connectionString kullan (Railway)
2. DB_HOST varsa → ayrı parametrelerle bağlan
3. Hiçbiri yoksa → localhost:5432/motor_servisi_crm
```

### Pool Konfigürasyonu
```javascript
const pool = new Pool({
  ...poolConfig,
  max: isProduction ? 3 : 10,     // Max connection sayısı
  min: 0,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 20000,
  allowExitOnIdle: true,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});
```

### Retry Mekanizması
```javascript
// Bağlantı hatalarında otomatik 5 deneme
// Her denemede artan bekleme: RETRY_DELAY * attempt (2s, 4s, 6s...)
// ECONNRESET, ECONNREFUSED, ETIMEDOUT, SSL hataları yakalanır
```

### Sunucu Başlatma (server.js)
```javascript
// Sunucu DB'den bağımsız ayağa kalkar
// DB init arka planda 10 deneme yapar (5s, 10s, 15s... max 30s aralıkla)
// DB bağlanamazsa sunucu çalışmaya devam eder
```

---

## 📊 AKTİVİTE LOG SİSTEMİ

### İşlem Tipleri
```javascript
const ISLEM_TIPLERI = {
  LOGIN, LOGOUT, LOGIN_FAILED, REGISTER,
  CREATE, UPDATE, DELETE, VIEW, APPROVE, REJECT, PRINT, EXPORT,
  IS_EMRI_OLUSTUR, IS_EMRI_GUNCELLE, IS_EMRI_SIL,
  MUSTERI_OLUSTUR, MUSTERI_GUNCELLE, MUSTERI_SIL,
  GIDER_OLUSTUR, GIDER_GUNCELLE, GIDER_SIL
};
```

### Kullanım
```javascript
// Esneklik: Hem object hem positional parametre alır
await logAktivite({
  kullanici_id, kullanici_adi, islem_tipi, islem_detay,
  hedef_tablo, hedef_id, ip_adresi, tarayici_bilgisi
});

// veya
await logAktivite(userId, islemTipi, detayStr, detayObj, requestInfo);
```

---

## ⚙️ ENVIRONMENT DEĞİŞKENLERİ

### Backend (.env)
```env
# Ortam
NODE_ENV=development              # 'development' | 'production'

# Database
DB_HOST=localhost                  # Veya Railway host
DB_PORT=5432                      # Veya Railway port
DB_NAME=motor_servisi_crm         # Veritabanı adı
DB_USER=postgres
DB_PASSWORD=postgres
DATABASE_URL=                     # Railway otomatik sağlar

# JWT
JWT_SECRET=demirkan_motorlu_arac_secret_key_2025

# Server
PORT=5000
```

### Frontend (.env)
```env
# Lokal
REACT_APP_API_URL=http://localhost:5000/api

# Production
REACT_APP_API_URL=https://motorservisicrm-production.up.railway.app/api
```

---

## 🚀 KURULUM VE ÇALIŞTIRMA

### 1. İlk Kurulum
```bash
# Tüm bağımlılıkları kur
npm run install:all

# Veya tek tek
npm install                  # Root (concurrently)
cd backend && npm install    # Backend
cd frontend && npm install   # Frontend
```

### 2. Lokal Geliştirme
```bash
# .env dosyalarını oluştur (Windows)
set-local-env.bat

# Her ikisini birden başlat
npm run dev

# Veya ayrı ayrı
cd backend && npm run dev      # nodemon ile (port 5000)
cd frontend && npm start       # CRA dev server (port 3000)
```

### 3. Veritabanı Hazırlığı
```
- PostgreSQL kurulu olmalı
- Veritabanı oluştur (örn: motor_servisi_crm)
- Sunucu ilk çalıştığında tüm tablolar otomatik oluşturulur (initDb.js)
- Varsayılan admin: kullanıcı adı: demirkan1, şifre: demirkan1
```

### 4. Production Build
```bash
cd frontend && npm run build
# build/ klasörü oluşur
```

---

## 🚂 RAILWAY DEPLOYMENT

### Dosyalar
- `railway.json` → Build ve deploy komutları
- `nixpacks.toml` → Nixpacks Node.js 18 config
- `Procfile` → `web: cd backend && node server.js`

### Railway Konfigürasyonu
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm install"
  },
  "deploy": {
    "startCommand": "cd backend && node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Railway Environment Variables
```
DATABASE_URL      → PostgreSQL connection string (Railway otomatik)
JWT_SECRET        → JWT gizli anahtar
NODE_ENV          → production
PORT              → Railway otomatik atar
```

### CORS Production
```javascript
origin: [
  'http://demirkanmotorluaraclar.com',
  'https://demirkanmotorluaraclar.com',
  'http://www.demirkanmotorluaraclar.com',
  'https://www.demirkanmotorluaraclar.com',
  'https://motorservisicrm-production.up.railway.app',
  // ...
]
```

---

## 🔄 SIDEBAR MENÜ YAPISI (Layout.jsx)

### Menü Konfigürasyonu
```javascript
const menuItems = [
  { title: 'Motorsiklet Satış', path: '/motor-satislari', showForMotorSatisOnly: true, color: '#E65100' },
  { title: 'Servis', path: '/', hideForAksesuarOnly: true, hideForMotorSatisOnly: true },
  { title: 'Aksesuarlar', path: '/aksesuarlar', showForAksesuarOnly: true, color: '#630094',
    subItems: [
      { title: 'Aksesuar Satış', path: '/aksesuarlar' },
      { title: 'Aksesuar Stok', path: '/aksesuar-stok' },
    ]
  },
  { title: 'Raporlar', path: '/raporlar', roles: ['admin'] },
  { title: 'Kullanıcılar', path: '/kullanicilar', roles: ['admin'] },
  { title: 'Müşteriler', path: '/musteriler', hideForAksesuarOnly: true, hideForMotorSatisOnly: true },
];
```

### Filtreleme Mantığı
```
Admin → Tüm menü öğeleri görünür
Aksesuar yetkisi → Sadece showForAksesuarOnly: true olanlar
Motor satış yetkisi → Sadece showForMotorSatisOnly: true olanlar
Her iki yetki → Aksesuar + Motor satış
Normal personel → Servis + Müşteriler (özel yetki gerektiren olanlar gizli)
```

---

## 📋 TABLO OLUŞTURMA PATTERN (initDb.js)

### Güvenli Kolon Ekleme Pattern'i
```sql
-- Tablo yoksa oluştur
CREATE TABLE IF NOT EXISTS tablo_adi (...);

-- Kolon yoksa ekle (mevcut tablolara migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='tablo_adi' AND column_name='kolon_adi'
  ) THEN
    ALTER TABLE tablo_adi ADD COLUMN kolon_adi TIP DEFAULT deger;
  END IF;
END $$;
```

Bu pattern sayesinde:
- Uygulama her başlatıldığında initDb çalışır
- Yeni tablolar otomatik oluşur
- Mevcut tablolara yeni kolonlar güvenle eklenir
- Migration dosyalarına gerek kalmaz (hepsi initDb'de)

---

## 📐 ÖNEMLİ KODLAMA PATTERNLERİ

### 1. Transaction Kullanımı (Backend)
```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  // ... işlemler
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

### 2. Boş String → Null/Zero Dönüşümü
```javascript
const emptyToNull = (value) => (value === '' || value === undefined) ? null : value;
const emptyToZero = (value) => {
  if (value === '' || value === undefined || value === null) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};
```

### 3. ILIKE Arama (Case-insensitive)
```sql
WHERE ad_soyad ILIKE $1 OR telefon ILIKE $1
-- parametre: `%${query}%`
```

### 4. ON CONFLICT (Toplu Stok Ekleme)
```sql
INSERT INTO aksesuar_stok (...)
VALUES (...)
ON CONFLICT (stok_kodu) DO UPDATE SET
  stok_adi = EXCLUDED.stok_adi,
  giren_miktar = EXCLUDED.giren_miktar,
  ...
```

### 5. Parameterized Query (SQL Injection koruması)
```javascript
// HER ZAMAN parametreli query kullan
pool.query('SELECT * FROM users WHERE id = $1', [userId]);
// ASLA string concatenation yapma!
```

---

## 📱 FRONTEND SAYFA YAPISI

| Sayfa | Dosya | Açıklama |
|-------|-------|----------|
| Login | `Login.jsx` | Giriş + kayıt formu |
| İş Emirleri | `IsEmirleri.jsx` | İş emri listesi + filtre + arama |
| İş Emri Form | `IsEmriForm.jsx` | Oluştur/düzenle formu + parça ekleme |
| İş Emri Detay | `IsEmriDetay.jsx` | Detay görünümü + yazdırma (react-to-print) |
| Müşteriler | `Musteriler.jsx` | Müşteri CRUD |
| Giderler | `Giderler.jsx` | Gider yönetimi |
| Aksesuarlar | `Aksesuarlar.jsx` | Aksesuar satış yönetimi |
| Aksesuar Stok | `AksesuarStok.jsx` | Stok yönetimi |
| Motor Satışları | `MotorSatislari.jsx` | Motor satış + vergi hesaplama |
| Raporlar | `Raporlar.jsx` | 4 rapor tipi (admin) |
| Kullanıcılar | `Kullanicilar.jsx` | Kullanıcı yönetimi (admin) |

---

## 🔧 YARDIMCI SCRIPT'LER

| Script | Dosya | Açıklama |
|--------|-------|----------|
| `set-local-env.bat` | Root | Lokal .env dosyalarını oluşturur |
| `set-production-env.bat` | Root | Production .env dosyalarını oluşturur |
| `fixAdmin.js` | Backend | Admin kullanıcıyı düzeltir |
| `resetPassword.js` | Backend | Şifre sıfırlar |
| `resetData.js` | Backend | Verileri sıfırlar |
| `addColumnsRailway.js` | Backend | Railway'de kolon ekler |
| `addDurumColumn.js` | Backend | Durum kolonu ekler |
| `testLogin.js` | Backend | Login test |
| `testFullLogin.js` | Backend | Tam login test |
| `testAksesuar.js` | Backend | Aksesuar test |

---

## 📊 ÖZELLİKLER ÖZETİ

### İş Emirleri Modülü
- [x] Otomatik artan fiş numarası
- [x] Müşteri otomatik oluşturma (telefon bazlı)
- [x] Parça ekleme/silme (birim fiyat + maliyet)
- [x] Otomatik kâr hesaplama
- [x] Durum yönetimi (beklemede/devam/tamamlandı)
- [x] Tamamlanan iş emrini personel düzenleyemez
- [x] Tamamlama tarihi otomatik set
- [x] Yazdırma (react-to-print)
- [x] Ödeme detayları notu

### Aksesuar Modülü
- [x] Çoklu parça ile satış
- [x] Otomatik stok düşme (tamamlandığında)
- [x] Stok geri ekleme (durum değişikliğinde/silmede)
- [x] Stok arama (kod/isim, ILIKE)
- [x] Toplu stok ekleme (seed data)
- [x] Envanter değeri hesaplama

### Motor Satış Modülü
- [x] Motor modeli yönetimi (cc, ÖTV oranı)
- [x] KDV (%20), ÖTV (değişken), damga vergisi (791 TL)
- [x] İskonto hesaplama
- [x] Parçalı ödeme (nakit + kart + havale)
- [x] TC kimlik no, adres bilgileri

### Kullanıcı Yönetimi
- [x] Register → Admin onayı gerekli
- [x] Onay akışı: beklemede → onaylandı/reddedildi
- [x] Aksesuar yetkisi toggle
- [x] Motor satış yetkisi toggle
- [x] Aktivite logları görüntüleme
- [x] Kullanıcı silme (admin kendini silemez)

### Raporlama
- [x] Günlük rapor (tamamlama tarihine göre)
- [x] Tarih aralığı raporu
- [x] Genel özet rapor
- [x] Fiş bazlı kâr raporu
- [x] Aksesuar raporları

### Diğer
- [x] Aktivite log sistemi (25+ işlem tipi)
- [x] 3 dinamik tema (Turkuaz/Mor/Turuncu)
- [x] Responsive tasarım (Mobile Drawer)
- [x] DB retry mekanizması (bağlantı kopmasına karşı)
- [x] Sunucu DB'den bağımsız ayağa kalkar

---

## 🧩 MİMARİ & KOD ORGANİZASYONU

Frontend **alan-bazlı (feature-based)** yapıdadır: her modül kendi alt klasöründe,
büyük sayfalar **kompozisyon kabuğu** (state + handler) + sunum alt bileşenleri
olarak ayrıştırılmıştır. Bu sayede tek dosyada toplanan "god component"ler ortadan
kaldırılmış, bileşenler tek sorumluluk ilkesine yaklaştırılmıştır.

Yapılan modülerizasyonların tamamı **UI/UX birebir korunarak** (saf yapısal
refactor), her adım ayrı commit + production build doğrulamasıyla yapılmıştır.
Öne çıkan dönüşümler:

| Bileşen | Önce | Sonra |
|---------|-----:|------:|
| `pages/raporlar/Raporlar.jsx` | 1939 | sekme bazlı modüller |
| `pages/public/LandingPage.jsx` | 1114 | 83 |
| `pages/kullanicilar/Kullanicilar.jsx` | 1276 | 892 |
| `components/IsEmriModal.jsx` | 968 | 582 |
| `components/AksesuarModal.jsx` | 862 | 454 |
| `pages/raporlar/GunlukRaporTab.jsx` | 875 | 89 |
| `pages/aksesuarlar/Aksesuarlar.jsx` | 825 | 274 |
| `pages/isEmirleri/IsEmriDetay.jsx` | 809 | 387 |
| `pages/isEmirleri/IsEmriForm.jsx` | 777 | 274 |
| `pages/public/MotorlarPage.jsx` | 704 | 232 |

> Tüm refactor geçmişi, hedefleri ve çıkarılan dosya tabloları için bkz.
> [REFACTOR.md](REFACTOR.md). Refactor sonrası >700 satır bileşen kalmamıştır.

---

## 🔄 YENİ PROJE İÇİN ADAPTE ETME ADIMLARI

1. **Proje adını değiştir:** `package.json` (3 tane), CORS ayarları, `.env` dosyaları
2. **Veritabanı adını değiştir:** `config/db.js` ve `.env`
3. **JWT Secret'ı değiştir:** `.env`
4. **Tabloları ihtiyaca göre düzenle:** `config/initDb.js`
5. **Route'ları düzenle:** `backend/routes/`, `frontend/src/App.jsx`
6. **Sayfaları düzenle:** `frontend/src/pages/`
7. **Tema renklerini değiştir:** `frontend/src/context/ThemeContext.jsx`, `frontend/src/theme.js`
8. **Logo değiştir:** `frontend/public/` ve `Layout.jsx`
9. **CORS origin'leri güncelle:** `backend/server.js`
10. **Sidebar menüyü düzenle:** `frontend/src/components/Layout.jsx`
11. **API servislerini düzenle:** `frontend/src/services/api.js`
12. **Seed data'yı güncelle:** `backend/migrations/seedAksesuarStok.js`
13. **Railway deploy:** Yeni Railway projesi oluştur, env variables ekle

---

## 📝 ÖNEMLİ NOTLAR

- **initDb.js her başlatmada çalışır** → Yeni kolonlar güvenle eklenir, mevcut hiçbir şey bozulmaz
- **Transaction kullan:** Para/stok ile ilgili tüm işlemlerde `BEGIN/COMMIT/ROLLBACK`
- **Aktivite logla:** Her önemli işlemi logla, hata olursa ana işlemi durdurma
- **Parameterized query:** SQL injection'a karşı HER ZAMAN `$1, $2` kullan
- **CORS ayarla:** Production'da kesin domain belirt, `*` kullanma
- **bcrypt salt:** 10 rounds
- **JWT expire:** 24 saat
- **Pool max:** Production'da 3, Development'ta 10
- **DB retry:** 5 deneme, artan bekleme
- **Sunucu başlatma retry:** 10 deneme, max 30s bekleme
