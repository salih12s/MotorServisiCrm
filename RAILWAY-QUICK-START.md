# ✅ Railway Deployment - Hızlı Kurulum

## 🎯 Railway'de Deploy Etmek İçin Adımlar

### 1. Railway Projesi Oluştur
- [Railway.app](https://railway.app) → New Project
- "Deploy from GitHub repo" seç
- `salih12s/MotorServisiCrm` repository'sini seç

### 2. Environment Variables Ekle

Railway dashboard → **Variables** sekmesi:

```env
NODE_ENV=production
PORT=5000
DB_HOST=mainline.proxy.rlwy.net
DB_PORT=19436
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=AujMSGZWwRuSBMkdnbDzYUtYEXuDqfHK
JWT_SECRET=demirkan_motorlu_arac_secret_key_2025
```

### 3. Deploy

✅ Otomatik başlayacak! Railway şunları algılayacak:
- ✅ `package.json` → Start komutu
- ✅ `Procfile` → Web servisi
- ✅ `railway.json` → Railway config
- ✅ `nixpacks.toml` → Build config

### 4. Domain Al

Settings → Networking → **Generate Domain**

Railway size bir URL verecek: `https://your-app.railway.app`

### 5. Test Et

```bash
curl https://your-app.railway.app/
```

## 📋 Yapılan Değişiklikler

✅ Root `package.json` → Start script eklendi  
✅ `Procfile` → Web process tanımı  
✅ `railway.json` → Railway yapılandırması  
✅ `nixpacks.toml` → Build yapılandırması  
✅ `RAILWAY-DEPLOYMENT.md` → Detaylı rehber  

## ✨ Frontend İçin

Railway backend URL'sini aldıktan sonra:

1. Frontend `.env` dosyasını güncelle:
```env
REACT_APP_API_URL=https://your-app.railway.app/api
```

2. Build al:
```bash
cd frontend
npm run build
```

3. `build` klasörünü web sunucuna yükle

## 🎉 Tamamlandı!

Tüm dosyalar GitHub'a pushlandı. Railway şimdi otomatik deploy edecek.

Railway dashboard'unda **Deployments** sekmesinden ilerlemeyi izle.
