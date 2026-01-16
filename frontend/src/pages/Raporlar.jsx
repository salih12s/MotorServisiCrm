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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { raporService, authService } from '../services/api';
import { useCustomTheme } from '../context/ThemeContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// Stat Card Component
const StatCard = ({ title, value, icon, color, variant = 'default', isMobile = false }) => (
  <Card 
    sx={{ 
      height: '100%',
      ...(variant === 'highlight' && {
        bgcolor: color,
        color: 'white',
      }),
    }}
  >
    <CardContent sx={{ p: isMobile ? 1.5 : 2, '&:last-child': { pb: isMobile ? 1.5 : 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        {React.cloneElement(icon, { 
          sx: { 
            fontSize: isMobile ? 16 : 20, 
            color: variant === 'highlight' ? 'rgba(255,255,255,0.8)' : color 
          } 
        })}
        <Typography 
          variant="body2" 
          sx={{ 
            color: variant === 'highlight' ? 'rgba(255,255,255,0.9)' : 'text.secondary',
            fontWeight: 500,
            fontSize: isMobile ? '0.7rem' : '0.875rem',
          }}
        >
          {title}
        </Typography>
      </Box>
      <Typography 
        variant={isMobile ? 'h6' : 'h5'}
        fontWeight={800}
        sx={{ 
          color: variant === 'highlight' ? 'white' : color,
          fontSize: isMobile ? '1.1rem' : '1.5rem',
        }}
      >
        {value}
      </Typography>
    </CardContent>
  </Card>
);

function Raporlar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { setAksesuarTheme, setDefaultTheme } = useCustomTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Günlük Rapor State
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [gunlukRapor, setGunlukRapor] = useState(null);
  
  // Oluşturan Kişi Filtresi
  const [kullanicilar, setKullanicilar] = useState([]);
  const [selectedKullanici, setSelectedKullanici] = useState('');
  
  // Fiş Kar State
  const [fisKarBaslangic, setFisKarBaslangic] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [fisKarBitis, setFisKarBitis] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [fisKarRapor, setFisKarRapor] = useState(null);

  // Detay Modal State
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Aksesuar Rapor State
  const [aksesuarSelectedDate, setAksesuarSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [aksesuarEndDate, setAksesuarEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [aksesuarRapor, setAksesuarRapor] = useState(null);
  const [selectedAksesuar, setSelectedAksesuar] = useState(null);
  const [aksesuarDetailModalOpen, setAksesuarDetailModalOpen] = useState(false);

  // Sıralama State'leri
  const [isEmriSortField, setIsEmriSortField] = useState('created_at');
  const [isEmriSortDirection, setIsEmriSortDirection] = useState('desc');
  const [aksesuarSortField, setAksesuarSortField] = useState('satis_tarihi');
  const [aksesuarSortDirection, setAksesuarSortDirection] = useState('desc');
  const [fisKarSortField, setFisKarSortField] = useState('created_at');
  const [fisKarSortDirection, setFisKarSortDirection] = useState('desc');

  // Kullanıcıları yükle
  useEffect(() => {
    const loadKullanicilar = async () => {
      try {
        const response = await authService.getUsers();
        setKullanicilar(response.data || []);
      } catch (error) {
        console.error('Kullanıcılar yüklenemedi:', error);
      }
    };
    loadKullanicilar();
  }, []);

  // Sekme değiştiğinde tema değişikliği
  useEffect(() => {
    if (activeTab === 1) {
      // Aksesuar Satışları sekmesi - mor tema
      setAksesuarTheme();
    } else {
      // Diğer sekmeler - varsayılan tema
      setDefaultTheme();
    }
  }, [activeTab, setAksesuarTheme, setDefaultTheme]);

  // Sayfa kapanınca varsayılan temaya dön
  useEffect(() => {
    return () => {
      setDefaultTheme();
    };
  }, [setDefaultTheme]);

  useEffect(() => {
    if (activeTab === 0) {
      loadGunlukRapor();
    } else if (activeTab === 1) {
      loadAksesuarRapor();
    } else if (activeTab === 2) {
      loadFisKarRapor();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedDate, endDate, fisKarBaslangic, fisKarBitis, aksesuarSelectedDate, aksesuarEndDate]);

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
      const response = await raporService.getFisKar(fisKarBaslangic, fisKarBitis);
      setFisKarRapor(response.data);
    } catch (error) {
      console.error('Fiş kar rapor hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAksesuarRapor = async () => {
    try {
      setLoading(true);
      const response = await raporService.getAksesuarAralik(aksesuarSelectedDate, aksesuarEndDate);
      setAksesuarRapor(response.data);
    } catch (error) {
      console.error('Aksesuar rapor hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAksesuarDetail = async (aksesuar) => {
    try {
      const response = await raporService.getAksesuarDetay(aksesuar.id);
      setSelectedAksesuar(response.data);
      setAksesuarDetailModalOpen(true);
    } catch (error) {
      console.error('Aksesuar detay hatası:', error);
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

  // Oluşturan kişiye göre filtrelenmiş iş emirleri
  const filteredIsEmirleri = gunlukRapor?.detayli_is_emirleri?.filter(isEmri => {
    if (!selectedKullanici) return true;
    return isEmri.olusturan_kullanici_adi === selectedKullanici || 
           isEmri.olusturan_ad_soyad === selectedKullanici;
  }) || [];

  // Sıralama fonksiyonu
  const sortData = (data, field, direction) => {
    return [...data].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      
      // Tarih alanları için
      if (field === 'created_at' || field === 'satis_tarihi' || field === 'tarih') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      // Sayısal alanlar için
      else if (field === 'gercek_toplam_ucret' || field === 'toplam_satis' || field === 'kar' || field === 'toplam_maliyet') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }
      
      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  };

  // Sıralanmış iş emirleri
  const sortedIsEmirleri = sortData(filteredIsEmirleri, isEmriSortField, isEmriSortDirection);

  // İş emri sıralama toggle
  const toggleIsEmriSort = (field) => {
    if (isEmriSortField === field) {
      setIsEmriSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setIsEmriSortField(field);
      setIsEmriSortDirection('desc');
    }
  };

  // Aksesuar sıralama toggle
  const toggleAksesuarSort = (field) => {
    if (aksesuarSortField === field) {
      setAksesuarSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setAksesuarSortField(field);
      setAksesuarSortDirection('desc');
    }
  };

  // Fiş kar sıralama toggle
  const toggleFisKarSort = (field) => {
    if (fisKarSortField === field) {
      setFisKarSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setFisKarSortField(field);
      setFisKarSortDirection('desc');
    }
  };

  // Sıralanmış aksesuar verileri
  const sortedAksesuarlar = aksesuarRapor?.detayli_aksesuarlar 
    ? sortData(aksesuarRapor.detayli_aksesuarlar, aksesuarSortField, aksesuarSortDirection) 
    : [];

  // Sıralanmış fiş kar verileri
  const sortedFisler = fisKarRapor?.fisler 
    ? sortData(fisKarRapor.fisler, fisKarSortField, fisKarSortDirection) 
    : [];

  // Sıralama ikonu
  const SortIcon = ({ field, currentField, direction }) => {
    if (field !== currentField) return null;
    return direction === 'asc' ? <ArrowUpwardIcon sx={{ fontSize: 16, ml: 0.5 }} /> : <ArrowDownwardIcon sx={{ fontSize: 16, ml: 0.5 }} />;
  };

  // Filtrelenmiş verilere göre özet hesaplama
  const filteredOzet = {
    toplam_is: filteredIsEmirleri.length,
    toplam_gelir: filteredIsEmirleri.reduce((sum, ie) => sum + parseFloat(ie.gercek_toplam_ucret || 0), 0),
    toplam_maliyet: filteredIsEmirleri.reduce((sum, ie) => sum + parseFloat(ie.toplam_maliyet || 0), 0),
    net_kar: filteredIsEmirleri.reduce((sum, ie) => sum + parseFloat(ie.kar || 0), 0),
  };

  const renderGunlukRapor = () => (
    <Box>
      {/* Tarih Aralığı ve Filtreler */}
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
            <Grid item xs={12} sm={5} md={2}>
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
            <Grid item xs={12} sm={5} md={2}>
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
            <Grid item xs={12} sm={5} md={3} width={180}>
              <FormControl fullWidth size="small">
                <InputLabel>Oluşturan Kişi</InputLabel>
                <Select
                  value={selectedKullanici}
                  label="Oluşturan Kişi"
                  onChange={(e) => setSelectedKullanici(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {kullanicilar.map((kullanici) => (
                    <MenuItem key={kullanici.id} value={kullanici.kullanici_adi}>
                      {kullanici.ad_soyad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
          <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="İş Emri Sayısı"
                value={selectedKullanici ? filteredOzet.toplam_is : (gunlukRapor.genel_ozet?.toplam_is || gunlukRapor.ozet?.toplam_is_emri || 0)}
                icon={<AssignmentIcon />}
                color="#04A7B8"
                isMobile={isMobile}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Toplam Gelir"
                value={formatCurrency(selectedKullanici ? filteredOzet.toplam_gelir : (gunlukRapor.genel_ozet?.toplam_gelir || gunlukRapor.ozet?.toplam_gelir || 0))}
                icon={<AttachMoneyIcon />}
                color="#2e7d32"
                isMobile={isMobile}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Toplam Maliyet"
                value={formatCurrency(selectedKullanici ? filteredOzet.toplam_maliyet : (gunlukRapor.genel_ozet?.toplam_maliyet || gunlukRapor.ozet?.toplam_maliyet || 0))}
                icon={<MoneyOffIcon />}
                color="#c62828"
                isMobile={isMobile}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Net Kar"
                value={formatCurrency(selectedKullanici ? filteredOzet.net_kar : (gunlukRapor.genel_ozet?.net_kar || gunlukRapor.ozet?.net_kar || 0))}
                icon={<TrendingUpIcon />}
                color="#04A7B8"
                variant="highlight"
                isMobile={isMobile}
              />
            </Grid>
          </Grid>

          {/* Günlük Veriler Tablosu */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: isMobile ? 1.5 : 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Günlük Özet</Typography>
              </Box>
              
              {(gunlukRapor.gunluk_veriler || gunlukRapor.is_emirleri || []).length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary">Bu tarih aralığında iş emri bulunmuyor</Typography>
                </Box>
              ) : isMobile ? (
                /* Mobile Card View for Günlük Özet */
                <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {(gunlukRapor.gunluk_veriler || []).map((item, index) => (
                    <Card key={index} variant="outlined" sx={{ bgcolor: '#fafafa' }}>
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {format(new Date(item.tarih), 'd MMMM yyyy', { locale: tr })}
                          </Typography>
                          <Chip label={`${item.is_sayisi} iş`} size="small" color="primary" sx={{ height: 22 }} />
                        </Box>
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Gelir</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#2e7d32', fontSize: '0.85rem' }}>
                              {formatCurrency(item.toplam_gelir)}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Maliyet</Typography>
                            <Typography variant="body2" sx={{ color: '#c62828', fontSize: '0.85rem' }}>
                              {formatCurrency(item.toplam_maliyet)}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Kar</Typography>
                            <Typography 
                              variant="body2" 
                              fontWeight={700}
                              sx={{ 
                                color: parseFloat(item.toplam_kar) >= 0 ? '#2e7d32' : '#c62828',
                                fontSize: '0.85rem',
                              }}
                            >
                              {formatCurrency(item.toplam_kar)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                /* Desktop Table View */
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
                      {(gunlukRapor.gunluk_veriler || []).map((item, index) => (
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
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
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
                {filteredIsEmirleri && (
                  <Chip 
                    label={`${filteredIsEmirleri.length} iş emri`} 
                    size="small" 
                    color="primary" 
                    sx={{ ml: { xs: 0, sm: 'auto' } }}
                  />
                )}
              </Box>
              
              {isMobile ? (
                /* Mobile Card View */
                <Box sx={{ p: 1.5 }}>
                  {(!filteredIsEmirleri || filteredIsEmirleri.length === 0) ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary">{selectedKullanici ? 'Bu kişiye ait iş emri bulunmuyor' : 'Bu tarih aralığında iş emri bulunmuyor'}</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {filteredIsEmirleri.map((isEmri) => (
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
                      <TableCell 
                        sx={{ fontWeight: 700, cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => toggleIsEmriSort('created_at')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          Tarih
                          <SortIcon field="created_at" currentField={isEmriSortField} direction={isEmriSortDirection} />
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Müşteri</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Araç</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Arıza/Şikayet</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Oluşturan</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Durum</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Ödeme Detayları</TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ fontWeight: 700, cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => toggleIsEmriSort('gercek_toplam_ucret')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          Gelir
                          <SortIcon field="gercek_toplam_ucret" currentField={isEmriSortField} direction={isEmriSortDirection} />
                        </Box>
                      </TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ fontWeight: 700, cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => toggleIsEmriSort('kar')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          Kar
                          <SortIcon field="kar" currentField={isEmriSortField} direction={isEmriSortDirection} />
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>İşlem</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(!sortedIsEmirleri || sortedIsEmirleri.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                          <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                          <Typography color="text.secondary">{selectedKullanici ? 'Bu kişiye ait iş emri bulunmuyor' : 'Bu tarih aralığında iş emri bulunmuyor'}</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedIsEmirleri.map((isEmri) => (
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
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {isEmri.odeme_detaylari || '-'}
                            </Typography>
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

  // Aksesuar Rapor Render
  const renderAksesuarRapor = () => (
    <Box>
      {/* Tarih Aralığı */}
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
            <Grid item xs={12} sm={5} md={2}>
              <TextField
                type="date"
                label="Başlangıç Tarihi"
                value={aksesuarSelectedDate}
                onChange={(e) => setAksesuarSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={5} md={2}>
              <TextField
                type="date"
                label="Bitiş Tarihi"
                value={aksesuarEndDate}
                onChange={(e) => setAksesuarEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              <Chip 
                label={aksesuarSelectedDate && aksesuarEndDate ? 
                  `${format(new Date(aksesuarSelectedDate), 'd MMM yyyy', { locale: tr })} - ${format(new Date(aksesuarEndDate), 'd MMM yyyy', { locale: tr })}` 
                  : 'Tarih Seçin'}
                sx={{ 
                  width: { xs: '100%', sm: 'auto' },
                  bgcolor: '#f3e5f5',
                  color: 'primary.main',
                  borderColor: 'primary.main',
                }}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : aksesuarRapor ? (
        <>
          {/* Özet Kartları */}
          <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Satış Sayısı"
                value={aksesuarRapor.genel_ozet?.toplam_satis_sayisi || 0}
                icon={<AssignmentIcon />}
                color={theme.palette.primary.main}
                isMobile={isMobile}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Toplam Satış"
                value={formatCurrency(aksesuarRapor.genel_ozet?.toplam_satis || 0)}
                icon={<AttachMoneyIcon />}
                color="#2e7d32"
                isMobile={isMobile}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Toplam Maliyet"
                value={formatCurrency(aksesuarRapor.genel_ozet?.toplam_maliyet || 0)}
                icon={<MoneyOffIcon />}
                color="#c62828"
                isMobile={isMobile}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Net Kar"
                value={formatCurrency(aksesuarRapor.genel_ozet?.toplam_kar || 0)}
                icon={<TrendingUpIcon />}
                color={theme.palette.primary.main}
                variant="highlight"
                isMobile={isMobile}
              />
            </Grid>
          </Grid>

          {/* Günlük Veriler Tablosu */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: isMobile ? 1.5 : 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingBagIcon color="primary" />
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Günlük Özet</Typography>
              </Box>
              
              {(aksesuarRapor.gunluk_veriler || []).length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <ShoppingBagIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary">Bu tarih aralığında aksesuar satışı bulunmuyor</Typography>
                </Box>
              ) : isMobile ? (
                /* Mobile Card View */
                <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {(aksesuarRapor.gunluk_veriler || []).map((item, index) => (
                    <Card key={index} variant="outlined" sx={{ bgcolor: '#faf5fc' }}>
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {format(new Date(item.tarih), 'd MMMM yyyy', { locale: tr })}
                          </Typography>
                          <Chip label={`${item.satis_sayisi} satış`} size="small" color="primary" sx={{ height: 22 }} />
                        </Box>
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Satış</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#2e7d32', fontSize: '0.85rem' }}>
                              {formatCurrency(item.toplam_satis)}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Maliyet</Typography>
                            <Typography variant="body2" sx={{ color: '#c62828', fontSize: '0.85rem' }}>
                              {formatCurrency(item.toplam_maliyet)}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Kar</Typography>
                            <Typography 
                              variant="body2" 
                              fontWeight={700}
                              sx={{ 
                                color: parseFloat(item.toplam_kar) >= 0 ? '#2e7d32' : '#c62828',
                                fontSize: '0.85rem',
                              }}
                            >
                              {formatCurrency(item.toplam_kar)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                /* Desktop Table View */
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: { xs: 600, sm: '100%' } }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f3e5f5' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Tarih</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Satış Sayısı</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Satış Tutarı</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Maliyet</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Kar</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(aksesuarRapor.gunluk_veriler || []).map((item, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography fontWeight={600}>
                              {format(new Date(item.tarih), 'd MMMM yyyy', { locale: tr })}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={item.satis_sayisi} size="small" color="primary" />
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600} sx={{ color: '#2e7d32' }}>
                              {formatCurrency(item.toplam_satis)}
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
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          {/* Detaylı Aksesuar Listesi */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: isMobile ? 1.5 : 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShoppingBagIcon color="primary" />
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Detaylı Satışlar
                  </Typography>
                </Box>
                <Chip 
                  label={`${(aksesuarRapor.detayli_aksesuarlar || []).length} satış`} 
                  size="small" 
                  color="primary"
                />
              </Box>
              
              {(aksesuarRapor.detayli_aksesuarlar || []).length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <ShoppingBagIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary">Bu tarih aralığında aksesuar satışı bulunmuyor</Typography>
                </Box>
              ) : isMobile ? (
                /* Mobile Card View */
                <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {(aksesuarRapor.detayli_aksesuarlar || []).map((aksesuar, index) => (
                    <Card key={aksesuar.id || index} variant="outlined" sx={{ bgcolor: '#faf5fc' }}>
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>{aksesuar.ad_soyad}</Typography>
                            <Typography variant="caption" color="text.secondary">{aksesuar.telefon}</Typography>
                          </Box>
                          <Tooltip title="Detay Görüntüle">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewAksesuarDetail(aksesuar)}
                              color="primary"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Satış</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#2e7d32', fontSize: '0.85rem' }}>
                              {formatCurrency(aksesuar.toplam_satis)}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Maliyet</Typography>
                            <Typography variant="body2" sx={{ color: '#c62828', fontSize: '0.85rem' }}>
                              {formatCurrency(aksesuar.toplam_maliyet)}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Kar</Typography>
                            <Typography 
                              variant="body2" 
                              fontWeight={700}
                              sx={{ color: parseFloat(aksesuar.kar) >= 0 ? '#2e7d32' : '#c62828', fontSize: '0.85rem' }}
                            >
                              {formatCurrency(aksesuar.kar)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                /* Desktop Table View */
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: { xs: 600, sm: '100%' } }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f3e5f5' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Müşteri</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Telefon</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Ödeme Şekli</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Satış</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Maliyet</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Kar</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>İşlem</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedAksesuarlar.map((aksesuar, index) => (
                        <TableRow key={aksesuar.id || index} hover>
                          <TableCell>
                            <Typography fontWeight={600}>{aksesuar.ad_soyad}</Typography>
                          </TableCell>
                          <TableCell>{aksesuar.telefon}</TableCell>
                          <TableCell>{aksesuar.odeme_sekli || '-'}</TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600} sx={{ color: '#2e7d32' }}>
                              {formatCurrency(aksesuar.toplam_satis)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ color: '#c62828' }}>
                              {formatCurrency(aksesuar.toplam_maliyet)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography 
                              fontWeight={700}
                              sx={{ color: parseFloat(aksesuar.kar) >= 0 ? '#2e7d32' : '#c62828' }}
                            >
                              {formatCurrency(aksesuar.kar)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Detay Görüntüle">
                              <IconButton 
                                size="small" 
                                onClick={() => handleViewAksesuarDetail(aksesuar)}
                                color="primary"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </Box>
  );

  const renderFisKarRapor = () => (
    <Box>
      {/* Tarih Aralığı Seçici */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm="auto">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon color="primary" />
                <Typography variant="body2" fontWeight={600} sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Tarih Aralığı
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={5} md={2}>
              <TextField
                type="date"
                label="Başlangıç Tarihi"
                value={fisKarBaslangic}
                onChange={(e) => setFisKarBaslangic(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={5} md={2}>
              <TextField
                type="date"
                label="Bitiş Tarihi"
                value={fisKarBitis}
                onChange={(e) => setFisKarBitis(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              <Chip 
                label={fisKarBaslangic && fisKarBitis ? 
                  `${format(new Date(fisKarBaslangic), 'd MMM yyyy', { locale: tr })} - ${format(new Date(fisKarBitis), 'd MMM yyyy', { locale: tr })}` 
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

          {/* İş Emirleri Tablosu */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                <DirectionsCarIcon color="primary" />
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  İş Emirleri
                </Typography>
                <Chip 
                  label={`${fisKarRapor.is_emirleri?.length || 0} kayıt`} 
                  size="small" 
                  color="primary"
                  sx={{ ml: 'auto' }} 
                />
                {fisKarRapor.is_emri_toplam && (
                  <Chip 
                    label={`Kar: ${formatCurrency(fisKarRapor.is_emri_toplam.kar)}`} 
                    size="small" 
                    sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
                  />
                )}
              </Box>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: { xs: 700, sm: '100%' } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Fiş No</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Müşteri</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Araç</TableCell>
                      <TableCell 
                        align="center" 
                        sx={{ fontWeight: 700, cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => toggleFisKarSort('created_at')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          Tarih
                          <SortIcon field="created_at" currentField={fisKarSortField} direction={fisKarSortDirection} />
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Durum</TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ fontWeight: 700, cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => toggleFisKarSort('gercek_toplam_ucret')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          Gelir
                          <SortIcon field="gercek_toplam_ucret" currentField={fisKarSortField} direction={fisKarSortDirection} />
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Maliyet</TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ fontWeight: 700, cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => toggleFisKarSort('kar')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          Kar
                          <SortIcon field="kar" currentField={fisKarSortField} direction={fisKarSortDirection} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(fisKarRapor.is_emirleri || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          <ReceiptIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                          <Typography color="text.secondary">Bu tarih aralığında iş emri bulunmuyor</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortData(fisKarRapor.is_emirleri, fisKarSortField, fisKarSortDirection).map((f) => (
                        <TableRow key={f.id} hover>
                          <TableCell>
                            <Typography fontWeight={700} color="primary.main">{f.fis_no}</Typography>
                          </TableCell>
                          <TableCell>{f.musteri_ad_soyad}</TableCell>
                          <TableCell>{f.marka} {f.model_tip}</TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {format(new Date(f.created_at), 'dd.MM.yyyy', { locale: tr })}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={f.durum === 'acik' ? 'Açık' : 'Tamamlandı'}
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

          {/* Aksesuar Satışları Tablosu */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingBagIcon color="primary" />
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Aksesuar Satışları
                </Typography>
                <Chip 
                  label={`${fisKarRapor.aksesuarlar?.length || 0} kayıt`} 
                  size="small" 
                  color="primary"
                  sx={{ ml: 'auto' }}
                />
                {fisKarRapor.aksesuar_toplam && (
                  <Chip 
                    label={`Kar: ${formatCurrency(fisKarRapor.aksesuar_toplam.kar)}`} 
                    size="small" 
                    sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
                  />
                )}
              </Box>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: { xs: 600, sm: '100%' } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Fiş No</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Müşteri</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Ödeme Şekli</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Tarih</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Satış</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Maliyet</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Kar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(fisKarRapor.aksesuarlar || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <ShoppingBagIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                          <Typography color="text.secondary">Bu tarih aralığında aksesuar satışı bulunmuyor</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      (fisKarRapor.aksesuarlar || []).map((a) => (
                        <TableRow key={a.id} hover>
                          <TableCell>
                            <Typography fontWeight={700} color="primary.main">{a.fis_no}</Typography>
                          </TableCell>
                          <TableCell>{a.musteri_ad_soyad}</TableCell>
                          <TableCell>{a.marka || '-'}</TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {format(new Date(a.created_at), 'dd.MM.yyyy', { locale: tr })}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ color: '#2e7d32' }}>
                              {formatCurrency(a.gercek_toplam_ucret)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ color: '#c62828' }}>
                              {formatCurrency(a.toplam_maliyet)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              fontWeight={700}
                              sx={{ 
                                color: parseFloat(a.kar) >= 0 ? '#2e7d32' : '#c62828'
                              }}
                            >
                              {formatCurrency(a.kar)}
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
            label="İş Emirleri" 
            icon={<DirectionsCarIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Aksesuar Satışları" 
            icon={<ShoppingBagIcon />} 
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
      {activeTab === 1 && renderAksesuarRapor()}
      {activeTab === 2 && renderFisKarRapor()}

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

      {/* Aksesuar Detay Modal */}
      <Dialog 
        open={aksesuarDetailModalOpen} 
        onClose={() => setAksesuarDetailModalOpen(false)}
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
            onClick={() => setAksesuarDetailModalOpen(false)}
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
          <Button onClick={() => setAksesuarDetailModalOpen(false)} variant="contained" sx={{ bgcolor: '#04A7B8' }}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Raporlar;
