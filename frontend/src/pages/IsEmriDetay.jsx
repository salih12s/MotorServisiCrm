import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Avatar,
  Switch,
  FormControlLabel,
  Tooltip,
  Slider,
} from '@mui/material';
import {
  Print as PrintIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  DragIndicator as DragIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import { isEmriService, authService } from '../services/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// Varsayılan pozisyonlar ve boyutlar
const defaultSettings = {
  fisNo: { top: 7, left: 82, fontSize: 1.3, visible: true },
  tarih: { top: 7, left: 90, fontSize: 0.95, visible: true },
  musteriAd: { top: 16, left: 5, fontSize: 1.0, visible: true },
  telefon: { top: 19, left: 5, fontSize: 0.95, visible: true },
  adres: { top: 22, left: 5, fontSize: 0.95, visible: true },
  marka: { top: 16, left: 55, fontSize: 1.0, visible: true },
  model: { top: 19, left: 55, fontSize: 0.95, visible: true },
  aciklama: { top: 32, left: 5, fontSize: 0.95, visible: true },
  arizaSikayetler: { top: 38, left: 5, fontSize: 0.95, visible: true },
  tahminiTeslim: { top: 45, left: 5, fontSize: 0.9, visible: true },
  // Parça tablosu
  parcaKodu: { top: 52, left: 5, fontSize: 0.8, visible: true },
  parcaAdi: { top: 52, left: 20, fontSize: 0.8, visible: true },
  parcaAdet: { top: 52, left: 45, fontSize: 0.8, visible: true },
  parcaFiyat: { top: 52, left: 55, fontSize: 0.8, visible: true },
  // Toplamlar
  genelToplam: { top: 80, left: 50, fontSize: 1.2, visible: true },
  tahminiUcret: { top: 85, left: 50, fontSize: 1.2, visible: true },
};

function IsEmriDetay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();
  const containerRef = useRef();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [isEmri, setIsEmri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragField, setDragField] = useState(null);

  useEffect(() => {
    loadIsEmri();
    loadPrintSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadPrintSettings = async () => {
    try {
      const response = await authService.getPrintSettings();
      if (response.data.ayarlar) {
        setSettings({
          ...defaultSettings,
          ...response.data.ayarlar,
        });
      }
    } catch (error) {
      console.error('Yazıcı ayarları yükleme hatası:', error);
      // Hata durumunda localStorage'dan dene
      const saved = localStorage.getItem('printSettings_v2');
      if (saved) {
        setSettings({
          ...defaultSettings,
          ...JSON.parse(saved),
        });
      }
    } finally {
      setSettingsLoaded(true);
    }
  };

  const loadIsEmri = async () => {
    try {
      const response = await isEmriService.getById(id);
      setIsEmri(response.data);
    } catch (error) {
      console.error('İş emri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `IsEmri_${isEmri?.fis_no}`,
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value || 0);
  };

  // Ayarları kaydet (veritabanına)
  const saveSettings = async (newSettings) => {
    setSettings(newSettings);
    // localStorage'a da kaydet (yedek olarak)
    localStorage.setItem('printSettings_v2', JSON.stringify(newSettings));
    
    // Veritabanına kaydet
    try {
      await authService.savePrintSettings(newSettings);
    } catch (error) {
      console.error('Yazıcı ayarları kaydetme hatası:', error);
    }
  };

  // Sürükleme başlat
  const handleDragStart = (e, fieldKey) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragField(fieldKey);
    setSelectedField(fieldKey);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      startTop: settings[fieldKey].top,
      startLeft: settings[fieldKey].left,
    });
  };

  // Sürükleme hareketi
  const handleMouseMove = (e) => {
    if (!isDragging || !dragField || !containerRef.current) return;
    
    const container = containerRef.current.getBoundingClientRect();
    
    // Mouse pozisyonunu container'a göre hesapla
    const mouseX = e.clientX - container.left;
    const mouseY = e.clientY - container.top;
    
    // Yüzdeye çevir (direkt pozisyon)
    let newLeft = (mouseX / container.width) * 100;
    let newTop = (mouseY / container.height) * 100;
    
    // Sınırla
    newLeft = Math.max(0, Math.min(95, newLeft));
    newTop = Math.max(0, Math.min(95, newTop));
    
    const newSettings = {
      ...settings,
      [dragField]: {
        ...settings[dragField],
        top: newTop,
        left: newLeft,
      }
    };
    
    setSettings(newSettings);
    // Anında localStorage'a kaydet
    localStorage.setItem('printSettings_v2', JSON.stringify(newSettings));
  };

  // Sürükleme bitir
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragField(null);
      saveSettings(settings);
    }
  };

  // Görünürlüğü değiştir
  const toggleVisibility = (key) => {
    const newSettings = {
      ...settings,
      [key]: { ...settings[key], visible: !settings[key].visible }
    };
    saveSettings(newSettings);
  };

  // Boyut değiştir
  const changeFontSize = (key, delta) => {
    const currentSize = settings[key].fontSize;
    const newSize = Math.max(0.5, Math.min(3, currentSize + delta));
    const newSettings = {
      ...settings,
      [key]: { ...settings[key], fontSize: newSize }
    };
    saveSettings(newSettings);
  };

  // Slider ile boyut değiştir
  const handleSliderChange = (key, value) => {
    const newSettings = {
      ...settings,
      [key]: { ...settings[key], fontSize: value }
    };
    saveSettings(newSettings);
  };

  // Pozisyonları sıfırla
  const resetSettings = () => {
    saveSettings(defaultSettings);
    setSelectedField(null);
  };

  // Pozisyon stili oluştur
  const getPositionStyle = (key) => {
    const s = settings[key];
    if (!s) return {};
    
    const style = { 
      position: 'absolute',
      top: `${s.top}%`,
      left: `${s.left}%`,
      fontSize: `${s.fontSize}rem`,
      fontWeight: 600,
      color: '#000',
      userSelect: 'none',
    };
    
    if (editMode) {
      style.cursor = 'move';
      style.border = selectedField === key ? '2px solid #1976d2' : '1px dashed #90caf9';
      style.borderRadius = '4px';
      style.padding = '4px 8px';
      style.backgroundColor = selectedField === key ? 'rgba(25, 118, 210, 0.15)' : 'rgba(25, 118, 210, 0.05)';
      style.zIndex = isDragging && dragField === key ? 1000 : 1;
      style.transition = isDragging && dragField === key ? 'none' : 'border 0.2s, background 0.2s';
    }
    
    return style;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isEmri) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>İş emri bulunamadı</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Geri Dön
        </Button>
      </Box>
    );
  }

  // Alan isimleri
  const fieldLabels = {
    fisNo: 'Fiş No',
    tarih: 'Tarih',
    musteriAd: 'Müşteri Adı',
    telefon: 'Telefon',
    adres: 'Adres',
    marka: 'Marka',
    model: 'Model',
    aciklama: 'Açıklama',
    arizaSikayetler: 'Arıza/Şikayetler',
    tahminiTeslim: 'Teslim Tarihi',
    parcaKodu: 'Parça Kodu',
    parcaAdi: 'Parça Adı',
    parcaAdet: 'Adet',
    parcaFiyat: 'Birim Fiyat',
    genelToplam: 'Genel Toplam',
    tahminiUcret: 'Tahmini Toplam Ücret',
  };

  return (
    <Box 
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate('/')}
            sx={{ 
              bgcolor: 'grey.100',
              '&:hover': { bgcolor: 'grey.200' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" fontWeight={700} color="primary.main">
                {isEmri.fis_no}
              </Typography>
              <Chip
                size="small"
                label={isEmri.durum === 'acik' ? 'Açık' : 'Kapalı'}
                color={isEmri.durum === 'acik' ? 'warning' : 'success'}
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {isEmri.created_at ? format(new Date(isEmri.created_at), 'dd MMMM yyyy, HH:mm', { locale: tr }) : '-'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch 
                checked={editMode} 
                onChange={(e) => {
                  setEditMode(e.target.checked);
                  if (!e.target.checked) setSelectedField(null);
                }}
                color="primary"
              />
            }
            label="Düzenleme Modu"
          />
          {editMode && (
            <Tooltip title="Tümünü Sıfırla">
              <IconButton onClick={resetSettings} color="warning">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/is-emirleri/${id}/duzenle`)}
          >
            Düzenle
          </Button>
          <Button 
            variant="contained" 
            startIcon={<PrintIcon />} 
            onClick={handlePrint}
          >
            Yazdır
          </Button>
        </Box>
      </Box>

      {/* Düzenleme Modu Paneli */}
      {editMode && (
        <Card sx={{ mb: 3, bgcolor: '#e3f2fd' }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#1976d2' }}>
              📍 Alanları Sürükle & Bırak | Tıklayarak Seç | Boyut Ayarla
            </Typography>
            
            {/* Alan Seçici */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {Object.keys(settings).map((key) => (
                <Chip
                  key={key}
                  label={fieldLabels[key]}
                  onClick={() => setSelectedField(selectedField === key ? null : key)}
                  onDelete={() => toggleVisibility(key)}
                  deleteIcon={settings[key].visible ? <DeleteIcon /> : <SaveIcon />}
                  color={selectedField === key ? 'primary' : settings[key].visible ? 'default' : 'default'}
                  variant={settings[key].visible ? 'filled' : 'outlined'}
                  sx={{ 
                    cursor: 'pointer',
                    opacity: settings[key].visible ? 1 : 0.5,
                    border: selectedField === key ? '2px solid #1976d2' : undefined,
                  }}
                />
              ))}
            </Box>

            {/* Seçili Alan Boyut Kontrolü */}
            {selectedField && (
              <Box sx={{ 
                bgcolor: 'white', 
                p: 2, 
                borderRadius: 2, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                boxShadow: 1
              }}>
                <Typography variant="body2" fontWeight={600} sx={{ minWidth: 100 }}>
                  {fieldLabels[selectedField]}:
                </Typography>
                
                <Tooltip title="Küçült">
                  <IconButton 
                    size="small" 
                    onClick={() => changeFontSize(selectedField, -0.1)}
                    color="primary"
                  >
                    <ZoomOutIcon />
                  </IconButton>
                </Tooltip>
                
                <Slider
                  value={settings[selectedField].fontSize}
                  min={0.5}
                  max={3}
                  step={0.05}
                  onChange={(e, val) => handleSliderChange(selectedField, val)}
                  sx={{ width: 200 }}
                />
                
                <Tooltip title="Büyüt">
                  <IconButton 
                    size="small" 
                    onClick={() => changeFontSize(selectedField, 0.1)}
                    color="primary"
                  >
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
                
                <Typography variant="body2" sx={{ minWidth: 50 }}>
                  {settings[selectedField].fontSize.toFixed(2)}rem
                </Typography>
                
                <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Konum: {settings[selectedField].top.toFixed(0)}% / {settings[selectedField].left.toFixed(0)}%
                  </Typography>
                </Box>
              </Box>
            )}

            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#666' }}>
              💡 Alan seçip boyutunu ayarlayın veya sürükleyerek taşıyın. Değişiklikler otomatik kaydedilir.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Kar Analizi Kartları - Sadece Admin Görebilir */}
      {isAdmin && (() => {
        const karDurumu = parseFloat(isEmri.kar) >= 0;
        return (
        <Grid container spacing={3} sx={{ mb: 3 }} className="no-print">
          <Grid item xs={12} md={4}>
            <Card sx={{ borderLeft: '4px solid', borderColor: 'primary.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main' }}>
                    <MoneyIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Toplam Satış
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {formatCurrency(isEmri.gercek_toplam_ucret)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderLeft: '4px solid', borderColor: 'error.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'error.lighter', color: 'error.main' }}>
                    <TrendingDownIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Toplam Maliyet
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="error.main">
                      {formatCurrency(isEmri.toplam_maliyet)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderLeft: '4px solid', borderColor: karDurumu ? 'success.main' : 'error.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ 
                    bgcolor: karDurumu ? 'success.lighter' : 'error.lighter', 
                    color: karDurumu ? 'success.main' : 'error.main' 
                  }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Net Kar
                    </Typography>
                    <Typography 
                      variant="h5" 
                      fontWeight={700} 
                      color={karDurumu ? 'success.main' : 'error.main'}
                    >
                    {formatCurrency(isEmri.kar)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        </Grid>
        );
      })()}

      {/* Yazdırılacak Alan */}
      <Box ref={printRef}>
        <style type="text/css" media="print">
          {`
            @page { size: A4; margin: 0mm; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none !important; }
            }
          `}
        </style>

        <Box
          ref={containerRef}
          sx={{
            position: 'relative',
            width: '210mm',
            height: '297mm',
            backgroundImage: 'url(/Fis.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            margin: '0 auto',
            overflow: 'hidden',
            border: editMode ? '3px solid #1976d2' : '1px solid #ddd',
            borderRadius: editMode ? '8px' : '4px',
            '@media print': {
              margin: 0,
              border: 'none',
            }
          }}
        >
          {/* Fiş No */}
          {settings.fisNo?.visible && (
            <Box 
              sx={getPositionStyle('fisNo')}
              onMouseDown={(e) => handleDragStart(e, 'fisNo')}
              onClick={() => editMode && setSelectedField('fisNo')}
            >
              {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
              <span style={{ fontWeight: 800 }}>{isEmri.fis_no}</span>
            </Box>
          )}

          {/* Tarih */}
          {settings.tarih?.visible && (
            <Box 
              sx={getPositionStyle('tarih')}
              onMouseDown={(e) => handleDragStart(e, 'tarih')}
              onClick={() => editMode && setSelectedField('tarih')}
            >
              {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
              <span style={{ fontWeight: 700 }}>
                {isEmri.created_at ? format(new Date(isEmri.created_at), 'dd.MM.yyyy', { locale: tr }) : '-'}
              </span>
            </Box>
          )}

          {/* Müşteri Adı */}
          {settings.musteriAd?.visible && (
            <Box 
              sx={getPositionStyle('musteriAd')}
              onMouseDown={(e) => handleDragStart(e, 'musteriAd')}
              onClick={() => editMode && setSelectedField('musteriAd')}
            >
              {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
              <span style={{ fontWeight: 700 }}>{isEmri.musteri_ad_soyad}</span>
            </Box>
          )}

          {/* Telefon */}
          {settings.telefon?.visible && (
            <Box 
              sx={getPositionStyle('telefon')}
              onMouseDown={(e) => handleDragStart(e, 'telefon')}
              onClick={() => editMode && setSelectedField('telefon')}
            >
              {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
              <span>{isEmri.telefon || '-'}</span>
            </Box>
          )}

          {/* Adres */}
          {settings.adres?.visible && (
            <Box 
              sx={{ ...getPositionStyle('adres'), maxWidth: '45%' }}
              onMouseDown={(e) => handleDragStart(e, 'adres')}
              onClick={() => editMode && setSelectedField('adres')}
            >
              {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
              <span>{isEmri.adres || '-'}</span>
            </Box>
          )}

          {/* Marka */}
          {settings.marka?.visible && (
            <Box 
              sx={getPositionStyle('marka')}
              onMouseDown={(e) => handleDragStart(e, 'marka')}
              onClick={() => editMode && setSelectedField('marka')}
            >
              {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
              <span style={{ fontWeight: 700 }}>{isEmri.marka}</span>
            </Box>
          )}

          {/* Model */}
          {settings.model?.visible && (
            <Box 
              sx={getPositionStyle('model')}
              onMouseDown={(e) => handleDragStart(e, 'model')}
              onClick={() => editMode && setSelectedField('model')}
            >
              {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
              <span>{isEmri.model_tip || '-'}</span>
            </Box>
          )}

          {/* Açıklama */}
          {settings.aciklama?.visible && (
            <Box 
              sx={{ ...getPositionStyle('aciklama'), maxWidth: '85%' }}
              onMouseDown={(e) => handleDragStart(e, 'aciklama')}
              onClick={() => editMode && setSelectedField('aciklama')}
            >
              {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
              <span>{isEmri.aciklama || '-'}</span>
            </Box>
          )}

          {/* Arıza/Şikayetler */}
          {settings.arizaSikayetler?.visible && (
            <Box 
              sx={{ ...getPositionStyle('arizaSikayetler'), maxWidth: '85%' }}
              onMouseDown={(e) => handleDragStart(e, 'arizaSikayetler')}
              onClick={() => editMode && setSelectedField('arizaSikayetler')}
            >
              {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
              <span>{isEmri.ariza_sikayetler || '-'}</span>
            </Box>
          )}

          {/* Tahmini Teslim */}
          {settings.tahminiTeslim?.visible && (
            <Box 
              sx={getPositionStyle('tahminiTeslim')}
              onMouseDown={(e) => handleDragStart(e, 'tahminiTeslim')}
              onClick={() => editMode && setSelectedField('tahminiTeslim')}
            >
              {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
              <span>
                {isEmri.tahmini_teslim_tarihi ? format(new Date(isEmri.tahmini_teslim_tarihi), 'dd.MM.yyyy', { locale: tr }) : '-'}
              </span>
            </Box>
          )}

          {/* Parça Tablosu */}
          {isEmri.parcalar && isEmri.parcalar.length > 0 && (
            <>
              {/* Parça Kodları */}
              {(settings.parcaKodu === undefined || settings.parcaKodu?.visible !== false) && (
                <Box 
                  sx={{ ...getPositionStyle('parcaKodu'), cursor: editMode ? 'move' : 'default' }}
                  onMouseDown={(e) => handleDragStart(e, 'parcaKodu')}
                  onClick={() => editMode && setSelectedField('parcaKodu')}
                >
                  {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
                  <div>
                    {isEmri.parcalar.map((parca, index) => (
                      <div key={index} style={{ marginBottom: '4px', lineHeight: '1.6' }}>
                        {index + 1}
                      </div>
                    ))}
                  </div>
                </Box>
              )}

              {/* Parça Adları */}
              {(settings.parcaAdi === undefined || settings.parcaAdi?.visible !== false) && (
                <Box 
                  sx={{ ...getPositionStyle('parcaAdi'), cursor: editMode ? 'move' : 'default' }}
                  onMouseDown={(e) => handleDragStart(e, 'parcaAdi')}
                  onClick={() => editMode && setSelectedField('parcaAdi')}
                >
                  {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
                  <div>
                    {isEmri.parcalar.map((parca, index) => (
                      <div key={index} style={{ marginBottom: '4px', lineHeight: '1.6', fontWeight: 600 }}>
                        {parca.takilan_parca}
                      </div>
                    ))}
                  </div>
                </Box>
              )}

              {/* Parça Adetleri */}
              {(settings.parcaAdet === undefined || settings.parcaAdet?.visible !== false) && (
                <Box 
                  sx={{ ...getPositionStyle('parcaAdet'), cursor: editMode ? 'move' : 'default' }}
                  onMouseDown={(e) => handleDragStart(e, 'parcaAdet')}
                  onClick={() => editMode && setSelectedField('parcaAdet')}
                >
                  {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
                  <div>
                    {isEmri.parcalar.map((parca, index) => (
                      <div key={index} style={{ marginBottom: '4px', lineHeight: '1.6' }}>
                        {parca.adet}
                      </div>
                    ))}
                  </div>
                </Box>
              )}

              {/* Parça Fiyatları */}
              {(settings.parcaFiyat === undefined || settings.parcaFiyat?.visible !== false) && (
                <Box 
                  sx={{ ...getPositionStyle('parcaFiyat'), cursor: editMode ? 'move' : 'default' }}
                  onMouseDown={(e) => handleDragStart(e, 'parcaFiyat')}
                  onClick={() => editMode && setSelectedField('parcaFiyat')}
                >
                  {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
                  <div>
                    {isEmri.parcalar.map((parca, index) => (
                      <div key={index} style={{ marginBottom: '4px', lineHeight: '1.6' }}>
                        {formatCurrency(parca.adet * parca.birim_fiyat)}
                      </div>
                    ))}
                  </div>
                </Box>
              )}
            </>
          )}

          {/* Genel Toplam */}
          {(settings.genelToplam === undefined || settings.genelToplam?.visible !== false) && isEmri.parcalar && isEmri.parcalar.length > 0 && (
            <Box 
              sx={getPositionStyle('genelToplam')}
              onMouseDown={(e) => handleDragStart(e, 'genelToplam')}
              onClick={() => editMode && setSelectedField('genelToplam')}
            >
              {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
              <span style={{ fontWeight: 800 }}>
                {formatCurrency(isEmri.parcalar.reduce((acc, p) => acc + (p.adet * p.birim_fiyat), 0))}
              </span>
            </Box>
          )}

          {/* Tahmini Toplam Ücret */}
          {(settings.tahminiUcret === undefined || settings.tahminiUcret?.visible !== false) && (
            <Box 
              sx={getPositionStyle('tahminiUcret')}
              onMouseDown={(e) => handleDragStart(e, 'tahminiUcret')}
              onClick={() => editMode && setSelectedField('tahminiUcret')}
            >
              {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
              <span style={{ fontWeight: 800 }}>
                {formatCurrency(isEmri.tahmini_toplam_ucret)}
              </span>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default IsEmriDetay;
