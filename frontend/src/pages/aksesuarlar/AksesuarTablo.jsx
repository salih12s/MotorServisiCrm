import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  Paper,
  Checkbox,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { formatDate, durumConfig, formatCurrency } from './aksesuarlarUtils';

const PAYMENT_LABELS = { nakit: 'Nakit', kart: 'Kart', kredi_karti: 'Kart', havale: 'Havale / EFT', karisik: 'Karışık' };
const getPaidAmount = (record) => Number(
  record.toplam_odenen
  ?? (Number(record.nakit_tutar || 0) + Number(record.kart_tutar || 0) + Number(record.havale_tutar || 0))
);
const getRemainingAmount = (record) => (
  ['tamamlandi', 'iptal', 'iptal_edildi'].includes(record.durum)
    ? 0
    : Number(record.kalan_bakiye || 0)
);
const getPaymentLabel = (record) => {
  const usedMethods = [
    Number(record.nakit_tutar || 0) > 0 && 'Nakit',
    Number(record.kart_tutar || 0) > 0 && 'Kart',
    Number(record.havale_tutar || 0) > 0 && 'Havale / EFT',
  ].filter(Boolean);
  if (usedMethods.length > 1) return 'Karışık';
  return usedMethods[0] || PAYMENT_LABELS[record.odeme_sekli] || 'Ödeme yok';
};

const AksesuarTablo = ({
  loading,
  filteredAksesuarlar,
  isMobile,
  isAdmin,
  themeColors,
  handleViewDetails,
  handleOpenModal,
  handleDelete,
  selectedIds,
  toggleSelected,
  toggleAll,
  allSelected,
  someSelected,
}) => (
  <Card>
    <CardContent sx={{ p: 0 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: themeColors.primary }} />
        </Box>
      ) : filteredAksesuarlar.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">Kayıt bulunamadı</Typography>
        </Box>
      ) : isMobile ? (
        // Mobile Card View
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredAksesuarlar.map((aksesuar) => (
            <Paper key={aksesuar.id} variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                  {isAdmin && (
                    <Checkbox
                      size="small"
                      disabled={['tamamlandi', 'iptal_edildi'].includes(aksesuar.durum)}
                      checked={selectedIds.includes(aksesuar.id)}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => toggleSelected(aksesuar.id)}
                      inputProps={{ 'aria-label': `${aksesuar.ad_soyad} satışını seç` }}
                    />
                  )}
                  <Typography variant="subtitle1" fontWeight={600}>{aksesuar.ad_soyad}</Typography>
                </Box>
                <Box>
                  <IconButton size="small" onClick={() => handleViewDetails(aksesuar)} sx={{ color: themeColors.primary }}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleOpenModal(aksesuar)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  {isAdmin && (
                    <IconButton size="small" color="error" onClick={() => handleDelete(aksesuar.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {aksesuar.telefon || '-'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {aksesuar.parcalar?.length || 0} ürün
              </Typography>
              <Box sx={{ mb: 0.5 }}>
                <Typography variant="body2" fontWeight={700}>Ödeme: {getPaymentLabel(aksesuar)}</Typography>
                <Typography variant="body2" color="success.main">Ödenen: {formatCurrency(getPaidAmount(aksesuar))}</Typography>
                {getRemainingAmount(aksesuar) > 0 && (
                  <Typography variant="body2" sx={{ color: '#c62828' }} fontWeight={800}>
                    Kalan: {formatCurrency(getRemainingAmount(aksesuar))}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Chip
                  label={durumConfig[aksesuar.durum]?.label || 'Beklemede'}
                  size="small"
                  sx={{
                    bgcolor: durumConfig[aksesuar.durum]?.bgColor || '#fff3e0',
                    color: durumConfig[aksesuar.durum]?.color || '#ff9800',
                    fontWeight: 600,
                  }}
                />
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: themeColors.primary }}>
                  {formatCurrency(aksesuar.toplam_satis || aksesuar.odeme_tutari)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Satış: {formatDate(aksesuar.satis_tarihi || aksesuar.created_at, 'dd.MM.yyyy')}
              </Typography>
            </Paper>
          ))}
        </Box>
      ) : (
        // Desktop Table View
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: `${themeColors.primary}15` }}>
                {isAdmin && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={allSelected}
                      indeterminate={!allSelected && someSelected}
                      onChange={toggleAll}
                      inputProps={{ 'aria-label': 'Tüm uygun aksesuar satışlarını seç' }}
                    />
                  </TableCell>
                )}
                <TableCell sx={{ fontWeight: 700 }}>Ad Soyad</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Telefon</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ürün Sayısı</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ödeme</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Durum</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Tutar</TableCell>
                {isAdmin && <TableCell align="right" sx={{ fontWeight: 700 }}>Maliyet</TableCell>}
                {isAdmin && <TableCell align="right" sx={{ fontWeight: 700 }}>Net Kar</TableCell>}
                <TableCell sx={{ fontWeight: 700 }}>Satış Tarihi</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAksesuarlar.map((aksesuar) => (
                <TableRow
                  key={aksesuar.id}
                  hover
                  onDoubleClick={() => isAdmin && handleViewDetails(aksesuar)}
                  sx={{ cursor: isAdmin ? 'pointer' : 'default' }}
                >
                  {isAdmin && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        disabled={['tamamlandi', 'iptal_edildi'].includes(aksesuar.durum)}
                        checked={selectedIds.includes(aksesuar.id)}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => toggleSelected(aksesuar.id)}
                        inputProps={{ 'aria-label': `${aksesuar.ad_soyad} satışını seç` }}
                      />
                    </TableCell>
                  )}
                  <TableCell>{aksesuar.ad_soyad}</TableCell>
                  <TableCell>{aksesuar.telefon || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${aksesuar.parcalar?.length || 0} ürün`}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography fontSize="0.8rem" fontWeight={700}>{getPaymentLabel(aksesuar)}</Typography>
                    <Typography fontSize="0.76rem" color="success.main" fontWeight={700}>
                      Ödenen: {formatCurrency(getPaidAmount(aksesuar))}
                    </Typography>
                    {getRemainingAmount(aksesuar) > 0 && (
                      <Typography fontSize="0.76rem" sx={{ color: '#c62828' }} fontWeight={800}>
                        Kalan: {formatCurrency(getRemainingAmount(aksesuar))}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={durumConfig[aksesuar.durum]?.label || 'Beklemede'}
                      size="small"
                      sx={{
                        bgcolor: durumConfig[aksesuar.durum]?.bgColor || '#fff3e0',
                        color: durumConfig[aksesuar.durum]?.color || '#ff9800',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600} sx={{ color: themeColors.primary }}>
                      {formatCurrency(aksesuar.toplam_satis || aksesuar.odeme_tutari)}
                    </Typography>
                  </TableCell>
                  {isAdmin && (
                    <TableCell align="right">
                      <Typography sx={{ color: '#c62828' }}>
                        {formatCurrency(aksesuar.toplam_maliyet || 0)}
                      </Typography>
                    </TableCell>
                  )}
                  {isAdmin && (
                    <TableCell align="right">
                      <Typography
                        fontWeight={700}
                        sx={{ color: parseFloat(aksesuar.kar || 0) >= 0 ? '#2e7d32' : '#c62828' }}
                      >
                        {formatCurrency(aksesuar.kar || 0)}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell>{formatDate(aksesuar.satis_tarihi || aksesuar.created_at, 'dd.MM.yyyy')}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleViewDetails(aksesuar)} sx={{ color: themeColors.primary }}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenModal(aksesuar)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {isAdmin && (
                      <IconButton size="small" color="error" onClick={() => handleDelete(aksesuar.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </CardContent>
  </Card>
);

export default AksesuarTablo;
