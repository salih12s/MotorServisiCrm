import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Pagination,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingBag as ShoppingBagIcon,
  Image as ImageIcon,
  Inventory2 as Inventory2Icon,
  Close as CloseIcon,
  AddShoppingCart as AddShoppingCartIcon,
} from '@mui/icons-material';
import PublicNav from '../../components/PublicNav';
import SiteFooter from '../../components/SiteFooter';
import { aksesuarStokService, getPublicAksesuarImageUrl } from '../../services/api';
import { useCart } from '../../context/CartContext';

function formatCurrency(value) {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

// Ürünün tüm fotoğraflarını dizi olarak döndürür (ana fotoğraf ilk sırada)
export function getResimler(urun) {
  let list = [];
  if (urun.resimler) {
    if (Array.isArray(urun.resimler)) {
      list = urun.resimler.filter(Boolean);
    } else {
      try {
        const parsed = JSON.parse(urun.resimler);
        if (Array.isArray(parsed)) list = parsed.filter(Boolean);
      } catch {
        list = [];
      }
    }
  }
  list = [...new Set(list.filter(Boolean))];
  // Ana fotoğraf eski/uyumsuz kayıtlarda galeride olmasa bile ilk sırada gösterilir.
  if (urun.resim) list = [urun.resim, ...list.filter((r) => r !== urun.resim)];
  return list;
}

export function AksesuarCard({ urun, onClick, onAddToCart }) {
  const stokVar = (urun.mevcut || 0) > 0;
  const resimler = getResimler(urun);
  return (
    <Card
      elevation={0}
      onClick={() => onClick(urun)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick(urun);
        }
      }}
      sx={{
        width: '100%',
        height: { xs: 390, sm: 450, md: 470 },
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: '1px solid rgba(54,197,211,0.15)',
        background: 'rgba(255,255,255,0.03)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: 'rgba(54,197,211,0.45)',
          boxShadow: '0 12px 30px rgba(4,167,184,0.18)',
        },
      }}
    >
      {/* Resim - tüm kartlarda sabit yükseklik (yalnızca ana/vitrin fotoğrafı) */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 180, sm: 220, md: 240 },
          flexShrink: 0,
          background: 'rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(54,197,211,0.1)',
        }}
      >
        {(urun.resim || urun.resim_var) ? (
          <Box
            component="img"
            src={urun.resim || getPublicAksesuarImageUrl(urun.id, urun.updated_at)}
            alt={urun.stok_adi}
            loading="lazy"
            decoding="async"
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <ImageIcon sx={{ fontSize: 64, color: 'rgba(54,197,211,0.25)' }} />
        )}
        {/* Birden fazla fotoğraf rozeti */}
        {(Number(urun.resim_sayisi) > 1 || resimler.length > 1) && (
          <Chip
            size="small"
            icon={<ImageIcon sx={{ fontSize: '0.85rem !important', color: '#fff !important' }} />}
            label={Number(urun.resim_sayisi) || resimler.length}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              height: 24,
              fontWeight: 700,
              fontSize: '0.7rem',
              color: '#fff',
              bgcolor: 'rgba(0,0,0,0.55)',
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        )}
      </Box>

      {/* Bilgi */}
      <Box sx={{ p: { xs: 1.75, sm: 2.25 }, display: 'flex', flexDirection: 'column', flex: 1, gap: 1 }}>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: { xs: '0.9rem', sm: '1rem' },
            color: '#fff',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: { xs: '2.3rem', sm: '2.6rem' },
          }}
        >
          {urun.stok_adi}
        </Typography>

        <Typography
          sx={{
            mt: 'auto',
            fontWeight: 900,
            fontSize: { xs: '1.2rem', sm: '1.4rem' },
            background: 'linear-gradient(135deg, #04A7B8 0%, #36C5D3 60%, #7be3ee 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ₺{formatCurrency(urun.satis_fiyati)}
        </Typography>

        {/* Stok durumu + Sepete Ekle - kartın altında, yan yana */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            icon={<Inventory2Icon sx={{ fontSize: '0.9rem !important' }} />}
            label={stokVar ? `Stokta ${urun.mevcut} ${urun.birimi || 'Adet'}` : 'Stokta bitti'}
            sx={{
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 26,
              color: stokVar ? '#fff' : 'rgba(255,255,255,0.55)',
              bgcolor: stokVar ? 'rgba(4,167,184,0.9)' : 'rgba(255,255,255,0.08)',
              border: stokVar ? 'none' : '1px solid rgba(255,255,255,0.12)',
              '& .MuiChip-icon': { color: stokVar ? '#fff' : 'rgba(255,255,255,0.4)' },
            }}
          />
          <Button
            size="small"
            variant="contained"
            disabled={!stokVar}
            startIcon={<AddShoppingCartIcon sx={{ fontSize: '1rem !important' }} />}
            onClick={(event) => {
              event.stopPropagation();
              onAddToCart?.(urun);
            }}
            sx={{
              ml: 'auto',
              minWidth: 0,
              px: 1.25,
              py: 0.4,
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 50,
              background: 'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
              boxShadow: 'none',
              '& .MuiButton-startIcon': { mr: 0.5 },
              '&:hover': { background: 'linear-gradient(135deg, #36C5D3 0%, #04A7B8 100%)' },
              '&.Mui-disabled': { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' },
            }}
          >
            Sepete Ekle
          </Button>
        </Box>

        {/* Açıklama - varsa stok bilgisinin altında kısaca */}
        <Box sx={{ minHeight: { xs: '2rem', sm: '2.2rem' } }}>
          {urun.aciklama && (
            <Typography
              sx={{
                fontSize: { xs: '0.72rem', sm: '0.78rem' },
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {urun.aciklama}
            </Typography>
          )}
        </Box>
      </Box>
    </Card>
  );
}

// Ürün detay penceresi - galeri (büyük ana foto + seçilebilir küçük fotoğraflar) + tam açıklama
export function AksesuarDetayDialog({ urun, open, onClose, onAddToCart }) {
  const [aktifResim, setAktifResim] = useState(0);

  useEffect(() => {
    setAktifResim(0);
  }, [urun]);

  if (!urun) return null;

  const resimler = getResimler(urun);
  const stokVar = (urun.mevcut || 0) > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' } },
      }}
      PaperProps={{
        sx: {
          background: 'linear-gradient(180deg, #0a1622 0%, #02080f 100%)',
          border: '1px solid rgba(54,197,211,0.25)',
          borderRadius: 3,
          color: '#fff',
          m: { xs: 1.5, sm: 2 },
          overflowX: 'hidden',
        },
      }}
    >
      <Box sx={{ position: 'relative', p: { xs: 2, sm: 3 }, minWidth: 0, overflowX: 'hidden' }}>
        <IconButton
          onClick={onClose}
          aria-label="Kapat"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 2,
            bgcolor: 'rgba(4,167,184,0.9)',
            color: '#fff',
            '&:hover': { bgcolor: '#36C5D3' },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 3 }}>
          {/* Galeri */}
          <Box sx={{ width: { xs: '100%', md: '52%' }, flexShrink: 0 }}>
            {/* Büyük ana fotoğraf */}
            <Box
              sx={{
                width: '100%',
                height: { xs: 240, sm: 320, md: 340 },
                borderRadius: 2,
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(54,197,211,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {resimler.length > 0 ? (
                <Box
                  component="img"
                  src={resimler[aktifResim]}
                  alt={urun.stok_adi}
                  sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <ImageIcon sx={{ fontSize: 72, color: 'rgba(54,197,211,0.25)' }} />
              )}
            </Box>

            {/* Seçilebilir küçük fotoğraflar */}
            {resimler.length > 1 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                {resimler.map((img, i) => (
                  <Box
                    key={i}
                    onClick={() => setAktifResim(i)}
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      flexShrink: 0,
                      border: '2px solid',
                      borderColor: i === aktifResim ? '#36C5D3' : 'rgba(255,255,255,0.12)',
                      opacity: i === aktifResim ? 1 : 0.7,
                      transition: 'all 0.15s ease',
                      '&:hover': { opacity: 1, borderColor: 'rgba(54,197,211,0.6)' },
                    }}
                  >
                    <Box
                      component="img"
                      src={img}
                      alt={`${urun.stok_adi} ${i + 1}`}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Bilgiler */}
          <Box sx={{ flex: 1, minWidth: 0, pr: { xs: 0, sm: 4 } }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.15rem', sm: '1.4rem' },
                color: '#fff',
                lineHeight: 1.3,
                pr: 4,
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              }}
            >
              {urun.stok_adi}
            </Typography>

            <Typography
              sx={{
                mt: 1.5,
                fontWeight: 900,
                fontSize: { xs: '1.5rem', sm: '1.8rem' },
                background: 'linear-gradient(135deg, #04A7B8 0%, #36C5D3 60%, #7be3ee 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ₺{formatCurrency(urun.satis_fiyati)}
            </Typography>

            <Chip
              size="small"
              icon={<Inventory2Icon sx={{ fontSize: '0.9rem !important' }} />}
              label={stokVar ? `Stokta ${urun.mevcut} ${urun.birimi || 'Adet'}` : 'Stokta bitti'}
              sx={{
                mt: 1.5,
                fontWeight: 700,
                fontSize: '0.72rem',
                height: 26,
                color: stokVar ? '#fff' : 'rgba(255,255,255,0.55)',
                bgcolor: stokVar ? 'rgba(4,167,184,0.9)' : 'rgba(255,255,255,0.08)',
                border: stokVar ? 'none' : '1px solid rgba(255,255,255,0.12)',
                '& .MuiChip-icon': { color: stokVar ? '#fff' : 'rgba(255,255,255,0.4)' },
              }}
            />

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                disabled={!stokVar}
                startIcon={<AddShoppingCartIcon />}
                onClick={() => onAddToCart?.(urun)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 50,
                  px: 3,
                  py: 1,
                  background: 'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
                  boxShadow: '0 6px 20px rgba(54,197,211,0.4)',
                  '&:hover': { background: 'linear-gradient(135deg, #36C5D3 0%, #04A7B8 100%)' },
                  '&.Mui-disabled': { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' },
                }}
              >
                {stokVar ? 'Sepete Ekle' : 'Stokta Yok'}
              </Button>
            </Box>

            {urun.aciklama && (
              <Box sx={{ mt: 2.5 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#36C5D3', mb: 0.75 }}>
                  Ürün Açıklaması
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.88rem',
                    color: 'rgba(255,255,255,0.75)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    maxWidth: '100%',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                  }}
                >
                  {urun.aciklama}
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </Box>
    </Dialog>
  );
}

function AksesuarSatisPage() {
  const [urunler, setUrunler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stokFiltre, setStokFiltre] = useState('tumu'); // 'tumu' | 'stokta'
  const [detayUrun, setDetayUrun] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const requestIdRef = useRef(0);
  const { addItem } = useCart();

  const handleAddToCart = useCallback((urun) => {
    const res = addItem(urun, 1);
    if (res.ok) {
      setSnackbar({ open: true, message: `${urun.stok_adi} sepete eklendi`, severity: 'success' });
    } else if (res.reason === 'limit') {
      setSnackbar({
        open: true,
        message: `Stokta en fazla ${res.stok} ${urun.birimi || 'adet'} var, daha fazla ekleyemezsiniz.`,
        severity: 'warning',
      });
    } else if (res.reason === 'outofstock') {
      setSnackbar({ open: true, message: 'Bu ürün stokta bulunmuyor.', severity: 'warning' });
    }
  }, [addItem]);

  const loadUrunler = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      const response = await aksesuarStokService.getPublic({
        page,
        limit: 50,
        search: debouncedSearch,
        stokta: stokFiltre === 'stokta',
      });
      if (requestId !== requestIdRef.current) return;
      setUrunler(response.data?.data || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Aksesuar listesi hatası:', error);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [page, debouncedSearch, stokFiltre]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(searchTerm.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadUrunler();
  }, [loadUrunler]);

  const handleStokFiltre = (_, value) => {
    if (!value) return;
    setPage(1);
    setStokFiltre(value);
  };

  const handleOpenDetail = useCallback(async (urun) => {
    setDetayUrun(urun);
    try {
      const response = await aksesuarStokService.getPublicById(urun.id);
      setDetayUrun(response.data);
    } catch (error) {
      console.error('Aksesuar detayı hatası:', error);
    }
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#02080f', color: '#fff', overflowX: 'hidden' }}>
      <PublicNav solid />

      {/* Hero Banner */}
      <Box
        sx={{
          pt: { xs: '72px', sm: '80px', md: '88px' },
          background: 'linear-gradient(180deg, rgba(4,167,184,0.18) 0%, rgba(2,8,15,0.0) 100%)',
          borderBottom: '1px solid rgba(54,197,211,0.12)',
          pb: { xs: 4, md: 5 },
        }}
      >
        <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 5 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            mb={1.5}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #04A7B8, #36C5D3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(54,197,211,0.4)',
                flexShrink: 0,
              }}
            >
              <ShoppingBagIcon sx={{ color: '#fff', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3rem' },
                  background: 'linear-gradient(135deg, #04A7B8 0%, #36C5D3 50%, #7be3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                }}
              >
                Aksesuar ve Ekipman
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: 400,
                }}
              >
                Motosiklet aksesuar, ekipman ve yedek parça ürünlerimiz
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {/* Arama */}
        <TextField
          fullWidth
          placeholder="Aksesuar ara... (örn: kask, eldiven, yağ...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#36C5D3' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: { xs: 3, md: 4 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              background: 'rgba(255,255,255,0.04)',
              color: '#fff',
              '& fieldset': { borderColor: 'rgba(54,197,211,0.25)' },
              '&:hover fieldset': { borderColor: 'rgba(54,197,211,0.5)' },
              '&.Mui-focused fieldset': { borderColor: '#36C5D3' },
            },
            '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.35)', opacity: 1 },
          }}
        />

        <ToggleButtonGroup
          value={stokFiltre}
          exclusive
          onChange={handleStokFiltre}
          aria-label="Stok filtresi"
          sx={{
            mb: { xs: 3, md: 4 },
            '& .MuiToggleButton-root': {
              color: 'rgba(255,255,255,0.7)',
              borderColor: 'rgba(54,197,211,0.3)',
              px: { xs: 2.5, sm: 4 },
              py: 0.9,
              fontWeight: 700,
              textTransform: 'none',
              '&.Mui-selected': {
                color: '#fff',
                borderColor: 'transparent',
                background: 'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #36C5D3 0%, #04A7B8 100%)',
                },
              },
              '&:hover': { background: 'rgba(54,197,211,0.1)' },
            },
          }}
        >
          <ToggleButton value="tumu">Tümü</ToggleButton>
          <ToggleButton value="stokta">Stokta Var</ToggleButton>
        </ToggleButtonGroup>

        {/* Üst sayfalama - rahat geçiş için ürünlerin üstünde */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 3, md: 4 } }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => {
                setPage(value);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={loading}
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': { color: 'rgba(255,255,255,0.75)' },
                '& .Mui-selected': { bgcolor: '#04A7B8 !important', color: '#fff' },
              }}
            />
          </Box>
        )}

        {loading ? (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#36C5D3' }} />
          </Box>
        ) : urunler.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <ImageIcon sx={{ fontSize: 48, color: 'rgba(54,197,211,0.3)', mb: 2 }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem' }}>
              {searchTerm
                ? 'Aramanızla eşleşen ürün bulunamadı.'
                : stokFiltre === 'stokta'
                  ? 'Şu anda stokta ürün bulunmuyor.'
                  : 'Henüz ürün eklenmemiş.'}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gap: { xs: 1.75, sm: 3 },
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              alignItems: 'stretch',
            }}
          >
            {urunler.map((urun) => (
              <AksesuarCard
                urun={urun}
                key={urun.id}
                onClick={handleOpenDetail}
                onAddToCart={handleAddToCart}
              />
            ))}
          </Box>
        )}

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => {
                setPage(value);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={loading}
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': { color: 'rgba(255,255,255,0.75)' },
                '& .Mui-selected': { bgcolor: '#04A7B8 !important', color: '#fff' },
              }}
            />
          </Box>
        )}
      </Container>

      <AksesuarDetayDialog
        urun={detayUrun}
        open={Boolean(detayUrun)}
        onClose={() => setDetayUrun(null)}
        onAddToCart={handleAddToCart}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ fontWeight: 600, ...(snackbar.severity === 'success' ? { bgcolor: '#04A7B8' } : {}) }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <SiteFooter />
    </Box>
  );
}

export default AksesuarSatisPage;
