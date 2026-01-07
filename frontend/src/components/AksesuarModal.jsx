import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Paper,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  ShoppingBag as ShoppingBagIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { aksesuarService } from '../services/api';
import { useCustomTheme } from '../context/ThemeContext';

function AksesuarModal({ open, onClose, onSuccess, editId = null }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { themeColors } = useCustomTheme();
  const isEdit = Boolean(editId);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    ad_soyad: '',
    telefon: '',
    odeme_sekli: '',
    aciklama: '',
    durum: 'beklemede',
    odeme_detaylari: '',
  });

  const [parcalar, setParcalar] = useState([]);
  const [newParca, setNewParca] = useState({
    urun_adi: '',
    adet: 1,
    maliyet: 0,
    satis_fiyati: 0,
  });

  // Edit modunda veriyi yükle
  useEffect(() => {
    const loadAksesuar = async () => {
      if (editId && open) {
        setLoading(true);
        try {
          const response = await aksesuarService.getById(editId);
          const data = response.data || response;
          setFormData({
            ad_soyad: data.ad_soyad || '',
            telefon: data.telefon || '',
            odeme_sekli: data.odeme_sekli || '',
            aciklama: data.aciklama || '',
            durum: data.durum || 'beklemede',
            odeme_detaylari: data.odeme_detaylari || '',
          });
          setParcalar(data.parcalar || []);
        } catch (err) {
          console.error('Edit yükleme hatası:', err);
          setError('Aksesuar yüklenirken hata oluştu');
        } finally {
          setLoading(false);
        }
      }
    };

    loadAksesuar();
  }, [editId, open]);

  // Modal kapandığında formu temizle
  useEffect(() => {
    if (!open) {
      setFormData({
        ad_soyad: '',
        telefon: '',
        odeme_sekli: '',
        aciklama: '',
        durum: 'beklemede',
        odeme_detaylari: '',
      });
      setParcalar([]);
      setNewParca({
        urun_adi: '',
        adet: 1,
        maliyet: 0,
        satis_fiyati: 0,
      });
      setError('');
    }
  }, [open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleParcaChange = (e) => {
    setNewParca({
      ...newParca,
      [e.target.name]: e.target.value,
    });
  };

  const addParca = () => {
    if (!newParca.urun_adi) return;

    setParcalar([...parcalar, { ...newParca, id: Date.now() }]);
    setNewParca({
      urun_adi: '',
      adet: 1,
      maliyet: 0,
      satis_fiyati: 0,
    });
  };

  const removeParca = (index) => {
    setParcalar(parcalar.filter((_, i) => i !== index));
  };

  // Inline parça düzenleme fonksiyonu
  const updateParca = (index, field, value) => {
    const updatedParcalar = [...parcalar];
    updatedParcalar[index] = {
      ...updatedParcalar[index],
      [field]: value
    };
    setParcalar(updatedParcalar);
  };

  const calculateTotals = () => {
    let toplamFiyat = 0;
    let toplamMaliyet = 0;

    parcalar.forEach((p) => {
      const adet = parseInt(p.adet) || 0;
      const fiyat = parseFloat(p.satis_fiyati) || 0;
      const maliyet = parseFloat(p.maliyet) || 0;

      toplamFiyat += adet * fiyat;
      toplamMaliyet += adet * maliyet;
    });

    const kar = toplamFiyat - toplamMaliyet;
    return { toplamFiyat, toplamMaliyet, kar };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data = {
        ...formData,
        parcalar: parcalar.map((p) => ({
          urun_adi: p.urun_adi,
          adet: parseInt(p.adet) || 1,
          satis_fiyati: parseFloat(p.satis_fiyati) || 0,
          maliyet: parseFloat(p.maliyet) || 0,
        })),
      };

      if (isEdit) {
        await aksesuarService.update(editId, data);
      } else {
        await aksesuarService.create(data);
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value || 0);
  };

  const { toplamFiyat } = calculateTotals();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      fullScreen={window.innerWidth < 600}
      PaperProps={{
        sx: { 
          minHeight: { xs: '100vh', sm: '90vh' },
          borderRadius: { xs: 0, sm: 2 },
          m: { xs: 0, sm: 2 },
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: { xs: 2, sm: 2.5 }, 
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: themeColors.primary,
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
            <ShoppingBagIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {isEdit ? 'Aksesuar Düzenle' : 'Yeni Aksesuar Satışı'}
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={onClose} 
          size="small"
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress sx={{ color: themeColors.primary }} />
          </Box>
        ) : (
          <form onSubmit={handleSubmit} id="aksesuar-form">
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              {/* Sol Kolon */}
              <Grid item xs={12} sm={6}>
                {/* Müşteri Bilgileri */}
                <Card sx={{ mb: 1.5 }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                      <Avatar sx={{ bgcolor: `${themeColors.primary}20`, color: themeColors.primary, width: 24, height: 24 }}>
                        <PersonIcon sx={{ fontSize: 14 }} />
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Müşteri Bilgileri
                      </Typography> 
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, mt: 0.5 }}>
                      <TextField
                        sx={{ flex: 1, mt: 1.1 }}
                        size="small"
                        label="Ad Soyad"
                        name="ad_soyad"
                        value={formData.ad_soyad}
                        onChange={handleChange}
                        required
                      />
                      <TextField
                        sx={{ flex: 1, mt: 1.1 }}
                        size="small"
                        label="Telefon"
                        name="telefon"
                        value={formData.telefon}
                        onChange={handleChange}
                      />
                    </Box>
                    <TextField
                      fullWidth
                      sx={{ mt: 1.1 }}
                      size="small"
                      multiline
                      rows={2}
                      label="Açıklama / Not"
                      name="aciklama"
                      value={formData.aciklama}
                      onChange={handleChange}
                      placeholder="Ek notlar..."
                    />
                  </CardContent>
                </Card>

                {/* Ödeme Detayları */}
                <Card>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main', width: 24, height: 24 }}>
                        <ReceiptIcon sx={{ fontSize: 14 }} />
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Ödeme Detayları
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        sx={{ flex: 1, mt: 1.1 }}
                        size="small"
                        label="Ödeme Şekli"
                        name="odeme_sekli"
                        value={formData.odeme_sekli}
                        onChange={handleChange}
                        placeholder="Nakit, Kart, Havale..."
                      />
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      size="small"
                      name="odeme_detaylari"
                      value={formData.odeme_detaylari}
                      onChange={handleChange}
                      placeholder="Ödeme detayları..."
                      sx={{ mt: 1.1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Sağ Kolon - Ürünler */}
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                      <Avatar sx={{ bgcolor: `${themeColors.primary}20`, color: themeColors.primary, width: 24, height: 24 }}>
                        <ShoppingBagIcon sx={{ fontSize: 14 }} />
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Ürünler ve Aksesuarlar
                      </Typography>
                      <Chip 
                        label={`${parcalar.length} ürün`} 
                        size="small" 
                        sx={{ ml: 'auto', bgcolor: themeColors.primary, color: 'white' }}
                      />
                    </Box>

                    {/* Yeni Ürün Ekleme */}
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 1.5, 
                        mb: 1.5, 
                        bgcolor: 'grey.50',
                        borderStyle: 'dashed'
                      }}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        label="Ürün / Aksesuar Adı"
                        name="urun_adi"
                        value={newParca.urun_adi}
                        onChange={handleParcaChange}
                        placeholder="Örn: Kask, Eldiven, Rüzgarlık..."
                        sx={{ mb: 1 }}
                      />
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                          sx={{ flex: 1, mt: 1.1 }}
                          size="small"
                          type="number"
                          label="Adet"
                          name="adet"
                          value={newParca.adet}
                          onChange={handleParcaChange}
                          inputProps={{ min: 1 }}
                        />
                        {isEdit && (
                          <TextField
                            sx={{ flex: 1, mt: 1.1 }}
                            size="small"
                            type="number"
                            label="Maliyet (₺)"
                            name="maliyet"
                            value={newParca.maliyet}
                            onChange={handleParcaChange}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                            }}
                            inputProps={{ min: 0, step: 0.01 }}
                          />
                        )}
                        <TextField
                          sx={{ flex: 1, mt: 1.1 }}
                          size="small"
                          type="number"
                          label="Satış Fiyatı (₺)"
                          name="satis_fiyati"
                          value={newParca.satis_fiyati}
                          onChange={handleParcaChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                          }}
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Box>
                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={addParca}
                        sx={{ bgcolor: themeColors.primary, '&:hover': { bgcolor: themeColors.primaryDark } }}
                      >
                        Ürün Ekle
                      </Button>
                    </Paper>

                    {/* Ürün Listesi */}
                    {isMobile ? (
                      /* Mobile Card View */
                      <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
                        {parcalar.length === 0 ? (
                          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary" variant="body2">
                              Henüz ürün eklenmedi
                            </Typography>
                          </Paper>
                        ) : (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: -1.5 }}>
                            {parcalar.map((parca, index) => (
                              <Paper key={parca.id || index} variant="outlined" sx={{ p: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <TextField
                                    sx={{ flex: 1, mt: 1.1 }}
                                    size="small"
                                    label="Ürün Adı"
                                    value={parca.urun_adi}
                                    onChange={(e) => updateParca(index, 'urun_adi', e.target.value)}
                                  />
                                  <IconButton size="small" color="error" onClick={() => removeParca(index)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <TextField
                                    sx={{ flex: 1, mt: 1.1 }}
                                    size="small"
                                    type="number"
                                    label="Adet"
                                    value={parca.adet}
                                    onChange={(e) => updateParca(index, 'adet', parseInt(e.target.value) || 1)}
                                    inputProps={{ min: 1 }}
                                  />
                                  {isEdit && (
                                    <TextField
                                      sx={{ flex: 1, mt: 1.1 }}
                                      size="small"
                                      type="number"
                                      label="Maliyet"
                                      value={parca.maliyet === 0 || parca.maliyet ? parca.maliyet : ''}
                                      onChange={(e) => updateParca(index, 'maliyet', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                      inputProps={{ min: 0, step: 0.01 }}
                                    />
                                  )}
                                  <TextField
                                    sx={{ flex: 1, mt: 1.1 }}
                                    size="small"
                                    type="number"
                                    label="Satış"
                                    value={parca.satis_fiyati === 0 || parca.satis_fiyati ? parca.satis_fiyati : ''}
                                    onChange={(e) => updateParca(index, 'satis_fiyati', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                    inputProps={{ min: 0, step: 0.01 }}
                                  />
                                </Box>
                              </Paper>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ) : (
                      /* Desktop Inline Düzenlenebilir Tablo */
                      <TableContainer 
                        component={Paper} 
                        variant="outlined" 
                        sx={{ maxHeight: 250, mb: 2 }}
                      >
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>Ürün</TableCell>
                              <TableCell align="center" width={80}>Adet</TableCell>
                              {isEdit && <TableCell align="right" width={100}>Maliyet</TableCell>}
                              <TableCell align="right" width={100}>Satış</TableCell>
                              <TableCell align="center" width={50}>Sil</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {parcalar.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={isEdit ? 5 : 4} align="center" sx={{ py: 3 }}>
                                  <Typography color="text.secondary" variant="body2">
                                    Henüz ürün eklenmedi
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ) : (
                              parcalar.map((parca, index) => (
                                <TableRow key={parca.id || index}>
                                  <TableCell>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={parca.urun_adi}
                                      onChange={(e) => updateParca(index, 'urun_adi', e.target.value)}
                                      placeholder="Ürün Adı"
                                      sx={{ '& input': { p: 0.5, fontWeight: 500 } }}
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <TextField
                                      size="small"
                                      type="number"
                                      value={parca.adet}
                                      onChange={(e) => updateParca(index, 'adet', parseInt(e.target.value) || 1)}
                                      inputProps={{ min: 1, style: { textAlign: 'center', width: 50 } }}
                                      sx={{ '& input': { p: 0.5 } }}
                                    />
                                  </TableCell>
                                  {isEdit && (
                                    <TableCell align="right">
                                      <TextField
                                        size="small"
                                        type="number"
                                        value={parca.maliyet === 0 || parca.maliyet ? parca.maliyet : ''}
                                        onChange={(e) => updateParca(index, 'maliyet', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                        inputProps={{ min: 0, step: 0.01, style: { textAlign: 'right', width: 70 } }}
                                        sx={{ '& input': { p: 0.5 } }}
                                      />
                                    </TableCell>
                                  )}
                                  <TableCell align="right">
                                    <TextField
                                      size="small"
                                      type="number"
                                      value={parca.satis_fiyati === 0 || parca.satis_fiyati ? parca.satis_fiyati : ''}
                                      onChange={(e) => updateParca(index, 'satis_fiyati', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                      inputProps={{ min: 0, step: 0.01, style: { textAlign: 'right', width: 70 } }}
                                      sx={{ '& input': { p: 0.5 } }}
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <IconButton 
                                      size="small" 
                                      color="error" 
                                      onClick={() => removeParca(index)}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}

                    {/* Toplamlar */}
                    {parcalar.length > 0 && (
                      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Grid container spacing={2}>
                          {isEdit ? (
                            <>
                              <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary">
                                  Toplam Maliyet
                                </Typography>
                                <Typography variant="subtitle1" color="error.main" fontWeight={600}>
                                  {formatCurrency(calculateTotals().toplamMaliyet)}
                                </Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary">
                                  Toplam Satış
                                </Typography>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {formatCurrency(toplamFiyat)}
                                </Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary">
                                  Net Kar
                                </Typography>
                                <Typography 
                                  variant="subtitle1" 
                                  fontWeight={700}
                                  color={calculateTotals().kar >= 0 ? 'success.main' : 'error.main'}
                                >
                                  {formatCurrency(calculateTotals().kar)}
                                </Typography>
                              </Grid>
                            </>
                          ) : (
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary">
                                Toplam Tutar
                              </Typography>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {formatCurrency(toplamFiyat)}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>
                    )}

                    {/* Durum (Sadece düzenleme modunda) */}
                    {isEdit && (
                      <Box sx={{ mt: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                          <Avatar sx={{ bgcolor: 'info.lighter', color: 'info.main', width: 24, height: 24 }}>
                            <ShippingIcon sx={{ fontSize: 14 }} />
                          </Avatar>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Durum
                          </Typography>
                        </Box>
                        <FormControl fullWidth size="small">
                          <InputLabel>Durum</InputLabel>
                          <Select
                            name="durum"
                            value={formData.durum}
                            label="Durum"
                            onChange={handleChange}
                          >
                            <MenuItem value="beklemede">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                                Beklemede
                              </Box>
                            </MenuItem>
                            <MenuItem value="islemde">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />
                                İşlemde
                              </Box>
                            </MenuItem>
                            <MenuItem value="tamamlandi">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                                Tamamlandı
                              </Box>
                            </MenuItem>
                            <MenuItem value="iptal_edildi">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                                İptal Edildi
                              </Box>
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </form>
        )}
      </DialogContent>

      <DialogActions 
        sx={{ 
          px: { xs: 2, sm: 3 }, 
          py: 2, 
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Button 
          variant="outlined" 
          onClick={onClose} 
          disabled={saving}
          fullWidth={window.innerWidth < 600}
        >
          İptal
        </Button>
        <Button
          type="submit"
          fullWidth={window.innerWidth < 600}
          form="aksesuar-form"
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          disabled={saving || loading}
          sx={{ bgcolor: themeColors.primary, '&:hover': { bgcolor: themeColors.primaryDark } }}
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AksesuarModal;
