# 🚀 Production Deployment - Hızlı Başlangıç

## demirkanmotorluaraclar.com için ayarlar tamamlandı!

### ✅ Yapılandırma Özeti

**Frontend (demirkanmotorluaraclar.com):**
- Domain: http://demirkanmotorluaraclar.com
- API Endpoint: http://demirkanmotorluaraclar.com/api

**Backend:**
- Database: Railway PostgreSQL
- Host: mainline.proxy.rlwy.net:19436
- Database: railway

### 🎯 Canlıya Alma Adımları

#### 1. Production Ortamını Aktif Et
```bash
set-production-env.bat
```
Bu komut:
- Backend'i Railway PostgreSQL'e bağlar
- Frontend API URL'sini http://demirkanmotorluaraclar.com/api yapar

#### 2. Backend'i Başlat
```bash
cd backend
npm install
npm start
```

Backend şu portta çalışacak: **http://localhost:5000**

> **Önemli:** Backend'i sunucunuzda (demirkanmotorluaraclar.com) çalıştırmanız gerekiyor.
> - PM2, Forever gibi bir process manager kullanın
> - Nginx/Apache ile reverse proxy kurun

#### 3. Frontend Build Al
```bash
cd frontend
npm install
npm run build
```

`build` klasörü oluşacak. Bu klasörü web sunucunuza yükleyin.

### 📦 Sunucu Kurulumu Önerileri

#### Backend için PM2 Kurulumu:
```bash
npm install -g pm2
cd backend
pm2 start server.js --name "demirkan-backend"
pm2 save
pm2 startup
```

#### Nginx Reverse Proxy Örneği:
```nginx
server {
    listen 80;
    server_name demirkanmotorluaraclar.com www.demirkanmotorluaraclar.com;

    # Frontend (React build)
    location / {
        root /path/to/frontend/build;
        try_files $uri /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 🔄 Local'e Dönmek İçin
```bash
set-local-env.bat
```

### 🔐 İlk Giriş Bilgileri
- **Kullanıcı Adı:** admin
- **Şifre:** admin123

> ⚠️ **Güvenlik:** İlk girişte şifrenizi mutlaka değiştirin!

### ✅ Test Kontrol Listesi

1. [ ] Backend başarıyla başladı mı?
2. [ ] Railway veritabanına bağlanabiliyor mu?
3. [ ] Frontend build başarılı mı?
4. [ ] API istekleri çalışıyor mu?
5. [ ] CORS hataları yok mu?
6. [ ] Login işlemi çalışıyor mu?

### 🆘 Sorun Giderme

**"CORS hatası alıyorum":**
- Backend'de CORS ayarları yapıldı, domain'ler eklendi
- Tarayıcı console'unu kontrol edin

**"API'ye bağlanamıyorum":**
- `frontend/.env` dosyasında `REACT_APP_API_URL=http://demirkanmotorluaraclar.com/api` olmalı
- Backend'in çalıştığından emin olun
- Nginx reverse proxy doğru yapılandırılmış olmalı

**"Veritabanına bağlanamıyorum":**
- Railway veritabanının aktif olduğundan emin olun
- `backend/.env` dosyasındaki bilgileri kontrol edin
- Port 19436'nın açık olduğundan emin olun

### 📞 Destek
Sorun yaşıyorsanız:
1. Browser console'da hataları kontrol edin
2. Backend loglarını kontrol edin
3. Network sekmesinde API isteklerini inceleyin
