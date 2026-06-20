import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingBag as ShoppingBagIcon,
  Image as ImageIcon,
  Inventory2 as Inventory2Icon,
  Close as CloseIcon,
} from '@mui/icons-material';
import PublicNav from '../../components/PublicNav';
import SiteFooter from '../../components/SiteFooter';
import { aksesuarStokService } from '../../services/api';

function formatCurrency(value) {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function AksesuarCard({ urun, onImageClick }) {
  const stokVar = (urun.mevcut || 0) > 0;
  return (
    <Card
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: '1px solid rgba(54,197,211,0.15)',
        background: 'rgba(255,255,255,0.03)',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: 'rgba(54,197,211,0.45)',
          boxShadow: '0 12px 30px rgba(4,167,184,0.18)',
        },
      }}
    >
      {/* Resim - tüm kartlarda sabit yükseklik */}
      <Box
        onClick={urun.resim ? () => onImageClick(urun.resim) : undefined}
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
          cursor: urun.resim ? 'zoom-in' : 'default',
        }}
      >
        {urun.resim ? (
          <Box
            component="img"
            src={urun.resim}
            alt={urun.stok_adi}
            loading="lazy"
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <ImageIcon sx={{ fontSize: 64, color: 'rgba(54,197,211,0.25)' }} />
        )}
      </Box>

      {/* Bilgi */}
      <Box sx={{ p: { xs: 1.75, sm: 2.25 }, display: 'flex', flexDirection: 'column', flex: 1, gap: 1.25 }}>
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

        {/* Stok durumu - kartın altında */}
        <Chip
          size="small"
          icon={<Inventory2Icon sx={{ fontSize: '0.9rem !important' }} />}
          label={stokVar ? `Stokta ${urun.mevcut} ${urun.birimi || 'Adet'}` : 'Stokta bitti'}
          sx={{
            alignSelf: 'flex-start',
            fontWeight: 700,
            fontSize: '0.72rem',
            height: 26,
            color: stokVar ? '#fff' : 'rgba(255,255,255,0.55)',
            bgcolor: stokVar ? 'rgba(4,167,184,0.9)' : 'rgba(255,255,255,0.08)',
            border: stokVar ? 'none' : '1px solid rgba(255,255,255,0.12)',
            '& .MuiChip-icon': { color: stokVar ? '#fff' : 'rgba(255,255,255,0.4)' },
          }}
        />
      </Box>
    </Card>
  );
}

function AksesuarSatisPage() {
  const [urunler, setUrunler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomImage, setZoomImage] = useState(null);

  const loadUrunler = useCallback(async () => {
    try {
      setLoading(true);
      const response = await aksesuarStokService.getPublic();
      setUrunler(response.data || []);
    } catch (error) {
      console.error('Aksesuar listesi hatası:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUrunler();
  }, [loadUrunler]);

  const filtered = urunler.filter((u) =>
    u.stok_adi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.stok_kodu?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                Aksesuarlar
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: 400,
                }}
              >
                Motosiklet aksesuar ve yedek parça ürünlerimiz
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

        {loading ? (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#36C5D3' }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <ImageIcon sx={{ fontSize: 48, color: 'rgba(54,197,211,0.3)', mb: 2 }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem' }}>
              {searchTerm ? 'Aramanızla eşleşen ürün bulunamadı.' : 'Henüz ürün eklenmemiş.'}
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
            {filtered.map((urun) => (
              <AksesuarCard urun={urun} key={urun.id} onImageClick={setZoomImage} />
            ))}
          </Box>
        )}
      </Container>

      {/* Görsel büyütme modalı */}
      <Dialog
        open={Boolean(zoomImage)}
        onClose={() => setZoomImage(null)}
        maxWidth="md"
        slotProps={{
          backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' } },
        }}
        PaperProps={{
          sx: {
            background: 'transparent',
            boxShadow: 'none',
            overflow: 'visible',
            m: 2,
          },
        }}
      >
        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <IconButton
            onClick={() => setZoomImage(null)}
            aria-label="Kapat"
            sx={{
              position: 'absolute',
              top: -16,
              right: -16,
              bgcolor: 'rgba(4,167,184,0.95)',
              color: '#fff',
              '&:hover': { bgcolor: '#36C5D3' },
              boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
            }}
          >
            <CloseIcon />
          </IconButton>
          {zoomImage && (
            <Box
              component="img"
              src={zoomImage}
              alt="Ürün görseli"
              sx={{
                maxWidth: '100%',
                maxHeight: '85vh',
                borderRadius: 2,
                border: '1px solid rgba(54,197,211,0.3)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                objectFit: 'contain',
              }}
            />
          )}
        </Box>
      </Dialog>

      <SiteFooter />
    </Box>
  );
}

export default AksesuarSatisPage;
