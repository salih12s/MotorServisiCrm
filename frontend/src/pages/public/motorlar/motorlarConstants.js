export const BRAND_COLORS = {
  Falcon: { from: '#d99a32', to: '#7a4a10', glow: 'rgba(217,154,50,0.5)' },
  Musatti: { from: '#36C5D3', to: '#04A7B8', glow: 'rgba(54,197,211,0.5)' },
  Smarda: { from: '#36C5D3', to: '#04A7B8', glow: 'rgba(54,197,211,0.5)' },
};

export const FALLBACK_IMAGE = '/Images/motor-031819.png';

export function getMotorImage(motor) {
  if (!motor) return FALLBACK_IMAGE;
  if (motor.cardImage) return motor.cardImage;

  if (motor.brand === 'Falcon') {
    const isPng = (url = '') => /\.png(?:$|\?)/i.test(url);
    const cutoutColor = (motor.colors || []).find((color) => isPng(color.image));
    const cutoutGalleryImage = (motor.gallery || []).find(isPng);
    return cutoutColor?.image || cutoutGalleryImage || motor.detailImage || motor.coverImage || FALLBACK_IMAGE;
  }

  return motor.detailImage || motor.coverImage || FALLBACK_IMAGE;
}
