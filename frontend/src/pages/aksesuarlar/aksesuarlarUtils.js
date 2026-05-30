import { format, isValid, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

// Güvenli tarih formatlama fonksiyonu
export const formatDate = (dateStr, formatStr = 'dd.MM.yyyy HH:mm') => {
  if (!dateStr) return '-';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    if (!isValid(date)) return '-';
    return format(date, formatStr, { locale: tr });
  } catch {
    return '-';
  }
};

// Durum renkleri ve etiketleri
export const durumConfig = {
  beklemede: { label: 'Beklemede', color: '#ff9800', bgColor: '#fff3e0' },
  islemde: { label: 'İşlemde', color: '#2196f3', bgColor: '#e3f2fd' },
  tamamlandi: { label: 'Tamamlandı', color: '#4caf50', bgColor: '#e8f5e9' },
  iptal_edildi: { label: 'İptal', color: '#f44336', bgColor: '#ffebee' },
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
};
