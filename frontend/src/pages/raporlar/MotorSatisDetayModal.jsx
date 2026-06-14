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
  Divider,
} from '@mui/material';
import {
  TwoWheeler as TwoWheelerIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { formatCurrency } from './raporlarUtils';

const MotorSatisDetayModal = ({ open, onClose, isMobile, selectedMotorSatis }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    fullScreen={isMobile}
  >
    <DialogTitle sx={{ 
      background: 'linear-gradient(135deg, #e65100 0%, #ff8c00 100%)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TwoWheelerIcon />
        <Typography variant="h6" fontWeight={700}>Motor Satış Detayı</Typography>
      </Box>
      <IconButton 
        onClick={onClose}
        sx={{ color: 'white' }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent sx={{ p: 3 }}>
      {selectedMotorSatis && (
        <Box>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} color="#e65100" gutterBottom>
                {selectedMotorSatis.model_adi || 'Motor'}
              </Typography>
              {selectedMotorSatis.cc && (
                <Chip label={`${selectedMotorSatis.cc} cc`} size="small" sx={{ mb: 2, bgcolor: '#fff3e0', color: '#e65100' }} />
              )}
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Müşteri</Typography>
                  <Typography fontWeight={600}>{selectedMotorSatis.musteri_adi || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Telefon</Typography>
                  <Typography fontWeight={600}>{selectedMotorSatis.musteri_telefon || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Oluşturan Kişi</Typography>
                  <Typography fontWeight={600}>
                    {selectedMotorSatis.olusturan_kisi || selectedMotorSatis.olusturan_ad_soyad || '-'}
                  </Typography>
                  {selectedMotorSatis.olusturan_kisi !== 'Ortak' && selectedMotorSatis.olusturan_kullanici_adi && (
                    <Typography variant="caption" color="text.secondary">
                      @{selectedMotorSatis.olusturan_kullanici_adi}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Satış Tarihi</Typography>
                  <Typography fontWeight={600}>
                    {selectedMotorSatis.tarih ? format(new Date(selectedMotorSatis.tarih + 'T12:00:00'), 'dd.MM.yyyy', { locale: tr }) : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Durum</Typography>
                  <Chip 
                    size="small"
                    label={selectedMotorSatis.durum === 'tamamlandi' ? 'Tamamlandı' : selectedMotorSatis.durum === 'iptal' ? 'İptal' : 'Beklemede'}
                    sx={{
                      bgcolor: selectedMotorSatis.durum === 'tamamlandi' ? '#e8f5e9' : selectedMotorSatis.durum === 'iptal' ? '#ffebee' : '#fff3e0',
                      color: selectedMotorSatis.durum === 'tamamlandi' ? '#2e7d32' : selectedMotorSatis.durum === 'iptal' ? '#c62828' : '#e65100',
                      fontWeight: 600
                    }}
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>Fiyat Bilgileri</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Alış Fiyatı</Typography>
                  <Typography fontWeight={600} sx={{ color: '#c62828' }}>
                    {formatCurrency(selectedMotorSatis.alis_fiyati)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">İskontolu Alış</Typography>
                  <Typography fontWeight={600} sx={{ color: '#c62828' }}>
                    {formatCurrency(selectedMotorSatis.iskontolu_alis_fiyati || selectedMotorSatis.alis_fiyati)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Satış Fiyatı</Typography>
                  <Typography fontWeight={600} sx={{ color: '#2e7d32' }}>
                    {formatCurrency(selectedMotorSatis.satis_fiyati)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Fatura Fiyatı</Typography>
                  <Typography fontWeight={600}>
                    {formatCurrency(selectedMotorSatis.fatura_fiyati)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Card sx={{ bgcolor: '#e8f5e9', p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={700}>Net Kar</Typography>
                      <Typography variant="h5" fontWeight={800} sx={{ color: parseFloat(selectedMotorSatis.kar) >= 0 ? '#2e7d32' : '#c62828' }}>
                        {formatCurrency(selectedMotorSatis.kar)}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>Ödeme Bilgileri</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Ödeme Şekli</Typography>
                  <Typography fontWeight={600}>
                    {selectedMotorSatis.odeme_sekli === 'nakit' ? 'Nakit' : 
                     selectedMotorSatis.odeme_sekli === 'kredi_karti' ? 'Kredi Kartı' :
                     selectedMotorSatis.odeme_sekli === 'havale' ? 'Havale' :
                     selectedMotorSatis.odeme_sekli === 'karisik' ? 'Karışık' : selectedMotorSatis.odeme_sekli || '-'}
                  </Typography>
                </Grid>
                {selectedMotorSatis.odeme_sekli === 'karisik' && (
                  <>
                    {selectedMotorSatis.nakit_tutar > 0 && (
                      <Grid item xs={6} sm={4}>
                        <Typography variant="body2" color="text.secondary">Nakit</Typography>
                        <Typography fontWeight={600}>{formatCurrency(selectedMotorSatis.nakit_tutar)}</Typography>
                      </Grid>
                    )}
                    {selectedMotorSatis.kart_tutar > 0 && (
                      <Grid item xs={6} sm={4}>
                        <Typography variant="body2" color="text.secondary">Kredi Kartı</Typography>
                        <Typography fontWeight={600}>{formatCurrency(selectedMotorSatis.kart_tutar)}</Typography>
                      </Grid>
                    )}
                    {selectedMotorSatis.havale_tutar > 0 && (
                      <Grid item xs={6} sm={4}>
                        <Typography variant="body2" color="text.secondary">Havale</Typography>
                        <Typography fontWeight={600}>{formatCurrency(selectedMotorSatis.havale_tutar)}</Typography>
                      </Grid>
                    )}
                  </>
                )}
              </Grid>

              {selectedMotorSatis.aciklama && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>Açıklama</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedMotorSatis.aciklama}</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </DialogContent>
    <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
      <Button onClick={onClose} variant="contained" sx={{ bgcolor: '#e65100' }}>
        Kapat
      </Button>
    </DialogActions>
  </Dialog>
);

export default MotorSatisDetayModal;
