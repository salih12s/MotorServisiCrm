import React, { useState, useEffect, useCallback } from 'react';
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
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Avatar,
  Chip,
  useMediaQuery,
  useTheme,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  Inventory as InventoryIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { aksesuarStokService } from '../services/api';

function AksesuarStok() {
  const [stoklar, setStoklar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStok, setEditingStok] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { themeColors } = useCustomTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [formData, setFormData] = useState({
    stok_kodu: '',
    stok_adi: '',
    giren_miktar: 0,
    cikan_miktar: 0,
    birimi: 'Adet',
    alis_fiyati: 0,
    satis_fiyati: 0,
  });

  const loadStoklar = useCallback(async () => {
    try {
      setLoading(true);
      const response = await aksesuarStokService.getAll();
      setStoklar(response.data || []);
    } catch (error) {
      console.error('Stok listesi hatası:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoklar();
  }, [loadStoklar]);

  const handleOpenDialog = (stok = null) => {
    if (stok) {
      setEditingStok(stok);
      setFormData({
        stok_kodu: stok.stok_kodu,
        stok_adi: stok.stok_adi,
        giren_miktar: stok.giren_miktar,
        cikan_miktar: stok.cikan_miktar,
        birimi: stok.birimi,
        alis_fiyati: stok.alis_fiyati,
        satis_fiyati: stok.satis_fiyati,
      });
    } else {
      setEditingStok(null);
      setFormData({
        stok_kodu: '',
        stok_adi: '',
        giren_miktar: 0,
        cikan_miktar: 0,
        birimi: 'Adet',
        alis_fiyati: 0,
        satis_fiyati: 0,
      });
    }
    setError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStok(null);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (!formData.stok_kodu || !formData.stok_adi) {
      setError('Stok kodu ve stok adı zorunludur');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingStok) {
        await aksesuarStokService.update(editingStok.id, formData);
      } else {
        await aksesuarStokService.create(formData);
      }
      handleCloseDialog();
      loadStoklar();
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu stok kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await aksesuarStokService.delete(id);
        loadStoklar();
      } catch (error) {
        console.error('Silme hatası:', error);
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  // Filtreleme
  const filteredStoklar = stoklar.filter((s) =>
    s.stok_kodu?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.stok_adi?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toplam envanter değeri
  const toplamEnvanter = stoklar.reduce((sum, s) => sum + parseFloat(s.envanter_degeri || 0), 0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`Toplam: ${stoklar.length} ürün`}
            size="small"
            sx={{ bgcolor: '#1a237e', color: 'white', fontWeight: 600 }}
          />
          <Chip
            label={`Envanter: ₺${formatCurrency(toplamEnvanter)}`}
            size="small"
            sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: themeColors.primary, '&:hover': { bgcolor: themeColors.primaryDark } }}
        >
          Yeni Ürün Ekle
        </Button>
      </Box>

      {/* Arama */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Stok kodu veya ürün adı ile ara..."
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
        </CardContent>
      </Card>

      {/* Tablo */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: themeColors.primary }} />
            </Box>
          ) : filteredStoklar.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">Stok kaydı bulunamadı</Typography>
            </Box>
          ) : isMobile ? (
            // Mobile Card View
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {filteredStoklar.map((stok) => (
                <Paper key={stok.id} variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">{stok.stok_kodu}</Typography>
                      <Typography variant="subtitle2" fontWeight={600}>{stok.stok_adi}</Typography>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenDialog(stok)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      {isAdmin && (
                        <IconButton size="small" color="error" onClick={() => handleDelete(stok.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Giren</Typography>
                      <Typography variant="body2">{stok.giren_miktar}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Çıkan</Typography>
                      <Typography variant="body2">{stok.cikan_miktar}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Mevcut</Typography>
                      <Typography variant="body2" fontWeight={600}>{stok.mevcut} {stok.birimi}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Alış</Typography>
                      <Typography variant="body2">₺{formatCurrency(stok.alis_fiyati)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Satış</Typography>
                      <Typography variant="body2">₺{formatCurrency(stok.satis_fiyati)}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 1, textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: themeColors.primary }}>
                      Envanter: ₺{formatCurrency(stok.envanter_degeri)}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            // Desktop Table View
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: `${themeColors.primary}15` }}>
                    <TableCell sx={{ fontWeight: 700 }}>Stok Kodu</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Stok Adı</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Giren Miktar</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Çıkan Miktar</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Mevcut</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Alış Fiyatı</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Fiyat A</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Envanter Değeri</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStoklar.map((stok) => (
                    <TableRow key={stok.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{stok.stok_kodu}</TableCell>
                      <TableCell>{stok.stok_adi}</TableCell>
                      <TableCell align="center">{stok.giren_miktar}</TableCell>
                      <TableCell align="center">{stok.cikan_miktar}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${stok.mevcut} ${stok.birimi}`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: stok.mevcut > 0 ? '#e8f5e9' : '#ffebee',
                            color: stok.mevcut > 0 ? '#2e7d32' : '#c62828',
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">₺{formatCurrency(stok.alis_fiyati)}</TableCell>
                      <TableCell align="right">₺{formatCurrency(stok.satis_fiyati)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        ₺{formatCurrency(stok.envanter_degeri)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleOpenDialog(stok)} sx={{ color: themeColors.primary }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        {isAdmin && (
                          <IconButton size="small" color="error" onClick={() => handleDelete(stok.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Toplam Satırı */}
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell colSpan={7} align="right" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      Toplam Envanter Tutarı:
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.95rem', color: themeColors.primary }}>
                      ₺{formatCurrency(toplamEnvanter)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Ekleme/Düzenleme Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          bgcolor: themeColors.primary,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InventoryIcon />
            <Typography variant="h6">{editingStok ? 'Stok Düzenle' : 'Yeni Stok Ekle'}</Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Stok Kodu"
                name="stok_kodu"
                value={formData.stok_kodu}
                onChange={handleChange}
                required
                placeholder="869000000XXXX"
              />
              <TextField
                fullWidth
                size="small"
                label="Birimi"
                name="birimi"
                value={formData.birimi}
                onChange={handleChange}
                sx={{ maxWidth: 120 }}
              />
            </Box>
            <TextField
              fullWidth
              size="small"
              label="Stok Adı"
              name="stok_adi"
              value={formData.stok_adi}
              onChange={handleChange}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Giren Miktar"
                name="giren_miktar"
                value={formData.giren_miktar}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Çıkan Miktar"
                name="cikan_miktar"
                value={formData.cikan_miktar}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Alış Fiyatı (₺)"
                name="alis_fiyati"
                value={formData.alis_fiyati}
                onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start">₺</InputAdornment> }}
                inputProps={{ min: 0, step: 0.01 }}
              />
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Satış Fiyatı / Fiyat A (₺)"
                name="satis_fiyati"
                value={formData.satis_fiyati}
                onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start">₺</InputAdornment> }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Box>
            {/* Mevcut ve Envanter Bilgisi (otomatik) */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Paper variant="outlined" sx={{ p: 1.5, flex: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Mevcut Stok</Typography>
                <Typography variant="h6" fontWeight={700}>
                  {(parseInt(formData.giren_miktar) || 0) - (parseInt(formData.cikan_miktar) || 0)}
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, flex: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Envanter Değeri</Typography>
                <Typography variant="h6" fontWeight={700} sx={{ color: themeColors.primary }}>
                  ₺{formatCurrency(
                    ((parseInt(formData.giren_miktar) || 0) - (parseInt(formData.cikan_miktar) || 0)) * (parseFloat(formData.satis_fiyati) || 0)
                  )}
                </Typography>
              </Paper>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">İptal</Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{ bgcolor: themeColors.primary, '&:hover': { bgcolor: themeColors.primaryDark } }}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AksesuarStok;
