export const PUBLIC_BRANDS = Object.freeze([
  {
    slug: 'falcon',
    name: 'Falcon',
    title: 'Falcon Koleksiyonunu Keşfet',
    description: 'Falcon motosiklet, scooter, ATV ve elektrikli modellerinin tamamını inceleyin.',
    accent: '#e0a43a',
    gradient: 'linear-gradient(135deg, #251b0b 0%, #6b4515 55%, #bb7b25 100%)',
    cardLayout: 'products',
    image: 'https://falconmotosiklet.com/upload/medya/MASTER-50-KIRMIZI.png',
    secondaryImage: 'https://falconmotosiklet.com/upload/medya/YES%CC%A7I%CC%87L-YAN-C%CC%A7ANTASIZ.png',
  },
  {
    slug: 'musatti',
    name: 'Musatti',
    title: 'Musatti Koleksiyonunu Keşfet',
    description: 'Mevcut Musatti motosiklet, scooter, ATV ve elektrikli modellerini inceleyin.',
    accent: '#36C5D3',
    gradient: 'linear-gradient(135deg, #01383d 0%, #047d89 55%, #36C5D3 100%)',
    cardLayout: 'background',
    image: '/Images/katalog/dark-pow/profil.jpg',
  },
]);

export const getBrandBySlug = (slug) => PUBLIC_BRANDS.find((brand) => brand.slug === String(slug || '').toLowerCase());

export const filterMotorsByBrand = (motors, slug) => {
  const brand = getBrandBySlug(slug);
  if (!brand) return [];
  return motors.filter((motor) => motor.brand?.toLocaleLowerCase('tr-TR') === brand.name.toLocaleLowerCase('tr-TR'));
};
