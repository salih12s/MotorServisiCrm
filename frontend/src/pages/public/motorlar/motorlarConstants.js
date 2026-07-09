export const BRAND_COLORS = {
  Musatti: { from: '#36C5D3', to: '#04A7B8', glow: 'rgba(54,197,211,0.5)' },
  Smarda: { from: '#36C5D3', to: '#04A7B8', glow: 'rgba(54,197,211,0.5)' },
};

export const FALLBACK_IMAGE = '/Images/motor-031819.png';

export function getMotorImage(motor) {
  return motor?.detailImage || motor?.coverImage || FALLBACK_IMAGE;
}
