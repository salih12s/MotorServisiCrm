// MotorSatislari sayfası için saf yardımcı fonksiyonlar

// Durum chip renkleri
export const getDurumColor = (durum) => {
  switch (durum) {
    case 'beklemede': return { bg: '#fff3e0', color: '#e65100' };
    case 'tamamlandi': return { bg: '#e8f5e9', color: '#2e7d32' };
    case 'iptal': return { bg: '#ffebee', color: '#c62828' };
    default: return { bg: '#f5f5f5', color: '#757575' };
  }
};

// Durum etiketi
export const getDurumLabel = (durum) => {
  switch (durum) {
    case 'beklemede': return 'Beklemede';
    case 'tamamlandi': return 'Tamamlandı';
    case 'iptal': return 'İptal';
    default: return 'Beklemede';
  }
};

// Para formatla
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value || 0);
};

// Sayı formatla (gösterim için 76.791,67 gibi - Türk formatı)
export const formatNumber = (value) => {
  if (!value && value !== 0) return '';
  // Eğer zaten sayıysa direkt formatla
  if (typeof value === 'number') {
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
  }
  // String ise parse et
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return '';
  return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(parsed);
};

// Akıllı sayı parse - Türk formatını doğru algılar
// 76.791,67 -> 76791.67
// 76791,67 -> 76791.67
// 76.791.67 -> 76791.67 (son nokta ondalık)
// 76791.67 -> 76791.67
export const parseFormattedNumber = (formattedValue) => {
  if (!formattedValue) return '';
  let str = formattedValue.toString().trim();

  // Virgül varsa, Türk formatı: nokta=binlik, virgül=ondalık
  if (str.includes(',')) {
    // Tüm noktaları kaldır (binlik ayracı), virgülü noktaya çevir
    str = str.replace(/\./g, '').replace(',', '.');
  } else {
    // Virgül yok, noktaları kontrol et
    const dots = (str.match(/\./g) || []).length;
    if (dots > 1) {
      // Birden fazla nokta var: son nokta ondalık, diğerleri binlik
      const lastDotIndex = str.lastIndexOf('.');
      const beforeLastDot = str.substring(0, lastDotIndex).replace(/\./g, '');
      const afterLastDot = str.substring(lastDotIndex);
      str = beforeLastDot + afterLastDot;
    }
    // Tek nokta varsa zaten doğru format (76791.67)
  }

  return str;
};

// Tarih formatla
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('tr-TR');
};
