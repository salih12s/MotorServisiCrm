import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Paper,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ShoppingBag as ShoppingBagIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { formatCurrency, calculateTotals } from './aksesuarModalUtils';

function AksesuarUrunlerSection({
  parcalar,
  newParca,
  setNewParca,
  handleParcaChange,
  addParca,
  removeParca,
  updateParca,
  isEdit,
  isMobile,
  isAdmin,
  formData,
  handleChange,
  toplamFiyat,
  themeColors,
  stokOptions,
  stokSearchLoading,
  selectedStok,
  setSelectedStok,
  searchStok,
}) {
  return (
    <Grid item xs={12} sm={6}>
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
            <Avatar sx={{ bgcolor: `${themeColors.primary}20`, color: themeColors.primary, width: 24, height: 24 }}>
              <ShoppingBagIcon sx={{ fontSize: 14 }} />
            </Avatar>
            <Typography variant="subtitle2" fontWeight={600}>
              Ürünler ve Aksesuarlar
            </Typography>
            <Chip 
              label={`${parcalar.length} ürün`} 
              size="small" 
              sx={{ ml: 'auto', bgcolor: themeColors.primary, color: 'white' }}
            />
          </Box>

          {/* Yeni Ürün Ekleme */}
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 1.5, 
              mb: 1.5, 
              bgcolor: 'grey.50',
              borderStyle: 'dashed'
            }}
          >
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
                  sx={{ mb: 1 }}
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
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                sx={{ flex: 1, mt: 1.1 }}
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
                  sx={{ flex: 1, mt: 1.1 }}
                  size="small"
                  type="number"
                  label="Maliyet (₺)"
                  name="maliyet"
                  value={newParca.maliyet}
                  onChange={handleParcaChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                  InputLabelProps={{ shrink: true }}
                />
              )}
              <TextField
                sx={{ flex: 1 , mt: 1.1 }}
                size="small"
                type="number"
                label="Satış Fiyatı (₺)"
                name="satis_fiyati"
                value={newParca.satis_fiyati}
                onChange={handleParcaChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 0.01 }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Button
              fullWidth
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={addParca}
              sx={{ bgcolor: themeColors.primary, '&:hover': { bgcolor: themeColors.primaryDark } }}
            >
              Ürün Ekle
            </Button>
          </Paper>

          {/* Ürün Listesi */}
          {isMobile ? (
            /* Mobile Card View */
            <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
              {parcalar.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary" variant="body2">
                    Henüz ürün eklenmedi
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {parcalar.map((parca, index) => (
                    <Paper key={parca.id || index} variant="outlined" sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <TextField
                          sx={{ flex: 1 , mt: 1.1 }}
                          size="small"
                          label="Ürün Adı"
                          value={parca.urun_adi}
                          onChange={(e) => updateParca(index, 'urun_adi', e.target.value)}
                        />
                        <IconButton size="small" color="error" onClick={() => removeParca(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          sx={{ flex: 1 , mt: 1.1 }}
                          size="small"
                          type="number"
                          label="Adet"
                          value={parca.adet}
                          onChange={(e) => updateParca(index, 'adet', parseInt(e.target.value) || 1)}
                          inputProps={{ min: 1 }}
                        />
                        {isEdit && (
                          <TextField
                            sx={{ flex: 1 , mt: 1.1 }}
                            size="small"
                            type="number"
                            label="Maliyet"
                            value={parca.maliyet === 0 || parca.maliyet ? parca.maliyet : ''}
                            onChange={(e) => updateParca(index, 'maliyet', e.target.value === '' ? '' : parseFloat(e.target.value))}
                            inputProps={{ min: 0, step: 0.01 }}
                          />
                        )}
                        <TextField
                          sx={{ flex: 1 , mt: 1.1 }}
                          size="small"
                          type="number"
                          label="Satış"
                          value={parca.satis_fiyati === 0 || parca.satis_fiyati ? parca.satis_fiyati : ''}
                          onChange={(e) => updateParca(index, 'satis_fiyati', e.target.value === '' ? '' : parseFloat(e.target.value))}
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            /* Desktop Inline Düzenlenebilir Tablo */
            <TableContainer 
              component={Paper} 
              variant="outlined" 
              sx={{ maxHeight: 250, mb: 2 }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Ürün</TableCell>
                    <TableCell align="center" width={80}>Adet</TableCell>
                    {isEdit && <TableCell align="right" width={100}>Maliyet</TableCell>}
                    <TableCell align="right" width={100}>Satış</TableCell>
                    <TableCell align="center" width={50}>Sil</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parcalar.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isEdit ? 5 : 4} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary" variant="body2">
                          Henüz ürün eklenmedi
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    parcalar.map((parca, index) => (
                      <TableRow key={parca.id || index}>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={parca.urun_adi}
                            onChange={(e) => updateParca(index, 'urun_adi', e.target.value)}
                            placeholder="Ürün Adı"
                            sx={{ '& input': { p: 0.5, fontWeight: 500 } }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            size="small"
                            type="number"
                            value={parca.adet}
                            onChange={(e) => updateParca(index, 'adet', parseInt(e.target.value) || 1)}
                            inputProps={{ min: 1, style: { textAlign: 'center', width: 50 } }}
                            sx={{ '& input': { p: 0.5 } }}
                          />
                        </TableCell>
                        {isEdit && (
                          <TableCell align="right">
                            <TextField
                              size="small"
                              type="number"
                              value={parca.maliyet === 0 || parca.maliyet ? parca.maliyet : ''}
                              onChange={(e) => updateParca(index, 'maliyet', e.target.value === '' ? '' : parseFloat(e.target.value))}
                              inputProps={{ min: 0, step: 0.01, style: { textAlign: 'right', width: 70 } }}
                              sx={{ '& input': { p: 0.5 } }}
                            />
                          </TableCell>
                        )}
                        <TableCell align="right">
                          <TextField
                            size="small"
                            type="number"
                            value={parca.satis_fiyati === 0 || parca.satis_fiyati ? parca.satis_fiyati : ''}
                            onChange={(e) => updateParca(index, 'satis_fiyati', e.target.value === '' ? '' : parseFloat(e.target.value))}
                            inputProps={{ min: 0, step: 0.01, style: { textAlign: 'right', width: 70 } }}
                            sx={{ '& input': { p: 0.5 } }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => removeParca(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Toplamlar */}
          {parcalar.length > 0 && (
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Grid container spacing={2}>
                {isEdit ? (
                  <>
                    {isAdmin && (
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          Toplam Maliyet
                        </Typography>
                        <Typography variant="subtitle1" color="error.main" fontWeight={600}>
                          {formatCurrency(calculateTotals(parcalar).toplamMaliyet)}
                        </Typography>
                      </Grid>
                    )}
                    <Grid item xs={isAdmin ? 4 : 6}>
                      <Typography variant="caption" color="text.secondary">
                        Toplam Satış
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {formatCurrency(toplamFiyat)}
                      </Typography>
                    </Grid>
                    {isAdmin && (
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          Net Kar
                        </Typography>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight={700}
                          color={calculateTotals(parcalar).kar >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(calculateTotals(parcalar).kar)}
                        </Typography>
                      </Grid>
                    )}
                  </>
                ) : (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Toplam Tutar
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {formatCurrency(toplamFiyat)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          )}

          {/* Durum (Sadece düzenleme modunda) */}
          {isEdit && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                <Avatar sx={{ bgcolor: 'info.lighter', color: 'info.main', width: 24, height: 24 }}>
                  <ShippingIcon sx={{ fontSize: 14 }} />
                </Avatar>
                <Typography variant="subtitle2" fontWeight={600}>
                  Durum
                </Typography>
              </Box>
              <FormControl fullWidth size="small">
                <InputLabel>Durum</InputLabel>
                <Select
                  name="durum"
                  value={formData.durum}
                  label="Durum"
                  onChange={handleChange}
                >
                  <MenuItem value="beklemede">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                      Beklemede
                    </Box>
                  </MenuItem>
                  <MenuItem value="islemde">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />
                      İşlemde
                    </Box>
                  </MenuItem>
                  <MenuItem value="tamamlandi">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                      Tamamlandı
                    </Box>
                  </MenuItem>
                  <MenuItem value="iptal_edildi">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                      İptal Edildi
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}

export default AksesuarUrunlerSection;
