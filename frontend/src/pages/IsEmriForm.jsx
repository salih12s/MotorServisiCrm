import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
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
  Paper,
  InputAdornment,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { isEmriService } from '../services/api';

function IsEmriForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value || 0);
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
            {/* Müşteri Bilgileri */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', width: 32, height: 32 }}>
                    <PersonIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Müşteri Bilgileri
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Müşteri Adı Soyadı"
                      name="musteri_ad_soyad"
                      value={formData.musteri_ad_soyad}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Telefon"
                      name="telefon"
                      value={formData.telefon}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="KM"
                      name="km"
                      value={formData.km}
                      onChange={handleChange}
                      type="number"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">km</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Araç Bilgileri */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.lighter', color: 'secondary.main', width: 32, height: 32 }}>
                    <CarIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Araç Bilgileri
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Marka"
                      name="marka"
                      value={formData.marka}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Model (Tip)"
                      name="model_tip"
                      value={formData.model_tip}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label="Tahmini Teslim Tarihi"
                      name="tahmini_teslim_tarihi"
                      value={formData.tahmini_teslim_tarihi}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Tahmini Toplam Ücret"
                      name="tahmini_toplam_ucret"
                      value={formData.tahmini_toplam_ucret}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Arıza ve Açıklama */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.lighter', color: 'warning.main', width: 32, height: 32 }}>
                    <BuildIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Arıza ve Açıklama
                  </Typography>
                </Box>
                
                {/* Hızlı Seçim Butonları */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
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

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Arıza ve Şikayetler"
                      name="ariza_sikayetler"
                      value={formData.ariza_sikayetler}
                      onChange={handleChange}
                      multiline
                      rows={4}
                      placeholder="Periyodik bakım, Hız sapması, Geri düşüşü ve hız..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Ek Açıklama"
                      name="aciklama"
                      value={formData.aciklama}
                      onChange={handleChange}
                      multiline
                      rows={3}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Sağ Kolon - Parçalar ve Teslim */}
          <Grid item xs={12} lg={6}>
            {/* Parça Ekleme */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main', width: 32, height: 32 }}>
                    <ReceiptIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Parçalar ve İşçilik
                  </Typography>
                  <Chip 
                    label={`${parcalar.length} parça`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ ml: 'auto' }}
                  />
                </Box>

                {/* Yeni Parça Ekleme Formu */}
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    bgcolor: 'grey.50',
                    borderStyle: 'dashed'
                  }}
                >
                  <Grid container spacing={1.5}>
                    <Grid item xs={6} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Parça Kodu"
                        name="parca_kodu"
                        value={newParca.parca_kodu}
                        onChange={handleParcaChange}
                      />
                    </Grid>
                    <Grid item xs={6} sm={8}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Takılan Parça / İşçilik"
                        name="takilan_parca"
                        value={newParca.takilan_parca}
                        onChange={handleParcaChange}
                      />
                    </Grid>
                    <Grid item xs={isEdit ? 4 : 6}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Adet"
                        name="adet"
                        value={newParca.adet}
                        onChange={handleParcaChange}
                      />
                    </Grid>
                    {isEdit && (
                      <Grid item xs={4}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Maliyet"
                          name="maliyet"
                          value={newParca.maliyet}
                          onChange={handleParcaChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                          }}
                        />
                      </Grid>
                    )}
                    <Grid item xs={isEdit ? 4 : 6}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Satış Fiyatı"
                        name="birim_fiyat"
                        value={newParca.birim_fiyat}
                        onChange={handleParcaChange}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={addParca}
                      >
                        Parça Ekle
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Parça Listesi */}
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Parça</TableCell>
                        <TableCell align="center">Adet</TableCell>
                        {isEdit && <TableCell align="right">Maliyet</TableCell>}
                        <TableCell align="right">Satış</TableCell>
                        {isEdit && <TableCell align="center" width={50}>Düzenle</TableCell>}
                        <TableCell align="center" width={50}>Sil</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {parcalar.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={isEdit ? 6 : 4} align="center" sx={{ py: 4 }}>
                            <ReceiptIcon sx={{ fontSize: 40, color: 'grey.300', mb: 1 }} />
                            <Typography color="text.secondary">
                              Henüz parça eklenmedi
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        parcalar.map((parca, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {parca.takilan_parca}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {parca.parca_kodu || 'Kod yok'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">{parca.adet}</TableCell>
                            {isEdit && (
                              <TableCell align="right">
                                <Typography variant="body2" color="error.main">
                                  {formatCurrency(parca.maliyet || 0)}
                                </Typography>
                              </TableCell>
                            )}
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={600}>
                                {formatCurrency(parca.birim_fiyat)}
                              </Typography>
                            </TableCell>
                            {isEdit && (
                              <TableCell align="center">
                                <IconButton 
                                  size="small" 
                                  color="primary" 
                                  onClick={() => {
                                    setNewParca({
                                      parca_kodu: parca.parca_kodu || '',
                                      takilan_parca: parca.takilan_parca,
                                      adet: parca.adet,
                                      birim_fiyat: parca.birim_fiyat,
                                      maliyet: parca.maliyet || 0,
                                    });
                                    removeParca(index);
                                  }}
                                >
                                  <BuildIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            )}
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

                {/* Toplamlar */}
                {parcalar.length > 0 && (
                  <Paper sx={{ mt: 2, p: 2, bgcolor: 'grey.50' }}>
                    <Grid container spacing={2}>
                      {isEdit ? (
                        <>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">
                              Toplam Maliyet
                            </Typography>
                            <Typography variant="h6" color="error.main" fontWeight={600}>
                              {formatCurrency(totals.toplamMaliyet)}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">
                              Toplam Satış
                            </Typography>
                            <Typography variant="h6" fontWeight={600}>
                              {formatCurrency(totals.toplamFiyat)}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">
                              Net Kar
                            </Typography>
                            <Typography 
                              variant="h6" 
                              fontWeight={700}
                              color={totals.kar >= 0 ? 'success.main' : 'error.main'}
                            >
                              {formatCurrency(totals.kar)}
                            </Typography>
                          </Grid>
                        </>
                      ) : (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">
                            Toplam Tutar
                          </Typography>
                          <Typography variant="h6" fontWeight={600}>
                            {formatCurrency(totals.toplamFiyat)}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                )}
              </CardContent>
            </Card>

            {/* Durum (Sadece düzenleme modunda) */}
            {isEdit && (
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.lighter', color: 'info.main', width: 32, height: 32 }}>
                      <ShippingIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Durum
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Durum</InputLabel>
                        <Select
                          name="durum"
                          value={formData.durum}
                          label="Durum"
                          onChange={handleChange}
                        >
                          <MenuItem value="acik">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                              Açık
                            </Box>
                          </MenuItem>
                          <MenuItem value="kapali">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                              Kapalı
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

export default IsEmriForm;
