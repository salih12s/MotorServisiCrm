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
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { isEmriService } from '../services/api';

function IsEmriModal({ open, onClose, onSuccess, editId = null }) {
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
  });

  const [parcalar, setParcalar] = useState([]);
  const [newParca, setNewParca] = useState({
    parca_kodu: '',
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
          const response = await fetch('http://localhost:5000/api/is-emirleri/next-fis-no/preview');
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
          console.log('Edit için yüklenen veri:', data);
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
      });
      setParcalar([]);
      setNewParca({
        parca_kodu: '',
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
      parca_kodu: '',
      takilan_parca: '',
      adet: 1,
      maliyet: 0,
      birim_fiyat: 0,
    });
  };

  const removeParca = (index) => {
    setParcalar(parcalar.filter((_, i) => i !== index));
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
      maxWidth="lg" 
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

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit} id="is-emri-form">
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {/* Sol Kolon */}
              <Grid item xs={12} md={6}>
                {/* Müşteri Bilgileri */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', width: 28, height: 28 }}>
                        <PersonIcon sx={{ fontSize: 16 }} />
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
                          required
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
                          type="number"
                          value={formData.km}
                          onChange={handleChange}
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
                      <Avatar sx={{ bgcolor: 'secondary.lighter', color: 'secondary.main', width: 28, height: 28 }}>
                        <CarIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Araç Bilgileri
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Marka"
                          name="marka"
                          value={formData.marka}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Model/Tip"
                          name="model_tip"
                          value={formData.model_tip}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          label="Tahmini Teslim"
                          name="tahmini_teslim_tarihi"
                          value={formData.tahmini_teslim_tarihi}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
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
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Arıza ve Açıklama */}
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'warning.lighter', color: 'warning.main', width: 28, height: 28 }}>
                        <BuildIcon sx={{ fontSize: 16 }} />
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
                          multiline
                          rows={5}
                          label="Arıza / Şikayetler"
                          name="ariza_sikayetler"
                          value={formData.ariza_sikayetler}
                          onChange={handleChange}
                          placeholder="Müşterinin bildirdiği arıza ve şikayetleri detaylı şekilde yazınız..."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Ek Açıklama"
                          name="aciklama"
                          value={formData.aciklama}
                          onChange={handleChange}
                          placeholder="Yapılacak işlemler ve ek açıklamalar..."
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Sağ Kolon - Parçalar */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main', width: 28, height: 28 }}>
                        <ReceiptIcon sx={{ fontSize: 16 }} />
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

                    {/* Yeni Parça Ekleme */}
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        mb: 2, 
                        bgcolor: 'grey.50',
                        borderStyle: 'dashed'
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Parça Kodu"
                            name="parca_kodu"
                            value={newParca.parca_kodu}
                            onChange={handleParcaChange}
                            placeholder="Örn: 054455465"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Takılan Parça / İşçilik Adı"
                            name="takilan_parca"
                            value={newParca.takilan_parca}
                            onChange={handleParcaChange}
                            placeholder="Örn: Civata (x5)"
                          />
                        </Grid>
                        <Grid item xs={12} sm={isEdit ? 4 : 6}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Adet"
                            name="adet"
                            value={newParca.adet}
                            onChange={handleParcaChange}
                            inputProps={{ min: 1 }}
                          />
                        </Grid>
                        {isEdit && (
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
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
                          </Grid>
                        )}
                        <Grid item xs={12} sm={isEdit ? 4 : 6}>
                          <TextField
                            fullWidth
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
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={<AddIcon />}
                            onClick={addParca}
                          >
                            Parça Ekle
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Parça Listesi */}
                    <TableContainer 
                      component={Paper} 
                      variant="outlined" 
                      sx={{ maxHeight: 250, mb: 2 }}
                    >
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Parça</TableCell>
                            <TableCell align="center">Adet</TableCell>
                            {isEdit && <TableCell align="right">Maliyet</TableCell>}
                            <TableCell align="right">Satış</TableCell>
                            {isEdit && <TableCell align="center" width={40}>Düzenle</TableCell>}
                            <TableCell align="center" width={40}>Sil</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {parcalar.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={isEdit ? 6 : 4} align="center" sx={{ py: 3 }}>
                                <Typography color="text.secondary" variant="body2">
                                  Henüz parça eklenmedi
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            parcalar.map((parca, index) => (
                              <TableRow key={parca.id || index}>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={500}>
                                    {parca.takilan_parca}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {parca.parca_kodu || '-'}
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'info.lighter', color: 'info.main', width: 28, height: 28 }}>
                            <ShippingIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                          <Typography variant="subtitle1" fontWeight={600}>
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
                            <MenuItem value="tamamlandi">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                                Tamamlandı
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
