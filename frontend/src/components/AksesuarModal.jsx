import React, { useState, useEffect, useCallback } from 'react';
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
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  ShoppingBag as ShoppingBagIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { aksesuarService, aksesuarStokService } from '../services/api';
import { useCustomTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { calculateTotals } from './aksesuarModalUtils';
import AksesuarUrunlerSection from './AksesuarUrunlerSection';

// service / stokService / baslik propları ile farklı satış türlerine (örn. hobi grup bisiklet)
// uyarlanabilir; varsayılanlar aksesuar satışı davranışını korur.
function AksesuarModal({
  open,
  onClose,
  onSuccess,
  editId = null,
  service = aksesuarService,
  stokService = aksesuarStokService,
  baslik = 'Aksesuar',
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { themeColors } = useCustomTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
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
    satis_tarihi: new Date().toISOString().split('T')[0],
    olusturan_kisi: user?.name || user?.ad_soyad || '',
  });

  const [parcalar, setParcalar] = useState([]);
  const [newParca, setNewParca] = useState({
    urun_adi: '',
    adet: 1,
    maliyet: 0,
    satis_fiyati: 0,
  });

  // Stok arama state'leri
  const [stokOptions, setStokOptions] = useState([]);
  const [stokSearchLoading, setStokSearchLoading] = useState(false);
  const [selectedStok, setSelectedStok] = useState(null);

  // Stok arama fonksiyonu (debounce ile)
  const searchTimeoutRef = React.useRef(null);
  const searchStok = useCallback((query) => {
    if (!query || query.length < 2) {
      setStokOptions([]);
      return;
    }
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(async () => {
      setStokSearchLoading(true);
      try {
        const response = await stokService.search(query);
        setStokOptions(response.data || []);
      } catch (err) {
        console.error('Stok arama hatası:', err);
        setStokOptions([]);
      } finally {
        setStokSearchLoading(false);
      }
    }, 300);
  }, [stokService]);

  // Edit modunda veriyi yükle
  useEffect(() => {
    const loadAksesuar = async () => {
      if (editId && open) {
        setLoading(true);
        try {
          const response = await service.getById(editId);
          const data = response.data || response;
          
          // Tarih düzeltmesi - sadece YYYY-MM-DD kısmını al, Date objesine çevirme
          let satisTarihi = new Date().toISOString().split('T')[0];
          if (data.satis_tarihi) {
            // String olarak ilk 10 karakteri al (YYYY-MM-DD)
            satisTarihi = String(data.satis_tarihi).substring(0, 10);
          }
          
          setFormData({
            ad_soyad: data.ad_soyad || '',
            telefon: data.telefon || '',
            odeme_sekli: data.odeme_sekli || '',
            aciklama: data.aciklama || '',
            durum: data.durum || 'beklemede',
            odeme_detaylari: data.odeme_detaylari || '',
            satis_tarihi: satisTarihi,
            olusturan_kisi: data.olusturan_kisi || user?.name || user?.ad_soyad || '',
          });
          setParcalar(data.parcalar || []);
        } catch (err) {
          console.error('Edit yükleme hatası:', err);
          setError('Kayıt yüklenirken hata oluştu');
        } finally {
          setLoading(false);
        }
      }
    };

    loadAksesuar();
  }, [editId, open, user, service]);

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
        satis_tarihi: new Date().toISOString().split('T')[0],
        olusturan_kisi: user?.name || user?.ad_soyad || '',
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
  }, [open, user]);

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
    setSelectedStok(null);
    setStokOptions([]);
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
        await service.update(editId, data);
      } else {
        await service.create(data);
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

  const { toplamFiyat } = calculateTotals(parcalar);

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
              {isEdit ? `${baslik} Düzenle` : `Yeni ${baslik} Satışı`}
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
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        sx={{ flex: 1 , mt: 1.1 }}
                        size="small"
                        label="Ad Soyad"
                        name="ad_soyad"
                        value={formData.ad_soyad}
                        onChange={handleChange}
                        required
                      />
                      <TextField
                        sx={{ flex: 1 , mt: 1.1 }}
                        size="small"
                        label="Telefon"
                        name="telefon"
                        value={formData.telefon}
                        onChange={handleChange}
                      />
                    </Box>
                    <Box sx={{ width: 180, mb: 1 }}>
                      <FormControl fullWidth size="small" sx={{ mt: 1.1 }}>
                        <InputLabel>Oluşturan Kişi</InputLabel>
                        <Select
                          name="olusturan_kisi"
                          value={formData.olusturan_kisi}
                          label="Oluşturan Kişi"
                          onChange={handleChange}
                        >
                          <MenuItem value={user?.name || user?.ad_soyad || ''}>
                            {user?.name || user?.ad_soyad || 'Ben'}
                          </MenuItem>
                          <MenuItem value="Ortak">Ortak</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <TextField
                      fullWidth
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
                        sx={{ flex: 1 , mt: 1.1 }}
                        size="small"
                        label="Ödeme Şekli"
                        name="odeme_sekli"
                        value={formData.odeme_sekli}
                        onChange={handleChange}
                        placeholder="Nakit, Kart, Havale..."
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        sx={{ flex: 1 , mt: 1.1}}
                        size="small"
                        label="Satış Tarihi"
                        name="satis_tarihi"
                        type="date"
                        value={formData.satis_tarihi}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
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
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Sağ Kolon - Ürünler */}
              <AksesuarUrunlerSection
                parcalar={parcalar}
                newParca={newParca}
                setNewParca={setNewParca}
                handleParcaChange={handleParcaChange}
                addParca={addParca}
                removeParca={removeParca}
                updateParca={updateParca}
                isEdit={isEdit}
                isMobile={isMobile}
                isAdmin={isAdmin}
                formData={formData}
                handleChange={handleChange}
                toplamFiyat={toplamFiyat}
                themeColors={themeColors}
                stokOptions={stokOptions}
                stokSearchLoading={stokSearchLoading}
                selectedStok={selectedStok}
                setSelectedStok={setSelectedStok}
                searchStok={searchStok}
              />
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
