import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, Stack } from '@mui/material';
import {
  TwoWheeler as TwoWheelerIcon,
  Build as BuildIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import PublicNav from '../components/PublicNav';

function LandingPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const HEADER_HEIGHT = {
    xs: '72px',
    sm: '80px',
    md: '88px',
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    const playVideo = () => {
      const promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {});
      }
    };

    playVideo();

    video.addEventListener('canplay', playVideo, { once: true });

    return () => {
      video.removeEventListener('canplay', playVideo);
    };
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#02080f',
        color: '#fff',
        overflowX: 'hidden',
      }}
    >
      <PublicNav solid />

      <Box
        id="hero"
        sx={{
          position: 'relative',
          width: '100%',
          height: {
            xs: 'calc(100svh - 72px)',
            sm: 'calc(100svh - 80px)',
            md: 'calc(100svh - 88px)',
          },
          mt: HEADER_HEIGHT,
          overflow: 'hidden',
          backgroundColor: '#02080f',
        }}
      >
        <Box
          ref={videoRef}
          component="video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/Ekran görüntüsü 2026-04-29 030654.png"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 22%',
            transform: {
              xs: 'scale(1.18)',
              sm: 'scale(1.22)',
              md: 'scale(1.24)',
              lg: 'scale(1.26)',
            },
            transformOrigin: 'center 22%',
            display: 'block',
            zIndex: 0,
          }}
        >
          <source src="/hero.mp4" type="video/mp4" />
        </Box>

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(2,8,15,0.18) 0%, rgba(2,8,15,0.08) 30%, rgba(2,8,15,0.25) 65%, rgba(2,8,15,0.85) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        <Container
          maxWidth="xl"
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: { xs: 70, sm: 80, md: 95 },
            transform: 'translateX(-50%)',
            zIndex: 2,
            px: { xs: 2, md: 3 },
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 2 }}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<TwoWheelerIcon />}
              onClick={() => navigate('/motorlar')}
              sx={{
                background: 'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
                color: '#fff',
                fontWeight: 700,
                px: { xs: 3, md: 4 },
                py: { xs: 1.2, md: 1.5 },
                borderRadius: 50,
                textTransform: 'none',
                fontSize: { xs: '0.9rem', md: '1rem' },
                width: { xs: '100%', sm: 'auto' },
                maxWidth: { xs: 320, sm: 'none' },
                boxShadow: '0 8px 30px rgba(54,197,211,0.6)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 40px rgba(54,197,211,0.9)',
                },
              }}
            >
              Modellerimizi Keşfet
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<BuildIcon />}
              onClick={() => navigate('/login')}
              sx={{
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.6)',
                fontWeight: 700,
                px: { xs: 3, md: 4 },
                py: { xs: 1.2, md: 1.5 },
                borderRadius: 50,
                textTransform: 'none',
                fontSize: { xs: '0.9rem', md: '1rem' },
                width: { xs: '100%', sm: 'auto' },
                maxWidth: { xs: 320, sm: 'none' },
                backdropFilter: 'blur(10px)',
                background: 'rgba(0,0,0,0.35)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  borderColor: '#36C5D3',
                  background: 'rgba(54,197,211,0.25)',
                },
              }}
            >
              Servis Sistemine Giriş
            </Button>
          </Stack>
        </Container>

        <Box
          sx={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.7)',
            zIndex: 2,
            display: { xs: 'none', sm: 'block' },
            animation: 'bounce 2s infinite',
            '@keyframes bounce': {
              '0%, 100%': {
                transform: 'translateX(-50%) translateY(0)',
              },
              '50%': {
                transform: 'translateX(-50%) translateY(-10px)',
              },
            },
          }}
        >
          <ArrowDownwardIcon />
        </Box>
      </Box>

      <Box
        sx={{
          py: 4,
          background: '#02080f',
          borderTop: '1px solid rgba(54,197,211,0.2)',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.85rem',
            }}
          >
            © {new Date().getFullYear()} Demirkan Motorlu Araçlar — Tüm hakları saklıdır.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;