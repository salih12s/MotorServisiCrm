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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  useMediaQuery,
  useTheme,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { aksesuarService } from '../services/api';
import { format, isValid, parseISO, isToday } from 'date-fns';
import { tr } from 'date-fns/locale';

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
  const [editingAksesuar, setEditingAksesuar] = useState(null);
  const [formData, setFormData] = useState({
    ad_soyad: '',
    telefon: '',
    urun_adi: '',
    odeme_tutari: '',
    odeme_sekli: '',
    aciklama: '',
    durum: 'beklemede',
  });
  
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
      setEditingAksesuar(aksesuar);
      setFormData({
        ad_soyad: aksesuar.ad_soyad || '',
        telefon: aksesuar.telefon || '',
        urun_adi: aksesuar.urun_adi || '',
        odeme_tutari: aksesuar.odeme_tutari || '',
        odeme_sekli: aksesuar.odeme_sekli || '',
        aciklama: aksesuar.aciklama || '',
        durum: aksesuar.durum || 'beklemede',
      });
    } else {
      setEditingAksesuar(null);
      setFormData({
        ad_soyad: '',
        telefon: '',
        urun_adi: '',
        odeme_tutari: '',
        odeme_sekli: '',
        aciklama: '',
        durum: 'beklemede',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAksesuar(null);
    setFormData({
      ad_soyad: '',
      telefon: '',
      urun_adi: '',
      odeme_tutari: '',
      odeme_sekli: '',
      aciklama: '',
      durum: 'beklemede',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAksesuar) {
        await aksesuarService.update(editingAksesuar.id, formData);
      } else {
        await aksesuarService.create(formData);
      }
      handleCloseModal();
      loadAksesuarlar();
    } catch (error) {
      console.error('Kayıt hatası:', error);
    }
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
    a.urun_adi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  // İstatistikler - HİÇ FİLTRE UYGULANMADAN (iş emirleri gibi)
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
  const toplamTutar = aksesuarlar.reduce((sum, a) => sum + parseFloat(a.odeme_tutari || 0), 0);

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
      {/* Header with Stats in One Line - İş Emirleri sayfası gibi */}
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
          
          {/* İstatistik Chip'leri - İş Emirleri gibi durum bazlı */}
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
              placeholder="Ad, ürün veya telefon ara..."
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
                  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                    {aksesuar.urun_adi}
                  </Typography>
                  {aksesuar.odeme_sekli && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Ödeme: {aksesuar.odeme_sekli}
                    </Typography>
                  )}
                  {aksesuar.aciklama && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic' }}>
                      {aksesuar.aciklama}
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
                      {formatCurrency(aksesuar.odeme_tutari)}
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
                    <TableCell sx={{ fontWeight: 700 }}>Ürün Adı</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Ödeme Şekli</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Açıklama</TableCell>
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
                      <TableCell>{aksesuar.urun_adi}</TableCell>
                      <TableCell>{aksesuar.odeme_sekli || '-'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {aksesuar.aciklama || '-'}
                        </Typography>
                      </TableCell>
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
                          {formatCurrency(aksesuar.odeme_tutari)}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(aksesuar.created_at)}</TableCell>
                      <TableCell align="center">
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
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          bgcolor: themeColors.primary, 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingBagIcon />
            <Typography variant="h6">
              {editingAksesuar ? 'Aksesuar Düzenle' : 'Yeni Aksesuar Satışı'}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseModal} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ad Soyad"
                  value={formData.ad_soyad}
                  onChange={(e) => setFormData({ ...formData, ad_soyad: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefon"
                  value={formData.telefon}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ürün Adı"
                  value={formData.urun_adi}
                  onChange={(e) => setFormData({ ...formData, urun_adi: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ödeme Tutarı"
                  type="number"
                  value={formData.odeme_tutari}
                  onChange={(e) => setFormData({ ...formData, odeme_tutari: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ödeme Şekli"
                  value={formData.odeme_sekli}
                  onChange={(e) => setFormData({ ...formData, odeme_sekli: e.target.value })}
                  placeholder="Nakit, Kredi Kartı, Havale vb."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Durum</InputLabel>
                  <Select
                    value={formData.durum}
                    label="Durum"
                    onChange={(e) => setFormData({ ...formData, durum: e.target.value })}
                  >
                    <MenuItem value="beklemede">Beklemede</MenuItem>
                    <MenuItem value="islemde">İşlemde</MenuItem>
                    <MenuItem value="tamamlandi">Tamamlandı</MenuItem>
                    <MenuItem value="iptal_edildi">İptal Edildi</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Açıklama"
                  multiline
                  rows={2}
                  value={formData.aciklama}
                  onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                  placeholder="Notlar, ekstra bilgiler..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseModal} color="inherit">
              İptal
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{ 
                bgcolor: themeColors.primary,
                '&:hover': { bgcolor: themeColors.primaryDark }
              }}
            >
              {editingAksesuar ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Aksesuarlar;
