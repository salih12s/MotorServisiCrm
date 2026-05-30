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
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { isEmriService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { calculateTotals } from './isEmriModalUtils';
import IsEmriParcalarSection from './IsEmriParcalarSection';

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
  }, [editId, open]);

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
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              {/* Sol Kolon */}
              <Grid item xs={12} sm={6}>
                {/* Müşteri Bilgileri */}
                <Card sx={{ mb: 0.5 }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', width: 24, height: 24 }}>
                        <PersonIcon sx={{ fontSize: 14 }} />
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Müşteri Bilgileri
                      </Typography> 
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 , mt : .5 }}>
                      <TextField
                        sx={{ flex: 1 , mt: 1.1 }}
                        size="small"
                        label="Ad Soyad"
                        name="musteri_ad_soyad"
                        value={formData.musteri_ad_soyad}
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
                    <Box sx={{ width: 180 }}>
                      <TextField
                        fullWidth
                        sx={ {mt : 1.1} }
                        size="small"
                        label="KM"
                        name="km"
                        type="number"
                        value={formData.km}
                        onChange={handleChange}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">km</InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1.2 }}>
                      <FormControl size="small" sx={{ minWidth: 180 , mt: 1.2 }}>
                        <InputLabel >Oluşturan Kişi</InputLabel>
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
                  </CardContent>
                </Card>

                {/* Araç Bilgileri */}
                <Card sx={{ mb: 1.5 }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'secondary.lighter', color: 'secondary.main', width: 24, height: 24 }}>
                        <CarIcon sx={{ fontSize: 14 }} />
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Araç Bilgileri
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        sx={{ flex: 1 , mt: 1.1 }}
                        size="small"
                        label="Marka"
                        name="marka"
                        value={formData.marka}
                        onChange={handleChange}
                      />
                      <TextField
                        sx={{ flex: 1 , mt: 1.1 }}
                        size="small"
                        label="Model/Tip"
                        name="model_tip"
                        value={formData.model_tip}
                        onChange={handleChange}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        sx={{ flex: 1  , mb: 1 , mt : 1.1 }}
                        size="small"
                        type="date"
                        label="Tahmini Teslim"
                        name="tahmini_teslim_tarihi"
                        value={formData.tahmini_tarihi}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        sx={{ flex: 1 , mb: 1 , mt : 1.1 }}
                        size="small"
                        type="number"
                        label="Tahmini Ücret"
                        name="tahmini_toplam_ucret"
                        value={formData.tahmini_toplam_ucret}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>

                {/* Arıza ve Açıklama */}
                <Card>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } , mt : -1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'warning.lighter', color: 'warning.main', width: 24, height: 24 }}>
                        <BuildIcon sx={{ fontSize: 14 }} />
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Arıza ve Açıklama
                      </Typography>
                    </Box>
                    
                    {/* Hızlı Seçim Butonları */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.1 }}>
                      <Chip 
                        label="Periyodik Bakım" 
                        onClick={() => setFormData(prev => ({
                          ...prev, 
                          ariza_sikayetler: prev.ariza_sikayetler ? `${prev.ariza_sikayetler}, Periyodik Bakım` : 'Periyodik Bakım'
                        }))}
                        sx={{ 
                          cursor: 'pointer',
                          bgcolor: '#E5E5E5',
                          '&:hover': { bgcolor: '#04A7B8', color: 'white' }
                        }}
                      />
                      <Chip 
                        label="Ağır Bakım" 
                        onClick={() => setFormData(prev => ({
                          ...prev, 
                          ariza_sikayetler: prev.ariza_sikayetler ? `${prev.ariza_sikayetler}, Ağır Bakım` : 'Ağır Bakım'
                        }))}
                        sx={{ 
                          cursor: 'pointer',
                          bgcolor: '#E5E5E5',
                          '&:hover': { bgcolor: '#04A7B8', color: 'white' }
                        }}
                      />
                      <Chip 
                        label="Tamir" 
                        onClick={() => setFormData(prev => ({
                          ...prev, 
                          ariza_sikayetler: prev.ariza_sikayetler ? `${prev.ariza_sikayetler}, Tamir` : 'Tamir'
                        }))}
                        sx={{ 
                          cursor: 'pointer',
                          bgcolor: '#E5E5E5',
                          '&:hover': { bgcolor: '#04A7B8', color: 'white' }
                        }}
                      />
                      <Chip 
                        label="Sigorta" 
                        onClick={() => setFormData(prev => ({
                          ...prev, 
                          ariza_sikayetler: prev.ariza_sikayetler ? `${prev.ariza_sikayetler}, Sigorta` : 'Sigorta'
                        }))}
                        sx={{ 
                          cursor: 'pointer',
                          bgcolor: '#E5E5E5',
                          '&:hover': { bgcolor: '#04A7B8', color: 'white' }
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        sx={{ flex: 1 , mt: 1.1 }}
                        size="small"
                        multiline
                        rows={2}
                        label="Arıza / Şikayetler"
                        name="ariza_sikayetler"
                        value={formData.ariza_sikayetler}
                        onChange={handleChange}
                        placeholder="Arıza ve şikayetler..."
                      />
                      <TextField
                        sx={{ flex: 1 , mt: 1.1 }}
                        size="small"
                        multiline
                        rows={2}
                        label="Ek Açıklama"
                        name="aciklama"
                        value={formData.aciklama}
                        onChange={handleChange}
                        placeholder="Ek açıklamalar..."
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Sağ Kolon - Parçalar */}
              <IsEmriParcalarSection
                parcalar={parcalar}
                newParca={newParca}
                handleParcaChange={handleParcaChange}
                addParca={addParca}
                removeParca={removeParca}
                updateParca={updateParca}
                isEdit={isEdit}
                isMobile={isMobile}
                formData={formData}
                handleChange={handleChange}
                toplamFiyat={toplamFiyat}
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
