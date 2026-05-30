import React from 'react';
import { Box, Card, CardContent, Grid, Typography, Avatar } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { formatCurrency } from './printSettings';

const KarAnaliziKartlari = ({ isEmri }) => {
  const karDurumu = parseFloat(isEmri.kar) >= 0;
  return (
    <Grid container spacing={3} sx={{ mb: 3 }} className="no-print">
      <Grid item xs={12} md={4}>
        <Card sx={{ borderLeft: '4px solid', borderColor: 'primary.main' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main' }}>
                <MoneyIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Toplam Satış
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {formatCurrency(isEmri.gercek_toplam_ucret)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ borderLeft: '4px solid', borderColor: 'error.main' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'error.lighter', color: 'error.main' }}>
                <TrendingDownIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Toplam Maliyet
                </Typography>
                <Typography variant="h5" fontWeight={700} color="error.main">
                  {formatCurrency(isEmri.toplam_maliyet)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ borderLeft: '4px solid', borderColor: karDurumu ? 'success.main' : 'error.main' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{
                bgcolor: karDurumu ? 'success.lighter' : 'error.lighter',
                color: karDurumu ? 'success.main' : 'error.main'
              }}>
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Net Kar
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color={karDurumu ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(isEmri.kar)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default KarAnaliziKartlari;
