import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Close as CloseIcon,
  ShoppingBag as ShoppingBagIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { formatDate, durumConfig, formatCurrency } from './aksesuarlarUtils';

const AksesuarDetayDialog = ({
  open,
  onClose,
  selectedAksesuar,
  isMobile,
  isAdmin,
  themeColors,
  handleOpenModal,
  baslik = 'Aksesuar Detayları',
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="md"
    fullWidth
  >
    <DialogTitle sx={{
      bgcolor: themeColors.primary,
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShoppingBagIcon />
        <Typography variant="h6">{baslik}</Typography>
      </Box>
      <IconButton onClick={onClose} sx={{ color: 'white' }}>
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent sx={{ pt: 3 }}>
      {selectedAksesuar && (
        <>
          {/* Müşteri Bilgileri */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Avatar sx={{ bgcolor: `${themeColors.primary}20`, color: themeColors.primary, width: 32, height: 32 }}>
                <PersonIcon fontSize="small" />
              </Avatar>
              <Typography variant="subtitle1" fontWeight={600}>Müşteri Bilgileri</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Ad Soyad</Typography>
                <Typography variant="body1" fontWeight={500}>{selectedAksesuar.ad_soyad || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Telefon</Typography>
                <Typography variant="body1">{selectedAksesuar.telefon || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Satış Tarihi</Typography>
                <Typography variant="body1">{formatDate(selectedAksesuar.satis_tarihi || selectedAksesuar.created_at, 'dd.MM.yyyy')}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Durum</Typography>
                <Chip
                  label={durumConfig[selectedAksesuar.durum]?.label || 'Beklemede'}
                  size="small"
                  sx={{
                    mt: 0.5,
                    bgcolor: durumConfig[selectedAksesuar.durum]?.bgColor,
                    color: durumConfig[selectedAksesuar.durum]?.color,
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Ürünler */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Avatar sx={{ bgcolor: `${themeColors.primary}20`, color: themeColors.primary, width: 32, height: 32 }}>
                <ShoppingBagIcon fontSize="small" />
              </Avatar>
              <Typography variant="subtitle1" fontWeight={600}>Ürünler</Typography>
              <Chip label={`${selectedAksesuar.parcalar?.length || 0} ürün`} size="small" sx={{ ml: 1 }} />
            </Box>

            {selectedAksesuar.parcalar && selectedAksesuar.parcalar.length > 0 ? (
              isMobile ? (
                /* Mobil Card View */
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {selectedAksesuar.parcalar.map((parca, index) => (
                    <Paper key={parca.id || index} variant="outlined" sx={{ p: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                        {parca.urun_adi}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Adet</Typography>
                          <Typography variant="body2" fontWeight={500}>{parca.adet}</Typography>
                        </Box>
                        {isAdmin && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">Maliyet</Typography>
                            <Typography variant="body2" color="error.main">{formatCurrency(parca.maliyet)}</Typography>
                          </Box>
                        )}
                        <Box>
                          <Typography variant="caption" color="text.secondary">Satış</Typography>
                          <Typography variant="body2">{formatCurrency(parca.satis_fiyati)}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Toplam</Typography>
                          <Typography variant="body2" fontWeight={700} sx={{ color: themeColors.primary }}>
                            {formatCurrency((parseInt(parca.adet) || 1) * (parseFloat(parca.satis_fiyati) || 0))}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                /* Desktop Tablo View */
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Ürün Adı</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Adet</TableCell>
                        {isAdmin && <TableCell align="right" sx={{ fontWeight: 600 }}>Maliyet</TableCell>}
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Satış Fiyatı</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Toplam</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedAksesuar.parcalar.map((parca, index) => (
                        <TableRow key={parca.id || index}>
                          <TableCell>{parca.urun_adi}</TableCell>
                          <TableCell align="center">{parca.adet}</TableCell>
                          {isAdmin && <TableCell align="right">{formatCurrency(parca.maliyet)}</TableCell>}
                          <TableCell align="right">{formatCurrency(parca.satis_fiyati)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency((parseInt(parca.adet) || 1) * (parseFloat(parca.satis_fiyati) || 0))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )
            ) : (
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">Ürün eklenmemiş</Typography>
              </Paper>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Özet */}
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 2 }}>
            {isAdmin && (
              <Paper sx={{ p: 2, flex: 1, minWidth: 150, bgcolor: 'error.lighter' }}>
                <Typography variant="caption" color="text.secondary">Toplam Maliyet</Typography>
                <Typography variant="h6" color="error.main" fontWeight={700}>
                  {formatCurrency(selectedAksesuar.toplam_maliyet)}
                </Typography>
              </Paper>
            )}
            <Paper sx={{ p: 2, flex: 1, minWidth: 150, bgcolor: 'grey.100' }}>
              <Typography variant="caption" color="text.secondary">Toplam Satış</Typography>
              <Typography variant="h6" fontWeight={700}>
                {formatCurrency(selectedAksesuar.toplam_satis || selectedAksesuar.odeme_tutari)}
              </Typography>
            </Paper>
            {isAdmin && (
              <Paper sx={{ p: 2, flex: 1, minWidth: 150, bgcolor: 'success.lighter' }}>
                <Typography variant="caption" color="text.secondary">Net Kar</Typography>
                <Typography variant="h6" color="success.main" fontWeight={700}>
                  {formatCurrency(selectedAksesuar.kar)}
                </Typography>
              </Paper>
            )}
          </Box>

          {/* Ödeme Detayları */}
          {(selectedAksesuar.odeme_sekli || selectedAksesuar.odeme_detaylari) && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main', width: 32, height: 32 }}>
                    <ReceiptIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={600}>Ödeme Bilgileri</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {selectedAksesuar.odeme_sekli && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Ödeme Şekli</Typography>
                      <Typography variant="body1">{selectedAksesuar.odeme_sekli}</Typography>
                    </Box>
                  )}
                  {selectedAksesuar.odeme_detaylari && (
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">Ödeme Detayları</Typography>
                      <Typography variant="body1">{selectedAksesuar.odeme_detaylari}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </>
          )}

          {/* Açıklama */}
          {selectedAksesuar.aciklama && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Açıklama / Not</Typography>
                <Typography variant="body1">{selectedAksesuar.aciklama}</Typography>
              </Box>
            </>
          )}
        </>
      )}
    </DialogContent>
    <DialogActions sx={{ p: 2 }}>
      <Button onClick={onClose} color="inherit">
        Kapat
      </Button>
      <Button
        variant="contained"
        onClick={() => {
          onClose();
          handleOpenModal(selectedAksesuar);
        }}
        sx={{ bgcolor: themeColors.primary, '&:hover': { bgcolor: themeColors.primaryDark } }}
      >
        Düzenle
      </Button>
    </DialogActions>
  </Dialog>
);

export default AksesuarDetayDialog;
