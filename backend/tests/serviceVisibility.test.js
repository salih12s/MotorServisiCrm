const test = require('node:test');
const assert = require('node:assert/strict');
const { buildServiceVisibility } = require('../domain/serviceVisibility');

test('admin can query all service orders', () => {
  assert.deepEqual(buildServiceVisibility({ id: 1, rol: 'admin' }), {
    condition: null,
    params: [],
  });
});

test('personnel can query own and shared service orders', () => {
  assert.deepEqual(buildServiceVisibility({ id: 42, rol: 'personel' }, 'ie', 3), {
    condition: "(ie.olusturan_kullanici_id = $3 OR LOWER(BTRIM(COALESCE(ie.olusturan_kisi, ''))) = 'ortak')",
    params: [42],
  });
});

test('invalid non-admin identity cannot query service orders', () => {
  assert.deepEqual(buildServiceVisibility({ rol: 'personel' }), {
    condition: 'FALSE',
    params: [],
  });
});
