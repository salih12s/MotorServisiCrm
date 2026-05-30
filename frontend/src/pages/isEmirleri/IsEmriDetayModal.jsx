import React from 'react';
import {
  Box,
  Card,
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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Receipt as ReceiptIcon,
  DirectionsCar as DirectionsCarIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { formatDate, formatCurrency } from './isEmirleriUtils';

function IsEmriDetayModal({ open, onClose, isEmri, isMobile, isAdmin, onEdit }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={window.innerWidth < 600}
      PaperProps={{
        sx: {
          m: { xs: 0, sm: 2 },
          borderRadius: { xs: 0, sm: 2 },
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        pb: 1, 
        bgcolor: 'primary.main', 
        color: 'white',
        p: { xs: 2, sm: 2.5 },
      }}>
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            İş Emri Detay - {isEmri?.fis_no}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {isEmri?.musteri_ad_soyad} | {formatDate(isEmri?.created_at, 'dd MMMM yyyy')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {isEmri && (
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {/* Müşteri ve Araç Bilgileri Yan Yana */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid', borderColor: 'primary.main' }}>
                  <PersonIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={700}>Müşteri Bilgileri</Typography>
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Ad Soyad:</Typography></Grid>
                  <Grid item xs={8}><Typography variant="body2" fontWeight={600}>{isEmri.musteri_ad_soyad}</Typography></Grid>
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Telefon:</Typography></Grid>
                  <Grid item xs={8}><Typography variant="body2" fontWeight={600}>{isEmri.telefon || '-'}</Typography></Grid>
                </Grid>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid', borderColor: 'primary.main' }}>
                  <DirectionsCarIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={700}>Araç Bilgileri</Typography>
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Marka:</Typography></Grid>
                  <Grid item xs={8}><Typography variant="body2" fontWeight={600}>{isEmri.marka}</Typography></Grid>
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">Model/Tip:</Typography></Grid>
                  <Grid item xs={8}><Typography variant="body2" fontWeight={600}>{isEmri.model_tip || '-'}</Typography></Grid>
                  <Grid item xs={4}><Typography variant="body2" color="text.secondary">KM:</Typography></Grid>
                  <Grid item xs={8}><Typography variant="body2" fontWeight={600}>{isEmri.km ? `${isEmri.km} km` : '-'}</Typography></Grid>
                </Grid>
              </Card>
            </Grid>

            {/* İş Detayları */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid', borderColor: 'primary.main' }}>
                  <ReceiptIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={700}>İş Detayları</Typography>
                  <Box sx={{ ml: 'auto' }}>
                    <Chip 
                      size="small" 
                      label={
                        isEmri.durum === 'beklemede' ? 'Beklemede' :
                        isEmri.durum === 'islemde' ? 'İşlemde' :
                        isEmri.durum === 'odeme_bekleniyor' ? 'Ödeme Bekleniyor' :
                        isEmri.durum === 'iptal_edildi' ? 'İptal Edildi' :
                        'Tamamlandı'
                      }
                      sx={{ 
                        bgcolor: 
                          isEmri.durum === 'beklemede' ? '#fff3e0' :
                          isEmri.durum === 'islemde' ? '#e3f2fd' :
                          isEmri.durum === 'odeme_bekleniyor' ? '#f3e5f5' :
                          isEmri.durum === 'iptal_edildi' ? '#ffebee' :
                          '#e8f5e9',
                        color: 
                          isEmri.durum === 'beklemede' ? '#e65100' :
                          isEmri.durum === 'islemde' ? '#0277bd' :
                          isEmri.durum === 'odeme_bekleniyor' ? '#7b1fa2' :
                          isEmri.durum === 'iptal_edildi' ? '#c62828' :
                          '#2e7d32',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={36} md={18}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Açıklama:</Typography>
                    <Typography variant="body2" sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, minHeight: 40 }}>
                      {isEmri.aciklama || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Arıza/Şikayetler:</Typography>
                    <Typography variant="body2" sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, minHeight: 40 }}>
                      {isEmri.ariza_sikayetler || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Oluşturma Tarihi:</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatDate(isEmri.created_at, 'dd.MM.yyyy HH:mm')}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Tahmini Teslim:</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatDate(isEmri.tahmini_teslim_tarihi, 'dd.MM.yyyy')}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Tahmini Ücret:</Typography>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                      {isEmri.tahmini_toplam_ucret ? formatCurrency(isEmri.tahmini_toplam_ucret) : '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Parçalar */}
            {isEmri.parcalar && isEmri.parcalar.length > 0 && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, pb: 1, borderBottom: '2px solid', borderColor: 'primary.main' }}>
                    Parçalar ({isEmri.parcalar.length})
                  </Typography>
                  
                  {/* Mobile Card View */}
                  {isMobile ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {isEmri.parcalar.map((parca, index) => (
                        <Paper key={index} variant="outlined" sx={{ p: 1.5 }}>
                          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                            {parca.takilan_parca}
                          </Typography>
                          {parca.parca_kodu && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                              Kod: {parca.parca_kodu}
                            </Typography>
                          )}
                          <Grid container spacing={1}>
                            <Grid item xs={isAdmin ? 3 : 4}>
                              <Typography variant="caption" color="text.secondary">Adet</Typography>
                              <Typography variant="body2" fontWeight={600}>{parca.adet}</Typography>
                            </Grid>
                            <Grid item xs={isAdmin ? 3 : 4}>
                              <Typography variant="caption" color="text.secondary">Birim Fiyat</Typography>
                              <Typography variant="body2" fontWeight={600}>{formatCurrency(parca.birim_fiyat)}</Typography>
                            </Grid>
                            {isAdmin && (
                              <Grid item xs={3}>
                                <Typography variant="caption" color="text.secondary">Maliyet</Typography>
                                <Typography variant="body2" fontWeight={600} color="error.main">
                                  {formatCurrency(parca.maliyet)}
                                </Typography>
                              </Grid>
                            )}
                            <Grid item xs={isAdmin ? 3 : 4}>
                              <Typography variant="caption" color="text.secondary">Toplam</Typography>
                              <Typography variant="body2" fontWeight={600} color="primary.main">
                                {formatCurrency(parca.adet * parca.birim_fiyat)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    /* Desktop Table View */
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 700 }}>Parça Kodu</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Parça Adı</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>Adet</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Birim Fiyat</TableCell>
                            {isAdmin && <TableCell align="right" sx={{ fontWeight: 700 }}>Maliyet</TableCell>}
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Toplam</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {isEmri.parcalar.map((parca, index) => (
                            <TableRow key={index} hover>
                              <TableCell>{parca.parca_kodu || '-'}</TableCell>
                              <TableCell>{parca.takilan_parca}</TableCell>
                              <TableCell align="center">{parca.adet}</TableCell>
                              <TableCell align="right">{formatCurrency(parca.birim_fiyat)}</TableCell>
                              {isAdmin && <TableCell align="right">{formatCurrency(parca.maliyet)}</TableCell>}
                              <TableCell align="right">{formatCurrency(parca.adet * parca.birim_fiyat)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Card>
              </Grid>
            )}

            {/* Ödeme Detayları */}
            {isEmri.odeme_detaylari && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid', borderColor: 'success.main' }}>
                    <ReceiptIcon color="success" />
                    <Typography variant="subtitle1" fontWeight={700}>Ödeme Detayları</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, whiteSpace: 'pre-wrap' }}>
                    {isEmri.odeme_detaylari}
                  </Typography>
                </Card>
              </Grid>
            )}

            {/* Finansal Bilgiler - Sadece Admin Görebilir */}
            {isAdmin && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid', borderColor: 'primary.main' }}>
                    <AttachMoneyIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight={700}>Finansal Özet</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                        <Typography variant="body2" color="text.secondary">Toplam Ücret</Typography>
                        <Typography variant="h5" fontWeight={700} color="primary.main">{formatCurrency(isEmri.gercek_toplam_ucret)}</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
                        <Typography variant="body2" color="text.secondary">Toplam Maliyet</Typography>
                        <Typography variant="h5" fontWeight={700} color="error.main">{formatCurrency(isEmri.toplam_maliyet)}</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ p: 2, textAlign: 'center', bgcolor: parseFloat(isEmri.kar) >= 0 ? '#e8f5e9' : '#ffebee' }}>
                        <Typography variant="body2" color="text.secondary">Kar</Typography>
                        <Typography variant="h5" fontWeight={700} sx={{ color: parseFloat(isEmri.kar) >= 0 ? '#2e7d32' : '#c62828' }}>
                          {formatCurrency(isEmri.kar)}
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                        <Typography variant="body2" color="text.secondary">Kar Oranı</Typography>
                        <Typography variant="h5" fontWeight={700} color="warning.dark">
                          %{isEmri.gercek_toplam_ucret > 0 ? ((isEmri.kar / isEmri.gercek_toplam_ucret) * 100).toFixed(1) : 0}
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button 
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={onEdit}
        >
          Düzenle
        </Button>
        <Button variant="contained" onClick={onClose}>
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default IsEmriDetayModal;
