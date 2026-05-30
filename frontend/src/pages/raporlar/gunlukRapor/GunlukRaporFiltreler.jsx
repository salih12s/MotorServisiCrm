import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Chip,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const GunlukRaporFiltreler = ({
  selectedDate,
  setSelectedDate,
  endDate,
  setEndDate,
  selectedKullanici,
  setSelectedKullanici,
  kullanicilar,
  selectedOdemeDetay,
  setSelectedOdemeDetay,
}) => (
  <Card sx={{ mb: 3 }}>
    <CardContent sx={{ py: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm="auto">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon color="primary" />
            <Typography variant="body2" fontWeight={600} sx={{ display: { xs: 'none', sm: 'block' } }}>
              Tarih Aralığı
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={5} md={2}>
          <TextField
            type="date"
            label="Başlangıç Tarihi"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={5} md={2}>
          <TextField
            type="date"
            label="Bitiş Tarihi"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={5} md={3} width={180}>
          <FormControl fullWidth size="small">
            <InputLabel>Oluşturan Kişi</InputLabel>
            <Select
              value={selectedKullanici}
              label="Oluşturan Kişi"
              onChange={(e) => setSelectedKullanici(e.target.value)}
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="Ortak">Ortak</MenuItem>
              {kullanicilar.map((kullanici) => (
                <MenuItem key={kullanici.id} value={kullanici.kullanici_adi}>
                  {kullanici.ad_soyad}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={5} md={2} width={180}>
          <FormControl fullWidth size="small">
            <InputLabel>Ödeme Detayı</InputLabel>
            <Select
              value={selectedOdemeDetay}
              label="Ödeme Detayı"
              onChange={(e) => setSelectedOdemeDetay(e.target.value)}
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="nakit">Nakit</MenuItem>
              <MenuItem value="kart">Kart</MenuItem>
              <MenuItem value="havale">Havale/EFT</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm="auto">
          <Chip
            label={selectedDate && endDate ?
              `${format(new Date(selectedDate), 'd MMM yyyy', { locale: tr })} - ${format(new Date(endDate), 'd MMM yyyy', { locale: tr })}`
              : 'Tarih Seçin'}
            color="primary"
            variant="outlined"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

export default GunlukRaporFiltreler;
