// Yazdırma alanı varsayılan pozisyon/boyut ayarları ve yardımcılar

export const defaultSettings = {
  fisNo: { top: 7, left: 82, fontSize: 1.3, visible: true },
  tarih: { top: 7, left: 90, fontSize: 0.95, visible: true },
  musteriAd: { top: 16, left: 5, fontSize: 1.0, visible: true },
  telefon: { top: 19, left: 5, fontSize: 0.95, visible: true },
  adres: { top: 22, left: 5, fontSize: 0.95, visible: true },
  marka: { top: 16, left: 55, fontSize: 1.0, visible: true },
  model: { top: 19, left: 55, fontSize: 0.95, visible: true },
  aciklama: { top: 32, left: 5, fontSize: 0.95, visible: true },
  arizaSikayetler: { top: 38, left: 5, fontSize: 0.95, visible: true },
  tahminiTeslim: { top: 45, left: 5, fontSize: 0.9, visible: true },
  // Parça tablosu
  parcaKodu: { top: 52, left: 5, fontSize: 0.8, visible: true },
  parcaAdi: { top: 52, left: 20, fontSize: 0.8, visible: true },
  parcaAdet: { top: 52, left: 45, fontSize: 0.8, visible: true },
  parcaFiyat: { top: 52, left: 55, fontSize: 0.8, visible: true },
  // Toplamlar
  genelToplam: { top: 80, left: 50, fontSize: 1.2, visible: true },
  tahminiUcret: { top: 85, left: 50, fontSize: 1.2, visible: true },
};

export const fieldLabels = {
  fisNo: 'Fiş No',
  tarih: 'Tarih',
  musteriAd: 'Müşteri Adı',
  telefon: 'Telefon',
  adres: 'Adres',
  marka: 'Marka',
  model: 'Model',
  aciklama: 'Açıklama',
  arizaSikayetler: 'Arıza/Şikayetler',
  tahminiTeslim: 'Teslim Tarihi',
  parcaKodu: 'Parça Kodu',
  parcaAdi: 'Parça Adı',
  parcaAdet: 'Adet',
  parcaFiyat: 'Birim Fiyat',
  genelToplam: 'Genel Toplam',
  tahminiUcret: 'Tahmini Toplam Ücret',
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(value || 0);
};
