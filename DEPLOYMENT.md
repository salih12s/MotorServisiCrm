# Demirkan Motorlu Araçlar CRM - Deployment Guide

## 🚀 Canlıya Alma Rehberi

### 🌐 Canlı Site Bilgileri
- **Frontend URL:** http://demirkanmotorluaraclar.com
- **Backend API:** http://demirkanmotorluaraclar.com/api
- **Database:** Railway PostgreSQL

### Gereksinimler
- Node.js 18+ 
- PostgreSQL 14+
- Railway hesabı (veritabanı için)

### 🔧 Ortam Kurulumu

#### 1. Local Development (Geliştirme)

**Hızlı Kurulum:**
```bash
# Local ortamı ayarla
set-local-env.bat

# Backend başlat
cd backend
npm install
npm start

# Frontend başlat (yeni terminal)
cd frontend
npm install
npm start
```

**Manuel Kurulum:**
- `backend/.env` dosyasında local PostgreSQL bilgilerini kullanın
- `frontend/.env` dosyasında `REACT_APP_API_URL=http://localhost:5000/api`

#### 2. Production (Canlı)

**Hızlı Kurulum:**
```bash
# Production ortamını ayarla
set-production-env.bat
```

Bu şu anda Railway PostgreSQL'e bağlanacak şekilde ayarlandı:
- Host: mainline.proxy.rlwy.net
- Port: 19436
- Database: railway
- User: postgres
- Password: AujMSGZWwRuSBMkdnbDzYUtYEXuDqfHK

### 📁 Önemli Dosyalar

- `backend/.env` - Backend yapılandırması (GIT'e eklenmez)
- `frontend/.env` - Frontend API URL (GIT'e eklenmez)
- `.env.example` - Örnek yapılandırma dosyaları
- `set-local-env.bat` - Local ortama geçiş
- `set-production-env.bat` - Production ortama geçiş

### 🗄️ Veritabanı Kurulumu

Backend ilk çalıştığında otomatik olarak:
- Gerekli tabloları oluşturur
- Admin kullanıcısı oluşturur (kullanıcı adı: admin, şifre: admin123)
- Yazıcı ayarları tablosunu oluşturur

### 🌐 Frontend Deployment

**Production Build:**
```bash
cd frontend
npm run build
```

Build klasörü oluşur. Bu klasörü hosting servisinize (Netlify, Vercel, vb.) yükleyin.

**Önemli:**
- Production'da `frontend/.env` dosyasında `REACT_APP_API_URL` değerini backend'in canlı URL'si ile güncelleyin
- Backend server.js dosyasında CORS ayarlarına frontend domain'inizi ekleyin

### 🔒 Güvenlik Notları

1. **JWT Secret**: Production'da `backend/.env` dosyasındaki `JWT_SECRET` değerini değiştirin
2. **Şifreler**: İlk admin şifresini değiştirin
3. **CORS**: `backend/server.js` dosyasında production domain'lerinizi ekleyin
4. **Environment Variables**: `.env` dosyalarını asla Git'e eklemeyin

### 🔄 Ortamlar Arası Geçiş

**Local'e dönmek için:**
```bash
set-local-env.bat
```

**Production'a geçmek için:**
```bash
set-production-env.bat
```

### 📊 Veritabanı Yedekleme

**Railway'den yedek almak için:**
```bash
pg_dump -h mainline.proxy.rlwy.net -p 19436 -U postgres -d railway > backup.sql
```

### 🐛 Sorun Giderme

**Backend bağlanamıyor:**
- Railway veritabanının aktif olduğundan emin olun
- Port ve host bilgilerini kontrol edin
- Firewall ayarlarını kontrol edin

**Frontend API'ye bağlanamıyor:**
- `frontend/.env` dosyasında API URL'sini kontrol edin
- Backend CORS ayarlarını kontrol edin
- Network sekmesinden istekleri kontrol edin

### 📞 Destek

Sorun yaşarsanız:
1. `backend/logs` klasöründeki hata loglarını kontrol edin
2. Browser console'da hataları kontrol edin
3. Network sekmesinde API isteklerini kontrol edin
