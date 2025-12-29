# 🚂 Railway Deployment Rehberi

## Railway'de Backend Deploy Etmek

### 1️⃣ Railway Projesi Oluştur

1. [Railway.app](https://railway.app) adresine git
2. GitHub hesabınla giriş yap
3. "New Project" → "Deploy from GitHub repo" seç
4. `MotorServisiCrm` repository'sini seç

### 2️⃣ Environment Variables Ekle

Railway dashboard'unda **Variables** sekmesine git ve şu değişkenleri ekle:

```bash
NODE_ENV=production
PORT=5000

# Database Configuration (Railway PostgreSQL)
DB_HOST=mainline.proxy.rlwy.net
DB_PORT=19436
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=AujMSGZWwRuSBMkdnbDzYUtYEXuDqfHK

# JWT Configuration
JWT_SECRET=demirkan_motorlu_arac_secret_key_2025
```

### 3️⃣ Deploy Ayarları

Railway otomatik olarak şu dosyaları algılayacak:
- ✅ `package.json` (root) - Start komutu
- ✅ `Procfile` - Web servisi tanımı  
- ✅ `railway.json` - Railway yapılandırması
- ✅ `nixpacks.toml` - Build yapılandırması

**Root klasöründeki `package.json` şu komutu çalıştırır:**
```json
"start": "cd backend && npm install && node server.js"
```

### 4️⃣ Domain Ayarları

1. Railway dashboard'unda **Settings** → **Networking** git
2. **Generate Domain** butonuna tıkla
3. Otomatik bir Railway domain alacaksın (örn: `your-app.railway.app`)
4. Kendi domain'in varsa **Custom Domain** ekle: `demirkanmotorluaraclar.com`

### 5️⃣ Frontend Ayarları

Frontend'i ayrı deploy edeceksen (Netlify, Vercel, vb.):

**Frontend .env dosyasını güncelle:**
```bash
REACT_APP_API_URL=https://your-app.railway.app/api
# veya kendi domain'in:
# REACT_APP_API_URL=http://demirkanmotorluaraclar.com/api
```

**Backend CORS ayarlarını güncelle** (`backend/server.js`):
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://your-frontend.netlify.app',
        'http://demirkanmotorluaraclar.com',
        'https://demirkanmotorluaraclar.com'
      ]
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 6️⃣ Health Check

Deploy sonrası test et:

```bash
# API health check
curl https://your-app.railway.app/

# Login test
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"kullanici_adi":"admin","sifre":"admin123"}'
```

### 📊 Logs Kontrol

Railway dashboard'unda **Deployments** sekmesinden real-time logları izle.

### 🔄 Yeniden Deploy

Her GitHub push otomatik deploy tetikler. Manuel deploy için:
1. Railway dashboard → **Deployments**
2. **Deploy** butonuna tıkla

### ⚠️ Önemli Notlar

1. **Database Connection Pool:** Railway veritabanı zaten ayarlı
2. **SSL:** Railway otomatik HTTPS sağlar
3. **Port:** Railway otomatik `PORT` environment variable set eder (varsayılan: 5000)
4. **Restart Policy:** Hata durumunda otomatik restart (max 10 deneme)

### 🆘 Sorun Giderme

**"Application failed to respond":**
- Environment variables'ın doğru set edildiğinden emin ol
- Logs'ta database bağlantısını kontrol et
- `PORT` environment variable'ının set olduğundan emin ol

**"Build failed":**
- `backend/package.json` dosyasının varlığını kontrol et
- Node.js versiyonunu kontrol et (minimum 18.x)
- Logs'ta hata mesajını incele

**Database bağlantı hatası:**
- Railway PostgreSQL servisinin aktif olduğunu kontrol et
- Connection string'in doğru olduğunu doğrula
- Firewall/network ayarlarını kontrol et

### 📱 Mobil/Tablet Erişimi

Railway domain'i hem desktop hem mobil'den erişilebilir:
- `https://your-app.railway.app`
- `http://demirkanmotorluaraclar.com` (custom domain)

### 🔒 Güvenlik

1. Environment variables'ı asla Git'e commit etme
2. JWT_SECRET'i güçlü bir key yap
3. Admin şifresini ilk girişte değiştir
4. HTTPS kullan (Railway otomatik sağlar)
5. CORS ayarlarını sadece gereken domain'lere aç
