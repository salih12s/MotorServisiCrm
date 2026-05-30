import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Card,
  CardActionArea,
  Dialog,
  DialogContent,
  IconButton,
  Chip,
  Slide,
  Fade,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  TwoWheeler as TwoWheelerIcon,
  Close as CloseIcon,
  Speed as SpeedIcon,
  Info as InfoIcon,
  EmojiEvents as TrophyIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import PublicNav from '../../components/PublicNav';
import SiteFooter from '../../components/SiteFooter';
import motors from '../../data/motors';

const SlideTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} timeout={400} />;
});

const BRAND_COLORS = {
  Musatti: { from: '#ff8f00', to: '#ff5722', glow: 'rgba(255,143,0,0.5)' },
  Smarda: { from: '#36C5D3', to: '#04A7B8', glow: 'rgba(54,197,211,0.5)' },
};

const FALLBACK_IMAGE = '/Ekran görüntüsü 2026-04-29 030654.png';

function getMotorImage(motor) {
  return motor?.detailImage || motor?.coverImage || FALLBACK_IMAGE;
}

function MotorCard({ motor, onClick }) {
  const colors = BRAND_COLORS[motor.brand] || BRAND_COLORS.Musatti;

  return (
    <Card
      sx={{
        width: '100%',
        height: 520,
        background: '#0d1f2d',
        border: '1px solid rgba(54,197,211,0.22)',
        borderRadius: 4,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 45px rgba(0,0,0,0.25)',
        transition: 'all 0.35s cubic-bezier(.25,.8,.25,1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          borderColor: colors.from,
          boxShadow: `0 24px 65px ${colors.glow}`,
        },
        '&:hover .motor-image': {
          transform: 'scale(1.025)',
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 260,
            background: '#071827',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <Chip
            label={motor.cc}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 3,
              background: 'rgba(0,0,0,0.72)',
              color: '#fff',
              fontWeight: 800,
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          />

          <Box
            className="motor-image"
            component="img"
            src={motor.coverImage || FALLBACK_IMAGE}
            alt={motor.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 42%',
              display: 'block',
              transition: 'transform 0.55s ease',
            }}
          />
        </Box>

        <Box
          sx={{
            p: 2.5,
            width: '100%',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            sx={{
              fontSize: '1.55rem',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.1,
              mb: 0.7,
              height: 34,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {motor.name}
          </Typography>

          <Typography
            sx={{
              fontSize: '0.92rem',
              fontWeight: 900,
              color: colors.from,
              mb: 1.2,
              height: 24,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {motor.cc} • {motor.hp} • {motor.category}
          </Typography>

          <Typography
            sx={{
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.72)',
              lineHeight: 1.55,
              height: 46,
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {motor.description}
          </Typography>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.2 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#4caf50',
                boxShadow: '0 0 8px #4caf50',
              }}
            />
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#4caf50',
                fontWeight: 900,
                letterSpacing: 1,
              }}
            >
              STOKTA
            </Typography>
          </Stack>

          <Box
            sx={{
              height: 44,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
              color: '#fff',
              fontWeight: 900,
              fontSize: '0.95rem',
              boxShadow: `0 8px 24px ${colors.glow}`,
            }}
          >
            <InfoIcon sx={{ fontSize: 18 }} />
            Detaylar
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}

function MotorDetailDialog({ motor, open, onClose }) {
  if (!motor) return null;

  const colors = BRAND_COLORS[motor.brand] || BRAND_COLORS.Musatti;
  const imageSrc = getMotorImage(motor);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth={false}
      TransitionComponent={SlideTransition}
      PaperProps={{
        sx: {
          width: 'min(1440px, calc(100vw - 48px))',
          height: 'min(760px, calc(100vh - 56px))',
          background: 'linear-gradient(135deg, #0a1929 0%, #050d18 100%)',
          color: '#fff',
          borderRadius: 4,
          border: '1px solid rgba(54,197,211,0.3)',
          overflow: 'hidden',
          boxShadow: `0 30px 90px ${colors.glow}, 0 0 0 1px rgba(255,255,255,0.05)`,
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          position: 'relative',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 20,
            color: '#fff',
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            '&:hover': { background: 'rgba(0,0,0,0.85)' },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box
          sx={{
            height: '100%',
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '58% 42%',
            },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: { xs: 360, md: '100%' },
              background:
                'radial-gradient(ellipse at center, rgba(16,42,60,0.9) 0%, #071827 70%)',
              overflow: 'hidden',
              borderRight: {
                xs: 'none',
                md: '1px solid rgba(54,197,211,0.18)',
              },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 1.5, md: 2 },
            }}
          >
            <Chip
              label={motor.cc}
              sx={{
                position: 'absolute',
                top: 18,
                right: 18,
                zIndex: 5,
                background: 'rgba(0,0,0,0.72)',
                color: '#fff',
                fontWeight: 900,
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.18)',
              }}
            />

            <Box
              component="img"
              src={imageSrc}
              alt={motor.name}
              onError={(e) => {
                e.currentTarget.src = motor.coverImage || FALLBACK_IMAGE;
              }}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center center',
                display: 'block',
                borderRadius: 2.5,
                animation: 'fadeZoom 0.45s ease forwards',
                '@keyframes fadeZoom': {
                  from: { opacity: 0, transform: 'scale(1.02)' },
                  to: { opacity: 1, transform: 'scale(1)' },
                },
              }}
            />
          </Box>

          <Box
            sx={{
              height: '100%',
              p: { xs: 3, md: 4 },
              overflowY: 'auto',
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(54,197,211,0.4)',
                borderRadius: 3,
              },
            }}
          >
            <Fade in timeout={500}>
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: '2rem', md: '2.6rem' },
                    fontWeight: 900,
                    lineHeight: 1.05,
                    mb: 1,
                    background: 'linear-gradient(90deg, #fff 0%, #36C5D3 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {motor.name}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 900,
                    color: colors.from,
                    mb: 2,
                  }}
                >
                  {motor.cc} • {motor.hp} • {motor.category}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '0.98rem',
                    color: 'rgba(255,255,255,0.78)',
                    mb: 3,
                    lineHeight: 1.65,
                  }}
                >
                  {motor.description}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <SpeedIcon sx={{ color: colors.from }} />
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 900 }}>
                    Teknik Özellikler
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, minmax(0, 1fr))',
                    },
                    gap: 1.2,
                    mb: 3,
                  }}
                >
                  {Object.entries(motor.specs || {}).map(([key, value], idx) => (
                    <Box
                      key={key}
                      sx={{
                        p: 1.5,
                        minHeight: 76,
                        borderRadius: 2.5,
                        background: 'rgba(255,255,255,0.045)',
                        border: '1px solid rgba(54,197,211,0.18)',
                        transition: 'all 0.25s ease',
                        opacity: 0,
                        animation: `slideIn 0.35s ease ${idx * 0.035}s forwards`,
                        '@keyframes slideIn': {
                          from: { opacity: 0, transform: 'translateY(8px)' },
                          to: { opacity: 1, transform: 'translateY(0)' },
                        },
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
                          letterSpacing: 0.4,
                          textTransform: 'uppercase',
                          mb: 0.45,
                        }}
                      >
                        {key}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: '0.95rem',
                          fontWeight: 900,
                          color: '#fff',
                          lineHeight: 1.3,
                        }}
                      >
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {motor.features && motor.features.length > 0 && (
                  <>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                      <TrophyIcon sx={{ color: colors.from }} />
                      <Typography sx={{ fontSize: '1.2rem', fontWeight: 900 }}>
                        Öne Çıkan Özellikler
                      </Typography>
                    </Stack>

                    <Stack spacing={1} sx={{ mb: 2 }}>
                      {motor.features.map((feature) => (
                        <Stack key={feature} direction="row" alignItems="center" spacing={1.2}>
                          <CheckIcon sx={{ color: colors.from, fontSize: 20 }} />
                          <Typography
                            sx={{
                              fontSize: '0.95rem',
                              color: 'rgba(255,255,255,0.86)',
                            }}
                          >
                            {feature}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </>
                )}
              </Box>
            </Fade>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

const FILTERS = [
  { key: 'hepsi', label: 'Hepsi' },
  { key: 'motosiklet', label: 'Motosiklet' },
  { key: 'scooter', label: 'Scooter' },
  { key: 'atv', label: 'ATV / UTV' },
  { key: 'elektrikli', label: 'Elektrikli' },
];

function MotorlarPage() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('hepsi');
  const [brandFilter, setBrandFilter] = useState('hepsi');

  const filtered = useMemo(() => {
    return motors.filter((motor) => {
      const typeOk =
        filter === 'hepsi' ||
        (filter === 'atv' && (motor.type === 'atv' || motor.type === 'utv')) ||
        motor.type === filter;

      const brandOk = brandFilter === 'hepsi' || motor.brand === brandFilter;

      return typeOk && brandOk;
    });
  }, [filter, brandFilter]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0a1929',
        color: '#fff',
        overflowX: 'hidden',
      }}
    >
      <PublicNav />

      <Box
        sx={{
          pt: { xs: 14, md: 18 },
          pb: { xs: 6, md: 8 },
          background:
            'radial-gradient(ellipse at top, rgba(4,167,184,0.35) 0%, transparent 60%), linear-gradient(180deg, #024E54 0%, #0a1929 100%)',
        }}
      >
        <Container maxWidth="xl">
          <Stack alignItems="center" spacing={1.5}>
            <Typography
              sx={{
                fontSize: '0.85rem',
                letterSpacing: 4,
                fontWeight: 800,
                color: '#36C5D3',
                textTransform: 'uppercase',
              }}
            >
              — Modellerimiz —
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: '2.2rem', md: '3.5rem' },
                fontWeight: 900,
                textAlign: 'center',
                background: 'linear-gradient(90deg, #fff 0%, #36C5D3 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Motorlarımız
            </Typography>

            <Typography
              sx={{
                color: 'rgba(255,255,255,0.75)',
                textAlign: 'center',
                maxWidth: 760,
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                lineHeight: 1.6,
              }}
            >
              Musatti & Smarda 2026 model motosikletleri, scooterları, ATV ve elektrikli araçları.
              Detaylı teknik özellikler için kartlara tıklayın.
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mb: 4 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems="center"
          justifyContent="center"
        >
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(_, value) => value && setFilter(value)}
            sx={{
              flexWrap: 'wrap',
              justifyContent: 'center',
              '& .MuiToggleButton-root': {
                color: 'rgba(255,255,255,0.7)',
                borderColor: 'rgba(54,197,211,0.3)',
                fontWeight: 700,
                px: 2.5,
                py: 0.8,
                textTransform: 'none',
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
                  color: '#fff',
                  borderColor: 'transparent',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #36C5D3 0%, #04A7B8 100%)',
                  },
                },
                '&:hover': { background: 'rgba(54,197,211,0.1)' },
              },
            }}
          >
            {FILTERS.map((item) => (
              <ToggleButton key={item.key} value={item.key}>
                {item.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <ToggleButtonGroup
            value={brandFilter}
            exclusive
            onChange={(_, value) => value && setBrandFilter(value)}
            sx={{
              flexWrap: 'wrap',
              justifyContent: 'center',
              '& .MuiToggleButton-root': {
                color: 'rgba(255,255,255,0.7)',
                borderColor: 'rgba(54,197,211,0.3)',
                fontWeight: 700,
                px: 2.5,
                py: 0.8,
                textTransform: 'none',
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #ff8f00 0%, #ff5722 100%)',
                  color: '#fff',
                  borderColor: 'transparent',
                },
                '&:hover': { background: 'rgba(255,143,0,0.1)' },
              },
            }}
          >
            <ToggleButton value="hepsi">Tüm Markalar</ToggleButton>
            <ToggleButton value="Musatti">Musatti</ToggleButton>
            <ToggleButton value="Smarda">Smarda</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Container>

      <Box sx={{ pb: { xs: 8, md: 12 } }}>
        <Container maxWidth="xl">
          {filtered.length === 0 ? (
            <Stack alignItems="center" sx={{ py: 8 }}>
              <TwoWheelerIcon
                sx={{
                  fontSize: 80,
                  color: 'rgba(54,197,211,0.4)',
                  mb: 2,
                }}
              />
              <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Bu filtreye uygun model bulunamadı.
              </Typography>
            </Stack>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 3,
                alignItems: 'stretch',
              }}
            >
              {filtered.map((motor) => (
                <MotorCard key={motor.id} motor={motor} onClick={() => setSelected(motor)} />
              ))}
            </Box>
          )}
        </Container>
      </Box>

      <MotorDetailDialog
        motor={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
      />

      <SiteFooter />
    </Box>
  );
}

export default MotorlarPage;