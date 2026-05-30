import React from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  DirectionsCar as DirectionsCarIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';

const formatTRY = (value) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value || 0);

function KullaniciIsEmriDetayDialog({ open, onClose, isMobile, workOrder }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ bgcolor: '#04A7B8', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
        <ReceiptIcon />
        <Box>
          <Typography variant="h6" fontWeight={700}>
            İş Emri Detayı - Fiş No: {workOrder?.fis_no}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {workOrder?.musteri_ad_soyad}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {workOrder && (
          <Box>
            {/* Müşteri ve Araç Bilgileri */}
            <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid', borderColor: 'primary.main' }}>
                <PersonIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>Müşteri Bilgileri</Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">Ad Soyad:</Typography>
                <Typography variant="body2" fontWeight={600}>{workOrder.musteri_ad_soyad}</Typography>
                <Typography variant="body2" color="text.secondary">Telefon:</Typography>
                <Typography variant="body2" fontWeight={600}>{workOrder.telefon || '-'}</Typography>
              </Box>
            </Card>

            <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid', borderColor: 'primary.main' }}>
                <DirectionsCarIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>Araç Bilgileri</Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">Marka:</Typography>
                <Typography variant="body2" fontWeight={600}>{workOrder.marka}</Typography>
                <Typography variant="body2" color="text.secondary">Model:</Typography>
                <Typography variant="body2" fontWeight={600}>{workOrder.model_tip || '-'}</Typography>
                <Typography variant="body2" color="text.secondary">KM:</Typography>
                <Typography variant="body2" fontWeight={600}>{workOrder.km ? `${workOrder.km} km` : '-'}</Typography>
              </Box>
            </Card>

            {/* Arıza ve Açıklama */}
            <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Arıza/Şikayetler:</Typography>
              <Typography variant="body2" sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, whiteSpace: 'pre-wrap' }}>
                {workOrder.ariza_sikayetler || '-'}
              </Typography>
              {workOrder.aciklama && (
                <>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, mt: 2 }}>Açıklama:</Typography>
                  <Typography variant="body2" sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, whiteSpace: 'pre-wrap' }}>
                    {workOrder.aciklama}
                  </Typography>
                </>
              )}
            </Card>

            {/* Parçalar */}
            {workOrder.parcalar && workOrder.parcalar.length > 0 && (
              <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                  Parçalar ({workOrder.parcalar.length})
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Parça Kodu</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Parça Adı</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Adet</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Fiyat</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Maliyet</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Toplam</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {workOrder.parcalar.map((parca, index) => (
                        <TableRow key={index}>
                          <TableCell>{parca.parca_kodu || '-'}</TableCell>
                          <TableCell>{parca.takilan_parca}</TableCell>
                          <TableCell align="center">{parca.adet}</TableCell>
                          <TableCell align="right">
                            {formatTRY(parca.birim_fiyat)}
                          </TableCell>
                          <TableCell align="right">
                            {formatTRY(parca.maliyet)}
                          </TableCell>
                          <TableCell align="right">
                            {formatTRY(parca.adet * parca.birim_fiyat)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}

            {/* Finansal Özet */}
            <Card variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Finansal Özet</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">Tahmini Ücret</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {formatTRY(workOrder.tahmini_toplam_ucret)}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">Gerçek Gelir</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#2e7d32' }}>
                    {formatTRY(workOrder.gercek_toplam_ucret)}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: workOrder.kar >= 0 ? '#e8f5e9' : '#ffebee', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">Net Kar</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: workOrder.kar >= 0 ? '#2e7d32' : '#c62828' }}>
                    {formatTRY(workOrder.kar)}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: '#036B74' }}>
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default KullaniciIsEmriDetayDialog;
