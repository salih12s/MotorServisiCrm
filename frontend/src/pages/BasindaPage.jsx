import React from 'react';
import { Box, Container, Typography, Stack } from '@mui/material';
import PublicNav from '../components/PublicNav';
import SiteFooter from '../components/SiteFooter';

function BasindaPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a1929', color: '#fff', overflowX: 'hidden' }}>
      <PublicNav />

      {/* Header */}
      <Box
        sx={{
          position: 'relative',
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
                fontWeight: 700,
                color: '#36C5D3',
                textTransform: 'uppercase',
              }}
            >
              — Medyada —
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
              Basında Biz
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.7)',
                textAlign: 'center',
                maxWidth: 760,
                mt: 1,
                fontSize: { xs: '0.95rem', md: '1.05rem' },
              }}
            >
              Türkiye'nin önde gelen yayın kuruluşları ve uluslararası fuarlarda Musatti Motor.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Full width press image */}
      <Box
        sx={{
          width: '100%',
          background: '#050d18',
          py: { xs: 4, md: 6 },
        }}
      >
        <Box
          component="img"
          src={`/${encodeURIComponent('Ekran görüntüsü 2026-04-29 030919.png')}`}
          alt="Basında Biz - İtalya EICMA 2024"
          sx={{
            width: '100%',
            height: 'auto',
            display: 'block',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </Box>

      <SiteFooter />
    </Box>
  );
}

export default BasindaPage;
