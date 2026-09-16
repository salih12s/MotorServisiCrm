import { getDefaultAuthenticatedPath } from './authNavigation';

test('yedek parça yetkili personeli yedek parça satışına yönlendirir', () => {
  expect(getDefaultAuthenticatedPath({ role: 'personel', yedek_parca_yetkisi: true }))
    .toBe('/yedek-parca-satis');
});

test('admin ve normal personel iş emirlerine yönlendirilir', () => {
  expect(getDefaultAuthenticatedPath({ role: 'admin' })).toBe('/is-emirleri');
  expect(getDefaultAuthenticatedPath({ role: 'personel' })).toBe('/is-emirleri');
});

test('çoklu yetkide mevcut menü önceliğini korur', () => {
  expect(getDefaultAuthenticatedPath({
    role: 'personel',
    aksesuar_yetkisi: true,
    motor_satis_yetkisi: true,
    yedek_parca_yetkisi: true,
  })).toBe('/aksesuarlar');
});
