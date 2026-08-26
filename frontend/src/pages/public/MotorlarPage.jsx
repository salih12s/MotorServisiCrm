import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { TwoWheeler as TwoWheelerIcon } from '@mui/icons-material';
import PublicNav from '../../components/PublicNav';
import SiteFooter from '../../components/SiteFooter';
import motors from '../../data/motors';
import MotorCard from './motorlar/MotorCard';
import { getBrandBySlug } from '../../data/brands';

const FILTERS = [
  { key: 'hepsi', label: 'Hepsi' },
  { key: 'motosiklet', label: 'Motosiklet' },
  { key: 'scooter', label: 'Scooter' },
  { key: 'atv', label: 'ATV / UTV' },
  { key: 'elektrikli', label: 'Elektrikli' },
  { key: 'fiyat-listesi', label: 'Fiyat Listesi' },
];

const FALCON_CATEGORY_ORDER = [
  'Cub', 'Classic', 'Scooter', 'Sport', 'Naked', 'Cruiser', 'Cross', 'Off-Road',
  'Elektrikli Bisiklet', 'Elektrikli Scooter', 'Üç Tekerli', 'Dört Tekerli',
];

function MotorlarPage() {
  const navigate = useNavigate();
  const { brandSlug } = useParams();
  const routeBrand = getBrandBySlug(brandSlug);
  const [filter, setFilter] = useState('hepsi');
  const brandFilter = routeBrand?.name || (brandSlug ? '__invalid__' : 'Musatti');
  useEffect(() => setFilter('hepsi'), [brandSlug]);
  const filters = useMemo(() => {
    if (routeBrand?.slug !== 'falcon') return FILTERS;
    const available = new Set(motors.filter((motor) => motor.brand === 'Falcon').map((motor) => motor.category));
    return [
      { key: 'hepsi', label: 'Tümü' },
      ...FALCON_CATEGORY_ORDER.filter((category) => available.has(category)).map((category) => ({ key: category, label: category })),
      { key: 'fiyat-listesi', label: 'Fiyat Listesi' },
    ];
  }, [routeBrand?.slug]);

  const filtered = useMemo(() => {
    return motors.filter((motor) => {
      const typeOk = routeBrand?.slug === 'falcon'
        ? filter === 'hepsi' || motor.category === filter
        : filter === 'hepsi' ||
          (filter === 'atv' && (motor.type === 'atv' || motor.type === 'utv')) ||
          motor.type === filter;

      const brandOk = brandFilter === 'hepsi' || motor.brand === brandFilter;

      return typeOk && brandOk;
    });
  }, [filter, brandFilter, routeBrand?.slug]);

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
              Koleksiyonu Keşfet
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
              {routeBrand
                ? `${routeBrand.name} koleksiyonundaki mevcut modelleri inceleyin ve ayrıntılar için kartlara tıklayın.`
                : 'Marka ve kategori filtreleriyle mevcut motor koleksiyonunu keşfedin.'}
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
            onChange={(_, value) => {
              if (value === 'fiyat-listesi') {
                navigate(routeBrand?.slug === 'falcon' ? '/fiyat-listesi/falcon' : '/fiyat-listesi/musatti');
              } else if (value) {
                setFilter(value);
              }
            }}
            sx={{
              flexWrap: 'wrap',
              justifyContent: 'center',
              '& .MuiToggleButton-root': {
                color: 'rgba(255,255,255,0.7)',
                borderColor: 'rgba(54,197,211,0.3)',
                fontWeight: 700,
                px: { xs: 1.4, sm: 2.5 },
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
            {filters.map((item) => (
              <ToggleButton key={item.key} value={item.key}>
                {item.label}
              </ToggleButton>
            ))}
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
                {routeBrand?.slug === 'falcon'
                  ? 'Falcon ürün görselleri, modelleri, fiyatları ve teknik özellikleri henüz sağlanmadı.'
                  : 'Bu filtreye uygun model bulunamadı.'}
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
                <MotorCard
                  key={motor.id}
                  motor={motor}
                  onClick={() => navigate(`/motorlar/${motor.id}`)}
                />
              ))}
            </Box>
          )}
        </Container>
      </Box>

      <SiteFooter />
    </Box>
  );
}

export default MotorlarPage;
