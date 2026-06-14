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

const AksesuarDetayModal = ({ open, onClose, isMobile, selectedAksesuar }) => (
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
      bgcolor: '#04A7B8', 
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      p: { xs: 2, sm: 2.5 },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ReceiptIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Aksesuar Satış Detayları
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
    <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
      {selectedAksesuar && (
        <Box>
          {/* Müşteri Bilgileri */}
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PersonIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={600}>Müşteri Bilgileri</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary">Ad Soyad</Typography>
                  <Typography variant="body1" fontWeight={600}>{selectedAksesuar.ad_soyad}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary">Telefon</Typography>
                  <Typography variant="body1">{selectedAksesuar.telefon || '-'}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary">Ödeme Şekli</Typography>
                  <Typography variant="body1">{selectedAksesuar.odeme_sekli || '-'}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary">Oluşturan Kişi</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedAksesuar.olusturan_kisi || selectedAksesuar.olusturan_ad_soyad || '-'}
                  </Typography>
                  {selectedAksesuar.olusturan_kisi !== 'Ortak' && selectedAksesuar.olusturan_kullanici_adi && (
                    <Typography variant="caption" color="text.secondary">
                      @{selectedAksesuar.olusturan_kullanici_adi}
                    </Typography>
                  )}
                </Grid>
                {selectedAksesuar.odeme_detaylari && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Ödeme Detayları</Typography>
                    <Typography variant="body1" sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, whiteSpace: 'pre-wrap', mt: 0.5 }}>
                      {selectedAksesuar.odeme_detaylari}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Satış Tarihi</Typography>
                  <Typography variant="body1">
                    {selectedAksesuar.satis_tarihi ? format(new Date(selectedAksesuar.satis_tarihi), 'd MMMM yyyy', { locale: tr }) : '-'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Ürünler */}
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AssignmentIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={600}>Satılan Ürünler</Typography>
                <Chip label={`${selectedAksesuar.parcalar?.length || 0} ürün`} size="small" sx={{ ml: 1 }} />
              </Box>
              {selectedAksesuar.parcalar && selectedAksesuar.parcalar.length > 0 ? (
                <TableContainer component={Box}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Ürün Adı</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Adet</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Maliyet</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Satış Fiyatı</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Toplam</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedAksesuar.parcalar.map((parca, index) => (
                        <TableRow key={parca.id || index}>
                          <TableCell>{parca.urun_adi}</TableCell>
                          <TableCell align="center">{parca.adet}</TableCell>
                          <TableCell align="right" sx={{ color: '#c62828' }}>
                            {formatCurrency(parca.maliyet)}
                          </TableCell>
                          <TableCell align="right">{formatCurrency(parca.satis_fiyati)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency((parseInt(parca.adet) || 1) * (parseFloat(parca.satis_fiyati) || 0))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">Ürün bilgisi bulunamadı</Typography>
              )}
            </CardContent>
          </Card>

          {/* Finansal Özet */}
          <Card variant="outlined">
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>Finansal Özet</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Toplam Satış</Typography>
                    <Typography variant="h6" sx={{ color: '#2e7d32' }}>
                      {formatCurrency(selectedAksesuar.toplam_satis)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Toplam Maliyet</Typography>
                    <Typography variant="h6" sx={{ color: '#c62828' }}>
                      {formatCurrency(selectedAksesuar.toplam_maliyet)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Net Kar</Typography>
                    <Typography 
                      variant="h6" 
                      fontWeight={700}
                      sx={{ color: parseFloat(selectedAksesuar.kar) >= 0 ? '#2e7d32' : '#c62828' }}
                    >
                      {formatCurrency(selectedAksesuar.kar)}
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
      <Button onClick={onClose} variant="contained" sx={{ bgcolor: '#04A7B8' }}>
        Kapat
      </Button>
    </DialogActions>
  </Dialog>
);

export default AksesuarDetayModal;
