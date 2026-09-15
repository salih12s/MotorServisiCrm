import React from 'react';
import HobiGrupStok from '../hobiGrup/HobiGrupStok';
import { getPublicYedekParcaImageUrl, yedekParcaStokService } from '../../services/api';

function YedekParcaStok() {
  return (
    <HobiGrupStok
      stokService={yedekParcaStokService}
      getImageUrl={getPublicYedekParcaImageUrl}
      inputId="yedek-parca-resim-input"
      searchPlaceholder="Stok kodu veya yedek parça adı ile ara..."
      newProductTitle="Yeni Yedek Parça Ekle"
      productPlaceholder="Örn: Ön fren balatası"
      descriptionPlaceholder="Marka, model uyumluluğu ve diğer ürün özellikleri..."
      createSuccessMessage="Yeni yedek parça başarıyla stoğa eklendi."
    />
  );
}

export default YedekParcaStok;
