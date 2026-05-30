import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import {
  Print as PrintIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import { isEmriService, authService } from '../../services/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { defaultSettings } from './isEmriDetay/printSettings';
import KarAnaliziKartlari from './isEmriDetay/KarAnaliziKartlari';
import DuzenlemePaneli from './isEmriDetay/DuzenlemePaneli';
import FisYazdirmaAlani from './isEmriDetay/FisYazdirmaAlani';

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
  const [, setSettingsLoaded] = useState(false);
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
        <DuzenlemePaneli
          settings={settings}
          selectedField={selectedField}
          setSelectedField={setSelectedField}
          toggleVisibility={toggleVisibility}
          changeFontSize={changeFontSize}
          handleSliderChange={handleSliderChange}
        />
      )}

      {/* Kar Analizi Kartları - Sadece Admin Görebilir */}
      {isAdmin && <KarAnaliziKartlari isEmri={isEmri} />}

      {/* Yazdırılacak Alan */}
      <FisYazdirmaAlani
        printRef={printRef}
        containerRef={containerRef}
        editMode={editMode}
        settings={settings}
        isEmri={isEmri}
        getPositionStyle={getPositionStyle}
        handleDragStart={handleDragStart}
        setSelectedField={setSelectedField}
      />
    </Box>
  );
}

export default IsEmriDetay;
