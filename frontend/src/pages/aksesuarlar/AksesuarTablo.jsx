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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { formatDate, durumConfig, formatCurrency } from './aksesuarlarUtils';

const AksesuarTablo = ({
  loading,
  filteredAksesuarlar,
  isMobile,
  isAdmin,
  themeColors,
  handleViewDetails,
  handleOpenModal,
  handleDelete,
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
                <Typography variant="subtitle1" fontWeight={600}>{aksesuar.ad_soyad}</Typography>
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
              {aksesuar.odeme_sekli && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Ödeme: {aksesuar.odeme_sekli}
                </Typography>
              )}
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
                <TableCell sx={{ fontWeight: 700 }}>Ad Soyad</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Telefon</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ürün Sayısı</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ödeme Şekli</TableCell>
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
                  <TableCell>{aksesuar.ad_soyad}</TableCell>
                  <TableCell>{aksesuar.telefon || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${aksesuar.parcalar?.length || 0} ürün`}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{aksesuar.odeme_sekli || '-'}</TableCell>
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
