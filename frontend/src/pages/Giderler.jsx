import React, { useState, useEffect } from 'react';
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
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  Tooltip,
  Divider,
  useMediaQuery,
  useTheme,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoneyOff as MoneyOffIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { giderService } from '../services/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const KATEGORILER = [
  { value: 'Kira', color: '#1a237e' },
  { value: 'Elektrik', color: '#ff8f00' },
  { value: 'Su', color: '#0277bd' },
  { value: 'Doğalgaz', color: '#c62828' },
  { value: 'İnternet', color: '#6a1b9a' },
  { value: 'Personel', color: '#00897b' },
  { value: 'Malzeme', color: '#0d47a1' },
  { value: 'Bakım', color: '#689f38' },
  { value: 'Vergi', color: '#d84315' },
  { value: 'Sigorta', color: '#5d4037' },
  { value: 'Diğer', color: '#757575' },
];

function Giderler() {
  const [giderler, setGiderler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTarih, setFilterTarih] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGider, setEditingGider] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [formData, setFormData] = useState({
    aciklama: '',
    tutar: '',
    kategori: '',
    tarih: format(new Date(), 'yyyy-MM-dd'),
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGiderler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTarih, filterKategori]);

  const loadGiderler = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterTarih) params.tarih = filterTarih;
      if (filterKategori) params.kategori = filterKategori;
      
      const response = await giderService.getAll(params);
      setGiderler(response.data);
    } catch (error) {
      console.error('Gider listesi hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (gider = null) => {
    if (gider) {
      setEditingGider(gider);
      setFormData({
        aciklama: gider.aciklama || '',
        tutar: gider.tutar || '',
        kategori: gider.kategori || '',
        tarih: gider.tarih?.split('T')[0] || format(new Date(), 'yyyy-MM-dd'),
      });
    } else {
      setEditingGider(null);
      setFormData({
        aciklama: '',
        tutar: '',
        kategori: '',
        tarih: format(new Date(), 'yyyy-MM-dd'),
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingGider(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.aciklama || !formData.tutar) return;

    setSaving(true);
    try {
      const data = {
        ...formData,
        tutar: parseFloat(formData.tutar),
      };
      
      if (editingGider) {
        await giderService.update(editingGider.id, data);
      } else {
        await giderService.create(data);
      }
      loadGiderler();
      handleCloseDialog();
    } catch (error) {
      console.error('Kaydetme hatası:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu gideri silmek istediğinizden emin misiniz?')) {
      try {
        await giderService.delete(id);
        loadGiderler();
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

  const getKategoriColor = (kategori) => {
    const found = KATEGORILER.find(k => k.value === kategori);
    return found ? found.color : '#757575';
  };

  const clearFilters = () => {
    setFilterTarih('');
    setFilterKategori('');
  };

  const hasActiveFilters = filterTarih || filterKategori;
  const toplamGider = giderler.reduce((sum, g) => sum + parseFloat(g.tutar || 0), 0);

  // Kategori bazlı istatistikler
  const kategoriStats = KATEGORILER.map(k => ({
    ...k,
    toplam: giderler.filter(g => g.kategori === k.value).reduce((sum, g) => sum + parseFloat(g.tutar || 0), 0)
  })).filter(k => k.toplam > 0).sort((a, b) => b.toplam - a.toplam);

  return (
    <Box>
      {/* Header with Stats */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Giderler
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Typography>
          </Box>
          {/* Inline Stats */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip 
              label={`Kayıt: ${giderler.length}`} 
              sx={{ bgcolor: '#e3f2fd', color: '#1a237e', fontWeight: 600 }} 
            />
            <Chip 
              label={formatCurrency(toplamGider)} 
              sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 600 }} 
            />
            {kategoriStats.length > 0 && (
              <Chip 
                label={`${kategoriStats[0]?.value}: ${formatCurrency(kategoriStats[0]?.toplam)}`} 
                sx={{ bgcolor: `${kategoriStats[0]?.color}15`, color: kategoriStats[0]?.color, fontWeight: 600 }} 
              />
            )}
          </Box>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
          sx={{ px: 3 }}
        >
          Yeni Gider
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6} sm={4} md={3}>
              <TextField
                type="date"
                label="Tarih"
                size="small"
                fullWidth
                value={filterTarih}
                onChange={(e) => setFilterTarih(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <FormControl size="small" fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={filterKategori}
                  label="Kategori"
                  onChange={(e) => setFilterKategori(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {KATEGORILER.map((k) => (
                    <MenuItem key={k.value} value={k.value}>{k.value}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {giderler.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <MoneyOffIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Henüz gider kaydı bulunmuyor
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  sx={{ mt: 2 }}
                >
                  İlk Gideri Ekle
                </Button>
              </CardContent>
            </Card>
          ) : (
            giderler.map((gider) => (
              <Card key={gider.id} sx={{ overflow: 'hidden' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                      <Avatar sx={{ bgcolor: getKategoriColor(gider.kategori), width: 36, height: 36, flexShrink: 0 }}>
                        <AttachMoneyIcon fontSize="small" />
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {format(new Date(gider.tarih), 'dd MMM yyyy', { locale: tr })}
                        </Typography>
                        <Chip
                          label={gider.kategori}
                          size="small"
                          sx={{
                            bgcolor: `${getKategoriColor(gider.kategori)}15`,
                            color: getKategoriColor(gider.kategori),
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: '20px',
                            mt: 0.5,
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="error.main"
                      sx={{ fontSize: '1rem', flexShrink: 0 }}
                      noWrap
                    >
                      {formatCurrency(gider.tutar)}
                    </Typography>
                  </Box>

                  {gider.aciklama && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                        <DescriptionIcon fontSize="small" color="action" sx={{ fontSize: '0.9rem', mt: 0.1, flexShrink: 0 }} />
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.875rem',
                            minWidth: 0,
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {gider.aciklama}
                        </Typography>
                      </Box>
                    </>
                  )}

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon sx={{ fontSize: '1rem' }} />}
                      onClick={() => handleOpenDialog(gider)}
                      sx={{ flex: 1, minWidth: 0, px: 1, fontSize: '0.75rem' }}
                    >
                      Düzenle
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon sx={{ fontSize: '1rem' }} />}
                      onClick={() => handleDelete(gider.id)}
                      sx={{ flex: 1, minWidth: 0, px: 1, fontSize: '0.75rem' }}
                    >
                      Sil
                    </Button>
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
            <Table size="small" sx={{ minWidth: { xs: 800, sm: '100%' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Açıklama</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell align="right">Tutar</TableCell>
                  <TableCell align="center" width={120}>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {giderler.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <MoneyOffIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                        <Typography variant="h6" color="text.secondary">
                          {hasActiveFilters ? 'Filtrelere uygun gider bulunamadı' : 'Henüz gider kaydı bulunmuyor'}
                        </Typography>
                        {!hasActiveFilters && (
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                          >
                            İlk Gideri Ekle
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  giderler.map((gider) => (
                    <TableRow key={gider.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography fontWeight={600}>
                            {gider.tarih ? format(new Date(gider.tarih), 'dd MMM yyyy', { locale: tr }) : '-'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography>{gider.aciklama}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={gider.kategori || 'Genel'}
                          sx={{
                            bgcolor: `${getKategoriColor(gider.kategori)}15`,
                            color: getKategoriColor(gider.kategori),
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={700} sx={{ color: '#c62828' }}>
                          {formatCurrency(gider.tutar)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Düzenle">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(gider)}
                            sx={{ mr: 0.5 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(gider.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: '#c62828',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MoneyOffIcon sx={{ color: 'white' }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              {editingGider ? 'Gider Düzenle' : 'Yeni Gider'}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Tarih"
                name="tarih"
                value={formData.tarih}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                  name="kategori"
                  value={formData.kategori}
                  label="Kategori"
                  onChange={handleChange}
                >
                  {KATEGORILER.map((k) => (
                    <MenuItem key={k.value} value={k.value}>{k.value}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama"
                name="aciklama"
                value={formData.aciklama}
                onChange={handleChange}
                required
                placeholder="Gider açıklamasını girin"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Tutar (₺)"
                name="tutar"
                value={formData.tutar}
                onChange={handleChange}
                required
                placeholder="0.00"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit">
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving || !formData.aciklama || !formData.tutar}
            sx={{ minWidth: 120 }}
          >
            {saving ? <CircularProgress size={24} /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Giderler;
