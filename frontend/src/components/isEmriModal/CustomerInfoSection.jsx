import React from 'react';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import FormSectionCard from './FormSectionCard';

const rowSx = { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 };

function CustomerInfoSection({ formData, handleChange, user }) {
  return (
    <FormSectionCard icon={<PersonIcon />} title="Müşteri Bilgileri">
      <Box sx={{ ...rowSx, mb: 1.5 }}>
        <TextField
          size="small"
          label="Ad Soyad"
          name="musteri_ad_soyad"
          value={formData.musteri_ad_soyad}
          onChange={handleChange}
          required
        />
        <TextField
          size="small"
          label="Telefon"
          name="telefon"
          value={formData.telefon}
          onChange={handleChange}
        />
      </Box>
      <Box sx={rowSx}>
        <TextField
          size="small"
          label="KM"
          name="km"
          type="number"
          value={formData.km}
          onChange={handleChange}
          InputProps={{
            endAdornment: <InputAdornment position="end">km</InputAdornment>,
          }}
        />
        <FormControl size="small">
          <InputLabel>Oluşturan Kişi</InputLabel>
          <Select
            name="olusturan_kisi"
            value={formData.olusturan_kisi}
            label="Oluşturan Kişi"
            onChange={handleChange}
          >
            <MenuItem value={user?.name || user?.ad_soyad || ''}>
              {user?.name || user?.ad_soyad || 'Ben'}
            </MenuItem>
            <MenuItem value="Ortak">Ortak</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </FormSectionCard>
  );
}

export default CustomerInfoSection;
