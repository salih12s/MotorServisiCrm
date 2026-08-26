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

const DURUM_MAP = {
  beklemede: { label: 'Beklemede', bg: '#fff3e0', color: '#e65100' },
  islemde: { label: 'İşlemde', bg: '#e3f2fd', color: '#0277bd' },
  odeme_bekleniyor: { label: 'Ödeme Bekleniyor', bg: '#f3e5f5', color: '#7b1fa2' },
  iptal_edildi: { label: 'İptal Edildi', bg: '#ffebee', color: '#c62828' },
};
const durumInfo = (durum) => DURUM_MAP[durum] || { label: 'Tamamlandı', bg: '#e8f5e9', color: '#2e7d32' };

const PAYMENT_LABELS = {
  nakit: 'Nakit',
  kart: 'Kart',
  kredi_karti: 'Kart',
  havale: 'Havale / EFT',
  karisik: 'Karışık',
};

const getPaymentLabel = (isEmri) => {
  const usedMethods = [
    Number(isEmri?.nakit_tutar || 0) > 0 && 'Nakit',
    Number(isEmri?.kart_tutar || 0) > 0 && 'Kart',
    Number(isEmri?.havale_tutar || 0) > 0 && 'Havale / EFT',
  ].filter(Boolean);

  if (usedMethods.length > 1) return 'Karışık';
  return usedMethods[0] || PAYMENT_LABELS[isEmri?.odeme_sekli] || 'Ödeme yok';
};

// Tek satır etiket - değer gösterimi (ör. "Ad Soyad: maraba")
function InfoRow({ label, value, color }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 2,
        py: 0.6,
        '&:not(:last-of-type)': { borderBottom: '1px solid', borderColor: 'divider' },
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>{label}</Typography>
      <Typography variant="body2" fontWeight={600} sx={{ color, textAlign: 'right' }}>{value}</Typography>
    </Box>
  );
}

// Uzun metinler için etiket üstte, metin altta (büyük boş kutu yaratmadan)
function InfoBlock({ label, value }) {
  return (
    <Box sx={{ py: 0.6, '&:not(:last-of-type)': { borderBottom: '1px solid', borderColor: 'divider' } }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>{label}</Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{value || '-'}</Typography>
    </Box>
  );
}

function SectionCard({ icon, title, action, children, sx }) {
  return (
    <Card variant="outlined" sx={{ p: 2, ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        {icon}
        <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
        {action && <Box sx={{ ml: 'auto' }}>{action}</Box>}
      </Box>
      {children}
    </Card>
  );
}

function IsEmriDetayModal({ open, onClose, isEmri, isMobile, isAdmin, onEdit }) {
  const durum = isEmri ? durumInfo(isEmri.durum) : null;
  const initialPaid = Number(isEmri?.nakit_tutar || 0) + Number(isEmri?.kart_tutar || 0) + Number(isEmri?.havale_tutar || 0);
  const totalPaid = Number(isEmri?.toplam_odenen ?? initialPaid);
  const paymentLabel = getPaymentLabel(isEmri);

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
          maxHeight: { sm: 'calc(100vh - 32px)' },
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
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
              alignItems: 'start',
            }}
          >
            {/* Müşteri Bilgileri */}
            <SectionCard icon={<PersonIcon color="primary" />} title="Müşteri Bilgileri">
              <InfoRow label="Ad Soyad" value={isEmri.musteri_ad_soyad} />
              <InfoRow label="Telefon" value={isEmri.telefon || '-'} />
            </SectionCard>

            {/* Araç Bilgileri */}
            <SectionCard icon={<DirectionsCarIcon color="primary" />} title="Araç Bilgileri">
              <InfoRow label="Marka" value={isEmri.marka} />
              <InfoRow label="Model/Tip" value={isEmri.model_tip || '-'} />
              <InfoRow label="KM" value={isEmri.km ? `${isEmri.km} km` : '-'} />
            </SectionCard>

            {/* İş Detayları */}
            <SectionCard
              icon={<ReceiptIcon color="primary" />}
              title="İş Detayları"
              sx={{ gridColumn: { md: '1 / -1' } }}
              action={
                <Chip
                  size="small"
                  label={durum.label}
                  sx={{ bgcolor: durum.bg, color: durum.color, fontWeight: 600 }}
                />
              }
            >
              <InfoBlock label="Açıklama" value={isEmri.aciklama} />
              <InfoBlock label="Arıza/Şikayetler" value={isEmri.ariza_sikayetler} />
              <InfoRow label="Oluşturma Tarihi" value={formatDate(isEmri.created_at, 'dd.MM.yyyy HH:mm')} />
              <InfoRow label="Tahmini Teslim" value={formatDate(isEmri.tahmini_teslim_tarihi, 'dd.MM.yyyy')} />
              <InfoRow
                label="Tahmini Ücret"
                value={isEmri.tahmini_toplam_ucret ? formatCurrency(isEmri.tahmini_toplam_ucret) : '-'}
                color="primary.main"
              />
            </SectionCard>

            {/* Parçalar */}
            {isEmri.parcalar && isEmri.parcalar.length > 0 && (
              <SectionCard
                icon={<ReceiptIcon color="primary" />}
                title={`Parçalar (${isEmri.parcalar.length})`}
                sx={{ gridColumn: { md: '1 / -1' } }}
              >
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
                        <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${isAdmin ? 4 : 3}, 1fr)`, gap: 1 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Adet</Typography>
                            <Typography variant="body2" fontWeight={600}>{parca.adet}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Birim Fiyat</Typography>
                            <Typography variant="body2" fontWeight={600}>{formatCurrency(parca.birim_fiyat)}</Typography>
                          </Box>
                          {isAdmin && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">Maliyet</Typography>
                              <Typography variant="body2" fontWeight={600} color="error.main">
                                {formatCurrency(parca.maliyet)}
                              </Typography>
                            </Box>
                          )}
                          <Box>
                            <Typography variant="caption" color="text.secondary">Toplam</Typography>
                            <Typography variant="body2" fontWeight={600} color="primary.main">
                              {formatCurrency(parca.adet * parca.birim_fiyat)}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                ) : (
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
              </SectionCard>
            )}

            {/* Ödeme Detayları */}
            {(isEmri.odeme_bilgisi_girildi || isEmri.odeme_detaylari) && (
              <SectionCard
                icon={<ReceiptIcon color="success" />}
                title="Ödeme Detayları"
                sx={{ gridColumn: { md: isAdmin ? 'auto' : '1 / -1' } }}
              >
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: isEmri.odeme_detaylari ? 1.2 : 0 }}>
                  {Number(isEmri.nakit_tutar) > 0 && <Chip label={`🟢 Nakit: ${formatCurrency(isEmri.nakit_tutar)}`} />}
                  {Number(isEmri.kart_tutar) > 0 && <Chip label={`🔵 Kart: ${formatCurrency(isEmri.kart_tutar)}`} />}
                  {Number(isEmri.havale_tutar) > 0 && <Chip label={`🟣 Havale: ${formatCurrency(isEmri.havale_tutar)}`} />}
                  <Chip label={`Ödenen: ${formatCurrency(totalPaid)}`} sx={{ bgcolor: '#dcfce7', color: '#047857', fontWeight: 800 }} />
                  <Chip label={`Ödeme Türü: ${paymentLabel}`} sx={{ bgcolor: '#eef2ff', color: '#4338ca', fontWeight: 800 }} />
                </Box>
                {isEmri.odeme_detaylari && <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{isEmri.odeme_detaylari}</Typography>}
              </SectionCard>
            )}

            {/* Finansal Özet - Sadece Admin */}
            {isAdmin && (
              <SectionCard icon={<AttachMoneyIcon color="primary" />} title="Finansal Özet" sx={{ bgcolor: '#f8f9fa' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1 }}>
                  <Card sx={{ p: 1.5, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                    <Typography variant="body2" color="text.secondary">Toplam Ücret</Typography>
                    <Typography variant="h6" fontWeight={700} color="primary.main">{formatCurrency(isEmri.gercek_toplam_ucret)}</Typography>
                  </Card>
                  <Card sx={{ p: 1.5, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                    <Typography variant="body2" color="text.secondary">Ödenen</Typography>
                    <Typography variant="h6" fontWeight={700} color="success.main">{formatCurrency(totalPaid)}</Typography>
                  </Card>
                  <Card sx={{ p: 1.5, textAlign: 'center', bgcolor: '#eef2ff' }}>
                    <Typography variant="body2" color="text.secondary">Ödeme Türü</Typography>
                    <Typography variant="h6" fontWeight={800} sx={{ color: '#4338ca' }}>{paymentLabel}</Typography>
                  </Card>
                  <Card sx={{ p: 1.5, textAlign: 'center', bgcolor: '#ffebee' }}>
                    <Typography variant="body2" color="text.secondary">Toplam Maliyet</Typography>
                    <Typography variant="h6" fontWeight={700} color="error.main">{formatCurrency(isEmri.toplam_maliyet)}</Typography>
                  </Card>
                  <Card sx={{ p: 1.5, textAlign: 'center', bgcolor: parseFloat(isEmri.kar) >= 0 ? '#e8f5e9' : '#ffebee' }}>
                    <Typography variant="body2" color="text.secondary">Kar</Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ color: parseFloat(isEmri.kar) >= 0 ? '#2e7d32' : '#c62828' }}>
                      {formatCurrency(isEmri.kar)}
                    </Typography>
                  </Card>
                  <Card sx={{ p: 1.5, textAlign: 'center', bgcolor: '#fff3e0' }}>
                    <Typography variant="body2" color="text.secondary">Kar Oranı</Typography>
                    <Typography variant="h6" fontWeight={700} color="warning.dark">
                      %{isEmri.gercek_toplam_ucret > 0 ? ((isEmri.kar / isEmri.gercek_toplam_ucret) * 100).toFixed(1) : 0}
                    </Typography>
                  </Card>
                </Box>
              </SectionCard>
            )}
          </Box>
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
