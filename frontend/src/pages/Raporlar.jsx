import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  CalendarMonth as CalendarIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon,
  MoneyOff as MoneyOffIcon,
  Assignment as AssignmentIcon,
  DirectionsCar as DirectionsCarIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { raporService } from '../services/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// Stat Card Component
const StatCard = ({ title, value, icon, color, variant = 'default' }) => (
  <Card 
    sx={{ 
      height: '100%',
      ...(variant === 'highlight' && {
        bgcolor: color,
        color: 'white',
      }),
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {React.cloneElement(icon, { 
          sx: { 
            fontSize: 20, 
            color: variant === 'highlight' ? 'rgba(255,255,255,0.8)' : color 
          } 
        })}
        <Typography 
          variant="body2" 
          sx={{ 
            color: variant === 'highlight' ? 'rgba(255,255,255,0.9)' : 'text.secondary',
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
      </Box>
      <Typography 
        variant="h5" 
        fontWeight={800}
        sx={{ color: variant === 'highlight' ? 'white' : color }}
      >
        {value}
      </Typography>
    </CardContent>
  </Card>
);

function Raporlar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Günlük Rapor State
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [gunlukRapor, setGunlukRapor] = useState(null);
  
  // Fiş Kar State
  const [fisKarTarih, setFisKarTarih] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [fisKarRapor, setFisKarRapor] = useState(null);

  // Detay Modal State
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 0) {
      loadGunlukRapor();
    } else {
      loadFisKarRapor();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedDate, endDate, fisKarTarih]);

  const loadGunlukRapor = async () => {
    try {
      setLoading(true);
      const response = await raporService.getAralik(selectedDate, endDate);
      setGunlukRapor(response.data);
    } catch (error) {
      console.error('Günlük rapor hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFisKarRapor = async () => {
    try {
      setLoading(true);
      const response = await raporService.getFisKar(fisKarTarih);
      setFisKarRapor(response.data);
    } catch (error) {
      console.error('Fiş kar rapor hatası:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleViewDetail = async (workOrder) => {
    try {
      const response = await raporService.getIsEmriDetay(workOrder.id);
      setSelectedWorkOrder(response.data);
      setDetailModalOpen(true);
    } catch (error) {
      console.error('İş emri detay hatası:', error);
    }
  };
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const renderGunlukRapor = () => (
    <Box>
      {/* Tarih Aralığı Seçici */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm="auto">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon color="primary" />
                <Typography variant="body2" fontWeight={600} sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Tarih Aralığı
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={5} md={3}>
              <TextField
                type="date"
                label="Başlangıç Tarihi"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={5} md={3}>
              <TextField
                type="date"
                label="Bitiş Tarihi"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              <Chip 
                label={selectedDate && endDate ? 
                  `${format(new Date(selectedDate), 'd MMM yyyy', { locale: tr })} - ${format(new Date(endDate), 'd MMM yyyy', { locale: tr })}` 
                  : 'Tarih Seçin'}
                color="primary"
                variant="outlined"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      ) : gunlukRapor ? (
        <>
          {/* Özet Kartları */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="İş Emri Sayısı"
                value={gunlukRapor.genel_ozet?.toplam_is || gunlukRapor.ozet?.toplam_is_emri || 0}
                icon={<AssignmentIcon />}
                color="#04A7B8"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Toplam Gelir"
                value={formatCurrency(gunlukRapor.genel_ozet?.toplam_gelir || gunlukRapor.ozet?.toplam_gelir || 0)}
                icon={<AttachMoneyIcon />}
                color="#2e7d32"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Toplam Maliyet"
                value={formatCurrency(gunlukRapor.genel_ozet?.toplam_maliyet || gunlukRapor.ozet?.toplam_maliyet || 0)}
                icon={<MoneyOffIcon />}
                color="#c62828"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Net Kar"
                value={formatCurrency(gunlukRapor.genel_ozet?.net_kar || gunlukRapor.ozet?.net_kar || 0)}
                icon={<TrendingUpIcon />}
                color="#04A7B8"
                variant="highlight"
              />
            </Grid>
          </Grid>

          {/* Günlük Veriler Tablosu */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Günlük Özet</Typography>
              </Box>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: { xs: 600, sm: '100%' } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tarih</TableCell>
                      <TableCell align="center">İş Sayısı</TableCell>
                      <TableCell align="right">Gelir</TableCell>
                      <TableCell align="right">Maliyet</TableCell>
                      <TableCell align="right">Kar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(gunlukRapor.gunluk_veriler || gunlukRapor.is_emirleri || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                          <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                          <Typography color="text.secondary">Bu tarih aralığında iş emri bulunmuyor</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      (gunlukRapor.gunluk_veriler || []).map((item, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography fontWeight={600}>
                              {format(new Date(item.tarih), 'd MMMM yyyy', { locale: tr })}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={item.is_sayisi} size="small" color="primary" />
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600} sx={{ color: '#2e7d32' }}>
                              {formatCurrency(item.toplam_gelir)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ color: '#c62828' }}>
                              {formatCurrency(item.toplam_maliyet)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              fontWeight={700}
                              sx={{ color: parseFloat(item.toplam_kar) >= 0 ? '#2e7d32' : '#c62828' }}
                            >
                              {formatCurrency(item.toplam_kar)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Detaylı İş Emirleri Listesi */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: { xs: 1.5, sm: 2.5 }, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <DirectionsCarIcon color="primary" />
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Tarih Aralığındaki İş Emirleri
                </Typography>
                {gunlukRapor.detayli_is_emirleri && (
                  <Chip 
                    label={`${gunlukRapor.detayli_is_emirleri.length} iş emri`} 
                    size="small" 
                    color="primary" 
                    sx={{ ml: { xs: 0, sm: 'auto' } }}
                  />
                )}
              </Box>
              
              {isMobile ? (
                /* Mobile Card View */
                <Box sx={{ p: 1.5 }}>
                  {(!gunlukRapor.detayli_is_emirleri || gunlukRapor.detayli_is_emirleri.length === 0) ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary">Bu tarih aralığında iş emri bulunmuyor</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {gunlukRapor.detayli_is_emirleri.map((isEmri) => (
                        <Card key={isEmri.id} sx={{ overflow: 'hidden', bgcolor: '#fafafa' }}>
                          <CardContent sx={{ p: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="subtitle2" fontWeight={700} color="primary.main" noWrap>
                                  {isEmri.fis_no}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                  {format(new Date(isEmri.created_at), 'dd.MM.yyyy', { locale: tr })}
                                </Typography>
                              </Box>
                              <Chip
                                size="small"
                                label={isEmri.durum === 'beklemede' ? 'Beklemede' : 'Tamamlandı'}
                                sx={{
                                  bgcolor: isEmri.durum === 'beklemede' ? '#fff3e0' : '#e8f5e9',
                                  color: isEmri.durum === 'beklemede' ? '#e65100' : '#2e7d32',
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: '20px',
                                  flexShrink: 0,
                                }}
                              />
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            <Box sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Müşteri</Typography>
                              <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: '0.875rem' }}>
                                {isEmri.musteri_ad_soyad}
                              </Typography>
                              {isEmri.telefon && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                  {isEmri.telefon}
                                </Typography>
                              )}
                            </Box>

                            <Box sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Araç</Typography>
                              <Typography variant="body2" noWrap sx={{ fontSize: '0.875rem' }}>
                                {isEmri.marka} {isEmri.model_tip}
                              </Typography>
                              {isEmri.km && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                  {isEmri.km} km
                                </Typography>
                              )}
                            </Box>

                            {isEmri.olusturan_ad_soyad && (
                              <Box sx={{ mb: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Oluşturan</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Avatar sx={{ width: 20, height: 20, fontSize: '0.65rem', bgcolor: 'primary.main' }}>
                                    <PersonIcon sx={{ fontSize: '0.8rem' }} />
                                  </Avatar>
                                  <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: '0.8rem' }}>
                                      {isEmri.olusturan_ad_soyad}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            )}

                            <Divider sx={{ my: 1 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Gelir</Typography>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#2e7d32', fontSize: '0.9rem' }} noWrap>
                                  {formatCurrency(isEmri.gercek_toplam_ucret)}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right', minWidth: 0, flex: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Kar</Typography>
                                <Typography 
                                  variant="subtitle2" 
                                  fontWeight={700}
                                  sx={{ 
                                    fontSize: '0.9rem',
                                    color: parseFloat(isEmri.kar) >= 0 ? '#2e7d32' : '#c62828',
                                  }}
                                  noWrap
                                >
                                  {formatCurrency(isEmri.kar)}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetail(isEmri)}
                                sx={{ color: 'primary.main', p: 0.5 }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Box>
              ) : (
                /* Desktop Table View */
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: { xs: 900, sm: '100%' } }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Fiş No</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Tarih</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Müşteri</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Araç</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Arıza/Şikayet</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Oluşturan</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Durum</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Gelir</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Kar</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>İşlem</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(!gunlukRapor.detayli_is_emirleri || gunlukRapor.detayli_is_emirleri.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                          <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                          <Typography color="text.secondary">Bu tarih aralığında iş emri bulunmuyor</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      gunlukRapor.detayli_is_emirleri.map((isEmri) => (
                        <TableRow key={isEmri.id} hover>
                          <TableCell>
                            <Typography fontWeight={700} color="primary.main">{isEmri.fis_no}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {format(new Date(isEmri.created_at), 'dd.MM.yyyy', { locale: tr })}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={600}>{isEmri.musteri_ad_soyad}</Typography>
                            <Typography variant="caption" color="text.secondary">{isEmri.telefon}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{isEmri.marka} {isEmri.model_tip}</Typography>
                            {isEmri.km && <Typography variant="caption" color="text.secondary">{isEmri.km} km</Typography>}
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                maxWidth: 200, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {isEmri.ariza_sikayetler || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                                <PersonIcon fontSize="small" />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {isEmri.olusturan_ad_soyad || '-'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  @{isEmri.olusturan_kullanici_adi || '-'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={isEmri.durum === 'beklemede' ? 'Beklemede' : 'Tamamlandı'}
                              sx={{
                                bgcolor: isEmri.durum === 'beklemede' ? '#fff3e0' : '#e8f5e9',
                                color: isEmri.durum === 'beklemede' ? '#e65100' : '#2e7d32',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600} sx={{ color: '#2e7d32' }}>
                              {formatCurrency(isEmri.gercek_toplam_ucret)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              fontWeight={700}
                              sx={{ color: parseFloat(isEmri.kar) >= 0 ? '#2e7d32' : '#c62828' }}
                            >
                              {formatCurrency(isEmri.kar)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Detayları Gör">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetail(isEmri)}
                                sx={{ color: 'primary.main' }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              )}
            </CardContent>
          </Card>

          {/* Giderler */}
          {gunlukRapor.giderler && gunlukRapor.giderler.length > 0 && (
            <Card>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Giderler</Typography>
                </Box>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: { xs: 500, sm: '100%' } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Açıklama</TableCell>
                        <TableCell>Kategori</TableCell>
                        <TableCell align="right">Tutar</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {gunlukRapor.giderler.map((g) => (
                        <TableRow key={g.id} hover>
                          <TableCell>{g.aciklama}</TableCell>
                          <TableCell>
                            <Chip 
                              size="small" 
                              label={g.kategori || 'Genel'} 
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600} sx={{ color: '#c62828' }}>
                              {formatCurrency(g.tutar)}
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
        </>
      ) : null}
    </Box>
  );

  const renderFisKarRapor = () => (
    <Box>
      {/* Tarih Seçici */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <ReceiptIcon color="primary" />
            <TextField
              type="date"
              label="Tarih Seçin"
              value={fisKarTarih}
              onChange={(e) => setFisKarTarih(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              Her fişin kar/zarar durumunu görüntüleyin
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      ) : fisKarRapor ? (
        <>
          {/* Toplam Özet */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={4}>
              <StatCard
                title="Toplam Gelir"
                value={formatCurrency(fisKarRapor.toplam.gelir)}
                icon={<AttachMoneyIcon />}
                color="#2e7d32"
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <StatCard
                title="Toplam Maliyet"
                value={formatCurrency(fisKarRapor.toplam.maliyet)}
                icon={<MoneyOffIcon />}
                color="#c62828"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Toplam Kar"
                value={formatCurrency(fisKarRapor.toplam.kar)}
                icon={<TrendingUpIcon />}
                color="#1a237e"
                variant="highlight"
              />
            </Grid>
          </Grid>

          {/* Fiş Tablosu */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Fiş Kar Analizi</Typography>
              </Box>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: { xs: 700, sm: '100%' } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fiş No</TableCell>
                      <TableCell>Müşteri</TableCell>
                      <TableCell>Araç</TableCell>
                      <TableCell align="center">Durum</TableCell>
                      <TableCell align="right">Gelir</TableCell>
                      <TableCell align="right">Maliyet</TableCell>
                      <TableCell align="right">Kar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fisKarRapor.fisler.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                          <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                          <Typography color="text.secondary">Bu tarihte fiş bulunmuyor</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      fisKarRapor.fisler.map((f) => (
                        <TableRow key={f.id} hover>
                          <TableCell>
                            <Typography fontWeight={700} color="primary.main">{f.fis_no}</Typography>
                          </TableCell>
                          <TableCell>{f.musteri_ad_soyad}</TableCell>
                          <TableCell>{f.marka} {f.model_tip}</TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={f.durum === 'acik' ? 'Açık' : 'Kapalı'}
                              sx={{
                                bgcolor: f.durum === 'acik' ? '#fff3e0' : '#e8f5e9',
                                color: f.durum === 'acik' ? '#e65100' : '#2e7d32',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ color: '#2e7d32' }}>
                              {formatCurrency(f.gercek_toplam_ucret)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ color: '#c62828' }}>
                              {formatCurrency(f.toplam_maliyet)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              fontWeight={700}
                              sx={{ 
                                color: parseFloat(f.kar) >= 0 ? '#2e7d32' : '#c62828'
                              }}
                            >
                              {formatCurrency(f.kar)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      ) : null}
    </Box>
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Raporlar
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gelir, gider ve kar analizlerinizi görüntüleyin
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              py: 2,
            },
          }}
        >
          <Tab 
            label="Günlük Rapor" 
            icon={<CalendarIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Fiş Kar Analizi" 
            icon={<ReceiptIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Card>

      {activeTab === 0 && renderGunlukRapor()}
      {activeTab === 1 && renderFisKarRapor()}

      {/* İş Emri Detay Modal */}
      <Dialog 
        open={detailModalOpen} 
        onClose={() => setDetailModalOpen(false)}
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
            onClick={() => setDetailModalOpen(false)}
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
                        {selectedWorkOrder.olusturan_ad_soyad || '-'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        @{selectedWorkOrder.olusturan_kullanici_adi || '-'}
                      </Typography>
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
                                <Typography fontWeight={600}>{parca.parca_adi}</Typography>
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
          <Button onClick={() => setDetailModalOpen(false)} variant="contained">
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Raporlar;
