<div align="center">

# Demirkan Motorlu Araçlar — Automotive Service & Sales ERP

### Dijital ürün vitrini, servis operasyonu ve bayi yönetimi tek platformda

Müşteriye açık motosiklet, aksesuar ve hobi ürünleri vitrini ile işletmenin servis,
stok, satış, müşteri ve raporlama süreçlerini bir araya getiren full-stack web uygulaması.

[Canlı vitrini görüntüle](https://demirkanmotorluaraclar.com) ·
[Ürün turu](#ürün-turu) ·
[Mimari](#mimari) ·
[Teknoloji yığını](#teknoloji-yığını)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Material UI](https://img.shields.io/badge/Material_UI-7-007FFF?logo=mui&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-4169E1?logo=postgresql&logoColor=white)
![Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?logo=railway&logoColor=white)

</div>

---


<!-- english-overview:start -->
## English Overview

Demirkan Motorlu Araçlar is a production automotive service and sales ERP that integrates a public motorcycle and accessory catalog with service, sales, inventory, customer, expense, reporting, and user-management workflows.

### My Contribution

I developed the public storefront and protected operations panel, implemented the Node.js/Express API and PostgreSQL model, connected inventory and sales workflows, added granular permissions and activity logs, and deployed the application for real business use.

### Engineering Challenges

- Keeping public product availability synchronized with internal inventory and sales
- Applying business-specific tax, cost, payment, and profitability rules consistently
- Separating customer-facing content from protected operational and financial data
- Supporting responsive public pages and data-heavy administration screens in one product
- Preparing synthetic demo data and screenshots without exposing live customer information
<!-- english-overview:end -->

## Ürün

Demirkan Motorlu Araçlar, iki farklı kullanıcı deneyimini aynı uygulama ve veri modeli
üzerinde buluşturur:

| Ürün yüzeyi | Kullanıcı | Sağladığı deneyim |
|---|---|---|
| **Dijital vitrin** | Ziyaretçi ve müşteri | Motosiklet kataloğu, model detayı, fiyat listesi, aksesuar ve e-bike vitrini, sepet ve WhatsApp sipariş akışı |
| **Operasyon paneli** | Personel ve yönetici | İş emri, müşteri, stok, satış, gider, rapor, kullanıcı, yetki, aktivite ve toplu SMS yönetimi |

| 2 ürün yüzeyi | 16 ilişkili tablo | 5 rapor görünümü | 27 ürün ekranı |
|:---:|:---:|:---:|:---:|
| Public + korumalı panel | PostgreSQL veri modeli | Operasyon ve kârlılık | Masaüstü + mobil |

Uygulama yalnızca kayıt tutmaz; servis fişi üretimi, çift yönlü stok hareketi,
motosiklet vergi ayrıştırması, rol bazlı erişim ve kanal bazlı kârlılık gibi
işletmeye özgü kuralları sunucu tarafında uygular.

> Bu sayfadaki ekranlar izole bir demo veritabanında, tamamen kurgusal müşteri ve işlem
> verileriyle oluşturuldu. Canlı veritabanı kullanılmadı; görsellerde gerçek kimlik
> bilgisi veya parola bulunmuyor.

---

## Ürün turu

### Dijital vitrin

<div align="center">

![Demirkan Motorlu Araçlar ana sayfası](docs/screenshots/public-anasayfa.jpg)

Video arka planlı açılış, ürün gruplarına hızlı erişim ve kurumsal marka anlatısı

</div>

| Motosiklet kataloğu | Model detay sayfası |
|---|---|
| ![Kategori ve marka filtreli motosiklet kataloğu](docs/screenshots/public-motorlar.jpg) | ![Motosiklet galeri ve teknik özellikleri](docs/screenshots/public-motor-detay.jpg) |
| Kategori ve marka filtreleriyle ürün keşfi | Galeri, renkler, teknik özellikler ve teklif akışı |

| Güncel fiyat listesi | Kurumsal anlatı |
|---|---|
| ![Motosiklet fiyat listesi](docs/screenshots/public-fiyat-listesi.jpg) | ![Demirkan Motorlu Araçlar hakkımızda sayfası](docs/screenshots/public-hakkimizda.jpg) |
| Model yılı, fiyat ve banka bazlı taksit görünümü | Marka, vizyon ve misyon içeriği |

| Aksesuar vitrini | Bisiklet ve e-bike vitrini |
|---|---|
| ![Aksesuar ürün vitrini](docs/screenshots/public-aksesuar-katalog.png) | ![Hobi grup ürün vitrini](docs/screenshots/public-hobi-grup.png) |
| Paneldeki stok kartlarından beslenen açık katalog | Ayrı stok alanına bağlı hobi ürünleri kataloğu |

<div align="center">

![Sepet ve WhatsApp sipariş akışı](docs/screenshots/public-sepet.png)

Stok limitini gözeten sepet, anlık toplam ve WhatsApp'a aktarılan sipariş özeti

</div>

### Operasyon paneli

<div align="center">

![Servis iş emirleri yönetim ekranı](docs/screenshots/panel-is-emirleri.png)

Durum ve tarih filtreleri, operasyon özetleri, ciro/kâr göstergeleri ve hızlı işlemler

</div>

| İş emri formu | İş emri detayı ve baskı |
|---|---|
| ![İş emri oluşturma formu](docs/screenshots/panel-is-emri-form.png) | ![İş emri detay ve yazdırma ekranı](docs/screenshots/panel-is-emri-detay.png) |
| Müşteri, araç, arıza, parça ve işçilik tek akışta | Maliyet/kâr kartları ve servis kabul formu önizlemesi |

| Aksesuar satışları | Aksesuar stoku |
|---|---|
| ![Aksesuar satış yönetimi](docs/screenshots/panel-aksesuar-satis.png) | ![Aksesuar stok yönetimi](docs/screenshots/panel-aksesuar-stok.png) |
| Çok kalemli satış, ödeme ve net kâr takibi | Stok girişi/çıkışı, mevcut ve envanter değeri |

| Hobi grup satışları | Hobi grup stoku |
|---|---|
| ![Hobi grup satış yönetimi](docs/screenshots/panel-hobi-grup-satis.png) | ![Hobi grup stok yönetimi](docs/screenshots/panel-hobi-grup-stok.png) |
| Bisiklet ve e-bike için bağımsız satış defteri | Ürün grubuna özel stok ve fiyat yönetimi |

<div align="center">

![Motosiklet satış yönetimi](docs/screenshots/panel-motor-satislari.png)

Şasi, model, iskonto, parçalı ödeme ve otomatik ÖTV/KDV/kâr hesapları

</div>

<details>
<summary><strong>Beş rapor görünümünü aç</strong></summary>

| Motosiklet satışları | Servis iş emirleri |
|---|---|
| ![Motosiklet satış raporu](docs/screenshots/panel-rapor-motor.png) | ![İş emri raporu](docs/screenshots/panel-rapor-is-emirleri.png) |
| Tarih ve personel bazlı satış/maliyet/kâr | Günlük servis performansı, gider ve net kâr |

| Aksesuar | Hobi grup |
|---|---|
| ![Aksesuar satış raporu](docs/screenshots/panel-rapor-aksesuar.png) | ![Hobi grup satış raporu](docs/screenshots/panel-rapor-hobi-grup.png) |
| Kanal bazlı ciro, maliyet ve kâr | Bisiklet/e-bike performans görünümü |

<div align="center">

![Konsolide fiş kâr analizi](docs/screenshots/panel-rapor-fis-kar.png)

Dört gelir kanalını kayıt bazında birleştiren fiş kâr analizi

</div>

</details>

| Müşteri kartları | Kullanıcı ve yetki yönetimi |
|---|---|
| ![Müşteri yönetimi](docs/screenshots/panel-musteriler.png) | ![Kullanıcı ve yetki yönetimi](docs/screenshots/panel-kullanicilar.png) |
| Servis kayıtlarından oluşan aranabilir müşteri defteri | Onay akışı, modül yetkileri ve aktivite kayıtları |

| Toplu SMS | Güvenli giriş |
|---|---|
| ![Toplu SMS yönetimi](docs/screenshots/panel-toplu-sms.png) | ![Kullanıcı giriş ekranı](docs/screenshots/login.jpg) |
| Rehber, müşteri aktarımı, alıcı seçimi ve mesaj sayacı | Kayıt, yönetici onayı ve JWT tabanlı oturum |

### Responsive deneyim

<div align="center">

<img src="docs/screenshots/mobil-anasayfa.jpg" alt="Mobil dijital vitrin" width="42%">
<img src="docs/screenshots/mobil-is-emirleri.png" alt="Mobil iş emirleri paneli" width="42%">

Public site ve operasyon paneli aynı responsive tasarım sistemiyle mobil cihazlara uyarlanır.

</div>

---

## Modüller

| Alan | Ürün yeteneği | Teknik karşılığı |
|---|---|---|
| **Servis** | İş emri, parça/işçilik, durum, maliyet, kâr ve fiş baskısı | Transaction tabanlı kayıt, otomatik fiş no, JSONB yazıcı yerleşimi |
| **Müşteri** | Telefonla eşleştirme, otomatik kart ve geçmiş | İş emri akışına bağlı müşteri upsert mantığı |
| **Aksesuar** | Çok kalemli satış, stok, fotoğraf ve açık katalog | Satış durumuna göre stok düşme/iade, cache'li görsel uçları |
| **Hobi grup** | Bisiklet ve e-bike satış, stok ve vitrin | Aksesuar akışından ayrıştırılmış bağımsız domain |
| **Motosiklet** | Model, şasi, iskonto, ödeme, vergi ve kârlılık | Model bazlı ÖTV ile geriye doğru vergi ayrıştırma |
| **Raporlama** | Kanal, tarih ve personel bazlı finansal görünüm | Tamamlanan kayıtlardan sunucu taraflı agregasyon |
| **Kullanıcı** | Kayıt onayı, rol, modül yetkisi ve denetim izi | JWT, bcrypt, route guard ve aktivite logu |
| **İletişim** | SMS rehberi, toplu gönderim ve WhatsApp sepeti | Normalize telefon verisi ve sağlayıcı kontrollü entegrasyon |

---

## Mimari

```mermaid
flowchart LR
    visitor["Ziyaretçi"] --> public["Dijital vitrin"]
    staff["Personel / Yönetici"] --> panel["Operasyon paneli"]

    subgraph spa["React SPA"]
        public
        panel
        contexts["Auth · Theme · Cart Context"]
        client["Axios API istemcisi"]
        public --> contexts
        panel --> contexts
        contexts --> client
    end

    client -->|"HTTPS / JSON"| api["Express REST API"]
    api --> publicApi["Public katalog uçları"]
    api --> protectedApi["JWT + rol/yetki korumalı uçlar"]
    publicApi --> db[("PostgreSQL")]
    protectedApi --> db
    protectedApi --> sms["SMS sağlayıcısı"]
    public --> whatsapp["WhatsApp sipariş"]
```

Tek React uygulaması public ve korumalı rotaları sunar. Axios katmanı token taşıma ve
oturum süresi yönetimini merkezileştirir. Express API; kimlik doğrulama, yetkilendirme,
doğrulama ve iş kurallarının sınırıdır. PostgreSQL tarafında 16 tablo; servis, satış,
stok, müşteri ve denetim alanlarını ilişkilendirir.

### Öne çıkan mühendislik kararları

- **İş kuralları API'de:** toplam, maliyet, kâr, vergi ve stok sonucu istemciye bırakılmaz.
- **Atomik operasyonlar:** iş emri kalemleri ve stok etkileyen satışlar
  `BEGIN / COMMIT / ROLLBACK` sınırında yürütülür.
- **Çift yönlü stok:** tamamlanan satış stoktan düşer; durum geri alınırsa veya kayıt
  silinirse aynı miktar stoğa döner.
- **Parametreli SQL:** veri erişimi `pg` havuzu ve `$1, $2, …` parametreleriyle yapılır.
- **Katmanlı yetkilendirme:** Express middleware işleme erişimi, React route guard ise
  kullanıcı deneyimini kontrol eder.
- **Denetim izi:** kritik kullanıcı işlemleri hedef kayıt, IP ve tarayıcı bilgisiyle loglanır.
- **Hafif katalog yanıtları:** ürün görselleri ayrı endpoint, `ETag` ve
  `Cache-Control` başlıklarıyla servis edilir.
- **Feature-based arayüz:** büyük ekranlar alan klasörlerine, sunum bileşenlerine ve
  saf yardımcı fonksiyonlara ayrılır.

---

## Teknoloji yığını

| Katman | Teknolojiler | Projedeki rolü |
|---|---|---|
| **Frontend** | React 19, React DOM 19 | SPA, bileşen tabanlı public site ve panel |
| **Tasarım sistemi** | Material UI 7, Emotion | Responsive düzen, temalar ve erişilebilir UI bileşenleri |
| **Yönlendirme** | React Router 7 | Public, korumalı, admin ve modül bazlı rotalar |
| **İstemci durumu** | React Context | Kimlik, tema ve sepet durumları |
| **HTTP** | Axios | Merkezi API istemcisi ve interceptor'lar |
| **Sunucu** | Node.js 20, Express 4 | REST API, middleware ve domain rotaları |
| **Veri** | PostgreSQL, node-postgres | İlişkisel model, transaction ve agregasyonlar |
| **Güvenlik** | JWT, bcryptjs, CORS | Oturum, parola hash'i ve origin kontrolü |
| **Ürün araçları** | date-fns, react-to-print | Tarih işlemleri ve servis fişi baskısı |
| **Operasyon** | Railway, Nixpacks | Backend servisinin üretim dağıtımı |

---

## Kritik iş akışları

### Servis iş emri

```text
Telefonla müşteri eşleştir
        ↓
Müşteri kartını oluştur / güncelle
        ↓
İş emri + parça ve işçilik kalemlerini transaction içinde yaz
        ↓
Ciro = Σ(adet × satış) · Maliyet = Σ(adet × maliyet) · Kâr = Ciro − Maliyet
        ↓
Durumu ilerlet, tamamlanma tarihini kaydet ve servis fişini üret
```

### Stok hareketi

```text
Satış tamamlandı       → ürün miktarlarını stoktan düş
Tamamlanma geri alındı → önceki miktarları stoğa iade et
Satış güncellendi      → eski etkiyi geri al, yeni etkiyi uygula
Satış silindi          → tamamlanmışsa stok etkisini geri al
```

### Motosiklet vergisi ve kârlılık

```text
Matrah           = Fatura / ((1 + ÖTV oranı) × (1 + KDV oranı))
ÖTV              = Matrah × modelin ÖTV oranı
KDV              = (Matrah + ÖTV) × %20
İskontolu alış   = Alış fiyatı − iskonto
Kâr              = Satış − vergiler − iskontolu alış
```

---

## Veri ve API görünümü

### Veri modeli

```text
kullanicilar ─┬─ is_emirleri ── parcalar
              ├─ aksesuarlar ── aksesuar_parcalar
              ├─ bisiklet_satislar ── bisiklet_satis_parcalar
              ├─ motor_satislari ── motor_modelleri
              └─ aktivite_log

musteriler ───── is_emirleri
aksesuar_stok ── aksesuar vitrini / stok hareketleri
bisiklet_stok ── hobi vitrini / stok hareketleri
giderler ─────── raporlar
sms_rehber ───── toplu SMS
yazici_ayarlari ─ servis fişi yerleşimi
```

Şemanın tablo ve kolon tanımları
[`backend/config/initDb.js`](backend/config/initDb.js), ilişkili domain sorguları ise
[`backend/routes/`](backend/routes/) altında görülebilir.

### REST yüzeyi

| API grubu | Sorumluluk | Erişim |
|---|---|---|
| `/api/public/aksesuarlar`, `/api/public/bisikletler` | Katalog, ürün detayı ve görsel | Public |
| `/api/auth` | Kayıt, giriş, onay, kullanıcı ve aktivite | Public + JWT + admin |
| `/api/is-emirleri`, `/api/musteriler` | Servis ve müşteri yönetimi | JWT |
| `/api/aksesuarlar`, `/api/aksesuar-stok` | Aksesuar satış ve stok | JWT + modül yetkisi |
| `/api/bisiklet-satislari`, `/api/bisiklet-stok` | Hobi grup satış ve stok | JWT + modül yetkisi |
| `/api/motor-satislari` | Model ve motosiklet satışları | JWT + modül yetkisi |
| `/api/raporlar`, `/api/giderler` | Finansal rapor ve giderler | JWT |
| `/api/sms` | Rehber ve toplu gönderim | JWT + admin |

### Rol modeli

```text
admin
└── Tüm operasyonlar + raporlar + kullanıcı/yetki yönetimi + toplu SMS

personel
├── temel erişim             → servis ve müşteriler
├── aksesuar_yetkisi         → aksesuar + hobi grup satış/stok
└── motor_satis_yetkisi      → motosiklet satışları
```

---

## Kod haritası

```text
.
├── backend/
│   ├── server.js                 # Express başlangıcı, public API ve middleware zinciri
│   ├── config/
│   │   ├── db.js                 # PostgreSQL bağlantı havuzu
│   │   ├── initDb.js             # Şema ve migration akışı
│   │   └── activityLogger.js     # Denetim izi yardımcıları
│   ├── routes/                   # Domain bazlı REST rotaları
│   └── migrations/               # Veri ve kolon migration script'leri
├── frontend/
│   ├── public/                   # Statik varlıklar ve SPA yapılandırması
│   └── src/
│       ├── App.jsx               # Route ağacı ve erişim guard'ları
│       ├── components/           # Paylaşılan ve form bileşenleri
│       ├── context/              # Auth, Theme ve Cart context'leri
│       ├── pages/
│       │   ├── public/           # Dijital vitrin
│       │   ├── isEmirleri/       # Servis domain'i
│       │   ├── aksesuarlar/      # Aksesuar satış ve stok
│       │   ├── hobiGrup/         # Bisiklet ve e-bike
│       │   ├── motorSatislari/   # Motosiklet satışları
│       │   └── raporlar/         # Finansal görünümler
│       └── services/api.js       # Merkezi Axios istemcisi
└── docs/screenshots/             # Ürün vitrini görselleri
```

---

## Güvenlik ve demo verisi

- Parolalar bcrypt ile hash'lenir; oturumlar süreli JWT ile taşınır.
- Operasyon uçları token ve gerekli rol/modül yetkisi olmadan çalışmaz.
- SQL sorguları parametreli hazırlanır; üretim origin'leri CORS ile sınırlandırılır.
- Hassas değerler kaynak kod ve dokümantasyonda yayınlanmaz.
- README görselleri yalnızca geçici, yerel ve sonradan silinmiş bir demo veritabanından alınmıştır.

---

<div align="center">

**Demirkan Motorlu Araçlar**<br>
Servis, satış, stok ve dijital vitrini tek ürün deneyiminde birleştiren operasyon platformu.

</div>
