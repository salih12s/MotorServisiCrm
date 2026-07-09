import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

const FILTERS = [
  { key: 'hepsi', label: 'Hepsi' },
  { key: 'motosiklet', label: 'Motosiklet' },
  { key: 'scooter', label: 'Scooter' },
  { key: 'atv', label: 'ATV / UTV' },
  { key: 'elektrikli', label: 'Elektrikli' },
  { key: 'fiyat-listesi', label: 'Fiyat Listesi' },
];

function MotorlarPage() {
  const navigate = useNavigate();
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
              Musatti & Smarda motor modellerini keşfedin, güncel fiyat listesine kolayca ulaşın.
              Ayrıntıları görmek için kartlara tıklayın.
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
                navigate('/fiyat-listesi');
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
                  background: 'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
                  color: '#fff',
                  borderColor: 'transparent',
                },
                '&:hover': { background: 'rgba(54,197,211,0.1)' },
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
