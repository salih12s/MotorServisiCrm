# Ortam Geçiş Klavuzu

## 🔄 Hızlı Geçiş

### Local (Geliştirme) Ortamına Geçiş
```bash
set-local-env.bat
```
Bu komut otomatik olarak:
- ✅ Backend'i local PostgreSQL'e bağlar (localhost:5432/Musatti)
- ✅ Frontend'i local API'ye yönlendirir (http://localhost:5000/api)

### Production (Canlı) Ortamına Geçiş
```bash
set-production-env.bat
```
Bu komut otomatik olarak:
- ✅ Backend'i Railway PostgreSQL'e bağlar
- ✅ Frontend'i Railway API'sine yönlendirir

---

## 📋 Mevcut Durum

### Backend (.env)
- **Local DB**: localhost:5432/Musatti
- **Local Port**: 5000
- **Canlı DB**: Railway PostgreSQL

### Frontend (.env)
- **Local API**: http://localhost:5000/api ✅ (ŞU AN AKTİF)
- **Canlı API**: https://motorservisicrm-production.up.railway.app/api

---

## 🚀 Çalıştırma Adımları

### Local Geliştirme
1. **PostgreSQL Kontrol**: Local PostgreSQL çalıştığından emin olun
   ```bash
   # PostgreSQL servisinin çalıştığını kontrol edin
   # Windows: services.msc > PostgreSQL kontrol edin
   ```

2. **Veritabanı Hazırlığı**:
   ```bash
   # PostgreSQL'de "Musatti" adında bir veritabanı olmalı
   # Yoksa oluşturun:
   # psql -U postgres
   # CREATE DATABASE "Musatti";
   ```

3. **Backend Başlat**:
   ```bash
   cd backend
   npm install  # İlk çalıştırmada
   npm start
   ```

4. **Frontend Başlat** (yeni terminal):
   ```bash
   cd frontend
   npm install  # İlk çalıştırmada
   npm start
   ```

5. **Tarayıcıda Aç**: http://localhost:3000

### Production Deploy
1. **Ortam Ayarla**:
   ```bash
   set-production-env.bat
   ```

2. **Backend**: Railway otomatik deploy olur (git push ile)

3. **Frontend Build**:
   ```bash
   cd frontend
   npm run build
   ```

4. **Hosting'e Yükle**: `build/` klasörünü hosting'e yükleyin

---

## 🔧 Manuel Yapılandırma

### Backend .env (Local)
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Musatti
DB_USER=postgres
DB_PASSWORD=12345
JWT_SECRET=demirkan_motorlu_arac_secret_key_2025
PORT=5000
```

### Backend .env (Production)
```env
NODE_ENV=production
DB_HOST=mainline.proxy.rlwy.net
DB_PORT=19436
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=AujMSGZWwRuSBMkdnbDzYUtYEXuDqfHK
JWT_SECRET=demirkan_motorlu_arac_secret_key_2025
PORT=5000
```

### Frontend .env (Local)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Frontend .env (Production)
```env
REACT_APP_API_URL=https://motorservisicrm-production.up.railway.app/api
```

---

## ⚠️ Önemli Notlar

1. **Local Veritabanı**: PostgreSQL'in local'de kurulu ve çalışıyor olması gerekiyor
2. **Veritabanı İsmi**: Local'de "Musatti", Production'da "railway"
3. **Frontend Restart**: `.env` değişikliğinden sonra frontend'i yeniden başlatın
4. **Backend Restart**: `.env` değişikliğinden sonra backend'i yeniden başlatın

---

## 🐛 Sorun Giderme

### "Cannot connect to database" hatası
- PostgreSQL servisinin çalıştığını kontrol edin
- Veritabanı bilgilerinin doğru olduğunu kontrol edin
- Local'de "Musatti" veritabanının var olduğunu kontrol edin

### "Network Error" hatası (Frontend)
- Backend'in çalıştığını kontrol edin (http://localhost:5000)
- `.env` dosyasında API URL'nin doğru olduğunu kontrol edin
- Frontend'i yeniden başlatın

### Ortam değişiklikleri yansımıyor
- Hem backend hem de frontend'i yeniden başlatın
- `.env` dosyalarını kontrol edin
- Browser cache'i temizleyin
