# ⚠️ Railway Environment Variables Nasıl Eklenir?

## Railway Dashboard'da Environment Variables Ekleme

### Adım 1: Railway Dashboard'a Git
1. [railway.app](https://railway.app) → Projenizi seçin
2. **Variables** sekmesine tıklayın

### Adım 2: Her Değişkeni Tek Tek Ekle

**⚠️ ÖNEMLİ:** Railway dashboard'unda Variables sekmesinde **Raw Editor** moduna geçin (sağ üstte toggle var)

**Raw Editor'e şunu yapıştırın:**

```
NODE_ENV=production
DB_HOST=mainline.proxy.rlwy.net
DB_PORT=19436
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=AujMSGZWwRuSBMkdnbDzYUtYEXuDqfHK
JWT_SECRET=demirkan_motorlu_arac_secret_key_2025
```

### Adım 3: Deploy

1. **Deploy** butonuna tıklayın
2. Logları izleyin

## Alternatif: Railway PostgreSQL Plugin Kullan

Railway'in kendi PostgreSQL servisini kullanmak daha kolay:

### 1. PostgreSQL Plugin Ekle
1. Railway dashboard → Projeniz
2. **+ New** → **Database** → **Add PostgreSQL**
3. Otomatik olarak environment variables oluşacak:
   - `DATABASE_URL`
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`

### 2. Backend Kodunu Güncelle

`backend/config/db.js` dosyasını şöyle değiştirin:

```javascript
const { Pool } = require('pg');

// Railway PostgreSQL'i kullan
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});
```

Bu durumda manuel variable eklemeye gerek kalmaz!

## Hangi Yöntem Daha İyi?

- **Railway PostgreSQL Plugin:** ✅ Önerilen, otomatik, kolay
- **Harici PostgreSQL (Railway external):** Mevcut veritabanınız varsa

## Sorun Giderme

**"not set" hatası alıyorum:**
- Variables sekmesinde değişkenlerin eklendiğinden emin olun
- Raw Editor'ü kullanın, her satır bir variable
- Deploy'dan sonra logları kontrol edin

**Hala bağlanamıyor:**
- SSL ayarlarını kontrol edin
- Database host/port'u doğrulayın
- Railway PostgreSQL plugin kullanmayı deneyin
