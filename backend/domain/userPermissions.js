const canAccessYedekParca = (user) => (
  user?.rol === 'admin' || user?.yedek_parca_yetkisi === true
);

module.exports = {
  canAccessYedekParca,
};
