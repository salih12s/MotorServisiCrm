import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Delete as DeleteIcon, FormatListBulleted as ListIcon, LocalShipping as ShippingIcon } from '@mui/icons-material';
import FormSectionCard from './FormSectionCard';
import { formatCurrency, calculateTotals } from '../isEmriModalUtils';

const DURUM_OPTIONS = [
  { value: 'beklemede', label: 'Beklemede', color: 'warning.main' },
  { value: 'islemde', label: 'İşlemde', color: 'info.main' },
  { value: 'odeme_bekleniyor', label: 'Ödeme Bekleniyor', color: '#f57c00' },
  { value: 'tamamlandi', label: 'Tamamlandı', color: 'success.main' },
  { value: 'iptal_edildi', label: 'İptal Edildi', color: 'error.main' },
];

function PartsTableSection({
  parcalar,
  removeParca,
  updateParca,
  isEdit,
  isMobile,
  toplamFiyat,
  formData,
  handleChange,
}) {
  const totals = calculateTotals(parcalar);

  return (
    <FormSectionCard icon={<ListIcon />} iconBg="info.lighter" iconColor="info.main" title="Eklenen Parçalar Tablosu">
      {isMobile ? (
        <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
          {parcalar.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 1.5 }}>
              <Typography color="text.secondary" variant="body2">
                Henüz parça eklenmedi
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {parcalar.map((parca, index) => (
                <Paper key={parca.id || index} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TextField
                      sx={{ flex: 1 }}
                      size="small"
                      label="Parça Adı"
                      value={parca.takilan_parca}
                      onChange={(e) => updateParca(index, 'takilan_parca', e.target.value)}
                    />
                    <IconButton size="small" color="error" onClick={() => removeParca(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: isEdit ? '1fr 1fr 1fr' : '1fr 1fr',
                      gap: 1,
                    }}
                  >
                    <TextField
                      size="small"
                      type="number"
                      label="Adet"
                      value={parca.adet}
                      onChange={(e) => updateParca(index, 'adet', parseInt(e.target.value) || 1)}
                      inputProps={{ min: 1 }}
                    />
                    {isEdit && (
                      <TextField
                        size="small"
                        type="number"
                        label="Maliyet"
                        value={parca.maliyet === 0 || parca.maliyet ? parca.maliyet : ''}
                        onChange={(e) => updateParca(index, 'maliyet', e.target.value === '' ? '' : parseFloat(e.target.value))}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    )}
                    <TextField
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
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 250, borderRadius: 1.5 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Parça</TableCell>
                <TableCell align="center" width={80} sx={{ fontWeight: 700 }}>Adet</TableCell>
                {isEdit && <TableCell align="right" width={100} sx={{ fontWeight: 700 }}>Maliyet</TableCell>}
                <TableCell align="right" width={100} sx={{ fontWeight: 700 }}>Satış</TableCell>
                <TableCell align="center" width={50} sx={{ fontWeight: 700 }}>Sil</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parcalar.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isEdit ? 5 : 4} align="center" sx={{ py: 3, border: 0 }}>
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
                      <IconButton size="small" color="error" onClick={() => removeParca(index)}>
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

      {parcalar.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: isEdit ? { xs: '1fr', sm: '1fr 1fr 1fr' } : '1fr',
            gap: 1.5,
            mt: 1.5,
            p: 1.5,
            bgcolor: 'grey.50',
            borderRadius: 1.5,
          }}
        >
          {isEdit ? (
            <>
              <Box>
                <Typography variant="caption" color="text.secondary">Toplam Maliyet</Typography>
                <Typography variant="subtitle1" color="error.main" fontWeight={600}>
                  {formatCurrency(totals.toplamMaliyet)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Toplam Satış</Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {formatCurrency(toplamFiyat)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Net Kar</Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color={totals.kar >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(totals.kar)}
                </Typography>
              </Box>
            </>
          ) : (
            <Box>
              <Typography variant="caption" color="text.secondary">Toplam Tutar</Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                {formatCurrency(toplamFiyat)}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {isEdit && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
            <ShippingIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              Durum
            </Typography>
          </Box>
          <FormControl fullWidth size="small">
            <InputLabel>Durum</InputLabel>
            <Select name="durum" value={formData.durum} label="Durum" onChange={handleChange}>
              {DURUM_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: opt.color }} />
                    {opt.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
    </FormSectionCard>
  );
}

export default PartsTableSection;
