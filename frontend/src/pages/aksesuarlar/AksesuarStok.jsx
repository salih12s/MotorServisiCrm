import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCustomTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Avatar,
  Chip,
  Tooltip,
  useMediaQuery,
  useTheme,
  Alert,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  Inventory as InventoryIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
  Image as ImageIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  InfoOutlined as InfoOutlinedIcon,
} from '@mui/icons-material';
import { aksesuarStokService, getPublicAksesuarImageUrl } from '../../services/api';

const compressImage = (file, maxSize = 600, quality = 0.72) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height >= width && height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ProductPhotoPicker = React.memo(function ProductPhotoPicker({
  images,
  mainImage,
  processing,
  primaryColor,
  onImageChange,
  onRemove,
  onSetMain,
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={700}>Ürün Fotoğrafları</Typography>
        <Tooltip
          title="Birden fazla fotoğraf ekleyebilirsiniz. Yıldıza basarak bir fotoğrafı vitrin (ana) fotoğrafı olarak seçin; ürün kartında sadece o fotoğraf görünür."
          arrow
        >
          <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }} />
        </Tooltip>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {images.map((img, index) => {
          const isMain = img === mainImage;
          return (
            <Box
              key={`${index}-${img.slice(-24)}`}
              sx={{
                width: 90,
                height: 90,
                borderRadius: 2,
                border: '2px solid',
                borderColor: isMain ? primaryColor : 'rgba(0,0,0,0.12)',
                overflow: 'hidden',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <Box
                component="img"
                src={img}
                alt={`Ürün ${index + 1}`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {isMain && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: primaryColor,
                    color: '#fff',
                    fontSize: '0.55rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    py: 0.2,
                    letterSpacing: 0.3,
                  }}
                >
                  VİTRİN
                </Box>
              )}
              <Tooltip title={isMain ? 'Vitrin fotoğrafı' : 'Vitrin fotoğrafı yap'} arrow>
                <IconButton
                  size="small"
                  aria-label={isMain ? 'Vitrin fotoğrafı' : 'Vitrin fotoğrafı yap'}
                  onClick={() => onSetMain(index)}
                  sx={{
                    position: 'absolute',
                    top: 1,
                    left: 1,
                    p: 0.2,
                    bgcolor: 'rgba(0,0,0,0.45)',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' },
                  }}
                >
                  {isMain
                    ? <StarIcon sx={{ fontSize: 16, color: '#ffd54f' }} />
                    : <StarBorderIcon sx={{ fontSize: 16, color: '#fff' }} />}
                </IconButton>
              </Tooltip>
              <IconButton
                size="small"
                aria-label="Fotoğrafı kaldır"
                onClick={() => onRemove(index)}
                sx={{
                  position: 'absolute',
                  top: 1,
                  right: 1,
                  p: 0.2,
                  bgcolor: 'rgba(0,0,0,0.45)',
                  '&:hover': { bgcolor: 'rgba(211,47,47,0.85)' },
                }}
              >
                <CloseIcon sx={{ fontSize: 14, color: '#fff' }} />
              </IconButton>
            </Box>
          );
        })}
        <Tooltip title="Fotoğraf ekle (birden fazla seçebilirsiniz)" arrow>
          <Box
            component="label"
            htmlFor="aksesuar-resim-input"
            sx={{
              width: 90,
              height: 90,
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: processing ? 'wait' : 'pointer',
              bgcolor: 'rgba(0,0,0,0.02)',
              flexShrink: 0,
              '&:hover': { borderColor: primaryColor },
            }}
          >
            <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
              {processing ? <CircularProgress size={20} /> : <PhotoCameraIcon fontSize="small" />}
              <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem', lineHeight: 1.1, mt: 0.3 }}>
                {processing ? 'Hazırlanıyor' : 'Fotoğraf Ekle'}
              </Typography>
            </Box>
          </Box>
        </Tooltip>
        <input
          id="aksesuar-resim-input"
          type="file"
          accept="image/*"
          multiple
          disabled={processing}
          hidden
          onChange={onImageChange}
        />
      </Box>
    </Box>
  );
});

const formatCurrency = (value) => new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(value || 0);

const StockResults = React.memo(function StockResults({
  loading,
  stocks,
  isMobile,
  isAdmin,
  primaryColor,
  totalInventory,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <Card><CardContent><Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress sx={{ color: primaryColor }} />
      </Box></CardContent></Card>
    );
  }

  if (stocks.length === 0) {
    return (
      <Card><CardContent><Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">Stok kaydı bulunamadı</Typography>
      </Box></CardContent></Card>
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        {isMobile ? (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {stocks.map((stok) => (
              <Paper key={stok.id} variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Avatar
                      variant="rounded"
                      src={stok.resim || (stok.resim_var ? getPublicAksesuarImageUrl(stok.id) : undefined)}
                      sx={{ width: 48, height: 48, bgcolor: 'rgba(0,0,0,0.06)' }}
                    >
                      <ImageIcon sx={{ color: 'rgba(0,0,0,0.3)' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">{stok.stok_kodu}</Typography>
                      <Typography variant="subtitle2" fontWeight={600}>{stok.stok_adi}</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => onEdit(stok)} aria-label="Stok düzenle">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {isAdmin && (
                      <IconButton size="small" color="error" onClick={() => onDelete(stok.id)} aria-label="Stok sil">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box><Typography variant="caption" color="text.secondary">Giren</Typography><Typography variant="body2">{stok.giren_miktar}</Typography></Box>
                  <Box><Typography variant="caption" color="text.secondary">Çıkan</Typography><Typography variant="body2">{stok.cikan_miktar}</Typography></Box>
                  <Box><Typography variant="caption" color="text.secondary">Mevcut</Typography><Typography variant="body2" fontWeight={600}>{stok.mevcut} {stok.birimi}</Typography></Box>
                  <Box><Typography variant="caption" color="text.secondary">Alış</Typography><Typography variant="body2">₺{formatCurrency(stok.alis_fiyati)}</Typography></Box>
                  <Box><Typography variant="caption" color="text.secondary">Satış</Typography><Typography variant="body2">₺{formatCurrency(stok.satis_fiyati)}</Typography></Box>
                </Box>
                <Box sx={{ mt: 1, textAlign: 'right' }}>
                  <Typography variant="body2" fontWeight={700} sx={{ color: primaryColor }}>
                    Envanter: ₺{formatCurrency(stok.envanter_degeri)}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: `${primaryColor}15` }}>
                  <TableCell sx={{ fontWeight: 700 }}>Resim</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Stok Kodu</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Stok Adı</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Giren Miktar</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Çıkan Miktar</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Mevcut</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Alış Fiyatı</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Fiyat A</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Envanter Değeri</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stocks.map((stok) => (
                  <TableRow key={stok.id} hover>
                    <TableCell>
                      <Avatar variant="rounded" src={stok.resim || (stok.resim_var ? getPublicAksesuarImageUrl(stok.id) : undefined)} sx={{ width: 40, height: 40, bgcolor: 'rgba(0,0,0,0.06)' }}>
                        <ImageIcon fontSize="small" sx={{ color: 'rgba(0,0,0,0.3)' }} />
                      </Avatar>
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{stok.stok_kodu}</TableCell>
                    <TableCell>{stok.stok_adi}</TableCell>
                    <TableCell align="center">{stok.giren_miktar}</TableCell>
                    <TableCell align="center">{stok.cikan_miktar}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${stok.mevcut} ${stok.birimi}`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: stok.mevcut > 0 ? '#e8f5e9' : '#ffebee',
                          color: stok.mevcut > 0 ? '#2e7d32' : '#c62828',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">₺{formatCurrency(stok.alis_fiyati)}</TableCell>
                    <TableCell align="right">₺{formatCurrency(stok.satis_fiyati)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>₺{formatCurrency(stok.envanter_degeri)}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => onEdit(stok)} sx={{ color: primaryColor }} aria-label="Stok düzenle">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      {isAdmin && (
                        <IconButton size="small" color="error" onClick={() => onDelete(stok.id)} aria-label="Stok sil">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell colSpan={8} align="right" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Toplam Envanter Tutarı:</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.95rem', color: primaryColor }}>₺{formatCurrency(totalInventory)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
});

function AksesuarStok() {
  const [stoklar, setStoklar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [toplamEnvanter, setToplamEnvanter] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStok, setEditingStok] = useState(null);
  const [saving, setSaving] = useState(false);
  const [processingImages, setProcessingImages] = useState(false);
  const [error, setError] = useState('');
  const requestIdRef = useRef(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { themeColors } = useCustomTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [formData, setFormData] = useState({
    stok_kodu: '',
    stok_adi: '',
    giren_miktar: 0,
    cikan_miktar: 0,
    birimi: 'Adet',
    alis_fiyati: 0,
    satis_fiyati: 0,
    resim: '',
    resimler: [],
    aciklama: '',
  });

  const loadStoklar = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      const response = await aksesuarStokService.getAll({ page, limit: 25, search: debouncedSearch });
      if (requestId !== requestIdRef.current) return;
      setStoklar(response.data?.data || []);
      setTotalItems(response.data?.pagination?.total || 0);
      setTotalPages(response.data?.pagination?.totalPages || 1);
      setToplamEnvanter(parseFloat(response.data?.toplamEnvanter || 0));
    } catch (error) {
      console.error('Stok listesi hatası:', error);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadStoklar();
  }, [loadStoklar]);

  const handleOpenDialog = useCallback(async (stok = null) => {
    if (stok) {
      setError('');
      setEditingStok(stok);
      setDialogOpen(true);
      setSaving(true);
      let detayliStok = stok;
      try {
        const response = await aksesuarStokService.getById(stok.id);
        detayliStok = response.data;
      } catch (error) {
        setError(error.response?.data?.message || 'Stok detayı yüklenemedi');
        setSaving(false);
        return;
      }
      // resimler kolonu JSON dizi olarak saklanır; eski kayıtlarda sadece resim olabilir
      let resimlerArr = [];
      if (detayliStok.resimler) {
        if (Array.isArray(detayliStok.resimler)) {
          resimlerArr = detayliStok.resimler.filter(Boolean);
        } else {
          try {
            const parsed = JSON.parse(detayliStok.resimler);
            if (Array.isArray(parsed)) resimlerArr = parsed.filter(Boolean);
          } catch {
            resimlerArr = [];
          }
        }
      }
      resimlerArr = [...new Set(resimlerArr)];
      if (detayliStok.resim) {
        resimlerArr = [detayliStok.resim, ...resimlerArr.filter((img) => img !== detayliStok.resim)];
      }
      const anaResim = detayliStok.resim || resimlerArr[0] || '';
      setEditingStok(detayliStok);
      setFormData({
        stok_kodu: detayliStok.stok_kodu,
        stok_adi: detayliStok.stok_adi,
        giren_miktar: detayliStok.giren_miktar,
        cikan_miktar: detayliStok.cikan_miktar,
        birimi: detayliStok.birimi,
        alis_fiyati: detayliStok.alis_fiyati,
        satis_fiyati: detayliStok.satis_fiyati,
        resim: anaResim,
        resimler: resimlerArr,
        aciklama: detayliStok.aciklama || '',
      });
      setSaving(false);
    } else {
      setEditingStok(null);
      setFormData({
        stok_kodu: '',
        stok_adi: '',
        giren_miktar: 0,
        cikan_miktar: 0,
        birimi: 'Adet',
        alis_fiyati: 0,
        satis_fiyati: 0,
        resim: '',
        resimler: [],
        aciklama: '',
      });
    }
    setError('');
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingStok(null);
    setError('');
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleImageChange = useCallback(async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      setError('Lütfen geçerli bir resim dosyası seçin');
      e.target.value = '';
      return;
    }
    setProcessingImages(true);
    try {
      const compressedList = await Promise.all(imageFiles.map((f) => compressImage(f)));
      setFormData((prev) => {
        const yeniResimler = [...(prev.resimler || []), ...compressedList];
        return {
          ...prev,
          resimler: yeniResimler,
          // Ana fotoğraf henüz seçilmemişse ilk eklenen ana olur
          resim: prev.resim || yeniResimler[0] || '',
        };
      });
      setError('');
    } catch (err) {
      setError('Resim işlenirken bir hata oluştu');
    } finally {
      setProcessingImages(false);
    }
    e.target.value = '';
  }, []);

  const handleRemoveImage = useCallback((index) => {
    setFormData((prev) => {
      const silinen = prev.resimler[index];
      const yeniResimler = prev.resimler.filter((_, i) => i !== index);
      let yeniAna = prev.resim;
      // Ana fotoğraf silindiyse ilk kalan fotoğraf ana olur
      if (silinen === prev.resim) {
        yeniAna = yeniResimler[0] || '';
      }
      return { ...prev, resimler: yeniResimler, resim: yeniAna };
    });
  }, []);

  const handleSetMainImage = useCallback((index) => {
    setFormData((prev) => ({ ...prev, resim: prev.resimler[index] }));
  }, []);

  const handleSave = async () => {
    if (!formData.stok_kodu || !formData.stok_adi) {
      setError('Stok kodu ve stok adı zorunludur');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...formData,
        resim: formData.resim || formData.resimler?.[0] || '',
      };
      if (editingStok) {
        await aksesuarStokService.update(editingStok.id, payload);
      } else {
        await aksesuarStokService.create(payload);
      }
      handleCloseDialog();
      loadStoklar();
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Bu stok kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await aksesuarStokService.delete(id);
        loadStoklar();
      } catch (error) {
        console.error('Silme hatası:', error);
      }
    }
  }, [loadStoklar]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`Toplam: ${totalItems} ürün`}
            size="small"
            sx={{ bgcolor: '#1a237e', color: 'white', fontWeight: 600 }}
          />
          <Chip
            label={`Envanter: ₺${formatCurrency(toplamEnvanter)}`}
            size="small"
            sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: themeColors.primary, '&:hover': { bgcolor: themeColors.primaryDark } }}
        >
          Yeni Ürün Ekle
        </Button>
      </Box>

      {/* Arama */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Stok kodu veya ürün adı ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <StockResults
        loading={loading}
        stocks={stoklar}
        isMobile={isMobile}
        isAdmin={isAdmin}
        primaryColor={themeColors.primary}
        totalInventory={toplamEnvanter}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
      />

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            disabled={loading}
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Ekleme/Düzenleme Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          bgcolor: themeColors.primary,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InventoryIcon />
            <Typography variant="h6">{editingStok ? 'Stok Düzenle' : 'Yeni Stok Ekle'}</Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <ProductPhotoPicker
              images={formData.resimler}
              mainImage={formData.resim}
              processing={processingImages}
              primaryColor={themeColors.primary}
              onImageChange={handleImageChange}
              onRemove={handleRemoveImage}
              onSetMain={handleSetMainImage}
            />
            {/* Stok Kodu + Birimi */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Stok Kodu"
                name="stok_kodu"
                value={formData.stok_kodu}
                onChange={handleChange}
                required
                placeholder="869000000XXXX"
              />
              <TextField
                fullWidth
                size="small"
                label="Birimi"
                name="birimi"
                value={formData.birimi}
                onChange={handleChange}
              />
            </Box>
            <TextField
              fullWidth
              size="small"
              label="Stok Adı"
              name="stok_adi"
              value={formData.stok_adi}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              size="small"
              label="Ürün Açıklaması (opsiyonel)"
              name="aciklama"
              value={formData.aciklama}
              onChange={handleChange}
              multiline
              minRows={2}
              maxRows={6}
              placeholder="Ürünle ilgili kısa açıklama, özellikler vb. (zorunlu değil)"
              helperText="Açıklama varsa ürün kartında stok bilgisinin altında kısaca, detayda ise tamamı görünür."
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Giren Miktar"
                name="giren_miktar"
                value={formData.giren_miktar}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Çıkan Miktar"
                name="cikan_miktar"
                value={formData.cikan_miktar}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Alış Fiyatı (₺)"
                name="alis_fiyati"
                value={formData.alis_fiyati}
                onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start">₺</InputAdornment> }}
                inputProps={{ min: 0, step: 0.01 }}
              />
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Satış Fiyatı / Fiyat A (₺)"
                name="satis_fiyati"
                value={formData.satis_fiyati}
                onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start">₺</InputAdornment> }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Box>
            {/* Mevcut ve Envanter Bilgisi (otomatik) */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Paper variant="outlined" sx={{ p: 1.5, flex: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Mevcut Stok</Typography>
                <Typography variant="h6" fontWeight={700}>
                  {(parseInt(formData.giren_miktar) || 0) - (parseInt(formData.cikan_miktar) || 0)}
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, flex: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Envanter Değeri</Typography>
                <Typography variant="h6" fontWeight={700} sx={{ color: themeColors.primary }}>
                  ₺{formatCurrency(
                    ((parseInt(formData.giren_miktar) || 0) - (parseInt(formData.cikan_miktar) || 0)) * (parseFloat(formData.satis_fiyati) || 0)
                  )}
                </Typography>
              </Paper>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">İptal</Button>
          <Button
            variant="contained"
            startIcon={(saving || processingImages) ? <CircularProgress size={16} /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving || processingImages}
            sx={{ bgcolor: themeColors.primary, '&:hover': { bgcolor: themeColors.primaryDark } }}
          >
            {processingImages ? 'Fotoğraflar hazırlanıyor...' : saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AksesuarStok;
