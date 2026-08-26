import React, { useState, useEffect } from 'react';
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
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { isEmriService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { calculateTotals } from './isEmriModalUtils';
import CustomerInfoSection from './isEmriModal/CustomerInfoSection';
import VehicleInfoSection from './isEmriModal/VehicleInfoSection';
import IssueDescriptionSection from './isEmriModal/IssueDescriptionSection';
import PartsLaborSection from './isEmriModal/PartsLaborSection';
import PartsTableSection from './isEmriModal/PartsTableSection';
import PaymentDetailsSection from './isEmriModal/PaymentDetailsSection';

function IsEmriModal({ open, onClose, onSuccess, editId = null }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isEdit = Boolean(editId);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fisNo, setFisNo] = useState(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    musteri_ad_soyad: '',
    km: '',
    telefon: '',
    model_tip: '',
    marka: '',
    aciklama: '',
    ariza_sikayetler: '',
    tahmini_teslim_tarihi: '',
    tahmini_toplam_ucret: '',
    durum: 'beklemede',
    teslim_alan_ad_soyad: '',
    teslim_eden_teknisyen: '',
    odeme_detaylari: '',
    odeme_sekli: 'nakit',
    nakit_tutar: '',
    kart_tutar: '',
    havale_tutar: '',
    cari_nakit_tutar: 0,
    cari_kart_tutar: 0,
    cari_havale_tutar: 0,
    olusturan_kisi: '',
  });

  const [parcalar, setParcalar] = useState([]);
  const [newParca, setNewParca] = useState({
    takilan_parca: '',
    adet: 1,
    maliyet: 0,
    birim_fiyat: 0,
  });

  // Bir sonraki fiş numarasını getir
  useEffect(() => {
    const fetchNextFisNo = async () => {
      if (open && !isEdit) {
        try {
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
          const response = await fetch(`${apiUrl}/is-emirleri/next-fis-no/preview`);
          const data = await response.json();
          setFisNo(data.fis_no);
        } catch (error) {
          console.error('Fiş numarası alınamadı:', error);
        }
        // Yeni iş emri oluşturulurken varsayılan olarak giriş yapan kişiyi ata
        setFormData(prev => ({ ...prev, olusturan_kisi: user?.name || user?.ad_soyad || '' }));
      }
    };

    fetchNextFisNo();
  }, [open, isEdit, user]);

  // Edit modunda veriyi yükle
  useEffect(() => {
    const loadIsEmri = async () => {
      if (editId && open) {
        setLoading(true);
        try {
          const response = await isEmriService.getById(editId);
          const data = response.data || response;
          setFormData({
            musteri_ad_soyad: data.musteri_ad_soyad || '',
            km: data.km || '',
            telefon: data.telefon || '',
            model_tip: data.model_tip || '',
            marka: data.marka || '',
            aciklama: data.aciklama || '',
            ariza_sikayetler: data.ariza_sikayetler || '',
            tahmini_teslim_tarihi: data.tahmini_teslim_tarihi?.split('T')[0] || '',
            tahmini_toplam_ucret: data.tahmini_toplam_ucret || '',
            durum: data.durum || 'beklemede',
            teslim_alan_ad_soyad: data.teslim_alan_ad_soyad || '',
            teslim_eden_teknisyen: data.teslim_eden_teknisyen || '',
            odeme_detaylari: data.odeme_detaylari || '',
            odeme_sekli: data.odeme_sekli || 'nakit',
            nakit_tutar: data.nakit_tutar || '',
            kart_tutar: data.kart_tutar || '',
            havale_tutar: data.havale_tutar || '',
            cari_nakit_tutar: Number(data.cari_nakit_tutar || 0),
            cari_kart_tutar: Number(data.cari_kart_tutar || 0),
            cari_havale_tutar: Number(data.cari_havale_tutar || 0),
            olusturan_kisi: data.olusturan_kisi || user?.name || user?.ad_soyad || '',
          });
          setParcalar(data.parcalar || []);
          setFisNo(data.fis_no);
        } catch (err) {
          console.error('Edit yükleme hatası:', err);
          setError('İş emri yüklenirken hata oluştu');
        } finally {
          setLoading(false);
        }
      }
    };

    loadIsEmri();
  }, [editId, open, user?.name, user?.ad_soyad]);

  // Modal kapandığında formu temizle
  useEffect(() => {
    if (!open) {
      setFormData({
        musteri_ad_soyad: '',
        km: '',
        telefon: '',
        model_tip: '',
        marka: '',
        aciklama: '',
        ariza_sikayetler: '',
        tahmini_teslim_tarihi: '',
        tahmini_toplam_ucret: '',
        durum: 'beklemede',
        teslim_alan_ad_soyad: '',
        teslim_eden_teknisyen: '',
        odeme_detaylari: '',
        odeme_sekli: 'nakit',
        nakit_tutar: '',
        kart_tutar: '',
        havale_tutar: '',
        cari_nakit_tutar: 0,
        cari_kart_tutar: 0,
        cari_havale_tutar: 0,
        olusturan_kisi: '',
      });
      setParcalar([]);
      setNewParca({
        takilan_parca: '',
        adet: 1,
        maliyet: 0,
        birim_fiyat: 0,
      });
      setError('');
      setFisNo(null);
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
    if (!newParca.takilan_parca) return;

    setParcalar([...parcalar, { ...newParca, id: Date.now() }]);
    setNewParca({
      takilan_parca: '',
      adet: 1,
      maliyet: 0,
      birim_fiyat: 0,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const serviceTotal = parcalar.reduce((sum, p) => sum + (parseFloat(p.adet) || 1) * (parseFloat(p.birim_fiyat) || 0), 0);
      const selectedPaymentField = `${formData.odeme_sekli}_tutar`;
      const paymentParts = formData.odeme_sekli === 'karisik'
        ? {
            nakit_tutar: Math.max((parseFloat(formData.nakit_tutar) || 0) - Number(formData.cari_nakit_tutar || 0), 0),
            kart_tutar: Math.max((parseFloat(formData.kart_tutar) || 0) - Number(formData.cari_kart_tutar || 0), 0),
            havale_tutar: Math.max((parseFloat(formData.havale_tutar) || 0) - Number(formData.cari_havale_tutar || 0), 0),
          }
        : {
            nakit_tutar: formData.odeme_sekli === 'nakit'
              ? Math.max((parseFloat(formData[selectedPaymentField]) || 0) - Number(formData.cari_nakit_tutar || 0), 0)
              : 0,
            kart_tutar: formData.odeme_sekli === 'kart'
              ? Math.max((parseFloat(formData[selectedPaymentField]) || 0) - Number(formData.cari_kart_tutar || 0), 0)
              : 0,
            havale_tutar: formData.odeme_sekli === 'havale'
              ? Math.max((parseFloat(formData[selectedPaymentField]) || 0) - Number(formData.cari_havale_tutar || 0), 0)
              : 0,
          };
      const laterPaid = Number(formData.cari_nakit_tutar || 0)
        + Number(formData.cari_kart_tutar || 0)
        + Number(formData.cari_havale_tutar || 0);
      if (paymentParts.nakit_tutar + paymentParts.kart_tutar + paymentParts.havale_tutar + laterPaid > serviceTotal + 0.005) {
        setError('Girilen ödemeler servis toplamını aşamaz.');
        setSaving(false);
        return;
      }
      const data = {
        ...formData,
        ...paymentParts,
        tahmini_toplam_ucret: parseFloat(formData.tahmini_toplam_ucret) || 0,
        olusturan_kisi: formData.olusturan_kisi,
        parcalar: parcalar.map((p) => ({
          parca_kodu: p.parca_kodu,
          takilan_parca: p.takilan_parca,
          adet: parseInt(p.adet) || 1,
          birim_fiyat: parseFloat(p.birim_fiyat) || 0,
          maliyet: parseFloat(p.maliyet) || 0,
        })),
      };

      if (isEdit) {
        await isEmriService.update(editId, data);
      } else {
        await isEmriService.create(data);
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
          bgcolor: 'grey.50'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            <ReceiptIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {isEdit ? 'İş Emri Düzenle' : 'Yeni İş Emri'}
            </Typography>
            {fisNo && (
              <Chip 
                label={fisNo} 
                color="primary" 
                size="small"
                sx={{ fontWeight: 600, mt: 0.5 }}
              />
            )}
          </Box>
        </Box>
        <IconButton 
          onClick={onClose} 
          size="small"
          sx={{ 
            bgcolor: 'grey.200',
            '&:hover': { bgcolor: 'grey.300' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit} id="is-emri-form">
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
                <CustomerInfoSection formData={formData} handleChange={handleChange} user={user} />
                <VehicleInfoSection formData={formData} handleChange={handleChange} />
                <IssueDescriptionSection formData={formData} setFormData={setFormData} handleChange={handleChange} />
              </Box>

              {/* Sağ Kolon */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <PartsLaborSection
                  newParca={newParca}
                  handleParcaChange={handleParcaChange}
                  addParca={addParca}
                  isEdit={isEdit}
                  parcaCount={parcalar.length}
                />
                <PartsTableSection
                  parcalar={parcalar}
                  removeParca={removeParca}
                  updateParca={updateParca}
                  isEdit={isEdit}
                  isMobile={isMobile}
                  toplamFiyat={toplamFiyat}
                  formData={formData}
                  handleChange={handleChange}
                />
                <PaymentDetailsSection formData={formData} setFormData={setFormData} handleChange={handleChange} />
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
          form="is-emri-form"
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          disabled={saving || loading}
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default IsEmriModal;
