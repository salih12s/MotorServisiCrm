import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomTheme } from '../context/ThemeContext';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  useMediaQuery,
  useTheme,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  ShoppingBag as ShoppingBagIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { aksesuarService } from '../services/api';
import { format, isValid, parseISO, isToday } from 'date-fns';
import { tr } from 'date-fns/locale';
import AksesuarModal from '../components/AksesuarModal';

// Güvenli tarih formatlama fonksiyonu
const formatDate = (dateStr, formatStr = 'dd.MM.yyyy HH:mm') => {
  if (!dateStr) return '-';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    if (!isValid(date)) return '-';
    return format(date, formatStr, { locale: tr });
  } catch {
    return '-';
  }
};

// Durum renkleri ve etiketleri
const durumConfig = {
  beklemede: { label: 'Beklemede', color: '#ff9800', bgColor: '#fff3e0' },
  islemde: { label: 'İşlemde', color: '#2196f3', bgColor: '#e3f2fd' },
  tamamlandi: { label: 'Tamamlandı', color: '#4caf50', bgColor: '#e8f5e9' },
  iptal_edildi: { label: 'İptal', color: '#f44336', bgColor: '#ffebee' },
};

function Aksesuarlar() {
  const [aksesuarlar, setAksesuarlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBugun, setFilterBugun] = useState(false);
  const [filterDurum, setFilterDurum] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAksesuar, setSelectedAksesuar] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { themeColors } = useCustomTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Erişim kontrolü - admin veya aksesuar yetkisi olmalı
  useEffect(() => {
    if (user && user.role !== 'admin' && !user.aksesuar_yetkisi) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    loadAksesuarlar();
  }, []);

  const loadAksesuarlar = async () => {
    try {
      setLoading(true);
      const response = await aksesuarService.getAll();
      // ID'ye göre azalan sıralama (en yeni en üstte)
      const sorted = (response.data || []).sort((a, b) => b.id - a.id);
      setAksesuarlar(sorted);
    } catch (error) {
      console.error('Aksesuar listesi hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (aksesuar = null) => {
    if (aksesuar) {
      setEditingId(aksesuar.id);
    } else {
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSuccess = () => {
    loadAksesuarlar();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu aksesuar kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await aksesuarService.delete(id);
        loadAksesuarlar();
      } catch (error) {
        console.error('Silme hatası:', error);
      }
    }
  };

  const handleViewDetails = (aksesuar) => {
    setSelectedAksesuar(aksesuar);
    setDetailDialogOpen(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  // Filtreleme
  let filteredAksesuarlar = aksesuarlar.filter((a) =>
    a.ad_soyad?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.telefon?.includes(searchQuery)
  );

  // Durum filtresi
  if (filterDurum) {
    filteredAksesuarlar = filteredAksesuarlar.filter(a => a.durum === filterDurum);
  }

  // Bugün filtresi
  if (filterBugun) {
    filteredAksesuarlar = filteredAksesuarlar.filter(a => {
      try {
        return isToday(parseISO(a.created_at));
      } catch {
        return false;
      }
    });
  }

  // İstatistikler
  const toplamSatis = aksesuarlar.length;
  const bugunkuSatis = aksesuarlar.filter(a => {
    try {
      return isToday(parseISO(a.created_at));
    } catch {
      return false;
    }
  }).length;
  const beklemedeSatis = aksesuarlar.filter(a => a.durum === 'beklemede').length;
  const islemdeSatis = aksesuarlar.filter(a => a.durum === 'islemde').length;
  const tamamlananSatis = aksesuarlar.filter(a => a.durum === 'tamamlandi').length;
  const iptalSatis = aksesuarlar.filter(a => a.durum === 'iptal_edildi').length;
  const toplamTutar = aksesuarlar.reduce((sum, a) => sum + parseFloat(a.toplam_satis || a.odeme_tutari || 0), 0);

  // Filtre chip'ine tıklandığında
  const handleFilterClick = (type) => {
    if (type === 'bugun') {
      setFilterBugun(!filterBugun);
      setFilterDurum('');
    } else if (type === 'beklemede') {
      setFilterDurum(filterDurum === 'beklemede' ? '' : 'beklemede');
      setFilterBugun(false);
    } else if (type === 'islemde') {
      setFilterDurum(filterDurum === 'islemde' ? '' : 'islemde');
      setFilterBugun(false);
    } else if (type === 'tamamlandi') {
      setFilterDurum(filterDurum === 'tamamlandi' ? '' : 'tamamlandi');
      setFilterBugun(false);
    } else if (type === 'iptal_edildi') {
      setFilterDurum(filterDurum === 'iptal_edildi' ? '' : 'iptal_edildi');
      setFilterBugun(false);
    } else {
      setFilterBugun(false);
      setFilterDurum('');
    }
  };

  return (
    <Box>
      {/* Header with Stats */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" fontWeight={700}>
              Aksesuar Satışları
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Typography>
          </Box>
          
          {/* İstatistik Chip'leri */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`Toplam: ${toplamSatis}`}
              size="small"
              onClick={() => handleFilterClick('toplam')}
              sx={{
                bgcolor: !filterBugun && !filterDurum ? themeColors.primary : 'grey.100',
                color: !filterBugun && !filterDurum ? 'white' : 'text.primary',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { opacity: 0.9 },
              }}
            />
            <Chip
              label={`Bugün: ${bugunkuSatis}`}
              size="small"
              onClick={() => handleFilterClick('bugun')}
              sx={{
                bgcolor: filterBugun ? '#ff9800' : 'grey.100',
                color: filterBugun ? 'white' : 'text.primary',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { opacity: 0.9 },
              }}
            />
            <Chip
              label={`Beklemede: ${beklemedeSatis}`}
              size="small"
              onClick={() => handleFilterClick('beklemede')}
              sx={{
                bgcolor: filterDurum === 'beklemede' ? '#ff9800' : 'grey.100',
                color: filterDurum === 'beklemede' ? 'white' : 'text.primary',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { opacity: 0.9 },
              }}
            />
            <Chip
              label={`İşlemde: ${islemdeSatis}`}
              size="small"
              onClick={() => handleFilterClick('islemde')}
              sx={{
                bgcolor: filterDurum === 'islemde' ? '#2196f3' : 'grey.100',
                color: filterDurum === 'islemde' ? 'white' : 'text.primary',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { opacity: 0.9 },
              }}
            />
            <Chip
              label={`Tamamlandı: ${tamamlananSatis}`}
              size="small"
              onClick={() => handleFilterClick('tamamlandi')}
              sx={{
                bgcolor: filterDurum === 'tamamlandi' ? '#4caf50' : 'grey.100',
                color: filterDurum === 'tamamlandi' ? 'white' : 'text.primary',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { opacity: 0.9 },
              }}
            />
            <Chip
              label={`İptal: ${iptalSatis}`}
              size="small"
              onClick={() => handleFilterClick('iptal_edildi')}
              sx={{
                bgcolor: filterDurum === 'iptal_edildi' ? '#f44336' : 'grey.100',
                color: filterDurum === 'iptal_edildi' ? 'white' : 'text.primary',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { opacity: 0.9 },
              }}
            />
            <Typography 
              variant="body2" 
              sx={{ 
                ml: 1, 
                color: themeColors.primary, 
                fontWeight: 700,
                bgcolor: `${themeColors.primary}15`,
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              {formatCurrency(toplamTutar)}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{
            bgcolor: themeColors.primary,
            '&:hover': { bgcolor: themeColors.primaryDark },
          }}
        >
          Yeni Satış
        </Button>
      </Box>

      {/* Search and Filter Row */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Ad veya telefon ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: 250, flex: { xs: 1, sm: 'none' } }}
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
            
            {(filterBugun || filterDurum || searchQuery) && (
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={() => {
                  setFilterBugun(false);
                  setFilterDurum('');
                  setSearchQuery('');
                }}
                color="inherit"
              >
                Filtreleri Temizle
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Tablo */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: themeColors.primary }} />
            </Box>
          ) : filteredAksesuarlar.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">Kayıt bulunamadı</Typography>
            </Box>
          ) : isMobile ? (
            // Mobile Card View
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredAksesuarlar.map((aksesuar) => (
                <Paper key={aksesuar.id} variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>{aksesuar.ad_soyad}</Typography>
                    <Box>
                      <IconButton size="small" onClick={() => handleViewDetails(aksesuar)} sx={{ color: themeColors.primary }}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleOpenModal(aksesuar)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(aksesuar.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {aksesuar.telefon || '-'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {aksesuar.parcalar?.length || 0} ürün
                  </Typography>
                  {aksesuar.odeme_sekli && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Ödeme: {aksesuar.odeme_sekli}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Chip 
                      label={durumConfig[aksesuar.durum]?.label || 'Beklemede'} 
                      size="small" 
                      sx={{ 
                        bgcolor: durumConfig[aksesuar.durum]?.bgColor || '#fff3e0',
                        color: durumConfig[aksesuar.durum]?.color || '#ff9800',
                        fontWeight: 600,
                      }}
                    />
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: themeColors.primary }}>
                      {formatCurrency(aksesuar.toplam_satis || aksesuar.odeme_tutari)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {formatDate(aksesuar.created_at)}
                  </Typography>
                </Paper>
              ))}
            </Box>
          ) : (
            // Desktop Table View
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: `${themeColors.primary}15` }}>
                    <TableCell sx={{ fontWeight: 700 }}>Ad Soyad</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Telefon</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Ürün Sayısı</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Ödeme Şekli</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Durum</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Tutar</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tarih</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAksesuarlar.map((aksesuar) => (
                    <TableRow key={aksesuar.id} hover>
                      <TableCell>{aksesuar.ad_soyad}</TableCell>
                      <TableCell>{aksesuar.telefon || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${aksesuar.parcalar?.length || 0} ürün`} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{aksesuar.odeme_sekli || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={durumConfig[aksesuar.durum]?.label || 'Beklemede'} 
                          size="small"
                          sx={{ 
                            bgcolor: durumConfig[aksesuar.durum]?.bgColor || '#fff3e0',
                            color: durumConfig[aksesuar.durum]?.color || '#ff9800',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600} sx={{ color: themeColors.primary }}>
                          {formatCurrency(aksesuar.toplam_satis || aksesuar.odeme_tutari)}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(aksesuar.created_at)}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleViewDetails(aksesuar)} sx={{ color: themeColors.primary }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleOpenModal(aksesuar)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(aksesuar.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Yeni/Düzenle Modal */}
      <AksesuarModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        editId={editingId}
      />

      {/* Detay Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: themeColors.primary, 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingBagIcon />
            <Typography variant="h6">Aksesuar Detayları</Typography>
          </Box>
          <IconButton onClick={() => setDetailDialogOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedAksesuar && (
            <>
              {/* Müşteri Bilgileri */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ bgcolor: `${themeColors.primary}20`, color: themeColors.primary, width: 32, height: 32 }}>
                    <PersonIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={600}>Müşteri Bilgileri</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Ad Soyad</Typography>
                    <Typography variant="body1" fontWeight={500}>{selectedAksesuar.ad_soyad || '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Telefon</Typography>
                    <Typography variant="body1">{selectedAksesuar.telefon || '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Tarih</Typography>
                    <Typography variant="body1">{formatDate(selectedAksesuar.created_at)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Durum</Typography>
                    <Chip 
                      label={durumConfig[selectedAksesuar.durum]?.label || 'Beklemede'} 
                      size="small"
                      sx={{ 
                        mt: 0.5,
                        bgcolor: durumConfig[selectedAksesuar.durum]?.bgColor,
                        color: durumConfig[selectedAksesuar.durum]?.color,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Ürünler */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ bgcolor: `${themeColors.primary}20`, color: themeColors.primary, width: 32, height: 32 }}>
                    <ShoppingBagIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={600}>Ürünler</Typography>
                  <Chip label={`${selectedAksesuar.parcalar?.length || 0} ürün`} size="small" sx={{ ml: 1 }} />
                </Box>
                
                {selectedAksesuar.parcalar && selectedAksesuar.parcalar.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
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
                            <TableCell align="right">{formatCurrency(parca.maliyet)}</TableCell>
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
                  <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">Ürün eklenmemiş</Typography>
                  </Paper>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Özet */}
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 2 }}>
                <Paper sx={{ p: 2, flex: 1, minWidth: 150, bgcolor: 'error.lighter' }}>
                  <Typography variant="caption" color="text.secondary">Toplam Maliyet</Typography>
                  <Typography variant="h6" color="error.main" fontWeight={700}>
                    {formatCurrency(selectedAksesuar.toplam_maliyet)}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: 1, minWidth: 150, bgcolor: 'grey.100' }}>
                  <Typography variant="caption" color="text.secondary">Toplam Satış</Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatCurrency(selectedAksesuar.toplam_satis || selectedAksesuar.odeme_tutari)}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: 1, minWidth: 150, bgcolor: 'success.lighter' }}>
                  <Typography variant="caption" color="text.secondary">Net Kar</Typography>
                  <Typography variant="h6" color="success.main" fontWeight={700}>
                    {formatCurrency(selectedAksesuar.kar)}
                  </Typography>
                </Paper>
              </Box>

              {/* Ödeme Detayları */}
              {(selectedAksesuar.odeme_sekli || selectedAksesuar.odeme_detaylari) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main', width: 32, height: 32 }}>
                        <ReceiptIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight={600}>Ödeme Bilgileri</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {selectedAksesuar.odeme_sekli && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Ödeme Şekli</Typography>
                          <Typography variant="body1">{selectedAksesuar.odeme_sekli}</Typography>
                        </Box>
                      )}
                      {selectedAksesuar.odeme_detaylari && (
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">Ödeme Detayları</Typography>
                          <Typography variant="body1">{selectedAksesuar.odeme_detaylari}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </>
              )}

              {/* Açıklama */}
              {selectedAksesuar.aciklama && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Açıklama / Not</Typography>
                    <Typography variant="body1">{selectedAksesuar.aciklama}</Typography>
                  </Box>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailDialogOpen(false)} color="inherit">
            Kapat
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              setDetailDialogOpen(false);
              handleOpenModal(selectedAksesuar);
            }}
            sx={{ bgcolor: themeColors.primary, '&:hover': { bgcolor: themeColors.primaryDark } }}
          >
            Düzenle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Aksesuarlar;
