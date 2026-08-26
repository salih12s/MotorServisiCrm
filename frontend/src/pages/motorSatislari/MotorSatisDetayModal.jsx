import React from 'react';
import {
  Box, Paper, Typography, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, Tooltip, Grid, Card, CardContent,
  Avatar, Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  TwoWheeler as MotorIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const DAMGA_VERGISI = 791;
const KDV_ORANI = 20;

const MotorSatisDetayModal = ({
  open,
  onClose,
  isMobile,
  selectedSatisDetay,
  modeller,
  formatCurrency,
  formatDate,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 2 },
          m: { xs: 0, sm: 2 },
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: { xs: 1.5, sm: 2 },
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <Avatar sx={{ bgcolor: 'info.main', width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}>
            <InfoIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
          </Avatar>
          <Box>
            <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={700}>
              Satış Detayları
            </Typography>
            {selectedSatisDetay && (
              <Typography variant="caption" color="text.secondary">
                Şase No: {selectedSatisDetay.sase_no}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            bgcolor: 'grey.200',
            '&:hover': { bgcolor: 'grey.300' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
        {selectedSatisDetay && (() => {
          // Hesaplamaları her zaman fatura fiyatı üzerinden yap (Türkiye vergi mevzuatına göre)
          const satis = selectedSatisDetay;
          const model = modeller.find(m => m.id === satis.motor_modeli_id);
          const otvOrani = parseFloat(model?.otv_orani || satis.otv_orani || 0);

          // Temel değerler
          const alisFiyati = parseFloat(satis.alis_fiyati || 0);
          const satisFiyati = parseFloat(satis.satis_fiyati || 0);
          const faturaFiyati = parseFloat(satis.fatura_fiyati || 0);
          const iskontoOrani = parseFloat(satis.iskonto || 0);

          // Doğru hesaplama: Fatura Fiyatı = Matrah × (1 + ÖTV) × (1 + KDV)
          // Matrah = Fatura Fiyatı / ((1 + ÖTV Oranı) × (1 + KDV Oranı))
          const matrahSatis = faturaFiyati / ((1 + otvOrani / 100) * (1 + KDV_ORANI / 100));

          // ÖTV = Matrah × ÖTV Oranı
          const otvTutari = matrahSatis * (otvOrani / 100);

          // KDV Matrahı (KDV'siz Tutar) = Matrah + ÖTV
          const kdvsizTutar = matrahSatis + otvTutari;

          // KDV = KDV Matrahı × KDV Oranı
          const kdvTutari = kdvsizTutar * (KDV_ORANI / 100);

          // İskonto hesaplaması - doğrudan alış fiyatı üzerinden
          const iskontoTutari = alisFiyati * (iskontoOrani / 100);
          const iskontoluAlis = alisFiyati - iskontoTutari;

          // Vergiler toplamı
          const damgaVergisi = DAMGA_VERGISI;
          const vergilerToplami = kdvTutari + otvTutari + damgaVergisi;

          // Kar = Satış Fiyatı - Vergiler Toplamı - İskontolu Alış
          const kar = satisFiyati - vergilerToplami - iskontoluAlis;
          const isClosed = ['tamamlandi', 'iptal', 'iptal_edildi'].includes(satis.durum);
          const currentDebt = isClosed ? 0 : Number(satis.kalan_bakiye ?? Math.max(
            satisFiyati
            - Number(satis.nakit_tutar || 0)
            - Number(satis.kart_tutar || 0)
            - Number(satis.havale_tutar || 0),
            0
          ));

          return (
            <Grid container spacing={2}>
              {/* Motor & Genel Bilgiler */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'primary.main' }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 28, height: 28 }}>
                        <MotorIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={700}>Motor Bilgileri</Typography>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
                      <Paper sx={{ p: 1, bgcolor: 'grey.50' }}>
                        <Typography variant="caption" color="text.secondary" fontSize="0.65rem">Tarih</Typography>
                        <Typography variant="body2" fontWeight={600} fontSize="0.75rem">{formatDate(satis.tarih)}</Typography>
                      </Paper>
                      <Paper sx={{ p: 1, bgcolor: 'grey.50' }}>
                        <Typography variant="caption" color="text.secondary" fontSize="0.65rem">Şase No</Typography>
                        <Typography variant="body2" fontWeight={600} fontSize="0.75rem">{satis.sase_no}</Typography>
                      </Paper>
                      <Paper sx={{ p: 1, bgcolor: 'grey.50' }}>
                        <Typography variant="caption" color="text.secondary" fontSize="0.65rem">Motor Modeli</Typography>
                        <Typography variant="body2" fontWeight={600} fontSize="0.75rem">{model?.model_adi || satis.model_adi || '-'}</Typography>
                      </Paper>
                      <Paper sx={{ p: 1, bgcolor: 'grey.50' }}>
                        <Typography variant="caption" color="text.secondary" fontSize="0.65rem">CC / ÖTV Oranı</Typography>
                        <Typography variant="body2" fontWeight={600} fontSize="0.75rem">{model?.cc || satis.cc || '-'} cc / %{otvOrani}</Typography>
                      </Paper>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Müşteri Bilgileri - TABLODA OLMAYAN */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'secondary.main' }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 28, height: 28 }}>
                        <PersonIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={700}>Müşteri Bilgileri</Typography>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
                      <Paper sx={{ p: 1, bgcolor: 'grey.50' }}>
                        <Typography variant="caption" color="text.secondary" fontSize="0.65rem">Müşteri Adı</Typography>
                        <Typography variant="body2" fontWeight={600} fontSize="0.75rem">{satis.musteri_adi || '-'}</Typography>
                      </Paper>
                      <Paper sx={{ p: 1, bgcolor: 'grey.50' }}>
                        <Typography variant="caption" color="text.secondary" fontSize="0.65rem">Telefon</Typography>
                        <Typography variant="body2" fontWeight={600} fontSize="0.75rem">{satis.musteri_telefon || '-'}</Typography>
                      </Paper>
                      <Paper sx={{ p: 1, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200', gridColumn: 'span 2' }}>
                        <Typography variant="caption" color="info.main" fontSize="0.65rem">TC Kimlik No</Typography>
                        <Typography variant="body2" fontWeight={700} color="info.main" fontSize="0.85rem">{satis.tc_kimlik_no || '-'}</Typography>
                      </Paper>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Fiyat Bilgileri */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'success.main' }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'success.main', width: 28, height: 28 }}>
                        <MoneyIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={700}>Fiyat Bilgileri</Typography>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
                      <Paper sx={{ p: 1, bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200' }}>
                        <Typography variant="caption" color="error.main" fontSize="0.65rem">Alış Fiyatı</Typography>
                        <Typography variant="body2" fontWeight={700} color="error.main" fontSize="0.8rem">{formatCurrency(alisFiyati)}</Typography>
                      </Paper>
                      <Paper sx={{ p: 1, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                        <Typography variant="caption" color="success.main" fontSize="0.65rem">Satış Fiyatı</Typography>
                        <Typography variant="body2" fontWeight={700} color="success.main" fontSize="0.8rem">{formatCurrency(satisFiyati)}</Typography>
                      </Paper>
                      <Paper sx={{ p: 1, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                        <Typography variant="caption" color="info.main" fontSize="0.65rem">Fatura Fiyatı</Typography>
                        <Typography variant="body2" fontWeight={700} color="info.main" fontSize="0.8rem">{formatCurrency(faturaFiyati)}</Typography>
                      </Paper>
                      <Paper sx={{ p: 1, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                        <Typography variant="caption" color="primary.main" fontSize="0.65rem">Matrah Satış</Typography>
                        <Typography variant="body2" fontWeight={700} color="primary.main" fontSize="0.8rem">{formatCurrency(matrahSatis)}</Typography>
                      </Paper>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* İskonto ve Ödeme Bilgileri */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'warning.main' }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 28, height: 28 }}>
                        <ReceiptIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={700}>İskonto & Ödeme</Typography>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.75 }}>
                      <Paper sx={{ p: 1, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                        <Typography variant="caption" color="warning.dark" fontSize="0.65rem">İskonto Oranı</Typography>
                        <Typography variant="body1" fontWeight={700} color="warning.dark">%{iskontoOrani}</Typography>
                      </Paper>
                      <Paper sx={{ p: 1, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                        <Typography variant="caption" color="warning.dark" fontSize="0.65rem">İskonto Tutarı</Typography>
                        <Typography variant="body2" fontWeight={700} color="warning.dark" fontSize="0.75rem">{formatCurrency(iskontoTutari)}</Typography>
                      </Paper>
                      <Paper sx={{ p: 1, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                        <Typography variant="caption" color="info.main" fontSize="0.65rem">İskontolu Alış</Typography>
                        <Typography variant="body2" fontWeight={700} color="info.main" fontSize="0.75rem">{formatCurrency(iskontoluAlis)}</Typography>
                      </Paper>
                    </Box>
                    <Paper sx={{ p: 1, mt: 0.75, bgcolor: 'grey.100', border: '1px solid', borderColor: 'grey.300' }}>
                      <Typography variant="caption" color="text.secondary" fontSize="0.65rem">Ödeme Şekli</Typography>
                      <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
                        {satis.odeme_sekli === 'nakit' ? '💵 Nakit' :
                         satis.odeme_sekli === 'kart' ? '💳 Kart' :
                         satis.odeme_sekli === 'havale' ? '🏦 Havale/EFT' :
                         satis.odeme_sekli === 'kredi' ? '📅 Kredi' :
                         satis.odeme_sekli === 'karisik' ? (() => {
                           const odemeler = [];
                           if (parseFloat(satis.nakit_tutar || 0) > 0) odemeler.push('Nakit');
                           if (parseFloat(satis.kart_tutar || 0) > 0) odemeler.push('Kart');
                           if (parseFloat(satis.havale_tutar || 0) > 0) odemeler.push('Havale');
                           return `🔀 ${odemeler.join(' / ')}`;
                         })() :
                         satis.odeme_sekli}
                      </Typography>
                      {satis.odeme_sekli === 'karisik' && (
                        <Box sx={{ mt: 0.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {parseFloat(satis.nakit_tutar || 0) > 0 && (
                            <Chip size="small" label={`💵 Nakit: ${formatCurrency(satis.nakit_tutar)}`} sx={{ fontSize: '0.7rem' }} />
                          )}
                          {parseFloat(satis.kart_tutar || 0) > 0 && (
                            <Chip size="small" label={`💳 Kart: ${formatCurrency(satis.kart_tutar)}`} sx={{ fontSize: '0.7rem' }} />
                          )}
                          {parseFloat(satis.havale_tutar || 0) > 0 && (
                            <Chip size="small" label={`🏦 Havale: ${formatCurrency(satis.havale_tutar)}`} sx={{ fontSize: '0.7rem' }} />
                          )}
                        </Box>
                      )}
                      {satis.odeme_bilgisi_girildi && !isClosed && (
                        <Chip
                          size="small"
                          label={`Güncel Borç: ${formatCurrency(currentDebt)}`}
                          sx={{ mt: .8, bgcolor: currentDebt > 0 ? '#fee2e2' : '#dcfce7', color: currentDebt > 0 ? '#b91c1c' : '#047857', fontWeight: 800 }}
                        />
                      )}
                    </Paper>
                  </CardContent>
                </Card>
              </Grid>

              {/* Vergi Bilgileri */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'error.main' }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'error.main', width: 28, height: 28 }}>
                        <ReceiptIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={700}>Vergi Bilgileri</Typography>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
                      <Paper sx={{ p: 1, bgcolor: 'grey.100' }}>
                        <Typography variant="caption" color="text.secondary" fontSize="0.65rem">KDV (%20)</Typography>
                        <Typography variant="body2" fontWeight={600} fontSize="0.75rem">{formatCurrency(kdvTutari)}</Typography>
                      </Paper>
                      <Paper sx={{ p: 1, bgcolor: 'grey.100' }}>
                        <Typography variant="caption" color="text.secondary" fontSize="0.65rem">ÖTV (%{otvOrani})</Typography>
                        <Typography variant="body2" fontWeight={600} fontSize="0.75rem">{formatCurrency(otvTutari)}</Typography>
                      </Paper>
                      <Paper sx={{ p: 1, bgcolor: 'grey.100' }}>
                        <Typography variant="caption" color="text.secondary" fontSize="0.65rem">Damga Vergisi</Typography>
                        <Typography variant="body2" fontWeight={600} fontSize="0.75rem">{formatCurrency(damgaVergisi)}</Typography>
                      </Paper>
                      <Paper sx={{ p: 1, bgcolor: 'grey.100' }}>
                        <Typography variant="caption" color="text.secondary" fontSize="0.65rem">KDVsiz Tutar</Typography>
                        <Typography variant="body2" fontWeight={600} fontSize="0.75rem">{formatCurrency(kdvsizTutar)}</Typography>
                      </Paper>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Paper sx={{ p: 1, bgcolor: 'error.100', border: '2px solid', borderColor: 'error.main' }}>
                      <Typography variant="caption" color="error.main" fontSize="0.65rem">VERGİLER TOPLAMI</Typography>
                      <Typography variant="body1" fontWeight={700} color="error.main">{formatCurrency(vergilerToplami)}</Typography>
                    </Paper>
                  </CardContent>
                </Card>
              </Grid>

              {/* Açıklama / Adres */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'grey.500' }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'grey.500', width: 28, height: 28 }}>
                        <InfoIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={700}>Açıklama / Adres</Typography>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
                      <Tooltip title={satis.aciklama || 'Açıklama girilmemiş'} arrow placement="top">
                        <Paper sx={{ p: 1, bgcolor: 'grey.50', cursor: 'pointer', height: 50, overflow: 'hidden' }}>
                          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">Açıklama</Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontSize="0.75rem"
                            noWrap
                          >
                            {satis.aciklama || '-'}
                          </Typography>
                        </Paper>
                      </Tooltip>
                      <Tooltip title={satis.adres || 'Adres girilmemiş'} arrow placement="top">
                        <Paper sx={{ p: 1, bgcolor: 'grey.50', cursor: 'pointer', height: 50, overflow: 'hidden' }}>
                          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">Adres</Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontSize="0.75rem"
                            noWrap
                          >
                            {satis.adres || '-'}
                          </Typography>
                        </Paper>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* KAR */}
              <Grid item xs={12}>
                <Card sx={{
                  background: kar >= 0
                    ? 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)'
                    : 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
                  border: '2px solid',
                  borderColor: kar >= 0 ? 'success.main' : 'error.main'
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="subtitle2" color={kar >= 0 ? 'success.dark' : 'error.dark'} gutterBottom>
                      NET KÂR
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      color={kar >= 0 ? 'success.main' : 'error.main'}
                    >
                      {formatCurrency(kar)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {formatCurrency(satisFiyati)} - {formatCurrency(vergilerToplami)} - {formatCurrency(iskontoluAlis)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

            </Grid>
          );
        })()}
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MotorSatisDetayModal;
