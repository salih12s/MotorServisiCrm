import React from 'react';
import { Box, TextField, Button, Paper, Chip, CircularProgress, InputAdornment, Autocomplete, Typography } from '@mui/material';
import { Add as AddIcon, ShoppingBag as ShoppingBagIcon } from '@mui/icons-material';
import FormSectionCard from './FormSectionCard';

function ProductAddSection({
  newParca,
  setNewParca,
  handleParcaChange,
  addParca,
  isEdit,
  parcaCount,
  themeColors,
  stokOptions,
  stokSearchLoading,
  selectedStok,
  setSelectedStok,
  searchStok,
}) {
  return (
    <FormSectionCard
      icon={<ShoppingBagIcon />}
      iconBg={`${themeColors.primary}20`}
      iconColor={themeColors.primary}
      title="Ürünler ve Aksesuarlar"
      action={
        <Chip
          label={`${parcaCount} ürün`}
          size="small"
          sx={{ bgcolor: themeColors.primary, color: 'white' }}
        />
      }
    >
      <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, bgcolor: 'grey.50', borderStyle: 'dashed', borderRadius: 1.5 }}>
        <Autocomplete
          freeSolo
          filterOptions={(x) => x}
          options={stokOptions}
          getOptionLabel={(option) => {
            if (typeof option === 'string') return option;
            return option.stok_adi || '';
          }}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" fontWeight={600}>{option.stok_adi}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Kod: ...{option.stok_kodu?.slice(-6)} | Stok: {option.mevcut} | ₺{parseFloat(option.satis_fiyati || 0).toLocaleString('tr-TR')}
                </Typography>
              </Box>
            </li>
          )}
          loading={stokSearchLoading}
          value={selectedStok}
          onChange={(e, newValue) => {
            setSelectedStok(newValue);
            if (newValue && typeof newValue !== 'string') {
              setNewParca({
                ...newParca,
                urun_adi: newValue.stok_adi,
                satis_fiyati: parseFloat(newValue.satis_fiyati) || 0,
                maliyet: parseFloat(newValue.alis_fiyati) || 0,
              });
            } else if (typeof newValue === 'string') {
              setNewParca({ ...newParca, urun_adi: newValue });
            }
          }}
          onInputChange={(e, newInputValue, reason) => {
            if (reason === 'input') {
              setNewParca({ ...newParca, urun_adi: newInputValue });
              searchStok(newInputValue);
            }
          }}
          inputValue={newParca.urun_adi}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              size="small"
              label="Ürün / Aksesuar Adı"
              placeholder="Stok kodu (son 6 hane) veya ürün adı yazın..."
              sx={{ mb: 1.5 }}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {stokSearchLoading ? <CircularProgress color="inherit" size={18} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
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
              InputLabelProps={{ shrink: true }}
            />
          )}
          <TextField
            size="small"
            type="number"
            label="Satış Fiyatı (₺)"
            name="satis_fiyati"
            value={newParca.satis_fiyati}
            onChange={handleParcaChange}
            InputProps={{ startAdornment: <InputAdornment position="start">₺</InputAdornment> }}
            inputProps={{ min: 0, step: 0.01 }}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        <Button
          fullWidth
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addParca}
          sx={{ bgcolor: themeColors.primary, '&:hover': { bgcolor: themeColors.primaryDark } }}
        >
          Ürün Ekle
        </Button>
      </Paper>
    </FormSectionCard>
  );
}

export default ProductAddSection;
