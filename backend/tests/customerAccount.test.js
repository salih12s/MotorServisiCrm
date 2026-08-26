const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeMoney,
  isValidDate,
  validateTransactionInput,
  getReversalType,
} = require('../domain/customerAccount');

test('money input preserves decimal text and rejects unsafe values', () => {
  assert.equal(normalizeMoney('10000,25'), '10000.25');
  assert.equal(normalizeMoney('0.01'), '0.01');
  assert.equal(normalizeMoney('0'), null);
  assert.equal(normalizeMoney('-5'), null);
  assert.equal(normalizeMoney('1.999'), null);
});

test('transaction validation enforces dates, payment methods and debt authorization', () => {
  assert.equal(isValidDate('2026-02-29'), false);
  assert.equal(isValidDate('2028-02-29'), true);

  const payment = validateTransactionInput({
    hareket_tipi: 'TAHSILAT', tutar: '25.50', islem_tarihi: '2026-08-25', odeme_yontemi: 'NAKIT',
  });
  assert.equal(payment.value.tutar, '25.50');

  const unauthorizedDebt = validateTransactionInput({
    hareket_tipi: 'BORC', tutar: '10', islem_tarihi: '2026-08-25',
  });
  assert.equal(unauthorizedDebt.status, 403);

  const adminDebt = validateTransactionInput({
    hareket_tipi: 'BORC', tutar: '10', islem_tarihi: '2026-08-25',
  }, { isAdmin: true });
  assert.equal(adminDebt.value.hareket_tipi, 'BORC');
});

test('only original debt/payment movements can be reversed', () => {
  assert.equal(getReversalType('BORC'), 'BORC_TERS');
  assert.equal(getReversalType('TAHSILAT'), 'TAHSILAT_TERS');
  assert.equal(getReversalType('BORC_TERS'), null);
});
