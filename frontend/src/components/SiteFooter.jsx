import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Grid, Stack, Typography, Divider, Chip, Link } from '@mui/material';
import {
  CallMade as CallMadeIcon,
  PhoneInTalk as PhoneIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Instagram as InstagramIcon,
} from '@mui/icons-material';

const QUICK_LINKS = [
  { label: 'Motorlarımız', path: '/koleksiyon' },
  { label: 'Hakkımızda', path: '/hakkimizda' },
  { label: 'Basında Biz', path: '/basinda' },
  { label: 'Giriş', path: '/login' },
];

function SiteFooter() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const goTo = (e, path) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        background:
          'linear-gradient(180deg, #02080f 0%, #050d18 60%, #02080f 100%)',
        borderTop: '1px solid rgba(54,197,211,0.18)',
        color: '#fff',
        pt: { xs: 6, md: 9 },
        pb: 3,
        mt: 'auto',
      }}
    >
      {/* Top accent line */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background:
            'linear-gradient(90deg, transparent 0%, #36C5D3 50%, transparent 100%)',
          opacity: 0.6,
        }}
      />

      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 6 }}>
          {/* Brand */}
          <Grid item xs={12} md={4}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid #36C5D3',
                  boxShadow: '0 0 20px rgba(54,197,211,0.5)',
                }}
              >
                <img
                  src="/Demirkan.jpeg"
                  alt="Demirkan"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: '1.15rem',
                    letterSpacing: 1.5,
                    lineHeight: 1,
                    background: 'linear-gradient(90deg,#36C5D3,#fff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  DEMİRKAN
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    color: '#9fd9e1',
                    letterSpacing: 1.2,
                    mt: 0.3,
                  }}
                >
                  MERSİN
                </Typography>
              </Box>
            </Stack>

            <Typography
              sx={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.9rem',
                lineHeight: 1.7,
                mb: 2.5,
                maxWidth: 320,
              }}
            >
              Mersin'de motosiklet tutkunlarına Musatti yetkili servisi ve satış bayisi
              olarak güvenilir hizmet sunuyoruz.
            </Typography>

            <Chip
              icon={<InstagramIcon sx={{ color: '#fff !important' }} />}
              label="@demirkanmotor"
              component="a"
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              clickable
              sx={{
                background: 'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
                color: '#fff',
                fontWeight: 700,
                letterSpacing: 0.5,
                px: 1,
                boxShadow: '0 6px 20px rgba(54,197,211,0.45)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #36C5D3 0%, #04A7B8 100%)',
                },
              }}
            />
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={4}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
              <CallMadeIcon sx={{ color: '#36C5D3', fontSize: 18 }} />
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '1rem',
                  letterSpacing: 0.5,
                  color: '#fff',
                }}
              >
                Hızlı Linkler
              </Typography>
            </Stack>
            <Stack spacing={1.4}>
              {QUICK_LINKS.map((item) => (
                <Stack
                  key={item.path}
                  direction="row"
                  alignItems="center"
                  spacing={1.2}
                  sx={{
                    cursor: 'pointer',
                    '&:hover .footer-link': { color: '#36C5D3' },
                    '&:hover .footer-dot': {
                      background: '#36C5D3',
                      boxShadow: '0 0 10px #36C5D3',
                    },
                  }}
                  onClick={(e) => goTo(e, item.path)}
                >
                  <Box
                    className="footer-dot"
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#04A7B8',
                      transition: 'all 0.25s ease',
                    }}
                  />
                  <Link
                    href={item.path}
                    onClick={(e) => goTo(e, item.path)}
                    underline="none"
                    className="footer-link"
                    sx={{
                      color: 'rgba(255,255,255,0.75)',
                      fontSize: '0.92rem',
                      transition: 'color 0.25s ease',
                    }}
                  >
                    {item.label}
                  </Link>
                </Stack>
              ))}
            </Stack>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} sm={6} md={4}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
              <PhoneIcon sx={{ color: '#36C5D3', fontSize: 18 }} />
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '1rem',
                  letterSpacing: 0.5,
                  color: '#fff',
                }}
              >
                İletişim
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    minWidth: 32,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(54,197,211,0.15)',
                    border: '1px solid rgba(54,197,211,0.3)',
                    color: '#36C5D3',
                  }}
                >
                  <LocationIcon sx={{ fontSize: 16 }} />
                </Box>
                <Typography
                  component="a"
                  href="https://www.google.com/maps/search/?api=1&query=Cumhuriyet,+Gazi+Mustafa+Kemal+Blv.+narko+sitesi+no+236,+33010+Yenişehir%2FMersin"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    textDecoration: 'none',
                    '&:hover': { color: '#36C5D3' },
                  }}
                >
                  Cumhuriyet, Gazi Mustafa Kemal Blv.
                  <br />
                  narko sitesi No:236, 33010
                  <br />
                  Yenişehir / Mersin
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    minWidth: 32,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(54,197,211,0.15)',
                    border: '1px solid rgba(54,197,211,0.3)',
                    color: '#36C5D3',
                  }}
                >
                  <PhoneIcon sx={{ fontSize: 16 }} />
                </Box>
                <Link
                  href="tel:+905465668792"
                  underline="none"
                  sx={{
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    '&:hover': { color: '#36C5D3' },
                  }}
                >
                  0546 566 87 92
                </Link>
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    minWidth: 32,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(54,197,211,0.15)',
                    border: '1px solid rgba(54,197,211,0.3)',
                    color: '#36C5D3',
                  }}
                >
                  <ScheduleIcon sx={{ fontSize: 16 }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                    }}
                  >
                    Pzt - Cmt: 09:00 - 22:00
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.8rem',
                    }}
                  >
                    Pazar: Kapalı
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        <Divider
          sx={{
            my: { xs: 4, md: 5 },
            borderColor: 'rgba(54,197,211,0.15)',
          }}
        />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: '0.82rem',
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            © {year} Demirkan Motorlu Araçlar — Tüm hakları saklıdır.
          </Typography>

          <Chip
            label="9-12 Ay Taksit İmkânı"
            size="small"
            sx={{
              background: 'transparent',
              border: '1px solid rgba(54,197,211,0.5)',
              color: '#36C5D3',
              fontWeight: 700,
              letterSpacing: 0.4,
              fontSize: '0.78rem',
            }}
          />
        </Stack>
      </Container>
    </Box>
  );
}

export default SiteFooter;
