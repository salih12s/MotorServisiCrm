import motors from './motors';
import { PUBLIC_BRANDS, filterMotorsByBrand, getBrandBySlug } from './brands';

test('public collection exposes Falcon and Musatti from one central definition', () => {
  expect(PUBLIC_BRANDS.map((brand) => brand.slug)).toEqual(['falcon', 'musatti']);
  expect(getBrandBySlug('FALCON').name).toBe('Falcon');
});

test('brand filter never leaks products from another brand', () => {
  const musatti = filterMotorsByBrand(motors, 'musatti');
  expect(musatti.length).toBeGreaterThan(0);
  expect(musatti.every((motor) => motor.brand === 'Musatti')).toBe(true);

  const falcon = filterMotorsByBrand(motors, 'falcon');
  expect(falcon.length).toBe(54);
  expect(falcon.every((motor) => motor.brand === 'Falcon')).toBe(true);
  expect(falcon.some((motor) => motor.coverImage && Object.keys(motor.specs || {}).length > 0)).toBe(true);
});
