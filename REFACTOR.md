# Demirkan Motorlu Araçlar — Refactor Dökümanı

> Bu döküman; projenin genel mimarisini, yapılan refactor çalışmalarını (Refactor 1) ve
> bir sonraki planlanan adımları (Refactor 2) detaylı şekilde kayıt altına alır.
>
> **Kural:** Tüm refactor çalışmaları **pür yapısal**dır — UI/UX birebir korunur,
> davranış değişmez. Her adım build ile doğrulanır ve ayrı commit'lenir.

---

## 1. Proje Genel Bakış

**Demirkan Motorlu Araçlar Servis Yönetim Sistemi** — motosiklet/motorlu araç servisi
için iş emri takibi, müşteri yönetimi, aksesuar satışı, motor satışı, gider takibi ve
raporlama yapan tam yığın (full-stack) bir web uygulamasıdır.

### Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 19.2 (CRA / react-scripts 5.0.1), JSX (TypeScript **değil**) |
| UI Kütüphanesi | MUI 7.3 (`@mui/material`, `@mui/icons-material`) + Emotion |
| Routing | react-router-dom 7.11 |
| HTTP | axios 1.13 (interceptor'lı) |
| Tarih | date-fns 4.1 (Türkçe locale) |
| Yazdırma | react-to-print 3.2 |
| Backend | Node.js + Express 4.18 |
| Veritabanı | PostgreSQL (`pg` 8.11) |
| Auth | JWT (`jsonwebtoken`, 24s geçerlilik) + bcryptjs |
| Deploy | Railway (Nixpacks), production domaini `demirkanmotorluaraclar.com` |

### Depo Yapısı

```
DemirkanMotorluArac/
├── backend/            # Express API
│   ├── server.js       # Giriş noktası, CORS, JWT middleware, route mount
│   ├── config/         # db.js, initDb.js, activityLogger.js, migrateFisNo.js
│   ├── routes/         # 8 route dosyası (REST API)
│   └── migrations/     # Şema değişiklikleri + seed scriptleri
├── frontend/           # React SPA (CRA)
│   └── src/
│       ├── pages/      # Sayfa bileşenleri
│       ├── components/ # Paylaşılan bileşenler (Layout, modallar, nav)
│       ├── context/    # AuthContext, ThemeContext
│       └── services/   # api.js (axios servis katmanı)
└── *.md / railway.json / Procfile / nixpacks.toml  # Deploy & döküman
```

---

## 2. Backend Mimarisi

### 2.1 Sunucu (`server.js`)
- **Port:** `5000` (`PORT` env ile değişebilir).
- **Middleware:** `cors()` (ortama duyarlı origin listesi), `express.json()`.
- **Auth Middleware:** `authenticateToken()` — `Authorization: Bearer <token>` doğrular.
- **CORS:** dev'de `localhost:3000/3001`; prod'da `demirkanmotorluaraclar.com` + Railway domainleri.

### 2.2 Veritabanı (`config/db.js`)
- PostgreSQL bağlantı havuzu (`pg.Pool`), **max 10** bağlantı.
- Bağlantı önceliği: `DATABASE_URL` (Railway) → ayrı env değişkenleri → localhost varsayılanları.
- Prod'da SSL açık (`rejectUnauthorized: false`), connection timeout 8s.

### 2.3 Tablolar (`config/initDb.js`)

| Tablo | Amaç |
|-------|------|
| `kullanicilar` | Kullanıcı kimlik + yetkiler (rol, aksesuar_yetkisi, motor_satis_yetkisi) |
| `musteriler` | Müşteri kayıtları |
| `is_emirleri` | İş emirleri / servis fişleri (fis_no, durum, kar vb.) |
| `parcalar` | İş emrine bağlı takılan parçalar |
| `giderler` | Genel giderler (kategori bazlı) |
| `aktivite_log` | Denetim/audit kayıtları |
| `yazici_ayarlari` | Yazdırma ayarları (JSONB) |
| `aksesuarlar` | Aksesuar satış kayıtları |
| `aksesuar_parcalar` | Aksesuar satışındaki ürün kalemleri |
| `aksesuar_stok` | Aksesuar stok/envanter takibi |
| `motor_modelleri` | Motor modeli tanımları (cc, ÖTV oranı) |
| `motor_satislari` | Motor satış kayıtları |

### 2.4 REST API Uç Noktaları (routes/)

| Route Dosyası | ~Satır | Başlıca Uç Noktalar |
|---------------|-------:|---------------------|
| `auth.js` | 542 | login, register, verify, kullanıcı/yetki yönetimi, aktivite logları, yazdırma ayarları |
| `isEmirleri.js` | 526 | iş emri CRUD, parça ekle/sil, tamamla, next-fis-no, (silme admin'e özel) |
| `raporlar.js` | 490 | gunluk, aralik, genel, fis-kar, is-emri/:id, aksesuar/aralik, aksesuar/:id |
| `aksesuarlar.js` | 356 | aksesuar satış CRUD + stats/genel (transaction + stok düşme) |
| `motorSatislari.js` | 323 | modeller CRUD + satış CRUD + stats/ozet |
| `aksesuarStok.js` | 163 | stok CRUD, arama, toplu upsert |
| `musteriler.js` | 151 | müşteri CRUD + arama |
| `giderler.js` | 134 | gider CRUD (tarih/kategori filtreli) |

- **`activityLogger.js`:** Tüm CRUD işlemlerini `aktivite_log`'a yazar (kullanıcı, işlem tipi,
  hedef tablo/ID, IP, tarayıcı bilgisi). Hem nesne hem konumsal çağrı desenini destekler.

---

## 3. Frontend Mimarisi

### 3.1 Yönlendirme & Yetkilendirme (`App.jsx`)
- **Public sayfalar:** `/` (LandingPage), `/hakkimizda`, `/basinda`, `/motorlar`.
- **Panel sayfaları** `PanelLayoutRoute` (Layout) altında, role-bazlı korumalı:
  - `NormalRoute` — standart personel sayfaları (iş emirleri, müşteriler).
  - `AdminRoute` — raporlar, kullanıcılar (sadece admin).
  - `AksesuarRoute` — aksesuarlar, aksesuar-stok (aksesuar_yetkisi veya admin).
  - `MotorSatisRoute` — motor-satislari (motor_satis_yetkisi veya admin).
- **Context:** `AuthProvider` (kullanıcı/oturum), `CustomThemeProvider` (tema).

### 3.2 Servis Katmanı (`services/api.js`)
- Tek `axios` örneği; istek interceptor'ı `localStorage` token'ı ekler,
  yanıt interceptor'ı **401'de otomatik logout** yapar.
- Servisler: `authService`, `musteriService`, `isEmriService`, `raporService`,
  `giderService`, `aksesuarService`, `aksesuarStokService`, `motorSatisService`.

### 3.3 Sayfa & Bileşen Boyutları (Refactor Hedefleri)

| Dosya | Satır | Not |
|-------|------:|-----|
| `pages/Raporlar.jsx` | **526** | ✅ Refactor 1'de 3221 → 526'ya düşürüldü |
| `pages/MotorSatislari.jsx` | 2074 | 🔜 Refactor 2 hedefi (en büyük dosya) |
| `pages/IsEmirleri.jsx` | 1323 | Sıradaki |
| `pages/Kullanicilar.jsx` | 1276 | Sıradaki |
| `pages/LandingPage.jsx` | 1114 | Public sayfa |
| `components/IsEmriModal.jsx` | 968 | Modal |
| `components/AksesuarModal.jsx` | 862 | Modal |
| `pages/Aksesuarlar.jsx` | 825 | |
| `pages/IsEmriDetay.jsx` | 809 | |
| `pages/IsEmriForm.jsx` | 777 | |
| `pages/MotorlarPage.jsx` | 704 | Public sayfa |
| `pages/Giderler.jsx` | 600 | |
| `components/Layout.jsx` | 570 | |
| `pages/Login.jsx` | 552 | |
| `pages/Musteriler.jsx` | 535 | |

### 3.4 Build & Doğrulama
```powershell
cd frontend; $env:CI="false"; npm run build   # exit 0 = başarılı
```
> `CI="false"` zorunlu — aksi halde ESLint uyarıları build'i kırar.

---

## 4. Refactor 1 — `Raporlar.jsx` Tam Modülerizasyonu ✅ TAMAMLANDI

### 4.1 Amaç
`Raporlar.jsx` projenin en büyük "god component"iydi (**3221 satır**). 4 sekme (Motor
Satışları, Günlük/İş Emirleri, Aksesuar Satışları, Fiş Kâr Analizi), 3 detay modal,
yardımcı bileşen ve fonksiyonlar tek dosyada toplanmıştı. Hedef: her parçayı
`pages/raporlar/` alt klasörüne ayrı bileşen/dosya olarak çıkarmak — **davranışı
değiştirmeden**.

### 4.2 Hazırlık
- Baseline branch: `refactor/phase-0-baseline`
- Baseline tag: `baseline-before-refactor` (commit `5c827cd`)
- Her çıkarma ayrı commit; branch'te kalındı (PR kullanıcı tarafından açılacak).

### 4.3 Adım Adım Yapılanlar

| # | Commit | Çıkarılan | Yeni Dosya(lar) | Satır |
|---|--------|-----------|------------------|------:|
| 1 | `d75a9c4` | `StatCard` inline bileşeni | `raporlar/StatCard.jsx` | 48 |
| 2 | `12591a7` | 3 detay modal + `formatCurrency` | `IsEmriDetayModal.jsx` (299), `AksesuarDetayModal.jsx` (199), `MotorSatisDetayModal.jsx` (189), `raporlarUtils.js` (10) | — |
| 3 | `0156d52` | `renderAksesuarRapor` | `AksesuarRaporTab.jsx` | 389 |
| 4 | `c792ca2` | `renderFisKarRapor` | `FisKarRaporTab.jsx` | 540 |
| 5 | `73e9823` | `renderMotorSatisRapor` | `MotorSatisRaporTab.jsx` | 582 |
| 6 | `84ef639` | `renderGunlukRapor` | `GunlukRaporTab.jsx` | 875 |

### 4.4 Sonuç `pages/raporlar/` klasörü

```
raporlar/
├── StatCard.jsx              (48)   # İstatistik kartı
├── raporlarUtils.js          (10)   # formatCurrency (Intl tr-TR TRY)
├── IsEmriDetayModal.jsx     (299)
├── AksesuarDetayModal.jsx   (199)
├── MotorSatisDetayModal.jsx (189)
├── AksesuarRaporTab.jsx     (389)   # Sekme 2
├── FisKarRaporTab.jsx       (540)   # Sekme 3
├── MotorSatisRaporTab.jsx   (582)   # Sekme 0
└── GunlukRaporTab.jsx       (875)   # Sekme 1
```

### 4.5 Yöntem Notları
- Her sekme bileşeni **props** ile beslendi (state ve handler'lar `Raporlar.jsx`'te kaldı).
  JSX'te tip denetimi olmadığından prop adları birebir eşleştirildi.
- Her çıkarmadan sonra: `get_errors` (language server) → `npm run build` (exit 0) → commit.
- Çıkarma sonrası kullanılmayan import'lar (`Table`, `Chip`, `FormControl`, ikonlar vb.)
  ana dosyadan temizlendi.

### 4.6 Ölçülen Kazanım
- `Raporlar.jsx`: **3221 → 526 satır** (~%84 azalma).
- Ana dosyada artık yalnızca: state, veri yükleme (`useEffect`/servis çağrıları),
  sıralama yardımcıları, `Tabs` düzeni ve sekme bileşenlerinin orkestrasyonu kaldı.
- Tüm 6 commit temiz build (exit 0). Sadece **2 baseline uyarısı** korundu (refactor'dan
  bağımsız, dokunulmadı): `motorModeller` ve `handleIsEmriDoubleClick` kullanılmıyor.

---

## 5. Refactor 2 — `MotorSatislari.jsx` Modülerizasyonu — DEVAM EDİYOR

### 5.1 Hedef
`MotorSatislari.jsx` artık en büyük dosya (**2074 satır**). Refactor 1 ile aynı desen
uygulanıyor: mantıksal parçaları `pages/motorSatislari/` alt klasörüne çıkarmak.

### 5.2 Dosya Anatomisi (keşif sonucu)
Dosya tek `MotorSatislari` bileşeninden oluşuyor; içinde 4 adet `Dialog` var:
1. **Satış Modal** (~478 satır) — satış ekleme/düzenleme formu (en karmaşık, fiyat/vergi hesaplı).
2. **Model Modal** (~104 satır) — motor modeli ekle/düzenle.
3. **Modeller Liste Modal** (~190 satır) — model listesi yönetimi.
4. **Detay Modal** (~356 satır) — salt-okunur satış detayı. ✅ **Çıkarıldı**

Ayrıca: masaüstü tablo + mobil kart liste görünümü, istatistik chip filtreleri,
yardımcılar (`formatCurrency`, `formatNumber`, `parseFormattedNumber`, `formatDate`),
sabitler (`KDV_ORANI=20`, `DAMGA_VERGISI=791`).

### 5.3 Yapılan Adımlar (her biri ayrı commit, build doğrulamalı)

| # | Commit | Çıkarılan | Yeni Dosya | Satır | Build |
|---|--------|-----------|------------|------:|:-----:|
| 1 | `(motorSatislari)` | Detay Modal (salt-okunur) | `motorSatislari/MotorSatisDetayModal.jsx` | ~340 | exit 0 ✅ |
| 2 | `(motorSatislari)` | Modeller Liste Modal | `motorSatislari/ModellerListModal.jsx` | ~225 | exit 0 ✅ |
| 3 | `(motorSatislari)` | Model Ekle/Düzenle Modal | `motorSatislari/ModelFormModal.jsx` | ~140 | exit 0 ✅ |
| 4 | `(motorSatislari)` | Satış Ekle/Düzenle Modal | `motorSatislari/SatisFormModal.jsx` | ~537 | exit 0 ✅ |

> **Not:** Tüm modaller props ile beslenir (state yukarıda `MotorSatislari`'da kalır).
> - `MotorSatisDetayModal`: `open, onClose, isMobile, selectedSatisDetay, modeller, formatCurrency, formatDate`.
> - `ModellerListModal`: `open, onClose, isMobile, modeller, onEditModel, onDeleteModel, onAddModel`.
> - `ModelFormModal`: `open, onClose, isMobile, editingModel, modelForm, setModelForm, onSave`.
> - `SatisFormModal`: `open, onClose, isMobile, editingSatis, satisForm, setSatisForm, modeller, getInputValue, handlePriceChange, handlePriceFocus, handlePriceBlur, isAdmin, formatCurrency, onSave`.
>
> Sabitler (`KDV_ORANI=20`, `DAMGA_VERGISI=791`) `MotorSatisDetayModal` ve `SatisFormModal`
> içinde modül sabiti olarak tanımlandı; davranış birebir korundu. Çıkarımdan sonra ana
> dosyada kullanılmayan import'lar (`Dialog*`, `Grid`, `FormControl`, `Select`, `MenuItem`,
> `MoneyIcon`, `ReceiptIcon`, `CategoryIcon`, `InfoIcon`) temizlendi.
>
> **Toplam sonuç: 2074 → 988 satır** (4 modal çıkarıldı).

### 5.4 Kalan Planlanan Adımlar
5. **Liste görünümü** (masaüstü tablo + mobil kart) → ayrı bileşen(ler).
6. **Yardımcılar** → `motorSatislariUtils.js` (ortak `formatCurrency`, `formatNumber`, `formatDate` vb.).
7. **Temizlik:** son build + commit.

### 5.5 Beklenen Sonuç
- `MotorSatislari.jsx` büyük oranda küçülecek (orkestrasyon katmanına inecek).
- Davranış ve UI birebir korunacak; her adım `npm run build` (exit 0) ile doğrulanacak.


---

## 6. Refactor 3 — Klasör Yapısı Modernizasyonu — TAMAMLANDI

### 6.1 Hedef
Tüm sayfalar düz (`flat`) biçimde doğrudan `pages/` altında duruyordu. Modern
özellik-bazlı (feature-folder) yapıya geçirilerek her sayfa kendi alanının klasörüne
taşındı; alt bileşenler (modal/tab/util) zaten ilgili klasörde toplandığından kök
dizin tamamen sadeleşti.

### 6.2 Yeni Yapı
```
pages/
  public/        → LandingPage, HakkimizdaPage, BasindaPage, MotorlarPage, Login
  dashboard/     → Dashboard
  isEmirleri/    → IsEmirleri, IsEmriForm, IsEmriDetay
  musteriler/    → Musteriler
  raporlar/      → Raporlar + StatCard, *DetayModal, *RaporTab, raporlarUtils
  giderler/      → Giderler
  kullanicilar/  → Kullanicilar
  aksesuarlar/   → Aksesuarlar, AksesuarStok
  motorSatislari/→ MotorSatislari + 4 modal + motorSatislariUtils
```

### 6.3 Yapılan İşlem
- Taşımalar `git mv` ile yapıldı (geçmiş korundu).
- Taşınan dosyalarda göreli import derinliği güncellendi (`../` → `../../`,
  `./altBilesen` → `./altBilesen`).
- `App.jsx` içindeki tüm sayfa import yolları yeni klasörlere göre güncellendi.
- Build doğrulandı (**exit 0**); davranış/UI birebir korundu.

### 6.4 Commit'ler
| Commit | Kapsam |
|--------|--------|
| `refactor(pages): Raporlar ve MotorSatislari kendi ozellik klasorlerine tasindi` | İlk 2 klasör |
| `refactor(pages): tum sayfalar ozellik klasorlerine tasindi (...)` | Kalan 7 grup |

---

## 7. Sonraki Refactor Adayları (Sıra)

| Sıra | Dosya | Satır | Yaklaşım |
|------|-------|------:|----------|
| Sıradaki | `pages/isEmirleri/IsEmirleri.jsx` | 1323 | Liste/filtre/satır bileşenleri ayrımı |
| Sıradaki | `pages/kullanicilar/Kullanicilar.jsx` | 1276 | Kullanıcı kartı + yetki + aktivite log ayrımı |
| Sıradaki | `components/IsEmriModal.jsx` | 968 | Form bölümleri ayrımı |
| Sıradaki | `components/AksesuarModal.jsx` | 862 | Form + parça listesi ayrımı |

---

## 7. Genel Kurallar (Tüm Refactor'lar İçin)
- UI/UX **birebir** korunur; yalnızca yapısal ayrıştırma yapılır.
- Her çıkarma ayrı commit; mesaj formatı: `refactor(<alan>): <bileşen> <kaynak>'tan ayrildi`.
- Build doğrulaması: `cd frontend; $env:CI="false"; npm run build` → **exit 0** şart.
- JSX'te derleme-zamanı tip denetimi yok → prop adları **birebir** eşleştirilmeli.
- Baseline'da var olan uyarılara **dokunulmaz** (refactor kapsamı dışı).
- `refactor/phase-0-baseline` branch'inde kalınır; PR kullanıcı tarafından açılır.
