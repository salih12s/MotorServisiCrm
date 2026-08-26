import React from 'react';
import { Box, TextField, InputAdornment } from '@mui/material';
import { DirectionsCar as CarIcon } from '@mui/icons-material';
import FormSectionCard from './FormSectionCard';

const rowSx = { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 };

function VehicleInfoSection({ formData, handleChange }) {
  return (
    <FormSectionCard icon={<CarIcon />} iconBg="secondary.lighter" iconColor="secondary.main" title="Araç Bilgileri">
      <Box sx={{ ...rowSx, mb: 1.5 }}>
        <TextField
          size="small"
          label="Marka"
          name="marka"
          value={formData.marka}
          onChange={handleChange}
        />
        <TextField
          size="small"
          label="Model/Tip"
          name="model_tip"
          value={formData.model_tip}
          onChange={handleChange}
        />
      </Box>
      <Box sx={rowSx}>
        <TextField
          size="small"
          type="date"
          label="Tahmini Teslim"
          name="tahmini_teslim_tarihi"
          value={formData.tahmini_teslim_tarihi}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          type="number"
          label="Tahmini Ücret"
          name="tahmini_toplam_ucret"
          value={formData.tahmini_toplam_ucret}
          onChange={handleChange}
          InputProps={{
            startAdornment: <InputAdornment position="start">₺</InputAdornment>,
          }}
        />
      </Box>
    </FormSectionCard>
  );
}

export default VehicleInfoSection;
