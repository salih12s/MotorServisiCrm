# 🖨️ Yazdırma Ayarları Rehberi

## İş Emri Yazdırma Özelleştirme

`frontend/src/pages/IsEmriDetay.jsx` dosyasında yazdırma tasarımını özelleştirebilirsiniz.

## 📍 Yazı Konumlarını Değiştirme

Her bilgi kutusu `position: 'absolute'` ile konumlandırılmıştır. Konumları değiştirmek için `top`, `left`, `right`, `bottom` değerlerini düzenleyin:

### Örnek Konumlar:

```jsx
{/* Fiş No - Sağ Üst */}
<Box sx={{ position: 'absolute', top: 40, right: 40 }}>
  {/* top: yukarıdan mesafe (px cinsinden) */}
  {/* right: sağdan mesafe */}
</Box>

{/* Müşteri Bilgileri - Sol */}
<Box sx={{ position: 'absolute', top: 120, left: 40 }}>
  {/* left: soldan mesafe */}
</Box>
```

## ✏️ Yazı Boyutlarını Değiştirme

`sx` prop'u içindeki `fontSize` değerini değiştirin:

```jsx
<Typography 
  variant="h5" 
  fontWeight={800} 
  sx={{ fontSize: '1.5rem' }}  // Bu değeri değiştirin
>
  {isEmri.fis_no}
</Typography>
```

### Boyut Örnekleri:
- `0.8rem` - Çok küçük
- `1rem` - Normal
- `1.2rem` - Orta
- `1.5rem` - Büyük
- `2rem` - Çok büyük

## 🔨 Yazı Kalınlığını Değiştirme

`fontWeight` değerini değiştirin:

```jsx
<Typography fontWeight={600}>  {/* Normal kalın */}
<Typography fontWeight={700}>  {/* Kalın */}
<Typography fontWeight={800}>  {/* Çok kalın */}
```

## 🗑️ Alan Silme

İstemediğiniz alanları tamamen kaldırabilirsiniz. Örneğin plaka bilgisini silmek için:

```jsx
{/* Bu kısmı silin veya yorum satırı yapın */}
{isEmri.plaka && <Typography>Plaka: {isEmri.plaka}</Typography>}
```

## 🎨 Arka Plan Resmi Değiştirme

`public` klasöründeki resmi değiştirin ve yeni resim adını güncelleyin:

```jsx
backgroundImage: 'url(/YeniResimAdi.png)',
```

## 📋 Mevcut Alanlar ve Konumları

### Üst Bölge (top: 40-120px)
- ✅ Fiş No ve Tarih (sağ üst)
- ✅ Müşteri Adı, Telefon, Adres (sol)
- ✅ Marka ve Model (sağ)

### Orta Bölge (top: 250-400px)
- ✅ Açıklama
- ✅ Arıza/Şikayetler
- ✅ Oluşturma ve Tahmini Teslim Tarihleri
- ✅ Durum (Açık/Kapalı)

### Alt Bölge (top: 450-bottom)
- ✅ Parça Listesi
- ✅ Toplam Ücret

### Kaldırılan Alanlar ❌
- ❌ Vergi No
- ❌ Plaka
- ❌ KM
- ❌ Şasi No
- ❌ Motor No
- ❌ Teslim Tarihi
- ❌ Teslim Alan
- ❌ Finansal İstatistikler (Maliyet, Kar, Kar Oranı)

## 💡 İpuçları

1. **Yazıları Büyütürken**: Üst üste binmemesi için konumları da ayarlayın
2. **A4 Boyutu**: Sayfa 210mm x 297mm boyutundadır
3. **Test Etme**: Değişiklikleri test etmek için tarayıcıda print preview kullanın
4. **Yedek**: Değişiklik yapmadan önce dosyanın yedeğini alın

## 🔧 Örnek Özelleştirme

Fiş numarasını daha büyük ve daha sola almak için:

```jsx
<Box sx={{ position: 'absolute', top: 40, right: 100 }}>  {/* right: 40 -> 100 */}
  <Typography 
    variant="h4"           {/* h5 -> h4 */}
    fontWeight={900}       {/* 800 -> 900 */}
    sx={{ fontSize: '2rem' }}  {/* 1.5rem -> 2rem */}
  >
    {isEmri.fis_no}
  </Typography>
</Box>
```

## 📞 Destek

Herhangi bir sorun veya soru için dosyayı inceleyerek her alanın konumunu görebilirsiniz.
