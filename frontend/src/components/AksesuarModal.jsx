import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { aksesuarService, aksesuarStokService } from '../services/api';
import { useCustomTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { calculateTotals } from './aksesuarModalUtils';
import CustomerInfoSection from './aksesuarModal/CustomerInfoSection';
import PaymentDetailsSection from './aksesuarModal/PaymentDetailsSection';
import ProductAddSection from './aksesuarModal/ProductAddSection';
import ProductsTableSection from './aksesuarModal/ProductsTableSection';

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
    odeme_sekli: 'nakit',
    nakit_tutar: '',
    kart_tutar: '',
    havale_tutar: '',
    cari_nakit_tutar: 0,
    cari_kart_tutar: 0,
    cari_havale_tutar: 0,
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
            odeme_sekli: data.odeme_sekli || 'nakit',
            nakit_tutar: data.nakit_tutar || '',
            kart_tutar: data.kart_tutar || '',
            havale_tutar: data.havale_tutar || '',
            cari_nakit_tutar: Number(data.cari_nakit_tutar || 0),
            cari_kart_tutar: Number(data.cari_kart_tutar || 0),
            cari_havale_tutar: Number(data.cari_havale_tutar || 0),
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
        odeme_sekli: 'nakit',
        nakit_tutar: '',
        kart_tutar: '',
        havale_tutar: '',
        cari_nakit_tutar: 0,
        cari_kart_tutar: 0,
        cari_havale_tutar: 0,
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
      const selectedPaymentField = `${formData.odeme_sekli}_tutar`;
      const enteredPayments = formData.odeme_sekli === 'karisik'
        ? [Number(formData.nakit_tutar || 0), Number(formData.kart_tutar || 0), Number(formData.havale_tutar || 0)]
        : [
            formData.odeme_sekli === 'nakit' ? Number(formData[selectedPaymentField] || 0) : 0,
            formData.odeme_sekli === 'kart' ? Number(formData[selectedPaymentField] || 0) : 0,
            formData.odeme_sekli === 'havale' ? Number(formData[selectedPaymentField] || 0) : 0,
          ];
      const laterPayments = [Number(formData.cari_nakit_tutar || 0), Number(formData.cari_kart_tutar || 0), Number(formData.cari_havale_tutar || 0)];
      const initialPayments = enteredPayments.map((amount, index) => Math.max(amount - laterPayments[index], 0));
      if (enteredPayments.some((amount) => !Number.isFinite(amount) || amount < 0) || enteredPayments.reduce((sum, amount) => sum + amount, 0) > toplamFiyat + .005) {
        setError('Girilen ödemeler satış toplamını aşamaz.');
        setSaving(false);
        return;
      }
      const data = {
        ...formData,
        nakit_tutar: initialPayments[0],
        kart_tutar: initialPayments[1],
        havale_tutar: initialPayments[2],
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
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
                alignItems: 'start',
              }}
            >
              {/* Sol Kolon */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <CustomerInfoSection formData={formData} handleChange={handleChange} user={user} themeColors={themeColors} />
                <PaymentDetailsSection formData={formData} setFormData={setFormData} handleChange={handleChange} />
              </Box>

              {/* Sağ Kolon - Ürünler */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <ProductAddSection
                  newParca={newParca}
                  setNewParca={setNewParca}
                  handleParcaChange={handleParcaChange}
                  addParca={addParca}
                  isEdit={isEdit}
                  parcaCount={parcalar.length}
                  themeColors={themeColors}
                  stokOptions={stokOptions}
                  stokSearchLoading={stokSearchLoading}
                  selectedStok={selectedStok}
                  setSelectedStok={setSelectedStok}
                  searchStok={searchStok}
                />
                <ProductsTableSection
                  parcalar={parcalar}
                  removeParca={removeParca}
                  updateParca={updateParca}
                  isEdit={isEdit}
                  isMobile={isMobile}
                  isAdmin={isAdmin}
                  toplamFiyat={toplamFiyat}
                  formData={formData}
                  handleChange={handleChange}
                />
              </Box>
            </Box>
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
