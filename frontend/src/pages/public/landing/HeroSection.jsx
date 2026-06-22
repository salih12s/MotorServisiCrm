import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, Stack } from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';

const HEADER_HEIGHT = {
  xs: '72px',
  sm: '80px',
  md: '88px',
};

function HeroSection() {
  const navigate = useNavigate();

  return (
    <Box
      id="hero"
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: {
          xs: 'calc(100svh - 72px)',
          sm: 'calc(100svh - 80px)',
          md: 'calc(100svh - 88px)',
        },
        mt: HEADER_HEIGHT,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#02080f',
      }}
    >
      {/* Arka plan videosu - tüm bölümü kaplar, içerik ortada kalır */}
      <Box
        component="video"
        src="/Demirkan.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/Demirkan.jpeg"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Videonun üzerine metni okunur kılan karartma katmanı */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background:
            'radial-gradient(ellipse at center, rgba(2,8,15,0.45) 0%, rgba(2,8,15,0.7) 100%),' +
            'linear-gradient(180deg, rgba(2,8,15,0.55) 0%, rgba(2,8,15,0.35) 50%, rgba(2,8,15,0.75) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Decorative grid */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(54,197,211,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(54,197,211,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, transparent 75%)',
          pointerEvents: 'none',
        }}
      />

      {/* Glow orbs */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: 280,
          height: 280,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(54,197,211,0.25) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '8%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(4,167,184,0.22) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: { xs: 3, md: 3 },
          px: { xs: 2, md: 3 },
        }}
      >
        <Box
          sx={{
            width: { xs: 110, sm: 140, md: 170 },
            height: { xs: 110, sm: 140, md: 170 },
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid rgba(54,197,211,0.7)',
            boxShadow:
              '0 0 60px rgba(54,197,211,0.5), 0 0 140px rgba(4,167,184,0.35)',
            mb: { xs: 1.5, md: 2 },
            backgroundColor: 'rgba(2,8,15,0.4)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <img
            src="/Demirkan.jpeg"
            decoding="async"
            fetchPriority="high"
            alt="Demirkan Motorlu Araçlar"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>

        <Typography
          component="div"
          sx={{
            fontWeight: 900,
            fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
            lineHeight: 1,
            color: '#fff',
            letterSpacing: { xs: 1, md: 2 },
            textShadow: '0 6px 30px rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 1, md: 1.8 },
            flexWrap: 'wrap',
          }}
        >
          <Box component="span">DEMİR</Box>
          <Box
            component="span"
            sx={{
              color: '#36C5D3',
              fontSize: { xs: '1.6rem', sm: '2.3rem', md: '3rem' },
              textShadow: '0 0 18px rgba(54,197,211,0.85)',
              lineHeight: 1,
              display: 'inline-flex',
            }}
          >
            ★
          </Box>
          <Box component="span">KAN</Box>
        </Typography>

        <Typography
          sx={{
            mt: { xs: 0.5, md: 1 },
            fontWeight: 800,
            fontSize: { xs: '1.5rem', sm: '2.2rem', md: '2.8rem' },
            lineHeight: 1,
            letterSpacing: { xs: 2, md: 4 },
            background:
              'linear-gradient(135deg, #04A7B8 0%, #36C5D3 50%, #7be3ee 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 4px 30px rgba(54,197,211,0.4)',
          }}
        >
          MERSİN
        </Typography>

        <Typography
          sx={{
            mt: { xs: 1.25, md: 1.75 },
            fontSize: { xs: '0.85rem', sm: '1rem', md: '1.15rem' },
            color: 'rgba(255,255,255,0.92)',
            fontWeight: 500,
            letterSpacing: 0.3,
            maxWidth: 720,
          }}
        >
          Musatti Yetkili Servisi ve Satış Bayisi
        </Typography>

        <Typography
          sx={{
            mt: { xs: 1, md: 1.25 },
            fontSize: { xs: '0.8rem', sm: '0.95rem', md: '1rem' },
            fontWeight: 700,
            color: '#36C5D3',
            letterSpacing: 1,
          }}
        >
          Sıfır <Box component="span" sx={{ color: 'rgba(255,255,255,0.55)', mx: 1 }}>•</Box>
          2. El <Box component="span" sx={{ color: 'rgba(255,255,255,0.55)', mx: 1 }}>•</Box>
          Takas <Box component="span" sx={{ color: 'rgba(255,255,255,0.55)', mx: 1 }}>•</Box>
          Taksit Avantajı
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1.25, sm: 2 }}
          justifyContent="center"
          alignItems="center"
          sx={{ mt: { xs: 2, md: 2.5 } }}
        >
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/motorlar')}
            sx={{
              background: 'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
              color: '#fff',
              fontWeight: 700,
              px: { xs: 3.5, md: 4.5 },
              py: { xs: 1.1, md: 1.3 },
              borderRadius: 50,
              textTransform: 'none',
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              width: { xs: '100%', sm: 'auto' },
              maxWidth: { xs: 320, sm: 'none' },
              boxShadow: '0 10px 35px rgba(54,197,211,0.55)',
              transition: 'all 0.25s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 14px 45px rgba(54,197,211,0.85)',
              },
            }}
          >
            Koleksiyonu Keşfet
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={() => navigate('/login')}
            sx={{
              color: '#fff',
              borderColor: 'rgba(255,255,255,0.55)',
              fontWeight: 700,
              px: { xs: 3.5, md: 4.5 },
              py: { xs: 1.1, md: 1.3 },
              borderRadius: 50,
              textTransform: 'none',
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              width: { xs: '100%', sm: 'auto' },
              maxWidth: { xs: 320, sm: 'none' },
              backdropFilter: 'blur(10px)',
              background: 'rgba(0,0,0,0.35)',
              transition: 'all 0.25s ease',
              '&:hover': {
                borderColor: '#36C5D3',
                background: 'rgba(54,197,211,0.2)',
              },
            }}
          >
            Servis Hizmetleri
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/aksesuarlar-satis')}
            sx={{
              color: '#36C5D3',
              borderColor: 'rgba(54,197,211,0.55)',
              fontWeight: 700,
              px: { xs: 3.5, md: 4.5 },
              py: { xs: 1.1, md: 1.3 },
              borderRadius: 50,
              textTransform: 'none',
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              width: { xs: '100%', sm: 'auto' },
              maxWidth: { xs: 320, sm: 'none' },
              backdropFilter: 'blur(10px)',
              background: 'rgba(54,197,211,0.06)',
              transition: 'all 0.25s ease',
              '&:hover': {
                borderColor: '#36C5D3',
                background: 'rgba(54,197,211,0.18)',
              },
            }}
          >
            Aksesuar ve Ekipman
          </Button>
        </Stack>
      </Container>


    </Box>
  );
}

export default HeroSection;
