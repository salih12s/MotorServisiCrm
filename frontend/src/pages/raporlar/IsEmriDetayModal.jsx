import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { formatCurrency } from './raporlarUtils';

const IsEmriDetayModal = ({ open, onClose, isMobile, selectedWorkOrder }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="md"
    fullWidth
    fullScreen={isMobile}
    PaperProps={{
      sx: {
        m: { xs: 0, sm: 2 },
        borderRadius: { xs: 0, sm: 2 },
      }
    }}
  >
    <DialogTitle sx={{ 
      bgcolor: 'primary.main', 
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      p: { xs: 2, sm: 2.5 },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssignmentIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          İş Emri Detayları - {selectedWorkOrder?.fis_no}
        </Typography>
      </Box>
      <IconButton
        onClick={onClose}
        size="small"
        sx={{ color: 'white' }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent sx={{ mt: { xs: 1, sm: 2 }, p: { xs: 2, sm: 3 } }}>
      {selectedWorkOrder && (
        <Box>
          {/* Oluşturan Bilgisi */}
          <Card sx={{ mb: 2, bgcolor: '#f5f5f5' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    İş Emrini Oluşturan
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {selectedWorkOrder.olusturan_kisi || selectedWorkOrder.olusturan_ad_soyad || '-'}
                  </Typography>
                  {selectedWorkOrder.olusturan_kisi !== 'Ortak' && (
                    <Typography variant="body2" color="text.secondary">
                      @{selectedWorkOrder.olusturan_kullanici_adi || '-'}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">
                    Oluşturulma Tarihi
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {format(new Date(selectedWorkOrder.created_at), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Müşteri ve Araç Bilgileri */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Müşteri Bilgileri
                  </Typography>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {selectedWorkOrder.musteri_ad_soyad}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    📞 {selectedWorkOrder.telefon}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Araç Bilgileri
                  </Typography>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {selectedWorkOrder.marka} {selectedWorkOrder.model_tip}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    🚗 {selectedWorkOrder.plaka}
                  </Typography>
                  {selectedWorkOrder.km && (
                    <Typography variant="body2" color="text.secondary">
                      📏 {selectedWorkOrder.km} km
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Arıza/Şikayet */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Arıza/Şikayet
              </Typography>
              <Typography variant="body1">
                {selectedWorkOrder.ariza_sikayetler || '-'}
              </Typography>
            </CardContent>
          </Card>

          {/* Ödeme Detayları */}
          {selectedWorkOrder.odeme_detaylari && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ReceiptIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Ödeme Detayları
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, whiteSpace: 'pre-wrap' }}>
                  {selectedWorkOrder.odeme_detaylari}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Parçalar */}
          {selectedWorkOrder.parcalar && selectedWorkOrder.parcalar.length > 0 && (
            <Card sx={{ mb: 2 }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" fontWeight={700}>
                    Kullanılan Parçalar ({selectedWorkOrder.parcalar.length})
                  </Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Parça Adı</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Adet</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Birim Fiyat</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Maliyet</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Satış</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Kar</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedWorkOrder.parcalar.map((parca, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography fontWeight={600}>{parca.takilan_parca || parca.parca_adi || '-'}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip size="small" label={parca.adet} />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatCurrency(parca.birim_fiyat)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ color: '#d32f2f' }}>
                              {formatCurrency(parca.maliyet)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                              {formatCurrency(parca.satis_fiyati)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography 
                              fontWeight={700}
                              sx={{ color: parseFloat(parca.kar) >= 0 ? '#2e7d32' : '#c62828' }}
                            >
                              {formatCurrency(parca.kar)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Finansal Özet */}
          <Card sx={{ bgcolor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Finansal Özet
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Tahmini Toplam
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {formatCurrency(selectedWorkOrder.tahmini_toplam_ucret)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Gerçekleşen Gelir
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#2e7d32' }}>
                      {formatCurrency(selectedWorkOrder.gercek_toplam_ucret)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Toplam Maliyet
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#d32f2f' }}>
                      {formatCurrency(selectedWorkOrder.toplam_maliyet)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Net Kar
                    </Typography>
                    <Typography 
                      variant="h6" 
                      fontWeight={700}
                      sx={{ color: parseFloat(selectedWorkOrder.kar) >= 0 ? '#2e7d32' : '#c62828' }}
                    >
                      {formatCurrency(selectedWorkOrder.kar)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}
    </DialogContent>
    <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
      <Button onClick={onClose} variant="contained">
        Kapat
      </Button>
    </DialogActions>
  </Dialog>
);

export default IsEmriDetayModal;
