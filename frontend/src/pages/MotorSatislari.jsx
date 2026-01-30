  import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Chip, Tooltip,
  CircularProgress, Alert, InputAdornment, Grid, FormControl, InputLabel, Select,
  Card, CardContent, Avatar, useTheme, useMediaQuery, Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  TwoWheeler as MotorIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Category as CategoryIcon,
  ListAlt as ListIcon,
  Visibility as VisibilityIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motorSatisService } from '../services/api';
import { useCustomTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const MotorSatislari = () => {
  const { setMotorSatisTheme, setDefaultTheme } = useCustomTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Data states
  const [satislar, setSatislar] = useState([]);
  const [modeller, setModeller] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [satisModalOpen, setSatisModalOpen] = useState(false);
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [modellerListModalOpen, setModellerListModalOpen] = useState(false);
  const [detayModalOpen, setDetayModalOpen] = useState(false);
  const [selectedSatisDetay, setSelectedSatisDetay] = useState(null);
  const [editingSatis, setEditingSatis] = useState(null);
  const [editingModel, setEditingModel] = useState(null);

  // Sabit değerler
  const DAMGA_VERGISI = 791;
  const KDV_ORANI = 20;
  
  // Form states - Satış
  const [satisForm, setSatisForm] = useState({
    tarih: new Date().toISOString().split('T')[0],
    sase_no: '',
    motor_modeli_id: '',
    iskonto: '',
    alis_fiyati: '',
    satis_fiyati: '',
    fatura_fiyati: '',
    odeme_sekli: 'nakit',
    nakit_tutar: '',
    kart_tutar: '',
    havale_tutar: '',
    musteri_adi: '',
    musteri_telefon: '',
    tc_kimlik_no: '',
    adres: '',
    aciklama: ''
  });
  
  // Form states - Model
  const [modelForm, setModelForm] = useState({
    model_adi: '',
    cc: '',
    otv_orani: ''
  });

  // Tema değişikliği
  useEffect(() => {
    setMotorSatisTheme();
    return () => setDefaultTheme();
  }, [setMotorSatisTheme, setDefaultTheme]);

  // Verileri yükle
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [satisRes, modelRes] = await Promise.all([
        motorSatisService.getAll(),
        motorSatisService.getModeller()
      ]);
      setSatislar(satisRes.data);
      setModeller(modelRes.data);
    } catch (err) {
      console.error('Veri yükleme hatası:', err);
      setError('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Satış işlemleri
  const handleOpenSatisModal = (satis = null) => {
    if (satis) {
      setEditingSatis(satis);
      setSatisForm({
        tarih: satis.tarih?.split('T')[0] || new Date().toISOString().split('T')[0],
        sase_no: satis.sase_no || '',
        motor_modeli_id: satis.motor_modeli_id || '',
        iskonto: satis.iskonto || '',
        alis_fiyati: satis.alis_fiyati || '',
        satis_fiyati: satis.satis_fiyati || '',
        fatura_fiyati: satis.fatura_fiyati || '',
        odeme_sekli: satis.odeme_sekli || 'nakit',
        nakit_tutar: satis.nakit_tutar || '',
        kart_tutar: satis.kart_tutar || '',
        havale_tutar: satis.havale_tutar || '',
        musteri_adi: satis.musteri_adi || '',
        musteri_telefon: satis.musteri_telefon || '',
        tc_kimlik_no: satis.tc_kimlik_no || '',
        adres: satis.adres || '',
        aciklama: satis.aciklama || ''
      });
    } else {
      setEditingSatis(null);
      setSatisForm({
        tarih: new Date().toISOString().split('T')[0],
        sase_no: '',
        motor_modeli_id: '',
        iskonto: '',
        alis_fiyati: '',
        satis_fiyati: '',
        fatura_fiyati: '',
        odeme_sekli: 'nakit',
        nakit_tutar: '',
        kart_tutar: '',
        havale_tutar: '',
        musteri_adi: '',
        musteri_telefon: '',
        tc_kimlik_no: '',
        adres: '',
        aciklama: ''
      });
    }
    setSatisModalOpen(true);
  };

  const handleCloseSatisModal = () => {
    setSatisModalOpen(false);
    setEditingSatis(null);
  };

  const handleSaveSatis = async () => {
    try {
      if (!satisForm.sase_no || !satisForm.motor_modeli_id) {
        setError('Şase no ve motor modeli zorunludur');
        return;
      }
      
      // Model bilgisini bul ve hesaplamaları yap
      const model = modeller.find(m => m.id === satisForm.motor_modeli_id);
      const otvOrani = parseFloat(model?.otv_orani || 0);
      
      const alisFiyati = parseFloat(satisForm.alis_fiyati || 0);
      const satisFiyati = parseFloat(satisForm.satis_fiyati || 0);
      const faturaFiyati = parseFloat(satisForm.fatura_fiyati || 0);
      const iskontoOrani = parseFloat(satisForm.iskonto || 0);
      
      // Hesaplamalar
      // İskonto hesabı: Doğrudan alış fiyatı üzerinden hesaplanır
      const iskontoTutari = alisFiyati * (iskontoOrani / 100);
      const iskontoluAlisFiyati = alisFiyati - iskontoTutari;
      
      // Doğru KDV ve ÖTV hesaplaması (Türkiye vergi mevzuatına göre)
      // Fatura Fiyatı = Matrah × (1 + ÖTV Oranı) × (1 + KDV Oranı)
      // Matrah = Fatura Fiyatı / ((1 + ÖTV Oranı) × (1 + KDV Oranı))
      const matrahSatis = faturaFiyati / ((1 + otvOrani / 100) * (1 + KDV_ORANI / 100));
      
      // ÖTV = Matrah × ÖTV Oranı
      const otvTutari = matrahSatis * (otvOrani / 100);
      
      // KDV Matrahı = Matrah + ÖTV (KDV'siz Tutar)
      const kdvsizTutar = matrahSatis + otvTutari;
      
      // KDV = KDV Matrahı × KDV Oranı
      const kdvTutari = kdvsizTutar * (KDV_ORANI / 100);
      
      // Vergiler Toplamı = KDV + ÖTV + Damga Vergisi
      const vergilerToplami = kdvTutari + otvTutari + DAMGA_VERGISI;
      
      // Kar = Satış Fiyatı - Vergiler Toplamı - İskontolu Alış Fiyatı
      const kar = satisFiyati - vergilerToplami - iskontoluAlisFiyati;
      
      // Form data ile hesaplanan değerleri birleştir
      const saveData = {
        ...satisForm,
        iskonto_tutari: iskontoTutari,
        iskontolu_alis_fiyati: iskontoluAlisFiyati,
        matrah_satis: matrahSatis,
        kdv_tutari: kdvTutari,
        kdvsiz_tutar: kdvsizTutar,
        otv_tutari: otvTutari,
        damga_vergisi: DAMGA_VERGISI,
        vergiler_toplami: vergilerToplami,
        kar: kar
      };
      
      if (editingSatis) {
        await motorSatisService.update(editingSatis.id, saveData);
      } else {
        await motorSatisService.create(saveData);
      }
      
      handleCloseSatisModal();
      fetchData();
    } catch (err) {
      console.error('Satış kaydetme hatası:', err);
      setError('Satış kaydedilirken hata oluştu');
    }
  };

  const handleDeleteSatis = async (id) => {
    if (!window.confirm('Bu satışı silmek istediğinize emin misiniz?')) return;
    
    try {
      await motorSatisService.delete(id);
      fetchData();
    } catch (err) {
      console.error('Satış silme hatası:', err);
      setError('Satış silinirken hata oluştu');
    }
  };

  // Model işlemleri
  const handleOpenModelModal = (model = null) => {
    if (model) {
      setEditingModel(model);
      setModelForm({
        model_adi: model.model_adi || '',
        cc: model.cc || '',
        otv_orani: model.otv_orani || ''
      });
    } else {
      setEditingModel(null);
      setModelForm({
        model_adi: '',
        cc: '',
        otv_orani: ''
      });
    }
    setModelModalOpen(true);
  };

  const handleCloseModelModal = () => {
    setModelModalOpen(false);
    setEditingModel(null);
  };

  const handleSaveModel = async () => {
    try {
      if (!modelForm.model_adi) {
        setError('Model adı zorunludur');
        return;
      }
      
      if (editingModel) {
        await motorSatisService.updateModel(editingModel.id, modelForm);
      } else {
        await motorSatisService.createModel(modelForm);
      }
      
      handleCloseModelModal();
      fetchData();
    } catch (err) {
      console.error('Model kaydetme hatası:', err);
      setError('Model kaydedilirken hata oluştu');
    }
  };

  const handleDeleteModel = async (id) => {
    if (!window.confirm('Bu modeli silmek istediğinize emin misiniz?')) return;
    
    try {
      await motorSatisService.deleteModel(id);
      fetchData();
    } catch (err) {
      console.error('Model silme hatası:', err);
      setError('Model silinirken hata oluştu');
    }
  };

  // Filtreleme
  const filteredSatislar = satislar.filter(satis => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (satis.sase_no?.toLowerCase() || '').includes(searchLower) ||
      (satis.model_adi?.toLowerCase() || '').includes(searchLower) ||
      (satis.musteri_adi?.toLowerCase() || '').includes(searchLower)
    );
  });

  // Para formatla
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value || 0);
  };

  // Sayı formatla (gösterim için 76.791,67 gibi - Türk formatı)
  const formatNumber = (value) => {
    if (!value && value !== 0) return '';
    // Eğer zaten sayıysa direkt formatla
    if (typeof value === 'number') {
      return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
    }
    // String ise parse et
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return '';
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(parsed);
  };

  // Akıllı sayı parse - Türk formatını doğru algılar
  // 76.791,67 -> 76791.67
  // 76791,67 -> 76791.67  
  // 76.791.67 -> 76791.67 (son nokta ondalık)
  // 76791.67 -> 76791.67
  const parseFormattedNumber = (formattedValue) => {
    if (!formattedValue) return '';
    let str = formattedValue.toString().trim();
    
    // Virgül varsa, Türk formatı: nokta=binlik, virgül=ondalık
    if (str.includes(',')) {
      // Tüm noktaları kaldır (binlik ayracı), virgülü noktaya çevir
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // Virgül yok, noktaları kontrol et
      const dots = (str.match(/\./g) || []).length;
      if (dots > 1) {
        // Birden fazla nokta var: son nokta ondalık, diğerleri binlik
        const lastDotIndex = str.lastIndexOf('.');
        const beforeLastDot = str.substring(0, lastDotIndex).replace(/\./g, '');
        const afterLastDot = str.substring(lastDotIndex);
        str = beforeLastDot + afterLastDot;
      }
      // Tek nokta varsa zaten doğru format (76791.67)
    }
    
    return str;
  };

  // Input için görüntüleme değeri (yazarken ham değer, değilse formatlı)
  const [activeInput, setActiveInput] = useState(null);
  
  // Fiyat input handler - virgüllü girişe izin verir
  const handlePriceChange = (field, formattedValue) => {
    // Sadece sayı, nokta ve virgül karakterlerine izin ver
    const allowedChars = formattedValue.replace(/[^0-9.,]/g, '');
    setSatisForm({ ...satisForm, [field]: allowedChars });
  };

  // Input focus olduğunda
  const handlePriceFocus = (field) => {
    setActiveInput(field);
  };

  // Input blur olduğunda - değeri parse et ve kaydet
  const handlePriceBlur = (field) => {
    setActiveInput(null);
    const rawValue = parseFormattedNumber(satisForm[field]);
    setSatisForm({ ...satisForm, [field]: rawValue });
  };

  // Input değerini göster (focus'taysa ham değer, değilse formatlı)
  const getInputValue = (field) => {
    if (activeInput === field) {
      return satisForm[field] || '';
    }
    return formatNumber(satisForm[field]);
  };

  // Tarih formatla
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  // Detay modal aç
  const handleOpenDetayModal = (satis) => {
    setSelectedSatisDetay(satis);
    setDetayModalOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {/* Hata mesajı */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={`Toplam: ${satislar.length} satış`} 
            color="primary" 
            variant="outlined" 
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ListIcon />}
            onClick={() => setModellerListModalOpen(true)}
            color="primary"
          >
            Tanımlı Modeller ({modeller.length})
          </Button>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => handleOpenModelModal()}
            color="primary"
          >
            Motor Tanımla
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenSatisModal()}
            color="primary"
          >
            Yeni Motor Satış
          </Button>
        </Box>
      </Box>

      {/* Arama */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Şase no, model veya müşteri adı ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Paper>

      {/* Satışlar Tablosu */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 950, tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main', '& th': { py: 0.75, px: 0.5, fontSize: '0.7rem' } }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 75 }}>Tarih</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 130 }}>Motor Modeli</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 100 }}>Müşteri</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 85 }}>Telefon</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 50 }}>İsk.</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 85 }}>Alış</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 85 }}>Satış</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 85 }}>Fatura</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 80 }}>Kar</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 70 }}>Ödeme</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 90 }} align="center">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSatislar.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz motor satışı yok'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredSatislar.map((satis) => {
                // Kar hesaplama (Doğru formül)
                const model = modeller.find(m => m.id === satis.motor_modeli_id);
                const otvOrani = parseFloat(model?.otv_orani || satis.otv_orani || 0);
                const alisFiyati = parseFloat(satis.alis_fiyati || 0);
                const satisFiyati = parseFloat(satis.satis_fiyati || 0);
                const faturaFiyati = parseFloat(satis.fatura_fiyati || 0);
                const iskontoOrani = parseFloat(satis.iskonto || 0);
                // Doğru hesaplama: Matrah = Fatura / ((1 + ÖTV) × (1 + KDV))
                const matrahSatis = faturaFiyati / ((1 + otvOrani / 100) * (1 + KDV_ORANI / 100));
                const otvTutari = matrahSatis * (otvOrani / 100);
                const kdvsizTutar = matrahSatis + otvTutari;
                const kdvTutari = kdvsizTutar * (KDV_ORANI / 100);
                // İskonto hesabı - doğrudan alış fiyatı üzerinden
                const iskontoTutari = alisFiyati * (iskontoOrani / 100);
                const iskontoluAlis = alisFiyati - iskontoTutari;
                const vergilerToplami = kdvTutari + otvTutari + DAMGA_VERGISI;
                // Kar = Satış - Vergiler - İskontolu Alış
                const kar = satis.kar || (satisFiyati - vergilerToplami - iskontoluAlis);
                
                return (
                <TableRow 
                  key={satis.id} 
                  hover 
                  onDoubleClick={() => handleOpenDetayModal(satis)}
                  sx={{ '& td': { py: 0.5, px: 0.5, fontSize: '0.7rem' }, cursor: 'pointer' }}
                >
                  <TableCell>
                    <Typography fontSize="0.7rem">{formatDate(satis.tarih)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={`${satis.model_adi || '-'} ${satis.cc ? `(${satis.cc}cc)` : ''}`}>
                      <Typography fontSize="0.7rem" fontWeight={600} noWrap sx={{ maxWidth: 125, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {satis.model_adi || '-'} {satis.cc ? `${satis.cc}cc` : ''}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={satis.musteri_adi || '-'}>
                      <Typography fontSize="0.7rem" fontWeight={500} noWrap sx={{ maxWidth: 95, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {satis.musteri_adi || '-'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize="0.7rem" noWrap>{satis.musteri_telefon || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={`%${satis.iskonto || 0}`} size="small" sx={{ height: 18, fontSize: '0.6rem', '& .MuiChip-label': { px: 0.5 } }} />
                  </TableCell>
                  <TableCell>
                    <Typography fontSize="0.65rem" noWrap>{formatCurrency(satis.alis_fiyati)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize="0.65rem" fontWeight={700} noWrap>{formatCurrency(satis.satis_fiyati)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize="0.65rem" noWrap>{formatCurrency(satis.fatura_fiyati)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize="0.7rem" fontWeight={700} sx={{ color: kar >= 0 ? 'success.main' : 'error.main' }} noWrap>
                      {formatCurrency(kar)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={satis.odeme_sekli === 'nakit' ? 'Nakit' : satis.odeme_sekli === 'kredi_karti' ? 'K.Kartı' : satis.odeme_sekli === 'havale' ? 'Havale' : 'Taksit'} 
                      size="small"
                      sx={{ height: 18, fontSize: '0.55rem', '& .MuiChip-label': { px: 0.5 } }}
                      color={satis.odeme_sekli === 'nakit' ? 'success' : 'info'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'center' }}>
                      <Tooltip title="Detaylar">
                        <IconButton size="small" onClick={() => handleOpenDetayModal(satis)} color="info" sx={{ p: 0.25 }}>
                          <VisibilityIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Düzenle">
                        <IconButton size="small" onClick={() => handleOpenSatisModal(satis)} color="primary" sx={{ p: 0.25 }}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton size="small" onClick={() => handleDeleteSatis(satis.id)} color="error" sx={{ p: 0.25 }}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Satış Modal - İş Emri Tarzı Dizayn */}
      <Dialog 
        open={satisModalOpen} 
        onClose={handleCloseSatisModal} 
        maxWidth="lg" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: { 
            minHeight: { xs: '100vh', sm: '80vh' },
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
              <MotorIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {editingSatis ? 'Motor Satışı Düzenle' : 'Yeni Motor Satış'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Motor satış bilgilerini girin
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={handleCloseSatisModal} 
            size="small"
            sx={{ 
              bgcolor: 'grey.200',
              '&:hover': { bgcolor: 'grey.300' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: { xs: 1.5, sm: 2 }, width : '100%' }}>
          <Grid container spacing={2}>
            {/* Motor Bilgileri */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' , width : 550}}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', width: 28, height: 28 }}>
                      <MotorIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Motor Bilgileri
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                    <TextField
                      sx={{ flex: 1, mt: 1.1}}
                      size="small"
                      label="Tarih"
                      type="date"
                      value={satisForm.tarih}
                      onChange={(e) => setSatisForm({ ...satisForm, tarih: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      sx={{ flex: 1, mt: 1.1}}
                      size="small"
                      label="Şase No"
                      value={satisForm.sase_no}
                      onChange={(e) => setSatisForm({ ...satisForm, sase_no: e.target.value })}
                      required
                      placeholder="Şase numarasını girin"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <FormControl size="small" sx={{ flex: 1 , mt: 1}} required>
                      <InputLabel>Motor Modeli</InputLabel>
                      <Select
                        value={satisForm.motor_modeli_id}
                        onChange={(e) => setSatisForm({ ...satisForm, motor_modeli_id: e.target.value })}
                        label="Motor Modeli"
                      >
                        {modeller.map((model) => (
                          <MenuItem key={model.id} value={model.id}>
                            {model.model_adi} {model.cc && `(${model.cc}cc)`} {model.otv_orani && `- ÖTV: %${model.otv_orani}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ flex: 1 , mt: 1}} >
                      <InputLabel>Ödeme Şekli</InputLabel>
                      <Select
                        value={satisForm.odeme_sekli}
                        onChange={(e) => setSatisForm({ ...satisForm, odeme_sekli: e.target.value })}
                        label="Ödeme Şekli"
                      >
                        <MenuItem value="nakit">Nakit</MenuItem>
                        <MenuItem value="kart">Kart</MenuItem>
                        <MenuItem value="havale">Havale/EFT</MenuItem>
                        <MenuItem value="kredi">Kredi</MenuItem>
                        <MenuItem value="karisik">Karışık (Çoklu Ödeme)</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  
                  {/* Karışık Ödeme Detayları */}
                  {satisForm.odeme_sekli === 'karisik' && (
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5 }}>
                      <TextField
                        sx={{ flex: 1 }}
                        size="small"
                        label="Nakit Tutar"
                        value={getInputValue('nakit_tutar')}
                        onChange={(e) => handlePriceChange('nakit_tutar', e.target.value)}
                        onFocus={() => handlePriceFocus('nakit_tutar')}
                        onBlur={() => handlePriceBlur('nakit_tutar')}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₺</InputAdornment>
                        }}
                        placeholder="0"
                      />
                      <TextField
                        sx={{ flex: 1 }}
                        size="small"
                        label="Kart Tutar"
                        value={getInputValue('kart_tutar')}
                        onChange={(e) => handlePriceChange('kart_tutar', e.target.value)}
                        onFocus={() => handlePriceFocus('kart_tutar')}
                        onBlur={() => handlePriceBlur('kart_tutar')}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₺</InputAdornment>
                        }}
                        placeholder="0"
                      />
                      <TextField
                        sx={{ flex: 1 }}
                        size="small"
                        label="Havale Tutar"
                        value={getInputValue('havale_tutar')}
                        onChange={(e) => handlePriceChange('havale_tutar', e.target.value)}
                        onFocus={() => handlePriceFocus('havale_tutar')}
                        onBlur={() => handlePriceBlur('havale_tutar')}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₺</InputAdornment>
                        }}
                        placeholder="0"
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Müşteri Bilgileri */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%'  , width : 550}}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'secondary.lighter', color: 'secondary.main', width: 28, height: 28 }}>
                      <PersonIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Müşteri Bilgileri
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                    <TextField
                      sx={{ flex: 1 }}
                      size="small"
                      label="Müşteri Adı"
                      value={satisForm.musteri_adi}
                      onChange={(e) => setSatisForm({ ...satisForm, musteri_adi: e.target.value })}
                      placeholder="Müşteri adı soyadı"
                    />
                    <TextField
                      sx={{ flex: 1 }}
                      size="small"
                      label="Müşteri Telefon"
                      value={satisForm.musteri_telefon}
                      onChange={(e) => setSatisForm({ ...satisForm, musteri_telefon: e.target.value })}
                      placeholder="0555 555 55 55"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <TextField
                      sx={{ flex: 1 }}
                      size="small"
                      label="TC Kimlik No"
                      value={satisForm.tc_kimlik_no}
                      onChange={(e) => setSatisForm({ ...satisForm, tc_kimlik_no: e.target.value })}
                      placeholder="12345678901"
                      inputProps={{ maxLength: 11 }}
                    />
                    <TextField
                      sx={{ flex: 1 }}
                      size="small"
                      label="Adres"
                      value={satisForm.adres}
                      onChange={(e) => setSatisForm({ ...satisForm, adres: e.target.value })}
                      placeholder="Müşteri adresi"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Fiyat Bilgileri */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main', width: 28, height: 28 }}>
                      <MoneyIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Fiyat Bilgileri
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                    <TextField
                      sx={{ flex: 1 , mt: 1.1}}
                      size="small"
                      label="Alış Fiyatı"
                      value={getInputValue('alis_fiyati')}
                      onChange={(e) => handlePriceChange('alis_fiyati', e.target.value)}
                      onFocus={() => handlePriceFocus('alis_fiyati')}
                      onBlur={() => handlePriceBlur('alis_fiyati')}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₺</InputAdornment>
                      }}
                      placeholder="76.791,67"
                    />
                    <TextField
                      sx={{ flex: 1 , mt: 1.1}}
                      size="small"
                      label="Satış Fiyatı"
                      value={getInputValue('satis_fiyati')}
                      onChange={(e) => handlePriceChange('satis_fiyati', e.target.value)}
                      onFocus={() => handlePriceFocus('satis_fiyati')}
                      onBlur={() => handlePriceBlur('satis_fiyati')}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₺</InputAdornment>
                      }}
                      placeholder="105.000"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <TextField
                      sx={{ flex: 1 , mt: 1.1}}
                      size="small"
                      label="Fatura Fiyatı"
                      value={getInputValue('fatura_fiyati')}
                      onChange={(e) => handlePriceChange('fatura_fiyati', e.target.value)}
                      onFocus={() => handlePriceFocus('fatura_fiyati')}
                      onBlur={() => handlePriceBlur('fatura_fiyati')}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₺</InputAdornment>
                      }}
                      placeholder="100.000"
                    />
                    <TextField
                      sx={{ flex: 1   , mt: 1.1}}
                      size="small"
                      label="İskonto (%)"
                      type="number"
                      value={satisForm.iskonto}
                      onChange={(e) => setSatisForm({ ...satisForm, iskonto: e.target.value })}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                      }}
                      inputProps={{ min: 0, max: 100 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Açıklama ve Kâr Özeti */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' , width : 550}}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 2.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'warning.lighter', color: 'warning.main', width: 28, height: 28 }}>
                      <ReceiptIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Açıklama / Özet
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    label="Açıklama / Not"
                    multiline
                    rows={3}
                    value={satisForm.aciklama}
                    onChange={(e) => setSatisForm({ ...satisForm, aciklama: e.target.value })}
                    placeholder="Satış ile ilgili notlar..."
                    sx={{ mb: 1.5 }}
                  />
                  
                  {/* Kâr Hesabı Özeti - Sadece Admin */}
                  {isAdmin && (satisForm.alis_fiyati || satisForm.satis_fiyati || satisForm.fatura_fiyati) && (() => {
                    const model = modeller.find(m => m.id === satisForm.motor_modeli_id);
                    const otvOrani = parseFloat(model?.otv_orani || 0);
                    const alisFiyati = parseFloat(satisForm.alis_fiyati || 0);
                    const satisFiyati = parseFloat(satisForm.satis_fiyati || 0);
                    const faturaFiyati = parseFloat(satisForm.fatura_fiyati || 0);
                    const iskontoOrani = parseFloat(satisForm.iskonto || 0);
                    // Doğru hesaplama: Matrah = Fatura / ((1 + ÖTV) × (1 + KDV))
                    const matrah = faturaFiyati / ((1 + otvOrani / 100) * (1 + KDV_ORANI / 100));
                    // ÖTV = Matrah × ÖTV Oranı
                    const otvTutari = matrah * (otvOrani / 100);
                    // KDV Matrahı = Matrah + ÖTV
                    const kdvsizTutar = matrah + otvTutari;
                    // KDV = KDV Matrahı × KDV Oranı
                    const kdvTutari = kdvsizTutar * (KDV_ORANI / 100);
                    // İskonto hesabı - doğrudan alış fiyatı üzerinden
                    const iskontoTutari = alisFiyati * (iskontoOrani / 100);
                    const iskontoluAlis = alisFiyati - iskontoTutari;
                    // Vergiler toplamı
                    const vergilerToplami = kdvTutari + otvTutari + DAMGA_VERGISI;
                    // Kar = Satış Fiyatı - Vergiler Toplamı - İskontolu Alış
                    const kar = satisFiyati - vergilerToplami - iskontoluAlis;
                    
                    return (
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 1.5, 
                          bgcolor: 'grey.50',
                          borderStyle: 'solid',
                          borderColor: 'primary.main',
                          borderWidth: 2
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ mb: 1 }}>
                          📊 Canlı Hesaplama (Admin)
                        </Typography>
                        
                        {/* Fiyatlar */}
                        <Box sx={{ mb: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                          <Typography variant="caption" fontWeight={600} color="text.secondary">FİYATLAR</Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.5, mt: 0.5 }}>
                            <Box>
                              <Typography variant="caption" color="error.main" fontSize="0.65rem">Alış</Typography>
                              <Typography variant="body2" fontWeight={600} color="error.main">{formatCurrency(alisFiyati)}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="success.main" fontSize="0.65rem">Satış</Typography>
                              <Typography variant="body2" fontWeight={600} color="success.main">{formatCurrency(satisFiyati)}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="info.main" fontSize="0.65rem">Fatura</Typography>
                              <Typography variant="body2" fontWeight={600} color="info.main">{formatCurrency(faturaFiyati)}</Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* İskonto */}
                        {iskontoOrani > 0 && (
                          <Box sx={{ mb: 1, p: 1, bgcolor: 'warning.50', borderRadius: 1 }}>
                            <Typography variant="caption" fontWeight={600} color="warning.dark">%{iskontoOrani} İSKONTO</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">İskonto Tutarı:</Typography>
                              <Typography variant="body2" fontWeight={600} color="warning.dark">-{formatCurrency(iskontoTutari)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">İskontolu Alış:</Typography>
                              <Typography variant="body2" fontWeight={700} color="warning.dark">{formatCurrency(iskontoluAlis)}</Typography>
                            </Box>
                          </Box>
                        )}

                        {/* Vergiler */}
                        <Box sx={{ mb: 1, p: 1, bgcolor: 'error.50', borderRadius: 1 }}>
                          <Typography variant="caption" fontWeight={600} color="error.main">VERGİLER (Fatura üzerinden)</Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, mt: 0.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" color="text.secondary">KDV (%{KDV_ORANI}):</Typography>
                              <Typography variant="caption" fontWeight={600}>{formatCurrency(kdvTutari)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" color="text.secondary">ÖTV (%{otvOrani}):</Typography>
                              <Typography variant="caption" fontWeight={600}>{formatCurrency(otvTutari)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" color="text.secondary">Damga V.:</Typography>
                              <Typography variant="caption" fontWeight={600}>{formatCurrency(DAMGA_VERGISI)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" color="text.secondary">Matrah:</Typography>
                              <Typography variant="caption" fontWeight={600}>{formatCurrency(matrah)}</Typography>
                            </Box>
                          </Box>
                          <Divider sx={{ my: 0.5 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" fontWeight={600} color="error.main">Vergiler Toplamı:</Typography>
                            <Typography variant="body2" fontWeight={700} color="error.main">{formatCurrency(vergilerToplami)}</Typography>
                          </Box>
                        </Box>

                        {/* Kar Hesabı */}
                        <Box sx={{ p: 1, bgcolor: kar >= 0 ? 'success.100' : 'error.100', borderRadius: 1, border: '2px solid', borderColor: kar >= 0 ? 'success.main' : 'error.main' }}>
                          <Typography variant="caption" fontWeight={600} color={kar >= 0 ? 'success.dark' : 'error.dark'}>KAR HESABI</Typography>
                          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.65rem' }}>
                            {formatCurrency(satisFiyati)} (Satış) - {formatCurrency(vergilerToplami)} (Vergiler) - {formatCurrency(iskontoluAlis)} (İsk. Alış)
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                            <Typography variant="body1" fontWeight={700}>TAHMİNİ KAR:</Typography>
                            <Typography 
                              variant="h6" 
                              fontWeight={800}
                              color={kar >= 0 ? 'success.main' : 'error.main'}
                            >
                              {formatCurrency(kar)}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    );
                  })()}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Button onClick={handleCloseSatisModal} variant="outlined" color="inherit">
            İptal
          </Button>
          <Button onClick={handleSaveSatis} variant="contained" color="primary" startIcon={<AddIcon />}>
            {editingSatis ? 'Güncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Model Tanımlama Modal */}
      <Dialog 
        open={modelModalOpen} 
        onClose={handleCloseModelModal} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2, 
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'grey.50'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              <SettingsIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {editingModel ? 'Motor Modeli Düzenle' : 'Yeni Motor Modeli Tanımla'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Motor modeli bilgilerini girin
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={handleCloseModelModal} 
            size="small"
            sx={{ 
              bgcolor: 'grey.200',
              '&:hover': { bgcolor: 'grey.300' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, pt: 2 }}>
          <Card>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', width: 28, height: 28 }}>
                  <CategoryIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Typography variant="subtitle2" fontWeight={600}>
                  Model Detayları
                </Typography>
              </Box>
              <TextField
                fullWidth
                size="small"
                label="Model Adı"
                value={modelForm.model_adi}
                onChange={(e) => setModelForm({ ...modelForm, model_adi: e.target.value })}
                required
                placeholder="Örn: Yamaha YZF-R3, Honda CB500X"
                sx={{ mb: 1.5 }}
              />
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  sx={{ flex: 1 }}
                  size="small"
                  label="CC (Motor Hacmi)"
                  value={modelForm.cc}
                  onChange={(e) => setModelForm({ ...modelForm, cc: e.target.value })}
                  placeholder="Örn: 321, 500, 1000"
                />
                <TextField
                  sx={{ flex: 1 }}
                  size="small"
                  label="ÖTV Oranı (%)"
                  type="number"
                  value={modelForm.otv_orani}
                  onChange={(e) => setModelForm({ ...modelForm, otv_orani: e.target.value })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                  placeholder="Örn: 37, 60, 150"
                />
              </Box>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Button onClick={handleCloseModelModal} variant="outlined" color="inherit">
            İptal
          </Button>
          <Button onClick={handleSaveModel} variant="contained" color="primary" startIcon={<AddIcon />}>
            {editingModel ? 'Güncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tanımlı Modeller Listesi Modal */}
      <Dialog 
        open={modellerListModalOpen} 
        onClose={() => setModellerListModalOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2, 
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'grey.50'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              <ListIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Tanımlı Motor Modelleri
              </Typography>
              <Chip 
                label={`${modeller.length} model`} 
                color="primary" 
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
          <IconButton 
            onClick={() => setModellerListModalOpen(false)} 
            size="small"
            sx={{ 
              bgcolor: 'grey.200',
              '&:hover': { bgcolor: 'grey.300' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          {modeller.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <MotorIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography color="text.secondary">
                Henüz motor modeli tanımlanmamış
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => {
                  setModellerListModalOpen(false);
                  handleOpenModelModal();
                }}
                sx={{ mt: 2 }}
              >
                İlk Modeli Tanımla
              </Button>
            </Paper>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Model Adı</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Motor Hacmi</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ÖTV Oranı</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modeller.map((model) => (
                    <TableRow key={model.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MotorIcon color="primary" fontSize="small" />
                          <Typography fontWeight={500}>{model.model_adi}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {model.cc ? (
                          <Chip label={`${model.cc} cc`} size="small" variant="outlined" />
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {model.otv_orani ? (
                          <Chip label={`%${model.otv_orani}`} size="small" color="warning" variant="outlined" />
                        ) : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setModellerListModalOpen(false);
                            handleOpenModelModal(model);
                          }}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteModel(model.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Button onClick={() => setModellerListModalOpen(false)} variant="outlined" color="inherit">
            Kapat
          </Button>
          <Button 
            onClick={() => {
              setModellerListModalOpen(false);
              handleOpenModelModal();
            }} 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
          >
            Yeni Model Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detay Modal */}
      <Dialog 
        open={detayModalOpen} 
        onClose={() => setDetayModalOpen(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2, 
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'grey.50'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40 }}>
              <InfoIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Satış Detayları
              </Typography>
              {selectedSatisDetay && (
                <Typography variant="body2" color="text.secondary">
                  Şase No: {selectedSatisDetay.sase_no}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton 
            onClick={() => setDetayModalOpen(false)} 
            size="small"
            sx={{ 
              bgcolor: 'grey.200',
              '&:hover': { bgcolor: 'grey.300' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          {selectedSatisDetay && (() => {
            // Hesaplamaları her zaman fatura fiyatı üzerinden yap (Türkiye vergi mevzuatına göre)
            const satis = selectedSatisDetay;
            const model = modeller.find(m => m.id === satis.motor_modeli_id);
            const otvOrani = parseFloat(model?.otv_orani || satis.otv_orani || 0);
            
            // Temel değerler
            const alisFiyati = parseFloat(satis.alis_fiyati || 0);
            const satisFiyati = parseFloat(satis.satis_fiyati || 0);
            const faturaFiyati = parseFloat(satis.fatura_fiyati || 0);
            const iskontoOrani = parseFloat(satis.iskonto || 0);
            
            // Doğru hesaplama: Fatura Fiyatı = Matrah × (1 + ÖTV) × (1 + KDV)
            // Matrah = Fatura Fiyatı / ((1 + ÖTV Oranı) × (1 + KDV Oranı))
            const matrahSatis = faturaFiyati / ((1 + otvOrani / 100) * (1 + KDV_ORANI / 100));
            
            // ÖTV = Matrah × ÖTV Oranı
            const otvTutari = matrahSatis * (otvOrani / 100);
            
            // KDV Matrahı (KDV'siz Tutar) = Matrah + ÖTV
            const kdvsizTutar = matrahSatis + otvTutari;
            
            // KDV = KDV Matrahı × KDV Oranı
            const kdvTutari = kdvsizTutar * (KDV_ORANI / 100);
            
            // İskonto hesaplaması - doğrudan alış fiyatı üzerinden
            const iskontoTutari = alisFiyati * (iskontoOrani / 100);
            const iskontoluAlis = alisFiyati - iskontoTutari;
            
            // Vergiler toplamı
            const damgaVergisi = DAMGA_VERGISI;
            const vergilerToplami = kdvTutari + otvTutari + damgaVergisi;
            
            // Kar = Satış Fiyatı - Vergiler Toplamı - İskontolu Alış
            const kar = satisFiyati - vergilerToplami - iskontoluAlis;
            
            return (
              <Grid container spacing={2}>
                {/* Motor & Genel Bilgiler */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'primary.main' }}>
                    <CardContent sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 28, height: 28 }}>
                          <MotorIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="subtitle2" fontWeight={700}>Motor Bilgileri</Typography>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
                        <Paper sx={{ p: 1, bgcolor: 'grey.50' }}>
                          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">Tarih</Typography>
                          <Typography variant="body2" fontWeight={600} fontSize="0.75rem">{formatDate(satis.tarih)}</Typography>
                        </Paper>
                        <Paper sx={{ p: 1, bgcolor: 'grey.50' }}>
                          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">Şase No</Typography>
                          <Typography variant="body2" fontWeight={600} fontSize="0.75rem">{satis.sase_no}</Typography>
                        </Paper>
                        <Paper sx={{ p: 1, bgcolor: 'grey.50' }}>
                          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">Motor Modeli</Typography>
                          <Typography variant="body2" fontWeight={600} fontSize="0.75rem">{model?.model_adi || satis.model_adi || '-'}</Typography>
                        </Paper>
                        <Paper sx={{ p: 1, bgcolor: 'grey.50' }}>
                          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">CC / ÖTV Oranı</Typography>
                          <Typography variant="body2" fontWeight={600} fontSize="0.75rem">{model?.cc || satis.cc || '-'} cc / %{otvOrani}</Typography>
                        </Paper>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Müşteri Bilgileri - TABLODA OLMAYAN */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'secondary.main' }}>
                    <CardContent sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 28, height: 28 }}>
                          <PersonIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="subtitle2" fontWeight={700}>Müşteri Bilgileri</Typography>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
                        <Paper sx={{ p: 1, bgcolor: 'grey.50' }}>
                          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">Müşteri Adı</Typography>
                          <Typography variant="body2" fontWeight={600} fontSize="0.75rem">{satis.musteri_adi || '-'}</Typography>
                        </Paper>
                        <Paper sx={{ p: 1, bgcolor: 'grey.50' }}>
                          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">Telefon</Typography>
                          <Typography variant="body2" fontWeight={600} fontSize="0.75rem">{satis.musteri_telefon || '-'}</Typography>
                        </Paper>
                        <Paper sx={{ p: 1, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200', gridColumn: 'span 2' }}>
                          <Typography variant="caption" color="info.main" fontSize="0.65rem">TC Kimlik No</Typography>
                          <Typography variant="body2" fontWeight={700} color="info.main" fontSize="0.85rem">{satis.tc_kimlik_no || '-'}</Typography>
                        </Paper>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Fiyat Bilgileri */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'success.main' }}>
                    <CardContent sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'success.main', width: 28, height: 28 }}>
                          <MoneyIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="subtitle2" fontWeight={700}>Fiyat Bilgileri</Typography>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
                        <Paper sx={{ p: 1, bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200' }}>
                          <Typography variant="caption" color="error.main" fontSize="0.65rem">Alış Fiyatı</Typography>
                          <Typography variant="body2" fontWeight={700} color="error.main" fontSize="0.8rem">{formatCurrency(alisFiyati)}</Typography>
                        </Paper>
                        <Paper sx={{ p: 1, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                          <Typography variant="caption" color="success.main" fontSize="0.65rem">Satış Fiyatı</Typography>
                          <Typography variant="body2" fontWeight={700} color="success.main" fontSize="0.8rem">{formatCurrency(satisFiyati)}</Typography>
                        </Paper>
                        <Paper sx={{ p: 1, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                          <Typography variant="caption" color="info.main" fontSize="0.65rem">Fatura Fiyatı</Typography>
                          <Typography variant="body2" fontWeight={700} color="info.main" fontSize="0.8rem">{formatCurrency(faturaFiyati)}</Typography>
                        </Paper>
                        <Paper sx={{ p: 1, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                          <Typography variant="caption" color="primary.main" fontSize="0.65rem">Matrah Satış</Typography>
                          <Typography variant="body2" fontWeight={700} color="primary.main" fontSize="0.8rem">{formatCurrency(matrahSatis)}</Typography>
                        </Paper>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* İskonto ve Ödeme Bilgileri */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'warning.main' }}>
                    <CardContent sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'warning.main', width: 28, height: 28 }}>
                          <ReceiptIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="subtitle2" fontWeight={700}>İskonto & Ödeme</Typography>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.75 }}>
                        <Paper sx={{ p: 1, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                          <Typography variant="caption" color="warning.dark" fontSize="0.65rem">İskonto Oranı</Typography>
                          <Typography variant="body1" fontWeight={700} color="warning.dark">%{iskontoOrani}</Typography>
                        </Paper>
                        <Paper sx={{ p: 1, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                          <Typography variant="caption" color="warning.dark" fontSize="0.65rem">İskonto Tutarı</Typography>
                          <Typography variant="body2" fontWeight={700} color="warning.dark" fontSize="0.75rem">{formatCurrency(iskontoTutari)}</Typography>
                        </Paper>
                        <Paper sx={{ p: 1, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                          <Typography variant="caption" color="info.main" fontSize="0.65rem">İskontolu Alış</Typography>
                          <Typography variant="body2" fontWeight={700} color="info.main" fontSize="0.75rem">{formatCurrency(iskontoluAlis)}</Typography>
                        </Paper>
                      </Box>
                      <Paper sx={{ p: 1, mt: 0.75, bgcolor: 'grey.100', border: '1px solid', borderColor: 'grey.300' }}>
                        <Typography variant="caption" color="text.secondary" fontSize="0.65rem">Ödeme Şekli</Typography>
                        <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
                          {satis.odeme_sekli === 'nakit' ? '💵 Nakit' : 
                           satis.odeme_sekli === 'kart' ? '💳 Kart' : 
                           satis.odeme_sekli === 'havale' ? '🏦 Havale/EFT' : 
                           satis.odeme_sekli === 'kredi' ? '📅 Kredi' :
                           satis.odeme_sekli === 'karisik' ? '🔀 Karışık' : 
                           satis.odeme_sekli}
                        </Typography>
                        {satis.odeme_sekli === 'karisik' && (
                          <Box sx={{ mt: 0.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {parseFloat(satis.nakit_tutar || 0) > 0 && (
                              <Chip size="small" label={`💵 Nakit: ${formatCurrency(satis.nakit_tutar)}`} sx={{ fontSize: '0.7rem' }} />
                            )}
                            {parseFloat(satis.kart_tutar || 0) > 0 && (
                              <Chip size="small" label={`💳 Kart: ${formatCurrency(satis.kart_tutar)}`} sx={{ fontSize: '0.7rem' }} />
                            )}
                            {parseFloat(satis.havale_tutar || 0) > 0 && (
                              <Chip size="small" label={`🏦 Havale: ${formatCurrency(satis.havale_tutar)}`} sx={{ fontSize: '0.7rem' }} />
                            )}
                          </Box>
                        )}
                      </Paper>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Vergi Bilgileri */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'error.main' }}>
                    <CardContent sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'error.main', width: 28, height: 28 }}>
                          <ReceiptIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="subtitle2" fontWeight={700}>Vergi Bilgileri</Typography>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
                        <Paper sx={{ p: 1, bgcolor: 'grey.100' }}>
                          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">KDV (%20)</Typography>
                          <Typography variant="body2" fontWeight={600} fontSize="0.75rem">{formatCurrency(kdvTutari)}</Typography>
                        </Paper>
                        <Paper sx={{ p: 1, bgcolor: 'grey.100' }}>
                          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">ÖTV (%{otvOrani})</Typography>
                          <Typography variant="body2" fontWeight={600} fontSize="0.75rem">{formatCurrency(otvTutari)}</Typography>
                        </Paper>
                        <Paper sx={{ p: 1, bgcolor: 'grey.100' }}>
                          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">Damga Vergisi</Typography>
                          <Typography variant="body2" fontWeight={600} fontSize="0.75rem">{formatCurrency(damgaVergisi)}</Typography>
                        </Paper>
                        <Paper sx={{ p: 1, bgcolor: 'grey.100' }}>
                          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">KDVsiz Tutar</Typography>
                          <Typography variant="body2" fontWeight={600} fontSize="0.75rem">{formatCurrency(kdvsizTutar)}</Typography>
                        </Paper>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Paper sx={{ p: 1, bgcolor: 'error.100', border: '2px solid', borderColor: 'error.main' }}>
                        <Typography variant="caption" color="error.main" fontSize="0.65rem">VERGİLER TOPLAMI</Typography>
                        <Typography variant="body1" fontWeight={700} color="error.main">{formatCurrency(vergilerToplami)}</Typography>
                      </Paper>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Açıklama / Not - TABLODA OLMAYAN */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'grey.500' }}>
                    <CardContent sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'grey.500', width: 28, height: 28 }}>
                          <InfoIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="subtitle2" fontWeight={700}>Açıklama / Not</Typography>
                      </Box>
                      <Paper sx={{ p: 1.5, bgcolor: 'grey.50', minHeight: 60 }}>
                        <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                          {satis.aciklama || 'Açıklama girilmemiş'}
                        </Typography>
                      </Paper>
                    </CardContent>
                  </Card>
                </Grid>

                {/* KAR */}
                <Grid item xs={12}>
                  <Card sx={{ 
                    background: kar >= 0 
                      ? 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' 
                      : 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
                    border: '2px solid',
                    borderColor: kar >= 0 ? 'success.main' : 'error.main'
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="subtitle2" color={kar >= 0 ? 'success.dark' : 'error.dark'} gutterBottom>
                        NET KÂR
                      </Typography>
                      <Typography 
                        variant="h4" 
                        fontWeight={800} 
                        color={kar >= 0 ? 'success.main' : 'error.main'}
                      >
                        {formatCurrency(kar)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {formatCurrency(satisFiyati)} - {formatCurrency(vergilerToplami)} - {formatCurrency(iskontoluAlis)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

              </Grid>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Button onClick={() => setDetayModalOpen(false)} variant="contained" color="primary">
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MotorSatislari;
