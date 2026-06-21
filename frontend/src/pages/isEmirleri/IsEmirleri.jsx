import React, { useState, useEffect, useCallback, useRef } from 'react';
import { /* useNavigate, */ useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  Divider,
  useMediaQuery,
  useTheme,
  Pagination,
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
  Person as PersonIcon,
  // Print as PrintIcon, // Geçici olarak kaldırıldı
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { isEmriService } from '../../services/api';
import IsEmriModal from '../../components/IsEmriModal';
import IsEmriDetayModal from './IsEmriDetayModal';
import IsEmriTamamlaModal from './IsEmriTamamlaModal';
import { formatDate, formatCurrency } from './isEmirleriUtils';

function IsEmirleri() {
  const [isEmirleri, setIsEmirleri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({});
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
  const requestIdRef = useRef(0);

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

  const loadIsEmirleri = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      const response = await isEmriService.getAll({
        page,
        limit: 25,
        search: debouncedSearch,
        durum: filterDurum || undefined,
        tarih: filterBugun ? new Intl.DateTimeFormat('en-CA').format(new Date()) : undefined,
        baslangic: !filterBugun && baslangicTarihi ? baslangicTarihi : undefined,
        bitis: !filterBugun && bitisTarihi ? bitisTarihi : undefined,
      });
      if (requestId !== requestIdRef.current) return;
      setIsEmirleri(response.data?.data || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
      setStats(response.data?.stats || {});
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.error('İş emirleri yükleme hatası:', error);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [page, debouncedSearch, filterDurum, filterBugun, baslangicTarihi, bitisTarihi]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [filterDurum, filterBugun, baslangicTarihi, bitisTarihi]);

  useEffect(() => {
    loadIsEmirleri();
  }, [loadIsEmirleri]);

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

  const filteredIsEmirleri = isEmirleri;
  const toplamIsEmri = Number(stats.toplam || 0);
  const bugunkuIsEmri = Number(stats.bugun || 0);
  const beklemedekiIsEmri = Number(stats.beklemede || 0);
  const islemdekiIsEmri = Number(stats.islemde || 0);
  const odemeBekleyenIsEmri = Number(stats.odeme_bekleniyor || 0);
  const tamamlananIsEmri = Number(stats.tamamlandi || 0);
  const iptalIsEmri = Number(stats.iptal_edildi || 0);
  const toplamTutar = parseFloat(stats.toplam_tutar || 0);
  const filtreliToplamKar = parseFloat(stats.toplam_kar || 0);

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
                      onDoubleClick={() => isAdmin && handleViewDetail(isEmri)}
                      sx={{ '&:hover': { bgcolor: 'action.hover', cursor: isAdmin ? 'pointer' : 'default' }, '& td': { py: 0.5, px: 0.5 } }}
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

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            disabled={loading}
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Detail Modal */}
      <IsEmriDetayModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        isEmri={selectedIsEmri}
        isMobile={isMobile}
        isAdmin={isAdmin}
        onEdit={() => {
          setDetailModalOpen(false);
          setEditingId(selectedIsEmri?.id);
          setIsModalOpen(true);
        }}
      />

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
      <IsEmriTamamlaModal
        open={completeModalOpen}
        onClose={() => {
          setCompleteModalOpen(false);
          setWorkOrderToComplete(null);
        }}
        workOrder={workOrderToComplete}
        onConfirm={confirmComplete}
      />
    </Box>
  );
}

export default IsEmirleri;
