const ACCOUNT_TRANSACTION_TYPES = Object.freeze({
  DEBT: 'BORC',
  PAYMENT: 'TAHSILAT',
  DEBIT_ADJUSTMENT: 'BORC_DUZELTME',
  CREDIT_ADJUSTMENT: 'ALACAK_DUZELTME',
  DEBT_REVERSAL: 'BORC_TERS',
  PAYMENT_REVERSAL: 'TAHSILAT_TERS',
});

const PAYMENT_METHODS = Object.freeze(['NAKIT', 'HAVALE_EFT', 'KART', 'DIGER']);
const USER_CREATABLE_TYPES = Object.freeze([
  ACCOUNT_TRANSACTION_TYPES.DEBT,
  ACCOUNT_TRANSACTION_TYPES.PAYMENT,
]);
const DEBIT_TYPES = Object.freeze([
  ACCOUNT_TRANSACTION_TYPES.DEBT,
  ACCOUNT_TRANSACTION_TYPES.DEBIT_ADJUSTMENT,
  ACCOUNT_TRANSACTION_TYPES.PAYMENT_REVERSAL,
]);
const CREDIT_TYPES = Object.freeze([
  ACCOUNT_TRANSACTION_TYPES.PAYMENT,
  ACCOUNT_TRANSACTION_TYPES.CREDIT_ADJUSTMENT,
  ACCOUNT_TRANSACTION_TYPES.DEBT_REVERSAL,
]);

// Tutar Number'a çevrilmeden PostgreSQL NUMERIC'e metin olarak gönderilir.
const MONEY_PATTERN = /^(?:0|[1-9]\d{0,11})(?:[.,]\d{1,2})?$/;

function normalizeMoney(value) {
  const normalized = String(value ?? '').trim().replace(',', '.');
  if (!MONEY_PATTERN.test(normalized) || /^0(?:\.0{1,2})?$/.test(normalized)) return null;
  return normalized;
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function normalizeReference(type, id) {
  const normalizedType = String(type || '').trim().toUpperCase();
  const normalizedId = String(id || '').trim();
  if (!normalizedType && !normalizedId) return { type: null, id: null };
  if (!/^[A-Z0-9_]{2,50}$/.test(normalizedType) || !normalizedId || normalizedId.length > 100) return null;
  return { type: normalizedType, id: normalizedId };
}

function validateTransactionInput(input, { isAdmin = false } = {}) {
  const type = String(input?.hareket_tipi || '').trim().toUpperCase();
  const amount = normalizeMoney(input?.tutar);
  const date = String(input?.islem_tarihi || '').trim();
  const paymentMethod = input?.odeme_yontemi ? String(input.odeme_yontemi).trim().toUpperCase() : null;
  const reference = normalizeReference(input?.referans_tipi, input?.referans_id);

  if (!USER_CREATABLE_TYPES.includes(type)) return { error: 'Geçersiz cari hareket tipi.' };
  if (type === ACCOUNT_TRANSACTION_TYPES.DEBT && !isAdmin) {
    return { error: 'Manuel borç hareketi yalnızca yönetici tarafından eklenebilir.', status: 403 };
  }
  if (!amount) return { error: 'Tutar sıfırdan büyük ve en fazla iki ondalık basamaklı olmalıdır.' };
  if (!isValidDate(date)) return { error: 'İşlem tarihi YYYY-MM-DD formatında geçerli bir tarih olmalıdır.' };
  if (type === ACCOUNT_TRANSACTION_TYPES.PAYMENT && !PAYMENT_METHODS.includes(paymentMethod)) {
    return { error: 'Geçerli bir ödeme yöntemi seçilmelidir.' };
  }
  if (type !== ACCOUNT_TRANSACTION_TYPES.PAYMENT && paymentMethod) {
    return { error: 'Ödeme yöntemi yalnızca tahsilat hareketinde kullanılabilir.' };
  }
  if (reference === null) return { error: 'Referans tipi veya referans numarası geçersiz.' };
  if ((reference.type || reference.id) && !isAdmin) {
    return { error: 'Kaynak referansı yalnızca yönetici tarafından belirtilebilir.', status: 403 };
  }

  return {
    value: {
      hareket_tipi: type,
      tutar: amount,
      islem_tarihi: date,
      odeme_yontemi: paymentMethod,
      aciklama: String(input?.aciklama || '').trim().slice(0, 1000) || null,
      referans_tipi: reference.type,
      referans_id: reference.id,
    },
  };
}

function getReversalType(type) {
  if ([ACCOUNT_TRANSACTION_TYPES.DEBT, ACCOUNT_TRANSACTION_TYPES.DEBIT_ADJUSTMENT].includes(type)) {
    return ACCOUNT_TRANSACTION_TYPES.DEBT_REVERSAL;
  }
  if ([ACCOUNT_TRANSACTION_TYPES.PAYMENT, ACCOUNT_TRANSACTION_TYPES.CREDIT_ADJUSTMENT].includes(type)) {
    return ACCOUNT_TRANSACTION_TYPES.PAYMENT_REVERSAL;
  }
  return null;
}

module.exports = {
  ACCOUNT_TRANSACTION_TYPES,
  PAYMENT_METHODS,
  DEBIT_TYPES,
  CREDIT_TYPES,
  normalizeMoney,
  isValidDate,
  validateTransactionInput,
  getReversalType,
};
