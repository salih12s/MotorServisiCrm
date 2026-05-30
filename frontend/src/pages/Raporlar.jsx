import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
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
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  ShoppingBag as ShoppingBagIcon,
  TwoWheeler as TwoWheelerIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { raporService, authService, motorSatisService } from '../services/api';
import { useCustomTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import StatCard from './raporlar/StatCard';
import IsEmriDetayModal from './raporlar/IsEmriDetayModal';
import AksesuarDetayModal from './raporlar/AksesuarDetayModal';
import MotorSatisDetayModal from './raporlar/MotorSatisDetayModal';
import AksesuarRaporTab from './raporlar/AksesuarRaporTab';
import FisKarRaporTab from './raporlar/FisKarRaporTab';
import MotorSatisRaporTab from './raporlar/MotorSatisRaporTab';
import { formatCurrency } from './raporlar/raporlarUtils';

function Raporlar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { setAksesuarTheme, setMotorSatisTheme, setDefaultTheme } = useCustomTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Günlük Rapor State
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [gunlukRapor, setGunlukRapor] = useState(null);
  
  // Oluşturan Kişi Filtresi
  const [kullanicilar, setKullanicilar] = useState([]);
  const [selectedKullanici, setSelectedKullanici] = useState('');
  const [selectedOdemeDetay, setSelectedOdemeDetay] = useState('');
  
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
  const [aksesuarSortField] = useState('satis_tarihi');
  const [aksesuarSortDirection] = useState('desc');
  const [fisKarSortField, setFisKarSortField] = useState('created_at');
  const [fisKarSortDirection, setFisKarSortDirection] = useState('desc');

  // Seçili gün accordion state (modal yerine satır altında açılır)
  const [expandedGun, setExpandedGun] = useState(null);
  const [expandedGunIsEmirleri, setExpandedGunIsEmirleri] = useState([]);
  
  // Motor Satışları State
  const [motorSatisSelectedDate, setMotorSatisSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [motorSatisEndDate, setMotorSatisEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [motorSatislar, setMotorSatislar] = useState([]);
  const [motorModeller, setMotorModeller] = useState([]);
  const [expandedMotorSatis, setExpandedMotorSatis] = useState(null);
  
  // Motor Satış Detay Modal State (Fiş Kar Analizi için)
  const [selectedMotorSatis, setSelectedMotorSatis] = useState(null);
  const [motorSatisDetailModalOpen, setMotorSatisDetailModalOpen] = useState(false);
  
  // Navigate hook
  const navigate = useNavigate();

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
    if (activeTab === 0) {
      // Motor Satışları sekmesi - turuncu tema
      setMotorSatisTheme();
    } else if (activeTab === 2) {
      // Aksesuar Satışları sekmesi - mor tema
      setAksesuarTheme();
    } else {
      // Diğer sekmeler - varsayılan tema
      setDefaultTheme();
    }
  }, [activeTab, setAksesuarTheme, setMotorSatisTheme, setDefaultTheme]);

  // Sayfa kapanınca varsayılan temaya dön
  useEffect(() => {
    return () => {
      setDefaultTheme();
    };
  }, [setDefaultTheme]);

  useEffect(() => {
    if (activeTab === 0) {
      loadMotorSatisRapor();
    } else if (activeTab === 1) {
      loadGunlukRapor();
    } else if (activeTab === 2) {
      loadAksesuarRapor();
    } else if (activeTab === 3) {
      loadFisKarRapor();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedDate, endDate, fisKarBaslangic, fisKarBitis, aksesuarSelectedDate, aksesuarEndDate, motorSatisSelectedDate, motorSatisEndDate]);

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

  const loadMotorSatisRapor = async () => {
    try {
      setLoading(true);
      const [satisRes, modelRes] = await Promise.all([
        motorSatisService.getAll(),
        motorSatisService.getModeller()
      ]);
      
      // Tarih aralığına göre filtrele ve sadece tamamlanan satışları göster
      const filteredSatislar = (satisRes.data || []).filter(satis => {
        // Sadece tamamlandi durumundakileri göster
        if (satis.durum !== 'tamamlandi') return false;
        
        // tarih alanını kullan (backend'den YYYY-MM-DD formatında geliyor)
        const satisTarih = satis.tarih || '';
        return satisTarih >= motorSatisSelectedDate && satisTarih <= motorSatisEndDate;
      });
      
      setMotorSatislar(filteredSatislar);
      setMotorModeller(modelRes.data || []);
    } catch (error) {
      console.error('Motor satış rapor hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFisKarRapor = async () => {
    try {
      setLoading(true);
      // Hem fiş kar raporu hem de motor satışlarını çek
      const [fisKarRes, motorSatisRes] = await Promise.all([
        raporService.getFisKar(fisKarBaslangic, fisKarBitis),
        motorSatisService.getAll()
      ]);
      
      // Motor satışlarını tarih aralığına göre filtrele (sadece tamamlananlar)
      const filteredMotorSatislar = (motorSatisRes.data || []).filter(satis => {
        if (satis.durum !== 'tamamlandi') return false;
        const satisTarih = satis.tarih || '';
        return satisTarih >= fisKarBaslangic && satisTarih <= fisKarBitis;
      });
      
      // Motor satış toplamlarını hesapla
      const motorSatisToplam = filteredMotorSatislar.reduce((acc, satis) => ({
        gelir: acc.gelir + parseFloat(satis.satis_fiyati || 0),
        maliyet: acc.maliyet + parseFloat(satis.iskontolu_alis_fiyati || satis.alis_fiyati || 0),
        kar: acc.kar + parseFloat(satis.kar || 0)
      }), { gelir: 0, maliyet: 0, kar: 0 });
      
      // Fiş kar raporuna motor satışlarını ekle
      const updatedFisKarRapor = {
        ...fisKarRes.data,
        motor_satislari: filteredMotorSatislar,
        motor_satis_toplam: motorSatisToplam,
        toplam: {
          gelir: (fisKarRes.data?.toplam?.gelir || 0) + motorSatisToplam.gelir,
          maliyet: (fisKarRes.data?.toplam?.maliyet || 0) + motorSatisToplam.maliyet,
          kar: (fisKarRes.data?.toplam?.kar || 0) + motorSatisToplam.kar
        }
      };
      
      setFisKarRapor(updatedFisKarRapor);
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
    if (!isAdmin) return;
    try {
      const response = await raporService.getAksesuarDetay(aksesuar.id);
      setSelectedAksesuar(response.data);
      setAksesuarDetailModalOpen(true);
    } catch (error) {
      console.error('Aksesuar detay hatası:', error);
    }
  };

  // Motor Satış Detay Handler (Fiş Kar Analizi için)
  const handleViewMotorSatisDetail = (motorSatis) => {
    if (!isAdmin) return;
    setSelectedMotorSatis(motorSatis);
    setMotorSatisDetailModalOpen(true);
  };

  const handleViewDetail = async (workOrder) => {
    if (!isAdmin) return;
    try {
      const response = await raporService.getIsEmriDetay(workOrder.id);
      setSelectedWorkOrder(response.data);
      setDetailModalOpen(true);
    } catch (error) {
      console.error('İş emri detay hatası:', error);
    }
  };

  // Günlük özet satırına tıklandığında accordion tarzı aç/kapa
  const handleGunlukOzetClick = (gunlukVeri) => {
    const tarih = format(new Date(gunlukVeri.tarih), 'yyyy-MM-dd');
    
    // Aynı güne tıklandıysa kapat
    if (expandedGun === tarih) {
      setExpandedGun(null);
      setExpandedGunIsEmirleri([]);
      return;
    }
    
    // O günün iş emirlerini filtrele - detayli_is_emirleri kullan ve tamamlama_tarihi'ne göre filtrele
    const gunIsEmirleri = (gunlukRapor.detayli_is_emirleri || []).filter(isEmri => {
      const isEmriTarih = format(new Date(isEmri.tamamlama_tarihi || isEmri.created_at), 'yyyy-MM-dd');
      return isEmriTarih === tarih;
    });
    
    setExpandedGun(tarih);
    setExpandedGunIsEmirleri(gunIsEmirleri);
  };

  // İş emrine çift tıklayınca detay modalını aç
  const handleIsEmriDoubleClick = async (isEmri) => {
    try {
      const response = await raporService.getIsEmriDetay(isEmri.id);
      setSelectedWorkOrder(response.data);
      setDetailModalOpen(true);
    } catch (error) {
      console.error('İş emri detay hatası:', error);
    }
  };

  // Oluşturan kişiye ve ödeme detayına göre filtrelenmiş iş emirleri
  const filteredIsEmirleri = gunlukRapor?.detayli_is_emirleri?.filter(isEmri => {
    // Oluşturan kişi filtresi
    if (selectedKullanici) {
      if (selectedKullanici === 'Ortak') {
        if (isEmri.olusturan_kisi !== 'Ortak') return false;
      } else {
        // Ortak olarak kaydedilmişleri hariç tut
        if (isEmri.olusturan_kisi === 'Ortak') return false;
        const kullaniciMatch = isEmri.olusturan_kisi === selectedKullanici ||
               isEmri.olusturan_kullanici_adi === selectedKullanici || 
               isEmri.olusturan_ad_soyad === selectedKullanici;
        if (!kullaniciMatch) return false;
      }
    }
    // Ödeme detayı filtresi
    if (selectedOdemeDetay) {
      const odemeMatch = isEmri.odeme_detaylari && isEmri.odeme_detaylari.toLowerCase().includes(selectedOdemeDetay.toLowerCase());
      if (!odemeMatch) return false;
    }
    return true;
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
                  <MenuItem value="Ortak">Ortak</MenuItem>
                  {kullanicilar.map((kullanici) => (
                    <MenuItem key={kullanici.id} value={kullanici.kullanici_adi}>
                      {kullanici.ad_soyad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={5} md={2} width={180}>
              <FormControl fullWidth size="small">
                <InputLabel>Ödeme Detayı</InputLabel>
                <Select
                  value={selectedOdemeDetay}
                  label="Ödeme Detayı"
                  onChange={(e) => setSelectedOdemeDetay(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="nakit">Nakit</MenuItem>
                  <MenuItem value="kart">Kart</MenuItem>
                  <MenuItem value="havale">Havale/EFT</MenuItem>
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
                /* Mobile Card View for Günlük Özet - Accordion tarzı */
                <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {(gunlukRapor.gunluk_veriler || []).map((item, index) => {
                    const tarih = format(new Date(item.tarih), 'yyyy-MM-dd');
                    const isExpanded = expandedGun === tarih;
                    
                    return (
                      <Box key={index}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            bgcolor: isExpanded ? '#e3f2fd' : '#fafafa', 
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#e3f2fd' }
                          }}
                          onClick={() => handleGunlukOzetClick(item)}
                        >
                          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {isExpanded ? <ExpandLessIcon color="primary" fontSize="small" /> : <ExpandMoreIcon color="action" fontSize="small" />}
                                <Typography variant="subtitle2" fontWeight={700}>
                                  {format(new Date(item.tarih), 'd MMMM yyyy', { locale: tr })}
                                </Typography>
                              </Box>
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
                        {/* Accordion içerik - Mobile */}
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, mt: 0.5, borderRadius: 1 }}>
                            {expandedGunIsEmirleri.length === 0 ? (
                              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
                                Bu güne ait iş emri bulunmuyor
                              </Typography>
                            ) : (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {expandedGunIsEmirleri.map((isEmri) => {
                                  const gelir = parseFloat(isEmri.toplam_tutar || 0);
                                  const maliyet = parseFloat(isEmri.toplam_maliyet || 0);
                                  const kar = gelir - maliyet;
                                  
                                  return (
                                    <Card 
                                      key={isEmri.id} 
                                      sx={{ bgcolor: 'white', cursor: 'pointer' }}
                                      onClick={(e) => e.stopPropagation()}
                                      onDoubleClick={(e) => { e.stopPropagation(); handleViewDetail(isEmri); }}
                                    >
                                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <Typography fontWeight={600} color="primary.main" fontSize="0.8rem">
                                            {isEmri.fis_no}
                                          </Typography>
                                          <Chip 
                                            label={isEmri.durum || 'Bekliyor'} 
                                            size="small"
                                            sx={{ fontSize: '0.6rem', height: 18 }}
                                          />
                                        </Box>
                                        <Typography fontSize="0.75rem" color="text.secondary">
                                          {isEmri.musteri_ad_soyad} • {isEmri.plaka}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                          <Typography fontSize="0.75rem" sx={{ color: '#2e7d32' }}>
                                            Gelir: {formatCurrency(gelir)}
                                          </Typography>
                                          <Typography fontSize="0.75rem" fontWeight={600} sx={{ color: kar >= 0 ? '#2e7d32' : '#c62828' }}>
                                            Kar: {formatCurrency(kar)}
                                          </Typography>
                                        </Box>
                                      </CardContent>
                                    </Card>
                                  );
                                })}
                              </Box>
                            )}
                          </Box>
                        </Collapse>
                      </Box>
                    );
                  })}
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
                      {(gunlukRapor.gunluk_veriler || []).map((item, index) => {
                        const tarih = format(new Date(item.tarih), 'yyyy-MM-dd');
                        const isExpanded = expandedGun === tarih;
                        
                        return (
                          <React.Fragment key={index}>
                            <TableRow 
                              hover
                              onClick={() => handleGunlukOzetClick(item)}
                              sx={{ 
                                cursor: 'pointer',
                                bgcolor: isExpanded ? '#e3f2fd' : 'inherit',
                                '&:hover': { bgcolor: '#e3f2fd' }
                              }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {isExpanded ? <ExpandLessIcon color="primary" /> : <ExpandMoreIcon color="action" />}
                                  <Typography fontWeight={600}>
                                    {format(new Date(item.tarih), 'd MMMM yyyy', { locale: tr })}
                                  </Typography>
                                </Box>
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
                            {/* Accordion İçerik - İş Emirleri */}
                            <TableRow>
                              <TableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                  <Box sx={{ bgcolor: '#f5f5f5', p: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <DirectionsCarIcon fontSize="small" color="primary" />
                                      {format(new Date(item.tarih), 'd MMMM yyyy', { locale: tr })} - İş Emirleri
                                      <Chip label={expandedGunIsEmirleri.length} size="small" color="primary" sx={{ ml: 1 }} />
                                    </Typography>
                                    {expandedGunIsEmirleri.length === 0 ? (
                                      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                        Bu güne ait iş emri bulunmuyor
                                      </Typography>
                                    ) : (
                                      <Table size="small" sx={{ bgcolor: 'white', borderRadius: 1 }}>
                                        <TableHead>
                                          <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Fiş No</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Tarih</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Müşteri</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Araç</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Oluşturan</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Durum</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Ödeme Detayları</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Maliyet</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Gelir</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Kar</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>İşlem</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {expandedGunIsEmirleri.map((isEmri) => {
                                            const gelir = parseFloat(isEmri.gercek_toplam_ucret || isEmri.toplam_tutar || 0);
                                            const maliyet = parseFloat(isEmri.toplam_maliyet || 0);
                                            const kar = parseFloat(isEmri.kar) || (gelir - maliyet);
                                            
                                            return (
                                              <TableRow 
                                                key={isEmri.id}
                                                hover
                                                onClick={(e) => e.stopPropagation()}
                                                onDoubleClick={(e) => { e.stopPropagation(); handleViewDetail(isEmri); }}
                                                sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#e3f2fd' } }}
                                              >
                                                <TableCell>
                                                  <Typography fontWeight={700} color="primary.main" fontSize="0.8rem">
                                                    {isEmri.fis_no}
                                                  </Typography>
                                                </TableCell>
                                                <TableCell>
                                                  <Typography fontSize="0.8rem">
                                                    {isEmri.created_at ? format(new Date(isEmri.created_at), 'dd.MM.yyyy', { locale: tr }) : '-'}
                                                  </Typography>
                                                </TableCell>
                                                <TableCell>
                                                  <Typography fontWeight={600} fontSize="0.8rem">{isEmri.musteri_ad_soyad || '-'}</Typography>
                                                  {isEmri.telefon && <Typography variant="caption" color="text.secondary">{isEmri.telefon}</Typography>}
                                                </TableCell>
                                                <TableCell>
                                                  <Typography fontSize="0.8rem">{isEmri.marka} {isEmri.model_tip || isEmri.arac_bilgisi || '-'}</Typography>
                                                  {isEmri.km && <Typography variant="caption" color="text.secondary">{isEmri.km} km</Typography>}
                                                </TableCell>
                                                <TableCell>
                                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Avatar sx={{ width: 20, height: 20, fontSize: '0.65rem', bgcolor: isEmri.olusturan_kisi === 'Ortak' ? 'warning.main' : 'primary.main' }}>
                                                      <PersonIcon sx={{ fontSize: 14 }} />
                                                    </Avatar>
                                                    <Box>
                                                      <Typography fontSize="0.75rem" fontWeight={600}>{isEmri.olusturan_kisi || isEmri.olusturan_ad_soyad || '-'}</Typography>
                                                      {isEmri.olusturan_kisi !== 'Ortak' && <Typography variant="caption" color="text.secondary">@{isEmri.olusturan_kullanici_adi || '-'}</Typography>}
                                                    </Box>
                                                  </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                  <Chip 
                                                    label={isEmri.durum === 'beklemede' ? 'Beklemede' : 'Tamamlandı'} 
                                                    size="small"
                                                    sx={{ 
                                                      fontSize: '0.65rem',
                                                      height: 20,
                                                      bgcolor: isEmri.durum === 'beklemede' ? '#fff3e0' : '#e8f5e9',
                                                      color: isEmri.durum === 'beklemede' ? '#e65100' : '#2e7d32',
                                                      fontWeight: 600
                                                    }}
                                                  />
                                                </TableCell>
                                                <TableCell>
                                                  <Tooltip title={isEmri.odeme_detaylari || '-'} arrow placement="top">
                                                    <Typography fontSize="0.75rem" sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                      {isEmri.odeme_detaylari || '-'}
                                                    </Typography>
                                                  </Tooltip>
                                                </TableCell>
                                                <TableCell align="right">
                                                  <Typography fontWeight={600} sx={{ color: '#c62828' }} fontSize="0.8rem">
                                                    {formatCurrency(maliyet)}
                                                  </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                  <Typography fontWeight={600} sx={{ color: '#2e7d32' }} fontSize="0.8rem">
                                                    {formatCurrency(gelir)}
                                                  </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                  <Typography fontWeight={700} sx={{ color: kar >= 0 ? '#2e7d32' : '#c62828' }} fontSize="0.8rem">
                                                    {formatCurrency(kar)}
                                                  </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                  <Tooltip title="Detayları Gör">
                                                    <IconButton
                                                      size="small"
                                                      onClick={(e) => { e.stopPropagation(); handleViewDetail(isEmri); }}
                                                      sx={{ color: 'primary.main' }}
                                                    >
                                                      <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                  </Tooltip>
                                                </TableCell>
                                              </TableRow>
                                            );
                                          })}
                                        </TableBody>
                                      </Table>
                                    )}
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                                      💡 Detayları görmek için iş emri satırına çift tıklayın veya göz simgesine basın
                                    </Typography>
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        );
                      })}
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
                        <Card 
                          key={isEmri.id} 
                          sx={{ 
                            overflow: 'hidden', 
                            bgcolor: '#fafafa',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#e3f2fd', transform: 'scale(1.01)' }
                          }}
                          onDoubleClick={() => handleViewDetail(isEmri)}
                        >
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
                      <TableCell sx={{ fontWeight: 700 }}>Oluşturan</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Durum</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Ödeme Detayları</TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ fontWeight: 700, cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => toggleIsEmriSort('toplam_maliyet')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          Maliyet
                          <SortIcon field="toplam_maliyet" currentField={isEmriSortField} direction={isEmriSortDirection} />
                        </Box>
                      </TableCell>
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
                        <TableRow 
                          key={isEmri.id} 
                          hover
                          onDoubleClick={() => handleViewDetail(isEmri)}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#e3f2fd' }
                          }}
                        >
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: isEmri.olusturan_kisi === 'Ortak' ? 'warning.main' : 'primary.main' }}>
                                <PersonIcon fontSize="small" />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {isEmri.olusturan_kisi || isEmri.olusturan_ad_soyad || '-'}
                                </Typography>
                                {isEmri.olusturan_kisi !== 'Ortak' && (
                                  <Typography variant="caption" color="text.secondary">
                                    @{isEmri.olusturan_kullanici_adi || '-'}
                                  </Typography>
                                )}
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
                            <Tooltip title={isEmri.odeme_detaylari || '-'} arrow placement="top">
                              <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                                {isEmri.odeme_detaylari || '-'}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600} sx={{ color: '#c62828' }}>
                              {formatCurrency(isEmri.toplam_maliyet || 0)}
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
  return (
    <Box>
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
            label="Motor Satışları" 
            icon={<TwoWheelerIcon />} 
            iconPosition="start"
          />
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

      {activeTab === 0 && (
        <MotorSatisRaporTab
          isMobile={isMobile}
          loading={loading}
          motorSatisSelectedDate={motorSatisSelectedDate}
          setMotorSatisSelectedDate={setMotorSatisSelectedDate}
          motorSatisEndDate={motorSatisEndDate}
          setMotorSatisEndDate={setMotorSatisEndDate}
          loadMotorSatisRapor={loadMotorSatisRapor}
          motorSatislar={motorSatislar}
          expandedMotorSatis={expandedMotorSatis}
          setExpandedMotorSatis={setExpandedMotorSatis}
          navigate={navigate}
        />
      )}
      {activeTab === 1 && renderGunlukRapor()}
      {activeTab === 2 && (
        <AksesuarRaporTab
          theme={theme}
          isMobile={isMobile}
          loading={loading}
          aksesuarSelectedDate={aksesuarSelectedDate}
          setAksesuarSelectedDate={setAksesuarSelectedDate}
          aksesuarEndDate={aksesuarEndDate}
          setAksesuarEndDate={setAksesuarEndDate}
          aksesuarRapor={aksesuarRapor}
          sortedAksesuarlar={sortedAksesuarlar}
          handleViewAksesuarDetail={handleViewAksesuarDetail}
        />
      )}
      {activeTab === 3 && (
        <FisKarRaporTab
          loading={loading}
          isAdmin={isAdmin}
          fisKarBaslangic={fisKarBaslangic}
          setFisKarBaslangic={setFisKarBaslangic}
          fisKarBitis={fisKarBitis}
          setFisKarBitis={setFisKarBitis}
          fisKarRapor={fisKarRapor}
          fisKarSortField={fisKarSortField}
          fisKarSortDirection={fisKarSortDirection}
          toggleFisKarSort={toggleFisKarSort}
          sortData={sortData}
          SortIcon={SortIcon}
          handleViewDetail={handleViewDetail}
          handleViewAksesuarDetail={handleViewAksesuarDetail}
          handleViewMotorSatisDetail={handleViewMotorSatisDetail}
        />
      )}

      {/* İş Emri Detay Modal */}
      <IsEmriDetayModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        isMobile={isMobile}
        selectedWorkOrder={selectedWorkOrder}
      />

      {/* Aksesuar Detay Modal */}
      <AksesuarDetayModal
        open={aksesuarDetailModalOpen}
        onClose={() => setAksesuarDetailModalOpen(false)}
        isMobile={isMobile}
        selectedAksesuar={selectedAksesuar}
      />

      {/* Motor Satış Detay Modal (Fiş Kar Analizi için) */}
      <MotorSatisDetayModal
        open={motorSatisDetailModalOpen}
        onClose={() => setMotorSatisDetailModalOpen(false)}
        isMobile={isMobile}
        selectedMotorSatis={selectedMotorSatis}
      />
    </Box>
  );
}

export default Raporlar;
