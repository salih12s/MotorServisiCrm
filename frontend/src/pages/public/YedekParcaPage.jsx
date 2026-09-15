import React from 'react';
import { Build as BuildIcon, Settings as SettingsIcon } from '@mui/icons-material';
import HobiGrupPage, { HOBI_GRUP_CATALOG } from './HobiGrupPage';
import { getPublicYedekParcaImageUrl, yedekParcaStokService } from '../../services/api';

const YEDEK_PARCA_CATALOG = {
  ...HOBI_GRUP_CATALOG,
  stokService: yedekParcaStokService,
  getImageUrl: getPublicYedekParcaImageUrl,
  cartType: 'yedek-parca',
  title: 'Yedek Parça',
  subtitle: 'Motosikletiniz için yedek parça koleksiyonumuz',
  detailLabel: 'Demirkan • Yedek Parça',
  searchPlaceholder: 'Yedek parça ara...',
  emptyDescription: 'Yedek parça koleksiyonumuz hazırlanıyor, kısa süre içinde bu sayfada olacak.',
  primary: '#9F2F2F',
  light: '#E57373',
  gradient: 'linear-gradient(135deg, #9F2F2F 0%, #E57373 60%, #FFCDD2 100%)',
  primaryRgb: '159,47,47',
  lightRgb: '229,115,115',
  Icon: BuildIcon,
  SubtitleIcon: SettingsIcon,
};

function YedekParcaPage() {
  return <HobiGrupPage catalog={YEDEK_PARCA_CATALOG} />;
}

export default YedekParcaPage;
