import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  WhatsApp as WhatsAppIcon,
  Speed as SpeedIcon,
  Palette as PaletteIcon,
  Collections as CollectionsIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import PublicNav from '../../../components/PublicNav';
import SiteFooter from '../../../components/SiteFooter';
import motors from '../../../data/motors';
import { BRAND_COLORS, FALLBACK_IMAGE, getMotorImage } from './motorlarConstants';

function MotorDetayPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const motor = useMemo(() => motors.find((m) => m.id === id), [id]);
  const defaultImage = useMemo(() => getMotorImage(motor), [motor]);

  // Ana görsel + galeri + renk görselleri tek listede toplanır
  const images = useMemo(() => {
    if (!motor) return [];
    const list = [];
    if (defaultImage) list.push(defaultImage);
    (motor.gallery || []).forEach((g) => {
      if (!list.includes(g)) list.push(g);
    });
    return list;
  }, [motor, defaultImage]);

  const [activeImage, setActiveImage] = useState(null);
  const [activeColor, setActiveColor] = useState(null);

  // Sayfa açılışında ve benzer model geçişlerinde en üste dön (paint öncesi, animasyondan önce).
  // index.css'te html/body/#root üzerinde height:100% + overflow-x:hidden olduğundan
  // gerçek kaydırma #root içinde gerçekleşiyor; window.scrollTo tek başına yetmez.
  useLayoutEffect(() => {
    const root = document.getElementById('root');
    if (root) root.scrollTop = 0;
    if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    setActiveImage(null);
    setActiveColor(null);
  }, [id]);

  if (!motor) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#0a1929', color: '#fff' }}>
        <PublicNav />
        <Container maxWidth="md" sx={{ pt: 24, pb: 12, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, mb: 2 }}>
            Model bulunamadı
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/koleksiyon')}
            sx={{
              background: 'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            Modellere Dön
          </Button>
        </Container>
        <SiteFooter />
      </Box>
    );
  }

  const colors = BRAND_COLORS[motor.brand] || BRAND_COLORS.Musatti;
  const shownImage =
    activeColor?.image || activeImage || defaultImage || FALLBACK_IMAGE;
  const collectionPath = motor.brand === 'Falcon'
    ? '/koleksiyon/falcon'
    : motor.brand === 'Musatti'
      ? '/koleksiyon/musatti'
      : '/motorlar';

  const specEntries = Object.entries(motor.specs || {});

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a1929', color: '#fff', overflowX: 'hidden' }}>
      <PublicNav />

      {/* Üst bölüm */}
      <Box
        sx={{
          pt: { xs: 12, md: 16 },
          pb: { xs: 4, md: 6 },
          background:
            'radial-gradient(ellipse at top, rgba(4,167,184,0.28) 0%, transparent 55%), linear-gradient(180deg, #024E54 0%, #0a1929 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(collectionPath)}
            sx={{
              color: 'rgba(255,255,255,0.75)',
              fontWeight: 700,
              textTransform: 'none',
              mb: 2,
              '&:hover': { color: '#36C5D3', background: 'rgba(54,197,211,0.08)' },
            }}
          >
            Tüm Modeller
          </Button>

          <Box
            key={motor.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.15fr) minmax(320px, .85fr)' },
              gap: { xs: 3, md: 3.5 },
              alignItems: 'start',
              // Giriş animasyonları: görsel soldan, bilgiler sağdan süzülerek gelir
              '@keyframes heroLeft': {
                from: { opacity: 0, transform: 'translateX(-48px)' },
                to: { opacity: 1, transform: 'translateX(0)' },
              },
              '@keyframes heroRight': {
                from: { opacity: 0, transform: 'translateX(48px)' },
                to: { opacity: 1, transform: 'translateX(0)' },
              },
              '@keyframes driveIn': {
                '0%': { opacity: 0, transform: 'translateX(80px) scale(0.92)' },
                '60%': { opacity: 1 },
                '100%': { opacity: 1, transform: 'translateX(0) scale(1)' },
              },
              '& .hero-left': {
                animation: 'heroLeft 0.55s cubic-bezier(.22,.9,.35,1) both',
              },
              '& .hero-right': {
                animation: 'heroRight 0.55s cubic-bezier(.22,.9,.35,1) 0.12s both',
              },
              '& .hero-vehicle': {
                animation: 'driveIn 0.75s cubic-bezier(.22,.9,.35,1) 0.15s both',
              },
            }}
          >
            {/* Sol: görsel + galeri */}
            <Box className="hero-left" sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 4,
                  background: `radial-gradient(circle at center, ${colors.from}20, transparent 58%), linear-gradient(145deg, #d9e0e3 0%, #f0f2f3 100%)`,
                  border: '1px solid rgba(54,197,211,0.25)',
                  overflow: 'hidden',
                  height: { xs: 330, sm: 410, md: 500 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: { xs: 2, md: 4 },
                }}
              >
                <Chip
                  label={motor.brand}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    zIndex: 3,
                    background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
                    color: '#fff',
                    fontWeight: 900,
                    letterSpacing: 0.5,
                  }}
                />
                <Box
                  className="hero-vehicle"
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    key={shownImage}
                    component="img"
                    src={shownImage}
                    alt={motor.name}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      display: 'block',
                      filter: 'drop-shadow(0 22px 28px rgba(0,0,0,0.22))',
                      animation: 'fadeIn 0.35s ease',
                      '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'scale(0.98)' },
                        to: { opacity: 1, transform: 'scale(1)' },
                      },
                    }}
                  />
                </Box>
              </Box>

              {images.length > 1 && (
                <Stack
                  direction="row"
                  spacing={1.2}
                  sx={{ mt: 2, overflowX: 'auto', pb: 1 }}
                >
                  {images.map((img) => {
                    const selected = !activeColor && (activeImage || images[0]) === img;
                    return (
                      <Box
                        key={img}
                        onClick={() => {
                          setActiveColor(null);
                          setActiveImage(img);
                        }}
                        sx={{
                          width: 78,
                          height: 58,
                          flexShrink: 0,
                          borderRadius: 2.5,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          background: '#fff',
                          border: selected
                            ? `2px solid ${colors.from}`
                            : '2px solid rgba(255,255,255,0.15)',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 0.6,
                          '&:hover': { borderColor: colors.from },
                        }}
                      >
                        <Box
                          component="img"
                          src={img}
                          alt=""
                          loading="lazy"
                          sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>

            {/* Sağ: bilgiler */}
            <Box className="hero-right" sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: { xs: '2rem', md: 'clamp(2.15rem, 3vw, 3rem)' },
                  fontWeight: 900,
                  lineHeight: 1.05,
                  mb: 1,
                  background: 'linear-gradient(90deg, #fff 0%, #36C5D3 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  overflowWrap: 'anywhere',
                }}
              >
                {motor.name}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                {[motor.category, motor.cc, motor.hp].filter(Boolean).map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      background: 'rgba(54,197,211,0.12)',
                      border: '1px solid rgba(54,197,211,0.35)',
                      color: '#36C5D3',
                      fontWeight: 800,
                    }}
                  />
                ))}
              </Stack>

              <Typography
                sx={{
                  fontSize: '1rem',
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.7,
                  mb: 3,
                }}
              >
                {motor.description}
              </Typography>

              {/* Fiyat */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.045)',
                  border: '1px solid rgba(54,197,211,0.25)',
                  mb: 3,
                }}
              >
                {motor.price ? (
                  <>
                    <Typography
                      sx={{
                        fontSize: '0.72rem',
                        color: 'rgba(255,255,255,0.55)',
                        fontWeight: 800,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        mb: 0.4,
                      }}
                    >
                      Tavsiye Edilen Satış Fiyatı
                    </Typography>
                    <Typography sx={{ fontSize: { xs: '1.65rem', md: '1.85rem' }, fontWeight: 900, color: '#fff' }}>
                      {motor.price.replace('TL', '₺')}
                    </Typography>
                  </>
                ) : (
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Chip
                      label="Çok Yakında"
                      sx={{
                        background: 'rgba(255,193,7,0.15)',
                        color: '#ffc107',
                        fontWeight: 900,
                        border: '1px solid rgba(255,193,7,0.4)',
                      }}
                    />
                    <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>
                      Fiyat bilgisi için bizi arayın.
                    </Typography>
                  </Stack>
                )}
              </Box>

              {/* Renk seçenekleri */}
              {motor.colors && motor.colors.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.2 }}>
                    <PaletteIcon sx={{ color: colors.from, fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 900, fontSize: '1rem' }}>
                      Renk Seçenekleri
                      {activeColor?.name ? ` — ${activeColor.name}` : ''}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.2} flexWrap="wrap" useFlexGap>
                    {motor.colors.map((color) => (
                      <Box
                        key={color.image}
                        onClick={() =>
                          setActiveColor(activeColor?.image === color.image ? null : color)
                        }
                        title={color.name}
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          background: '#fff',
                          p: 0.5,
                          border:
                            activeColor?.image === color.image
                              ? `2px solid ${colors.from}`
                              : '2px solid rgba(255,255,255,0.2)',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&:hover': { borderColor: colors.from, transform: 'scale(1.08)' },
                        }}
                      >
                        <Box
                          component="img"
                          src={color.swatch || color.image}
                          alt={color.name}
                          loading="lazy"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: color.swatch ? 'cover' : 'contain',
                            borderRadius: '50%',
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<WhatsAppIcon />}
                  href={`https://wa.me/905465668792?text=${encodeURIComponent(
                    `Merhaba, ${motor.name} modeli hakkında bilgi ve fiyat teklifi almak istiyorum.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
                    color: '#fff',
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: 2.5,
                    py: 1.4,
                    fontSize: '1rem',
                    boxShadow: `0 10px 30px ${colors.glow}`,
                    '&:hover': { opacity: 0.92 },
                  }}
                >
                  Bilgi Al & Teklif İste
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate(motor.brand === 'Falcon' ? '/fiyat-listesi/falcon' : '/fiyat-listesi/musatti')}
                  sx={{
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.3)',
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: 2.5,
                    py: 1.4,
                    '&:hover': {
                      borderColor: '#36C5D3',
                      background: 'rgba(54,197,211,0.1)',
                    },
                  }}
                >
                  Fiyat Listesi
                </Button>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Teknik özellikler */}
      {specEntries.length > 0 && (
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 3 }}>
            <SpeedIcon sx={{ color: colors.from, fontSize: 26 }} />
            <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 900 }}>
              Teknik Özellikler
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 1.5,
            }}
          >
            {specEntries.map(([key, value]) => (
              <Box
                key={key}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.045)',
                  border: '1px solid rgba(54,197,211,0.16)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    background: 'rgba(54,197,211,0.08)',
                    borderColor: colors.from,
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.55)',
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    mb: 0.4,
                  }}
                >
                  {key}
                </Typography>
                <Typography sx={{ fontSize: '0.98rem', fontWeight: 900, color: '#fff' }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      )}

      {/* Hakkında */}
      {motor.about && (
        <Container maxWidth="lg" sx={{ pb: { xs: 4, md: 6 } }}>
          <Divider sx={{ borderColor: 'rgba(54,197,211,0.15)', mb: 4 }} />
          <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 2 }}>
            <InfoIcon sx={{ color: colors.from, fontSize: 26 }} />
            <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 900 }}>
              {motor.name} Hakkında
            </Typography>
          </Stack>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.78)',
              lineHeight: 1.85,
              fontSize: '1rem',
              maxWidth: 980,
            }}
          >
            {motor.about}
          </Typography>
        </Container>
      )}

      {/* Galeri */}
      {motor.gallery && motor.gallery.length > 0 && (
        <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 10 } }}>
          <Divider sx={{ borderColor: 'rgba(54,197,211,0.15)', mb: 4 }} />
          <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 3 }}>
            <CollectionsIcon sx={{ color: colors.from, fontSize: 26 }} />
            <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 900 }}>
              Galeri
            </Typography>
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            {motor.gallery.map((img) => (
              <Box
                key={img}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid rgba(54,197,211,0.18)',
                  background: 'linear-gradient(145deg, #d9e0e3, #f0f2f3)',
                  aspectRatio: '16 / 10',
                  '&:hover img': { transform: 'scale(1.04)' },
                }}
              >
                <Box
                  component="img"
                  src={img}
                  alt={motor.name}
                  loading="lazy"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    mixBlendMode: motor.brand === 'Falcon' ? 'multiply' : 'normal',
                    display: 'block',
                    transition: 'transform 0.45s ease',
                  }}
                />
              </Box>
            ))}
          </Box>
        </Container>
      )}

      {/* Diğer modeller */}
      <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
        <Divider sx={{ borderColor: 'rgba(54,197,211,0.15)', mb: 4 }} />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 900 }}>
            Benzer Modeller
          </Typography>
          <Button
            endIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
            onClick={() => navigate('/motorlar')}
            sx={{ color: '#36C5D3', fontWeight: 800, textTransform: 'none' }}
          >
            Tümünü Gör
          </Button>
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          {motors
            .filter((m) => m.id !== motor.id && m.type === motor.type)
            .slice(0, 4)
            .map((m) => (
              <Box
                key={m.id}
                onClick={() => navigate(`/motorlar/${m.id}`)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid rgba(54,197,211,0.18)',
                  background: '#0d1f2d',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: colors.from,
                  },
                }}
              >
                <Box
                  sx={{
                    background: 'linear-gradient(145deg, #d9e0e3 0%, #eef1f2 100%)',
                    aspectRatio: '16 / 11',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1.5,
                  }}
                >
                  <Box
                    component="img"
                    src={m.coverImage || FALLBACK_IMAGE}
                    alt={m.name}
                    loading="lazy"
                    sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', mixBlendMode: m.brand === 'Falcon' ? 'multiply' : 'normal' }}
                  />
                </Box>
                <Box sx={{ p: 1.8 }}>
                  <Typography sx={{ fontWeight: 900, color: '#fff', fontSize: '1rem' }}>
                    {m.name}
                  </Typography>
                  <Typography
                    sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', fontWeight: 700 }}
                  >
                    {[m.cc, m.category].filter(Boolean).join(' • ')}
                  </Typography>
                </Box>
              </Box>
            ))}
        </Box>
      </Container>

      <SiteFooter />
    </Box>
  );
}

export default MotorDetayPage;
