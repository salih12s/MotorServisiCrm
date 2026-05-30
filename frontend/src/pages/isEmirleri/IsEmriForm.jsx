import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Grid,
  Button,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { isEmriService } from '../../services/api';
import IsEmriMusteriArac from './isEmriForm/IsEmriMusteriArac';
import IsEmriParcalar from './isEmriForm/IsEmriParcalar';

function IsEmriForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
    durum: 'acik',
    teslim_alan_ad_soyad: '',
    teslim_eden_teknisyen: '',
    olusturan_kisi: user?.name || user?.ad_soyad || '',
  });

  const [parcalar, setParcalar] = useState([]);
  const [newParca, setNewParca] = useState({
    parca_kodu: '',
    takilan_parca: '',
    adet: 1,
    birim_fiyat: '',
    maliyet: '',
  });

  useEffect(() => {
    if (isEdit) {
      loadIsEmri();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const loadIsEmri = async () => {
    try {
      setLoading(true);
      const response = await isEmriService.getById(id);
      const data = response.data;

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
        durum: data.durum || 'acik',
        teslim_alan_ad_soyad: data.teslim_alan_ad_soyad || '',
        teslim_eden_teknisyen: data.teslim_eden_teknisyen || '',
        olusturan_kisi: data.olusturan_kisi || user?.name || user?.ad_soyad || '',
      });

      setParcalar(data.parcalar || []);
    } catch (error) {
      console.error('İş emri yükleme hatası:', error);
      setError('İş emri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleParcaChange = (e) => {
    const { name, value } = e.target;
    setNewParca((prev) => ({ ...prev, [name]: value }));
  };

  const addParca = () => {
    if (!newParca.takilan_parca) {
      return;
    }

    const parca = {
      ...newParca,
      adet: parseInt(newParca.adet) || 1,
      birim_fiyat: parseFloat(newParca.birim_fiyat) || 0,
      maliyet: parseFloat(newParca.maliyet) || 0,
      toplam_fiyat: (parseInt(newParca.adet) || 1) * (parseFloat(newParca.birim_fiyat) || 0),
    };

    setParcalar((prev) => [...prev, parca]);
    setNewParca({
      parca_kodu: '',
      takilan_parca: '',
      adet: 1,
      birim_fiyat: '',
      maliyet: '',
    });
  };

  const removeParca = (index) => {
    setParcalar((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const toplamFiyat = parcalar.reduce((sum, p) => sum + (p.adet * p.birim_fiyat), 0);
    const toplamMaliyet = parcalar.reduce((sum, p) => sum + (p.adet * p.maliyet), 0);
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
        await isEmriService.update(id, data);
      } else {
        await isEmriService.create(data);
      }

      navigate('/is-emirleri');
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      setError(error.response?.data?.message || 'Kaydetme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => navigate('/is-emirleri')}
            sx={{
              bgcolor: 'grey.100',
              '&:hover': { bgcolor: 'grey.200' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {isEdit ? 'İş Emri Düzenle' : 'Yeni İş Emri'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEdit ? 'Mevcut iş emrini güncelleyin' : 'Yeni bir iş emri oluşturun'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/is-emirleri')}>
            İptal
          </Button>
          <Button
            type="submit"
            variant="contained"
            form="is-emri-form"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={saving}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form id="is-emri-form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {/* Sol Kolon - Müşteri ve Araç Bilgileri */}
          <Grid item xs={12} lg={6}>
            <IsEmriMusteriArac
              formData={formData}
              handleChange={handleChange}
              setFormData={setFormData}
              user={user}
            />
          </Grid>

          {/* Sağ Kolon - Parçalar ve Teslim */}
          <Grid item xs={12} lg={6}>
            <IsEmriParcalar
              isEdit={isEdit}
              isAdmin={isAdmin}
              formData={formData}
              handleChange={handleChange}
              newParca={newParca}
              handleParcaChange={handleParcaChange}
              addParca={addParca}
              removeParca={removeParca}
              setNewParca={setNewParca}
              parcalar={parcalar}
              totals={totals}
            />
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

export default IsEmriForm;
