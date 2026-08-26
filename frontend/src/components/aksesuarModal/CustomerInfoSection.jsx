import React from 'react';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import FormSectionCard from './FormSectionCard';

const rowSx = { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 };

function CustomerInfoSection({ formData, handleChange, user, themeColors }) {
  return (
    <FormSectionCard
      icon={<PersonIcon />}
      iconBg={`${themeColors.primary}20`}
      iconColor={themeColors.primary}
      title="Müşteri Bilgileri"
    >
      <Box sx={{ ...rowSx, mb: 1.5 }}>
        <TextField
          size="small"
          label="Ad Soyad"
          name="ad_soyad"
          value={formData.ad_soyad}
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
      <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
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
      <TextField
        fullWidth
        size="small"
        multiline
        rows={2}
        label="Açıklama / Not"
        name="aciklama"
        value={formData.aciklama}
        onChange={handleChange}
        placeholder="Ek notlar..."
      />
    </FormSectionCard>
  );
}

export default CustomerInfoSection;
