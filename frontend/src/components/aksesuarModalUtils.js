// AksesuarModal için saf yardımcı fonksiyonlar

export const formatCurrency = (value) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(value || 0);

export const calculateTotals = (parcalar = []) => {
  let toplamFiyat = 0;
  let toplamMaliyet = 0;

  parcalar.forEach((p) => {
    const adet = parseInt(p.adet) || 0;
    const fiyat = parseFloat(p.satis_fiyati) || 0;
    const maliyet = parseFloat(p.maliyet) || 0;

    toplamFiyat += adet * fiyat;
    toplamMaliyet += adet * maliyet;
  });

  const kar = toplamFiyat - toplamMaliyet;
  return { toplamFiyat, toplamMaliyet, kar };
};
