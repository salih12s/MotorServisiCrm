import React from 'react';
import { Box, TextField, Button, InputAdornment, Chip } from '@mui/material';
import { Add as AddIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import FormSectionCard from './FormSectionCard';

function PartsLaborSection({ newParca, handleParcaChange, addParca, isEdit, parcaCount }) {
  return (
    <FormSectionCard
      icon={<ReceiptIcon />}
      iconBg="success.lighter"
      iconColor="success.main"
      title="Parçalar ve İşçilik"
      action={<Chip label={`${parcaCount} parça`} size="small" color="primary" variant="outlined" />}
    >
      <TextField
        fullWidth
        size="small"
        label="Takılan Parça / İşçilik Adı"
        name="takilan_parca"
        value={newParca.takilan_parca}
        onChange={handleParcaChange}
        placeholder="Örn: Civata (x5)"
        sx={{ mb: 1.5 }}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: isEdit ? '1fr 1fr 1fr' : '1fr 1fr' },
          gap: 1.5,
          mb: 1.5,
        }}
      >
        <TextField
          size="small"
          type="number"
          label="Adet"
          name="adet"
          value={newParca.adet}
          onChange={handleParcaChange}
          inputProps={{ min: 1 }}
        />
        {isEdit && (
          <TextField
            size="small"
            type="number"
            label="Maliyet (₺)"
            name="maliyet"
            value={newParca.maliyet}
            onChange={handleParcaChange}
            InputProps={{ startAdornment: <InputAdornment position="start">₺</InputAdornment> }}
            inputProps={{ min: 0, step: 0.01 }}
          />
        )}
        <TextField
          size="small"
          type="number"
          label="Satış Fiyatı (₺)"
          name="birim_fiyat"
          value={newParca.birim_fiyat}
          onChange={handleParcaChange}
          InputProps={{ startAdornment: <InputAdornment position="start">₺</InputAdornment> }}
          inputProps={{ min: 0, step: 0.01 }}
        />
      </Box>
      <Button fullWidth size="small" variant="contained" startIcon={<AddIcon />} onClick={addParca}>
        Parça Ekle
      </Button>
    </FormSectionCard>
  );
}

export default PartsLaborSection;
