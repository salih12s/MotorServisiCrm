import React, { useState, useEffect } from 'react';
import { /* useNavigate, */ useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Card,
  CardContent,
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
  TextField,
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  useMediaQuery,
  useTheme,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Receipt as ReceiptIcon,
  DirectionsCar as DirectionsCarIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  // Print as PrintIcon, // Geçici olarak kaldırıldı
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { isEmriService } from '../services/api';
import { format, isValid, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import IsEmriModal from '../components/IsEmriModal';

// Güvenli tarih formatlama fonksiyonu
const formatDate = (dateStr, formatStr = 'dd.MM.yyyy') => {
  if (!dateStr) return '-';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    if (!isValid(date)) return '-';
    return format(date, formatStr, { locale: tr });
  } catch {
    return '-';
  }
};

function IsEmirleri() {
  const [isEmirleri, setIsEmirleri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDurum, setFilterDurum] = useState('');
  const [baslangicTarihi, setBaslangicTarihi] = useState('');
  const [bitisTarihi, setBitisTarihi] = useState('');
  const [filterBugun, setFilterBugun] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedIsEmri, setSelectedIsEmri] = useState(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [workOrderToComplete, setWorkOrderToComplete] = useState(null);
  // const navigate = useNavigate(); // Geçici olarak kaldırıldı (yazdırma için)
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // URL parametrelerinden filtreleri oku
  useEffect(() => {
    const durumParam = searchParams.get('durum');
    const bugunParam = searchParams.get('bugun');
    if (durumParam) {
      setFilterDurum(durumParam);
    }
    if (bugunParam === 'true') {
      setFilterBugun(true);
    }
  }, [searchParams]);

  useEffect(() => {
    loadIsEmirleri();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadIsEmirleri = async () => {
    try {
      setLoading(true);
      // Tüm verileri çek, filtreleme frontend'de yapılacak
      const response = await isEmriService.getAll({});
      // ID'ye göre azalan sıralama (en yeni en üstte)
      const sorted = response.data.sort((a, b) => b.id - a.id);
      setIsEmirleri(sorted);
    } catch (error) {
      console.error('İş emirleri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu iş emrini silmek istediğinizden emin misiniz?')) {
      try {
        await isEmriService.delete(id);
        loadIsEmirleri();
      } catch (error) {
        console.error('Silme hatası:', error);
      }
    }
  };

  const handleViewDetail = async (isEmri) => {
    try {
      const response = await isEmriService.getById(isEmri.id);
      const data = response.data || response; // API response'u kontrol et
      setSelectedIsEmri(data);
      setDetailModalOpen(true);
    } catch (error) {
      console.error('Detay yükleme hatası:', error);
    }
  };

  const handleTamamla = async (id) => {
    const isEmri = isEmirleri.find(ie => ie.id === id);
    setWorkOrderToComplete(isEmri);
    setCompleteModalOpen(true);
  };

  const confirmComplete = async () => {
    try {
      await isEmriService.tamamla(workOrderToComplete.id);
      setCompleteModalOpen(false);
      setWorkOrderToComplete(null);
      loadIsEmirleri();
    } catch (error) {
      console.error('Tamamlama hatası:', error);
    }
  };

  // handlePrint fonksiyonu geçici olarak kaldırıldı
  // const handlePrint = async (isEmri) => {
  //   try {
  //     navigate(`/is-emirleri/${isEmri.id}?print=true`);
  //   } catch (error) {
  //     console.error('Yazdırma hatası:', error);
  //   }
  // };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterDurum('');
    setBaslangicTarihi('');
    setBitisTarihi('');
    setFilterBugun(false);
    // URL parametrelerini temizle
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || filterDurum || baslangicTarihi || bitisTarihi || filterBugun;

  // Bugünü başlangıç ve bitiş tarihiyle karşılaştır
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    const date = new Date(dateStr);
    return date.toDateString() === today.toDateString();
  };

  // Filtreleme - arama filtresi
  let filteredIsEmirleri = isEmirleri.filter((ie) =>
    ie.musteri_ad_soyad?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ie.fis_no?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
    ie.marka?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ie.telefon?.includes(searchQuery)
  );

  // Durum filtresi (frontend'de uygula)
  if (filterDurum) {
    filteredIsEmirleri = filteredIsEmirleri.filter(ie => ie.durum === filterDurum);
  }

  // Bugünkü işler filtresi
  if (filterBugun) {
    filteredIsEmirleri = filteredIsEmirleri.filter(ie => isToday(ie.created_at));
  }

  // Tarih aralığı filtresi
  if (baslangicTarihi) {
    filteredIsEmirleri = filteredIsEmirleri.filter(ie => {
      if (!ie.created_at) return false;
      const tarih = new Date(ie.created_at);
      const baslangic = new Date(baslangicTarihi);
      baslangic.setHours(0, 0, 0, 0);
      return tarih >= baslangic;
    });
  }

  if (bitisTarihi) {
    filteredIsEmirleri = filteredIsEmirleri.filter(ie => {
      if (!ie.created_at) return false;
      const tarih = new Date(ie.created_at);
      const bitis = new Date(bitisTarihi);
      bitis.setHours(23, 59, 59, 999);
      return tarih <= bitis;
    });
  }

  // İstatistikler - FİLTRELENMİŞ verilerden hesapla
  const toplamIsEmri = isEmirleri.length;
  const bugunkuIsEmri = isEmirleri.filter(ie => isToday(ie.created_at)).length;
  const beklemedekiIsEmri = isEmirleri.filter(ie => ie.durum === 'beklemede').length;
  const islemdekiIsEmri = isEmirleri.filter(ie => ie.durum === 'islemde').length;
  const odemeBekleyenIsEmri = isEmirleri.filter(ie => ie.durum === 'odeme_bekleniyor').length;
  const tamamlananIsEmri = isEmirleri.filter(ie => ie.durum === 'tamamlandi').length;
  const iptalIsEmri = isEmirleri.filter(ie => ie.durum === 'iptal_edildi').length;
  const toplamTutar = isEmirleri.reduce((sum, ie) => sum + parseFloat(ie.gercek_toplam_ucret || 0), 0);

  // FİLTRELENMİŞ VERİLER için kar hesaplama
  const filtreliToplamKar = filteredIsEmirleri.reduce((sum, ie) => sum + parseFloat(ie.kar || 0), 0);

  return (
    <Box>
      {/* Stats ve Yeni İş Emri - Tek Satır */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2, 
        flexWrap: 'wrap', 
        gap: 1,
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {/* Inline Stats - Tıklanabilir Filtreler */}
          <Chip 
            label={`Toplam: ${toplamIsEmri}`} 
            size="small"
            onClick={() => { clearFilters(); }}
            sx={{ 
              bgcolor: !filterDurum && !filterBugun ? '#1a237e' : '#e3f2fd', 
              color: !filterDurum && !filterBugun ? 'white' : '#1a237e', 
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#1a237e', color: 'white' }
            }} 
          />
          <Chip 
            label={`Bugün: ${bugunkuIsEmri}`} 
            size="small"
            onClick={() => { setFilterDurum(''); setFilterBugun(true); setSearchParams({ bugun: 'true' }); }}
            sx={{ 
              bgcolor: filterBugun ? '#1565c0' : '#bbdefb', 
              color: filterBugun ? 'white' : '#1565c0', 
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#1565c0', color: 'white' }
            }} 
          />
          <Chip 
            label={`Beklemede: ${beklemedekiIsEmri}`} 
            size="small"
            onClick={() => { setFilterBugun(false); setFilterDurum('beklemede'); setSearchParams({ durum: 'beklemede' }); }}
            sx={{ 
              bgcolor: filterDurum === 'beklemede' ? '#e65100' : '#fff3e0', 
              color: filterDurum === 'beklemede' ? 'white' : '#e65100', 
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#e65100', color: 'white' }
            }} 
          />
          <Chip 
            label={`İşlemde: ${islemdekiIsEmri}`} 
            size="small"
            onClick={() => { setFilterBugun(false); setFilterDurum('islemde'); setSearchParams({ durum: 'islemde' }); }}
            sx={{ 
              bgcolor: filterDurum === 'islemde' ? '#0277bd' : '#e3f2fd', 
              color: filterDurum === 'islemde' ? 'white' : '#0277bd', 
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#0277bd', color: 'white' }
            }} 
          />
          <Chip 
            label={`Ödeme Bekl.: ${odemeBekleyenIsEmri}`} 
            size="small"
            onClick={() => { setFilterBugun(false); setFilterDurum('odeme_bekleniyor'); setSearchParams({ durum: 'odeme_bekleniyor' }); }}
            sx={{ 
              bgcolor: filterDurum === 'odeme_bekleniyor' ? '#7b1fa2' : '#f3e5f5', 
              color: filterDurum === 'odeme_bekleniyor' ? 'white' : '#7b1fa2', 
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#7b1fa2', color: 'white' }
            }} 
          />
          <Chip 
            label={`Tamamlandı: ${tamamlananIsEmri}`} 
            size="small"
            onClick={() => { setFilterBugun(false); setFilterDurum('tamamlandi'); setSearchParams({ durum: 'tamamlandi' }); }}
            sx={{ 
              bgcolor: filterDurum === 'tamamlandi' ? '#2e7d32' : '#e8f5e9', 
              color: filterDurum === 'tamamlandi' ? 'white' : '#2e7d32', 
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#2e7d32', color: 'white' }
            }} 
          />
          <Chip 
            label={`İptal: ${iptalIsEmri}`} 
            size="small"
            onClick={() => { setFilterBugun(false); setFilterDurum('iptal_edildi'); setSearchParams({ durum: 'iptal_edildi' }); }}
            sx={{ 
              bgcolor: filterDurum === 'iptal_edildi' ? '#c62828' : '#ffebee', 
              color: filterDurum === 'iptal_edildi' ? 'white' : '#c62828', 
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#c62828', color: 'white' }
            }} 
          />
          <Chip 
            label={formatCurrency(toplamTutar)} 
            size="small"
            sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }} 
          />
          {isAdmin && (
            <Chip 
              label={`Kar: ${formatCurrency(filtreliToplamKar)}`} 
              size="small"
              sx={{ 
                bgcolor: filtreliToplamKar >= 0 ? '#e8f5e9' : '#ffebee', 
                color: filtreliToplamKar >= 0 ? '#2e7d32' : '#c62828', 
                fontWeight: 600 
              }} 
            />
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }}
          sx={{ flexShrink: 0 }}
        >
          Yeni İş Emri
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                placeholder="Ara (Müşteri, Fiş No, Marka, Telefon...)"
                size="small"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} sm={8} md={6} width={200}>
              <FormControl size="small" fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={filterDurum}
                  label="Durum"
                  onChange={(e) => setFilterDurum(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="beklemede">Beklemede</MenuItem>
                  <MenuItem value="islemde">İşlemde</MenuItem>
                  <MenuItem value="odeme_bekleniyor">Ödeme Bekleniyor</MenuItem>
                  <MenuItem value="tamamlandi">Tamamlandı</MenuItem>
                  <MenuItem value="iptal_edildi">İptal Edildi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                type="date"
                size="small"
                label="Başlangıç"
                fullWidth
                value={baslangicTarihi}
                onChange={(e) => { setBaslangicTarihi(e.target.value); setFilterBugun(false); }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                type="date"
                size="small"
                label="Bitiş"
                fullWidth
                value={bitisTarihi}
                onChange={(e) => { setBitisTarihi(e.target.value); setFilterBugun(false); }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {hasActiveFilters && (
              <Grid item xs={12} sm={4} md={2}>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  fullWidth
                  size="small"
                >
                  Temizle
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Table / Mobile Cards */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      ) : isMobile ? (
        /* Mobile Card View */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredIsEmirleri.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {hasActiveFilters ? 'Filtrelere uygun iş emri bulunamadı' : 'Henüz iş emri bulunmuyor'}
                </Typography>
                {!hasActiveFilters && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsModalOpen(true)}
                    sx={{ mt: 2 }}
                  >
                    İlk İş Emrini Oluştur
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredIsEmirleri.map((isEmri) => (
              <Card key={isEmri.id} sx={{ position: 'relative', overflow: 'hidden' }}>
                <CardContent sx={{ p: 1.5 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                        <ReceiptIcon fontSize="small" />
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700} color="primary.main" noWrap>
                          {isEmri.fis_no}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {formatDate(isEmri.created_at)}
                        </Typography>
                      </Box>
                    </Box>
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
                          isEmri.durum === 'odeme_bekleniyor' ? '#fff8e1' :
                          isEmri.durum === 'iptal_edildi' ? '#ffebee' :
                          '#e8f5e9',
                        color: 
                          isEmri.durum === 'beklemede' ? '#e65100' :
                          isEmri.durum === 'islemde' ? '#1565c0' :
                          isEmri.durum === 'odeme_bekleniyor' ? '#f57c00' :
                          isEmri.durum === 'iptal_edildi' ? '#c62828' :
                          '#2e7d32',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: '22px',
                        flexShrink: 0,
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  {/* Content */}
                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                      <PersonIcon fontSize="small" color="action" sx={{ mt: 0.2, flexShrink: 0 }} />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Müşteri</Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }} noWrap>
                          {isEmri.musteri_ad_soyad}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                      <DirectionsCarIcon fontSize="small" color="action" sx={{ mt: 0.2, flexShrink: 0 }} />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Araç</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }} noWrap>
                          {isEmri.marka} {isEmri.model_tip}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {isEmri.telefon && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
                        📞 {isEmri.telefon}
                      </Typography>
                    )}
                    
                    {isEmri.aciklama && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Açıklama:</Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: '0.875rem',
                            mt: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {isEmri.aciklama}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  {/* Footer */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, gap: 2 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Toplam</Typography>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '1rem' }} noWrap>
                        {formatCurrency(isEmri.gercek_toplam_ucret)}
                      </Typography>
                    </Box>
                    {isAdmin && (
                      <Box sx={{ textAlign: 'right', minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Kar</Typography>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight={700}
                          sx={{ 
                            fontSize: '1rem',
                            color: parseFloat(isEmri.kar) >= 0 ? '#2e7d32' : '#c62828',
                          }}
                          noWrap
                        >
                          {formatCurrency(isEmri.kar)}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon sx={{ fontSize: '1rem' }} />}
                      onClick={() => handleViewDetail(isEmri)}
                      sx={{ flex: 1, minWidth: 0, px: 1, fontSize: '0.75rem' }}
                    >
                      Detay
                    </Button>
                    {isEmri.durum !== 'tamamlandi' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon sx={{ fontSize: '1rem' }} />}
                        onClick={() => handleTamamla(isEmri.id)}
                        sx={{ flex: 1, minWidth: 0, px: 1, fontSize: '0.75rem' }}
                      >
                        Tamamla
                      </Button>
                    )}
                    {(isAdmin || isEmri.durum !== 'tamamlandi') && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingId(isEmri.id);
                          setIsModalOpen(true);
                        }}
                        sx={{ color: 'warning.main', p: 0.5 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {isAdmin && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(isEmri.id)}
                        sx={{ color: 'error.main', p: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      ) : (
        /* Desktop Table View */
        <Card>
        <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 850, tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow sx={{ '& th': { py: 0.75, px: 0.5, fontSize: '0.7rem', fontWeight: 600 } }}>
                  <TableCell sx={{ width: 45 }}>Fiş No</TableCell>
                  <TableCell sx={{ width: 100 }}>Müşteri</TableCell>
                  <TableCell sx={{ width: 90 }}>Araç</TableCell>
                  <TableCell sx={{ width: 40 }}>Telefon</TableCell>
                  <TableCell sx={{ width: 95 }}>Tarih/Durum</TableCell>
                  <TableCell sx={{ width: 85 }}>Arıza</TableCell>
                  <TableCell sx={{ width: 55 }}>Açıklama</TableCell>
                  <TableCell align="right" sx={{ width: 70 }}>Toplam</TableCell>
                  {isAdmin && <TableCell align="right" sx={{ width: 65 }}>Maliyet</TableCell>}
                  {isAdmin && <TableCell align="right" sx={{ width: 60 }}>Kar</TableCell>}
                  <TableCell align="center" sx={{ width: 120 }}>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredIsEmirleri.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 11 : 9} align="center" sx={{ py: 6 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                        <Typography variant="body1" color="text.secondary">
                          {hasActiveFilters ? 'Filtrelere uygun iş emri bulunamadı' : 'Henüz iş emri bulunmuyor'}
                        </Typography>
                        {!hasActiveFilters && (
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setIsModalOpen(true)}
                          >
                            İlk İş Emrini Oluştur
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIsEmirleri.map((isEmri) => (
                    <TableRow
                      key={isEmri.id}
                      hover
                      onDoubleClick={() => handleViewDetail(isEmri)}
                      sx={{ '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' }, '& td': { py: 0.5, px: 0.5 } }}
                    >
                      <TableCell>
                        <Tooltip title={`Fiş: ${isEmri.fis_no}`}>
                          <Typography fontWeight={700} color="primary.main" fontSize="0.7rem" noWrap>
                            {isEmri.fis_no}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={isEmri.musteri_ad_soyad}>
                          <Typography fontWeight={500} fontSize="0.7rem" noWrap sx={{ maxWidth: 95, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {isEmri.musteri_ad_soyad}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={`${isEmri.marka} ${isEmri.model_tip}`}>
                          <Typography variant="body2" fontSize="0.7rem" noWrap sx={{ maxWidth: 85, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {isEmri.marka} {isEmri.model_tip}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={isEmri.telefon || 'Telefon yok'}>
                          <Typography variant="body2" fontSize="0.7rem" noWrap>{isEmri.telefon || '-'}</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                          <Typography variant="body2" fontSize="0.7rem">
                            {formatDate(isEmri.created_at)}
                          </Typography>
                          <Chip
                            size="small"
                            label={
                              isEmri.durum === 'beklemede' ? 'Bekl.' :
                              isEmri.durum === 'islemde' ? 'İşlemde' :
                              isEmri.durum === 'odeme_bekleniyor' ? 'Ödeme' :
                              isEmri.durum === 'iptal_edildi' ? 'İptal' :
                              'Tamam'
                            }
                            sx={{
                              bgcolor: 
                                isEmri.durum === 'beklemede' ? '#fff3e0' :
                                isEmri.durum === 'islemde' ? '#e3f2fd' :
                                isEmri.durum === 'odeme_bekleniyor' ? '#fff8e1' :
                                isEmri.durum === 'iptal_edildi' ? '#ffebee' :
                                '#e8f5e9',
                              color: 
                                isEmri.durum === 'beklemede' ? '#e65100' :
                                isEmri.durum === 'islemde' ? '#1565c0' :
                                isEmri.durum === 'odeme_bekleniyor' ? '#f57c00' :
                                isEmri.durum === 'iptal_edildi' ? '#c62828' :
                                '#2e7d32',
                              fontWeight: 600,
                              fontSize: '0.6rem',
                              height: 18,
                              '& .MuiChip-label': { px: 0.75 }
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={isEmri.ariza_sikayetler || 'Arıza/Şikayet yok'}>
                          <Typography 
                            variant="body2" 
                            fontSize="0.65rem"
                            sx={{ 
                              maxWidth: 80, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}
                          >
                            {isEmri.ariza_sikayetler || '-'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={isEmri.aciklama || 'Açıklama yok'}>
                          <Typography 
                            variant="body2" 
                            fontSize="0.65rem"
                            sx={{ 
                              maxWidth: 70, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}
                          >
                            {isEmri.aciklama || '-'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={`Toplam: ${formatCurrency(isEmri.gercek_toplam_ucret)}`}>
                          <Typography fontWeight={700} fontSize="0.65rem" noWrap>
                            {formatCurrency(isEmri.gercek_toplam_ucret)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      {isAdmin && (
                        <TableCell align="right">
                          <Tooltip title={`Maliyet: ${formatCurrency(isEmri.toplam_maliyet)}`}>
                            <Typography fontSize="0.65rem" sx={{ color: '#c62828' }} noWrap>
                              {formatCurrency(isEmri.toplam_maliyet)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      )}
                      {isAdmin && (
                        <TableCell align="right">
                          <Tooltip title={`Kar: ${formatCurrency(isEmri.kar)}`}>
                            <Typography
                              fontWeight={700}
                              fontSize="0.65rem"
                              sx={{ color: parseFloat(isEmri.kar) >= 0 ? '#2e7d32' : '#c62828' }}
                              noWrap
                            >
                              {formatCurrency(isEmri.kar)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      )}
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Detay">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetail(isEmri)}
                              sx={{ color: 'primary.main' }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {isEmri.durum !== 'tamamlandi' && (
                            <Tooltip title="Tamamla">
                              <IconButton
                                size="small"
                                onClick={() => handleTamamla(isEmri.id)}
                                sx={{ color: 'success.main' }}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {(isAdmin || isEmri.durum !== 'tamamlandi') && (
                            <Tooltip title="Düzenle">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingId(isEmri.id);
                                  setIsModalOpen(true);
                                }}
                                sx={{ color: 'warning.main' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {isAdmin && (
                            <Tooltip title="Sil">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(isEmri.id)}
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        </TableContainer>
      </Card>
      )}

      {/* Detail Modal */}
      <Dialog 
        open={detailModalOpen} 
        onClose={() => setDetailModalOpen(false)}
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
              İş Emri Detay - {selectedIsEmri?.fis_no}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {selectedIsEmri?.musteri_ad_soyad} | {formatDate(selectedIsEmri?.created_at, 'dd MMMM yyyy')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={() => setDetailModalOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {selectedIsEmri && (
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
                    <Grid item xs={8}><Typography variant="body2" fontWeight={600}>{selectedIsEmri.musteri_ad_soyad}</Typography></Grid>
                    <Grid item xs={4}><Typography variant="body2" color="text.secondary">Telefon:</Typography></Grid>
                    <Grid item xs={8}><Typography variant="body2" fontWeight={600}>{selectedIsEmri.telefon || '-'}</Typography></Grid>
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
                    <Grid item xs={8}><Typography variant="body2" fontWeight={600}>{selectedIsEmri.marka}</Typography></Grid>
                    <Grid item xs={4}><Typography variant="body2" color="text.secondary">Model/Tip:</Typography></Grid>
                    <Grid item xs={8}><Typography variant="body2" fontWeight={600}>{selectedIsEmri.model_tip || '-'}</Typography></Grid>
                    <Grid item xs={4}><Typography variant="body2" color="text.secondary">KM:</Typography></Grid>
                    <Grid item xs={8}><Typography variant="body2" fontWeight={600}>{selectedIsEmri.km ? `${selectedIsEmri.km} km` : '-'}</Typography></Grid>
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
                          selectedIsEmri.durum === 'beklemede' ? 'Beklemede' :
                          selectedIsEmri.durum === 'islemde' ? 'İşlemde' :
                          selectedIsEmri.durum === 'odeme_bekleniyor' ? 'Ödeme Bekleniyor' :
                          selectedIsEmri.durum === 'iptal_edildi' ? 'İptal Edildi' :
                          'Tamamlandı'
                        }
                        sx={{ 
                          bgcolor: 
                            selectedIsEmri.durum === 'beklemede' ? '#fff3e0' :
                            selectedIsEmri.durum === 'islemde' ? '#e3f2fd' :
                            selectedIsEmri.durum === 'odeme_bekleniyor' ? '#f3e5f5' :
                            selectedIsEmri.durum === 'iptal_edildi' ? '#ffebee' :
                            '#e8f5e9',
                          color: 
                            selectedIsEmri.durum === 'beklemede' ? '#e65100' :
                            selectedIsEmri.durum === 'islemde' ? '#0277bd' :
                            selectedIsEmri.durum === 'odeme_bekleniyor' ? '#7b1fa2' :
                            selectedIsEmri.durum === 'iptal_edildi' ? '#c62828' :
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
                        {selectedIsEmri.aciklama || '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Arıza/Şikayetler:</Typography>
                      <Typography variant="body2" sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, minHeight: 40 }}>
                        {selectedIsEmri.ariza_sikayetler || '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Oluşturma Tarihi:</Typography>
                      <Typography variant="body2" fontWeight={600}>{formatDate(selectedIsEmri.created_at, 'dd.MM.yyyy HH:mm')}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Tahmini Teslim:</Typography>
                      <Typography variant="body2" fontWeight={600}>{formatDate(selectedIsEmri.tahmini_teslim_tarihi, 'dd.MM.yyyy')}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Tahmini Ücret:</Typography>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {selectedIsEmri.tahmini_toplam_ucret ? formatCurrency(selectedIsEmri.tahmini_toplam_ucret) : '-'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

              {/* Parçalar */}
              {selectedIsEmri.parcalar && selectedIsEmri.parcalar.length > 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, pb: 1, borderBottom: '2px solid', borderColor: 'primary.main' }}>
                      Parçalar ({selectedIsEmri.parcalar.length})
                    </Typography>
                    
                    {/* Mobile Card View */}
                    {isMobile ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {selectedIsEmri.parcalar.map((parca, index) => (
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
                            {selectedIsEmri.parcalar.map((parca, index) => (
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
              {selectedIsEmri.odeme_detaylari && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid', borderColor: 'success.main' }}>
                      <ReceiptIcon color="success" />
                      <Typography variant="subtitle1" fontWeight={700}>Ödeme Detayları</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, whiteSpace: 'pre-wrap' }}>
                      {selectedIsEmri.odeme_detaylari}
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
                          <Typography variant="h5" fontWeight={700} color="primary.main">{formatCurrency(selectedIsEmri.gercek_toplam_ucret)}</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
                          <Typography variant="body2" color="text.secondary">Toplam Maliyet</Typography>
                          <Typography variant="h5" fontWeight={700} color="error.main">{formatCurrency(selectedIsEmri.toplam_maliyet)}</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Card sx={{ p: 2, textAlign: 'center', bgcolor: parseFloat(selectedIsEmri.kar) >= 0 ? '#e8f5e9' : '#ffebee' }}>
                          <Typography variant="body2" color="text.secondary">Kar</Typography>
                          <Typography variant="h5" fontWeight={700} sx={{ color: parseFloat(selectedIsEmri.kar) >= 0 ? '#2e7d32' : '#c62828' }}>
                            {formatCurrency(selectedIsEmri.kar)}
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                          <Typography variant="body2" color="text.secondary">Kar Oranı</Typography>
                          <Typography variant="h5" fontWeight={700} color="warning.dark">
                            %{selectedIsEmri.gercek_toplam_ucret > 0 ? ((selectedIsEmri.kar / selectedIsEmri.gercek_toplam_ucret) * 100).toFixed(1) : 0}
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
            onClick={() => {
              setDetailModalOpen(false);
              setEditingId(selectedIsEmri?.id);
              setIsModalOpen(true);
            }}
          >
            Düzenle
          </Button>
          <Button variant="contained" onClick={() => setDetailModalOpen(false)}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* İş Emri Modal */}
      <IsEmriModal 
        open={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        editId={editingId}
        onSuccess={() => {
          loadIsEmirleri();
          setIsModalOpen(false);
          setEditingId(null);
        }}
      />

      {/* Tamamlama Onay Modal */}
      <Dialog 
        open={completeModalOpen} 
        onClose={() => {
          setCompleteModalOpen(false);
          setWorkOrderToComplete(null);
        }}
        maxWidth="sm"
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
          bgcolor: 'success.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: { xs: 2, sm: 2.5 },
        }}>
          <CheckCircleIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            İş Emrini Tamamla
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: { xs: 2, sm: 3 }, p: { xs: 2, sm: 3 } }}>
          {workOrderToComplete && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Bu iş emrini tamamlandı olarak işaretlemek istediğinizden emin misiniz?
              </Typography>
              
              <Card sx={{ mt: 2, bgcolor: '#f5f5f5' }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Fiş No
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="primary.main">
                        {workOrderToComplete.fis_no}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Müşteri
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {workOrderToComplete.musteri_ad_soyad}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Araç
                      </Typography>
                      <Typography variant="body1">
                        {workOrderToComplete.marka} {workOrderToComplete.model_tip} - {workOrderToComplete.plaka}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Arıza/Şikayet
                      </Typography>
                      <Typography variant="body2">
                        {workOrderToComplete.ariza_sikayetler || '-'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Box sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: '#e8f5e9', 
                borderRadius: 1,
                border: '1px solid #2e7d32'
              }}>
                <Typography variant="body2" color="success.dark" fontWeight={600}>
                  ✓ İş emri durumu "Tamamlandı" olarak güncellenecektir.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => {
              setCompleteModalOpen(false);
              setWorkOrderToComplete(null);
            }}
            variant="outlined"
          >
            İptal
          </Button>
          <Button 
            onClick={confirmComplete}
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
          >
            Tamamla
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default IsEmirleri;
