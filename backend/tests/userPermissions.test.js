const test = require('node:test');
const assert = require('node:assert/strict');
const { canAccessYedekParca } = require('../domain/userPermissions');

test('admin can access yedek parca without an explicit permission', () => {
  assert.equal(canAccessYedekParca({ rol: 'admin', yedek_parca_yetkisi: false }), true);
});

test('personnel with yedek parca permission can access it', () => {
  assert.equal(canAccessYedekParca({ rol: 'personel', yedek_parca_yetkisi: true }), true);
});

test('personnel without yedek parca permission cannot access it', () => {
  assert.equal(canAccessYedekParca({ rol: 'personel', yedek_parca_yetkisi: false }), false);
});
