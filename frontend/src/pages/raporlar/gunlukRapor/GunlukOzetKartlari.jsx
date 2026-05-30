import React from 'react';
import { Grid } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  MoneyOff as MoneyOffIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import StatCard from '../StatCard';
import { formatCurrency } from '../raporlarUtils';

const GunlukOzetKartlari = ({ isMobile, gunlukRapor, selectedKullanici, filteredOzet }) => (
  <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: 3 }}>
    <Grid item xs={6} sm={3}>
      <StatCard
        title="İş Emri Sayısı"
        value={selectedKullanici ? filteredOzet.toplam_is : (gunlukRapor.genel_ozet?.toplam_is || gunlukRapor.ozet?.toplam_is_emri || 0)}
        icon={<AssignmentIcon />}
        color="#04A7B8"
        isMobile={isMobile}
      />
    </Grid>
    <Grid item xs={6} sm={3}>
      <StatCard
        title="Toplam Gelir"
        value={formatCurrency(selectedKullanici ? filteredOzet.toplam_gelir : (gunlukRapor.genel_ozet?.toplam_gelir || gunlukRapor.ozet?.toplam_gelir || 0))}
        icon={<AttachMoneyIcon />}
        color="#2e7d32"
        isMobile={isMobile}
      />
    </Grid>
    <Grid item xs={6} sm={3}>
      <StatCard
        title="Toplam Maliyet"
        value={formatCurrency(selectedKullanici ? filteredOzet.toplam_maliyet : (gunlukRapor.genel_ozet?.toplam_maliyet || gunlukRapor.ozet?.toplam_maliyet || 0))}
        icon={<MoneyOffIcon />}
        color="#c62828"
        isMobile={isMobile}
      />
    </Grid>
    <Grid item xs={6} sm={3}>
      <StatCard
        title="Net Kar"
        value={formatCurrency(selectedKullanici ? filteredOzet.net_kar : (gunlukRapor.genel_ozet?.net_kar || gunlukRapor.ozet?.net_kar || 0))}
        icon={<TrendingUpIcon />}
        color="#04A7B8"
        variant="highlight"
        isMobile={isMobile}
      />
    </Grid>
  </Grid>
);

export default GunlukOzetKartlari;
