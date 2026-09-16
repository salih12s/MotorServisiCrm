import React from 'react';
import HobiGrupSatis from '../hobiGrup/HobiGrupSatis';
import { yedekParcaSatisService, yedekParcaStokService } from '../../services/api';

function YedekParcaSatis() {
  return (
    <HobiGrupSatis
      satisService={yedekParcaSatisService}
      stokService={yedekParcaStokService}
      baslik="Yedek Parça"
      detayBasligi="Yedek Parça Satış Detayları"
      kayitAdi="yedek parça satışı"
      requiredPermission="yedek_parca_yetkisi"
    />
  );
}

export default YedekParcaSatis;
