  import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, TextField, Chip, Tooltip,
  CircularProgress, Alert, InputAdornment,
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
  ListAlt as ListIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { motorSatisService } from '../../services/api';
import { useCustomTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import MotorSatisDetayModal from './MotorSatisDetayModal';
import ModellerListModal from './ModellerListModal';
import ModelFormModal from './ModelFormModal';
import SatisFormModal from './SatisFormModal';
import {
  getDurumColor,
  getDurumLabel,
  formatCurrency,
  formatNumber,
  parseFormattedNumber,
  formatDate,
} from './motorSatislariUtils';

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
  const [filterDurum, setFilterDurum] = useState('');
  
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
    aciklama: '',
    durum: 'beklemede',
    olusturan_kisi: user?.name || user?.ad_soyad || ''
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
      // Tarih düzeltmesi - UTC timezone sorununu gidermek için
      let satisTarihi = new Date().toISOString().split('T')[0];
      if (satis.tarih) {
        // Tarih string ise direkt al, Date objesi oluşturmadan
        const tarihStr = String(satis.tarih);
        if (tarihStr.includes('T')) {
          // ISO format: 2024-01-31T00:00:00.000Z -> sadece tarih kısmını al
          satisTarihi = tarihStr.split('T')[0];
        } else if (tarihStr.length >= 10) {
          // Zaten YYYY-MM-DD formatında
          satisTarihi = tarihStr.substring(0, 10);
        }
      }
      setSatisForm({
        tarih: satisTarihi,
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
        aciklama: satis.aciklama || '',
        durum: satis.durum || 'beklemede',
        olusturan_kisi: satis.olusturan_kisi || user?.name || user?.ad_soyad || ''
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
        aciklama: '',
        durum: 'beklemede',
        olusturan_kisi: user?.name || user?.ad_soyad || ''
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
    const matchesSearch = (
      (satis.sase_no?.toLowerCase() || '').includes(searchLower) ||
      (satis.model_adi?.toLowerCase() || '').includes(searchLower) ||
      (satis.musteri_adi?.toLowerCase() || '').includes(searchLower)
    );
    const matchesDurum = !filterDurum || satis.durum === filterDurum;
    return matchesSearch && matchesDurum;
  });

  // Bugünü kontrol et
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    const date = new Date(dateStr);
    return date.toDateString() === today.toDateString();
  };

  // İstatistikler
  const toplamSatis = satislar.length;
  const bugunkuSatis = satislar.filter(s => isToday(s.tarih)).length;
  const beklemedeSatis = satislar.filter(s => s.durum === 'beklemede').length;
  const tamamlananSatis = satislar.filter(s => s.durum === 'tamamlandi').length;
  const toplamKar = satislar.reduce((sum, s) => sum + parseFloat(s.kar || 0), 0);
  const toplamSatisFiyati = satislar.reduce((sum, s) => sum + parseFloat(s.satis_fiyati || 0), 0);

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
        alignItems: 'center', 
        mb: 2, 
        flexWrap: 'wrap', 
        gap: 1,
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {/* İstatistik Chipleri - Tıklanabilir Filtreler */}
          <Chip 
            label={`Toplam: ${toplamSatis}`} 
            size="small"
            onClick={() => setFilterDurum('')}
            sx={{ 
              bgcolor: !filterDurum ? '#1a237e' : '#e3f2fd', 
              color: !filterDurum ? 'white' : '#1a237e', 
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#1a237e', color: 'white' }
            }} 
          />
          <Chip 
            label={`Bugün: ${bugunkuSatis}`} 
            size="small"
            sx={{ 
              bgcolor: '#bbdefb', 
              color: '#1565c0', 
              fontWeight: 600
            }} 
          />
          <Chip 
            label={`Beklemede: ${beklemedeSatis}`} 
            size="small"
            onClick={() => setFilterDurum(filterDurum === 'beklemede' ? '' : 'beklemede')}
            sx={{ 
              bgcolor: filterDurum === 'beklemede' ? '#e65100' : '#fff3e0', 
              color: filterDurum === 'beklemede' ? 'white' : '#e65100', 
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#e65100', color: 'white' }
            }} 
          />
          <Chip 
            label={`Tamamlandı: ${tamamlananSatis}`} 
            size="small"
            onClick={() => setFilterDurum(filterDurum === 'tamamlandi' ? '' : 'tamamlandi')}
            sx={{ 
              bgcolor: filterDurum === 'tamamlandi' ? '#2e7d32' : '#e8f5e9', 
              color: filterDurum === 'tamamlandi' ? 'white' : '#2e7d32', 
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#2e7d32', color: 'white' }
            }} 
          />
          {isAdmin && (
            <>
              <Chip 
                label={`Satış: ${formatCurrency(toplamSatisFiyati)}`} 
                size="small"
                sx={{ 
                  bgcolor: '#e3f2fd', 
                  color: '#1565c0', 
                  fontWeight: 600 
                }} 
              />
              <Chip 
                label={`Kar: ${formatCurrency(toplamKar)}`} 
                size="small"
                sx={{ 
                  bgcolor: toplamKar >= 0 ? '#e8f5e9' : '#ffebee', 
                  color: toplamKar >= 0 ? '#2e7d32' : '#c62828', 
                  fontWeight: 600 
                }} 
              />
            </>
          )}
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', sm: 'flex-end' },
          width: { xs: '100%', sm: 'auto' }
        }}>
          <Button
            variant="outlined"
            startIcon={!isMobile && <ListIcon />}
            onClick={() => setModellerListModalOpen(true)}
            color="primary"
            size={isMobile ? 'small' : 'medium'}
            sx={{ flex: { xs: 1, sm: 'none' }, minWidth: { xs: 0, sm: 'auto' } }}
          >
            {isMobile ? <ListIcon /> : `Tanımlı Modeller (${modeller.length})`}
          </Button>
          <Button
            variant="outlined"
            startIcon={!isMobile && <SettingsIcon />}
            onClick={() => handleOpenModelModal()}
            color="primary"
            size={isMobile ? 'small' : 'medium'}
            sx={{ flex: { xs: 1, sm: 'none' }, minWidth: { xs: 0, sm: 'auto' } }}
          >
            {isMobile ? <SettingsIcon /> : 'Motor Tanımla'}
          </Button>
          <Button
            variant="contained"
            startIcon={!isMobile && <AddIcon />}
            onClick={() => handleOpenSatisModal()}
            color="primary"
            size={isMobile ? 'small' : 'medium'}
            sx={{ flex: { xs: 1, sm: 'none' }, minWidth: { xs: 0, sm: 'auto' } }}
          >
            {isMobile ? <AddIcon /> : 'Yeni Motor Satış'}
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

      {/* Satışlar - Masaüstü Tablo / Mobil Kart Görünümü */}
      {isMobile ? (
        /* Mobil Kart Görünümü */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filteredSatislar.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <MotorIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography color="text.secondary">
                {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz motor satışı yok'}
              </Typography>
            </Paper>
          ) : (
            filteredSatislar.map((satis) => {
              const model = modeller.find(m => m.id === satis.motor_modeli_id);
              const otvOrani = parseFloat(model?.otv_orani || satis.otv_orani || 0);
              const alisFiyati = parseFloat(satis.alis_fiyati || 0);
              const satisFiyati = parseFloat(satis.satis_fiyati || 0);
              const faturaFiyati = parseFloat(satis.fatura_fiyati || 0);
              const iskontoOrani = parseFloat(satis.iskonto || 0);
              const matrahSatis = faturaFiyati / ((1 + otvOrani / 100) * (1 + KDV_ORANI / 100));
              const otvTutari = matrahSatis * (otvOrani / 100);
              const kdvsizTutar = matrahSatis + otvTutari;
              const kdvTutari = kdvsizTutar * (KDV_ORANI / 100);
              const iskontoTutari = alisFiyati * (iskontoOrani / 100);
              const iskontoluAlis = alisFiyati - iskontoTutari;
              const vergilerToplami = kdvTutari + otvTutari + DAMGA_VERGISI;
              const kar = satis.kar || (satisFiyati - vergilerToplami - iskontoluAlis);

              return (
                <Card key={satis.id} sx={{ overflow: 'hidden' }} onClick={() => handleOpenDetayModal(satis)}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    {/* Üst Kısım - Model ve Tarih */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                          <MotorIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2" fontWeight={700} noWrap>
                            {satis.model_adi || '-'} {satis.cc ? `${satis.cc}cc` : ''}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                            {formatDate(satis.tarih)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
                        <Chip 
                          label={getDurumLabel(satis.durum)} 
                          size="small"
                          sx={{ 
                            height: 20, 
                            fontSize: '0.65rem',
                            bgcolor: getDurumColor(satis.durum).bg,
                            color: getDurumColor(satis.durum).color,
                            fontWeight: 600
                          }}
                        />
                        <Chip 
                          label={satis.odeme_sekli === 'nakit' ? 'Nakit' : 
                                 satis.odeme_sekli === 'kart' ? 'Kart' : 
                                 satis.odeme_sekli === 'kredi_karti' ? 'Kart' : 
                                 satis.odeme_sekli === 'havale' ? 'Havale' : 
                                 satis.odeme_sekli === 'kredi' ? 'Kredi' :
                                 satis.odeme_sekli === 'karisik' ? (() => {
                                   const o = [];
                                   if (parseFloat(satis.nakit_tutar || 0) > 0) o.push('Nakit');
                                   if (parseFloat(satis.kart_tutar || 0) > 0) o.push('Kart');
                                   if (parseFloat(satis.havale_tutar || 0) > 0) o.push('Havale');
                                   return o.join('/');
                                 })() : satis.odeme_sekli} 
                          size="small"
                          sx={{ height: 18, fontSize: '0.6rem' }}
                          color={satis.odeme_sekli === 'nakit' ? 'success' : 'info'}
                        />
                      </Box>
                    </Box>

                    {/* Müşteri Bilgileri */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, bgcolor: 'grey.50', p: 0.75, borderRadius: 1 }}>
                      <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1 }}>
                        {satis.musteri_adi || 'Müşteri belirtilmemiş'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {satis.musteri_telefon || '-'}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Fiyat Bilgileri */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.5, mb: 1 }}>
                      <Box sx={{ textAlign: 'center', p: 0.5, bgcolor: 'error.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="error.main" fontSize="0.6rem">Alış</Typography>
                        <Typography variant="body2" fontWeight={600} color="error.main" fontSize="0.7rem">
                          {formatCurrency(alisFiyati)}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', p: 0.5, bgcolor: 'success.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="success.main" fontSize="0.6rem">Satış</Typography>
                        <Typography variant="body2" fontWeight={600} color="success.main" fontSize="0.7rem">
                          {formatCurrency(satisFiyati)}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', p: 0.5, bgcolor: 'info.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="info.main" fontSize="0.6rem">Fatura</Typography>
                        <Typography variant="body2" fontWeight={600} color="info.main" fontSize="0.7rem">
                          {formatCurrency(faturaFiyati)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Kar ve İşlemler */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={`%${satis.iskonto || 0} İsk.`} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />
                        {isAdmin && (
                          <Box sx={{ 
                            bgcolor: kar >= 0 ? 'success.100' : 'error.100', 
                            px: 1, 
                            py: 0.25, 
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: kar >= 0 ? 'success.main' : 'error.main'
                          }}>
                            <Typography variant="caption" fontWeight={700} color={kar >= 0 ? 'success.main' : 'error.main'}>
                              Kar: {formatCurrency(kar)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                        {isAdmin && (
                          <IconButton size="small" onClick={() => handleOpenDetayModal(satis)} color="info" sx={{ p: 0.5 }}>
                            <VisibilityIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        )}
                        <IconButton size="small" onClick={() => handleOpenSatisModal(satis)} color="primary" sx={{ p: 0.5 }}>
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        {isAdmin && (
                          <IconButton size="small" onClick={() => handleDeleteSatis(satis.id)} color="error" sx={{ p: 0.5 }}>
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })
          )}
        </Box>
      ) : (
        /* Masaüstü Tablo Görünümü */
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1020, tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main', '& th': { py: 0.75, px: 0.5, fontSize: '0.7rem' } }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 75 }}>Tarih</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 130 }}>Motor Modeli</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 100 }}>Müşteri</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 85 }}>Telefon</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 50 }}>İsk.</TableCell>
              {isAdmin && <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 85 }}>Alış</TableCell>}
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 85 }}>Satış</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 85 }}>Fatura</TableCell>
              {isAdmin && <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 80 }}>Kar</TableCell>}
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 70 }}>Durum</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 70 }}>Ödeme</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: isAdmin ? 90 : 60 }} align="center">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSatislar.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 12 : 10} align="center" sx={{ py: 4 }}>
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
                  onDoubleClick={() => isAdmin && handleOpenDetayModal(satis)}
                  sx={{ '& td': { py: 0.5, px: 0.5, fontSize: '0.7rem' }, cursor: isAdmin ? 'pointer' : 'default' }}
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
                  {isAdmin && (
                    <TableCell>
                      <Typography fontSize="0.65rem" noWrap>{formatCurrency(satis.alis_fiyati)}</Typography>
                    </TableCell>
                  )}
                  <TableCell>
                    <Typography fontSize="0.65rem" fontWeight={700} noWrap>{formatCurrency(satis.satis_fiyati)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize="0.65rem" noWrap>{formatCurrency(satis.fatura_fiyati)}</Typography>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <Typography fontSize="0.7rem" fontWeight={700} sx={{ color: kar >= 0 ? 'success.main' : 'error.main' }} noWrap>
                        {formatCurrency(kar)}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell>
                    <Chip 
                      label={getDurumLabel(satis.durum)} 
                      size="small"
                      sx={{ 
                        height: 18, 
                        fontSize: '0.55rem', 
                        '& .MuiChip-label': { px: 0.5 },
                        bgcolor: getDurumColor(satis.durum).bg,
                        color: getDurumColor(satis.durum).color,
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={satis.odeme_sekli === 'nakit' ? 'Nakit' : 
                             satis.odeme_sekli === 'kart' ? 'Kart' : 
                             satis.odeme_sekli === 'kredi_karti' ? 'Kart' : 
                             satis.odeme_sekli === 'havale' ? 'Havale' : 
                             satis.odeme_sekli === 'kredi' ? 'Kredi' :
                             satis.odeme_sekli === 'karisik' ? (() => {
                               const o = [];
                               if (parseFloat(satis.nakit_tutar || 0) > 0) o.push('Nakit');
                               if (parseFloat(satis.kart_tutar || 0) > 0) o.push('Kart');
                               if (parseFloat(satis.havale_tutar || 0) > 0) o.push('Havale');
                               return o.join('/');
                             })() : satis.odeme_sekli} 
                      size="small"
                      sx={{ height: 18, fontSize: '0.55rem', '& .MuiChip-label': { px: 0.5 } }}
                      color={satis.odeme_sekli === 'nakit' ? 'success' : 'info'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'center' }}>
                      {isAdmin && (
                        <Tooltip title="Detaylar">
                          <IconButton size="small" onClick={() => handleOpenDetayModal(satis)} color="info" sx={{ p: 0.25 }}>
                            <VisibilityIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Düzenle">
                        <IconButton size="small" onClick={() => handleOpenSatisModal(satis)} color="primary" sx={{ p: 0.25 }}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      {isAdmin && (
                        <Tooltip title="Sil">
                          <IconButton size="small" onClick={() => handleDeleteSatis(satis.id)} color="error" sx={{ p: 0.25 }}>
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      )}

      {/* Satış Modal - İş Emri Tarzı Dizayn */}
      <SatisFormModal
        open={satisModalOpen}
        onClose={handleCloseSatisModal}
        isMobile={isMobile}
        editingSatis={editingSatis}
        satisForm={satisForm}
        setSatisForm={setSatisForm}
        modeller={modeller}
        getInputValue={getInputValue}
        handlePriceChange={handlePriceChange}
        handlePriceFocus={handlePriceFocus}
        handlePriceBlur={handlePriceBlur}
        isAdmin={isAdmin}
        user={user}
        formatCurrency={formatCurrency}
        onSave={handleSaveSatis}
      />

      {/* Model Tanımlama Modal */}
      <ModelFormModal
        open={modelModalOpen}
        onClose={handleCloseModelModal}
        isMobile={isMobile}
        editingModel={editingModel}
        modelForm={modelForm}
        setModelForm={setModelForm}
        onSave={handleSaveModel}
      />

      {/* Tanımlı Modeller Listesi Modal */}
      <ModellerListModal
        open={modellerListModalOpen}
        onClose={() => setModellerListModalOpen(false)}
        isMobile={isMobile}
        modeller={modeller}
        onEditModel={handleOpenModelModal}
        onDeleteModel={handleDeleteModel}
        onAddModel={handleOpenModelModal}
      />

      {/* Detay Modal */}
      <MotorSatisDetayModal
        open={detayModalOpen}
        onClose={() => setDetayModalOpen(false)}
        isMobile={isMobile}
        selectedSatisDetay={selectedSatisDetay}
        modeller={modeller}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
    </Box>
  );
};

export default MotorSatislari;
