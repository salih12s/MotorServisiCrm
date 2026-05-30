import { format, isValid, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

// Güvenli tarih formatlama fonksiyonu
export const formatDate = (dateStr, formatStr = 'dd.MM.yyyy') => {
  if (!dateStr) return '-';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    if (!isValid(date)) return '-';
    return format(date, formatStr, { locale: tr });
  } catch {
    return '-';
  }
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
};
