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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { formatCurrency, calculateTotals } from './isEmriModalUtils';

function IsEmriParcalarSection({
  parcalar,
  newParca,
  handleParcaChange,
  addParca,
  removeParca,
  updateParca,
  isEdit,
  isMobile,
  formData,
  handleChange,
  toplamFiyat,
}) {
  return (
    <Grid item xs={12} sm={6}>
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } , mt : -1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
            <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main', width: 24, height: 24 }}>
              <ReceiptIcon sx={{ fontSize: 14 }} />
            </Avatar>
            <Typography variant="subtitle2" fontWeight={600}>
              Parçalar ve İşçilik
            </Typography>
            <Chip 
              label={`${parcalar.length} parça`} 
              size="small" 
              color="primary" 
              variant="outlined"
              sx={{ ml: 'auto' }}
            />
          </Box>

          {/* Yeni Parça Ekleme */}
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 1.5, 
              mb: 1.5, 
              bgcolor: 'grey.50',
              borderStyle: 'dashed'
            }}
          >
            <TextField
              fullWidth
              size="small"
              label="Takılan Parça / İşçilik Adı"
              name="takilan_parca"
              value={newParca.takilan_parca}
              onChange={handleParcaChange}
              placeholder="Örn: Civata (x5)"
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                sx={{ flex: 1 , mt : 1.1 }}
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
                  sx={{ flex: 1 , mt : 1.1 }}
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
                />
              )}
              <TextField
                sx={{ flex: 1 , mt : 1.1 }}
                size="small"
                type="number"
                label="Satış Fiyatı (₺)"
                name="birim_fiyat"
                value={newParca.birim_fiyat}
                onChange={handleParcaChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Box>
            <Button
              fullWidth
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={addParca}
            >
              Parça Ekle
            </Button>
          </Paper>

          {/* Parça Listesi - Mobilde Card, Masaüstünde Inline Düzenlenebilir Tablo */}
          {isMobile ? (
            /* Mobile Card View - Inline Düzenlenebilir */
            <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
              {parcalar.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary" variant="body2">
                    Henüz parça eklenmedi
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: .5 , mt : -1.5 }}>
                  {parcalar.map((parca, index) => (
                    <Paper key={parca.id || index} variant="outlined" sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <TextField
                          sx={{ flex: 1 , mt : 1.1 }}
                          size="small"
                          label="Parça Adı"
                          value={parca.takilan_parca}
                          onChange={(e) => updateParca(index, 'takilan_parca', e.target.value)}
                        />
                        <IconButton size="small" color="error" onClick={() => removeParca(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          sx={{ flex: 1 , mt : 1.1 }}
                          size="small"
                          type="number"
                          label="Adet"
                          value={parca.adet}
                          onChange={(e) => updateParca(index, 'adet', parseInt(e.target.value) || 1)}
                          inputProps={{ min: 1 }}
                        />
                        {isEdit && (
                          <TextField
                            sx={{ flex: 1 ,   mt : 1.1 }}
                            size="small"
                            type="number"
                            label="Maliyet"
                            value={parca.maliyet === 0 || parca.maliyet ? parca.maliyet : ''}
                            onChange={(e) => updateParca(index, 'maliyet', e.target.value === '' ? '' : parseFloat(e.target.value))}
                            inputProps={{ min: 0, step: 0.01 }}
                          />
                        )}
                        <TextField
                          sx={{ flex: 1 ,   mt : 1.1 }}
                          size="small"
                          type="number"
                          label="Satış"
                          value={parca.birim_fiyat === 0 || parca.birim_fiyat ? parca.birim_fiyat : ''}
                          onChange={(e) => updateParca(index, 'birim_fiyat', e.target.value === '' ? '' : parseFloat(e.target.value))}
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
                    <TableCell>Parça</TableCell>
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
                          Henüz parça eklenmedi
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
                            value={parca.takilan_parca}
                            onChange={(e) => updateParca(index, 'takilan_parca', e.target.value)}
                            placeholder="Parça Adı"
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
                            value={parca.birim_fiyat === 0 || parca.birim_fiyat ? parca.birim_fiyat : ''}
                            onChange={(e) => updateParca(index, 'birim_fiyat', e.target.value === '' ? '' : parseFloat(e.target.value))}
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
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        Toplam Maliyet
                      </Typography>
                      <Typography variant="subtitle1" color="error.main" fontWeight={600}>
                        {formatCurrency(calculateTotals(parcalar).toplamMaliyet)}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        Toplam Satış
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {formatCurrency(toplamFiyat)}
                      </Typography>
                    </Grid>
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
                  <MenuItem value="odeme_bekleniyor">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f57c00' }} />
                      Ödeme Bekleniyor
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

          {/* Ödeme Detayları */}
          <Box sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
              <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main', width: 24, height: 24 }}>
                <ReceiptIcon sx={{ fontSize: 14 }} />
              </Avatar>
              <Typography variant="subtitle2" fontWeight={600}>
                Ödeme Detayları
              </Typography>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              name="odeme_detaylari"
              value={formData.odeme_detaylari}
              onChange={handleChange}
              placeholder="Örn: Nakit, Kart..."
            />
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
}

export default IsEmriParcalarSection;
