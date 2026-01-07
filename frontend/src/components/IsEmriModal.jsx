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
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { isEmriService } from '../services/api';

function IsEmriModal({ open, onClose, onSuccess, editId = null }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isEdit = Boolean(editId);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fisNo, setFisNo] = useState(null);

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
      }
    };

    fetchNextFisNo();
  }, [open, isEdit]);

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

  const calculateTotals = () => {
    let toplamFiyat = 0;
    let toplamMaliyet = 0;

    parcalar.forEach((p) => {
      const adet = parseInt(p.adet) || 0;
      const fiyat = parseFloat(p.birim_fiyat) || 0;
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
                    <Box sx={{ width: 170 }}>
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
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } , mt : -1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main', width: 24, height: 24 }}>
                        <ReceiptIcon sx={{ fontSize: 14 }} />
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={600}>
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

                    {/* Yeni Parça Ekleme */}
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
                        label="Takılan Parça / İşçilik Adı"
                        name="takilan_parca"
                        value={newParca.takilan_parca}
                        onChange={handleParcaChange}
                        placeholder="Örn: Civata (x5)"
                        sx={{ mb: 1 }}
                      />
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                          sx={{ flex: 1 , mt : 1.1 }}
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
                            sx={{ flex: 1 , mt : 1.1 }}
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
                          sx={{ flex: 1 , mt : 1.1 }}
                          size="small"
                          type="number"
                          label="Satış Fiyatı (₺)"
                          name="birim_fiyat"
                          value={newParca.birim_fiyat}
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
                      >
                        Parça Ekle
                      </Button>
                    </Paper>

                    {/* Parça Listesi - Mobilde Card, Masaüstünde Inline Düzenlenebilir Tablo */}
                    {isMobile ? (
                      /* Mobile Card View - Inline Düzenlenebilir */
                      <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
                        {parcalar.length === 0 ? (
                          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary" variant="body2">
                              Henüz parça eklenmedi
                            </Typography>
                          </Paper>
                        ) : (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: .5 , mt : -1.5 }}>
                            {parcalar.map((parca, index) => (
                              <Paper key={parca.id || index} variant="outlined" sx={{ p: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <TextField
                                    sx={{ flex: 1 , mt : 1.1 }}
                                    size="small"
                                    label="Parça Adı"
                                    value={parca.takilan_parca}
                                    onChange={(e) => updateParca(index, 'takilan_parca', e.target.value)}
                                  />
                                  <IconButton size="small" color="error" onClick={() => removeParca(index)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <TextField
                                    sx={{ flex: 1 , mt : 1.1 }}
                                    size="small"
                                    type="number"
                                    label="Adet"
                                    value={parca.adet}
                                    onChange={(e) => updateParca(index, 'adet', parseInt(e.target.value) || 1)}
                                    inputProps={{ min: 1 }}
                                  />
                                  {isEdit && (
                                    <TextField
                                      sx={{ flex: 1 ,   mt : 1.1 }}
                                      size="small"
                                      type="number"
                                      label="Maliyet"
                                      value={parca.maliyet === 0 || parca.maliyet ? parca.maliyet : ''}
                                      onChange={(e) => updateParca(index, 'maliyet', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                      inputProps={{ min: 0, step: 0.01 }}
                                    />
                                  )}
                                  <TextField
                                    sx={{ flex: 1 ,   mt : 1.1 }}
                                    size="small"
                                    type="number"
                                    label="Satış"
                                    value={parca.birim_fiyat === 0 || parca.birim_fiyat ? parca.birim_fiyat : ''}
                                    onChange={(e) => updateParca(index, 'birim_fiyat', e.target.value === '' ? '' : parseFloat(e.target.value))}
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
                              <TableCell>Parça</TableCell>
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
                                    Henüz parça eklenmedi
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
                                      value={parca.takilan_parca}
                                      onChange={(e) => updateParca(index, 'takilan_parca', e.target.value)}
                                      placeholder="Parça Adı"
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
                                      value={parca.birim_fiyat === 0 || parca.birim_fiyat ? parca.birim_fiyat : ''}
                                      onChange={(e) => updateParca(index, 'birim_fiyat', e.target.value === '' ? '' : parseFloat(e.target.value))}
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
                            <MenuItem value="odeme_bekleniyor">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f57c00' }} />
                                Ödeme Bekleniyor
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

                    {/* Ödeme Detayları */}
                    <Box sx={{ mt: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                        <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main', width: 24, height: 24 }}>
                          <ReceiptIcon sx={{ fontSize: 14 }} />
                        </Avatar>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Ödeme Detayları
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        size="small"
                        name="odeme_detaylari"
                        value={formData.odeme_detaylari}
                        onChange={handleChange}
                        placeholder="Örn: Nakit, Kart..."
                      />
                    </Box>
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
