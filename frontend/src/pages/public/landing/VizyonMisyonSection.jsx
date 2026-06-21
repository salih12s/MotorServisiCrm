import React from 'react';
import { Box, Container, Typography, Stack, Grid, Card, Chip } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  GpsFixed as TargetIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  VerifiedUser as VerifiedIcon,
  CheckCircle as CheckCircleIcon,
  Workspaces as WorkspacesIcon,
  Group as GroupIcon,
} from '@mui/icons-material';

const PRINCIPLES = [
  {
    title: 'Müşteri Odaklılık',
    text: 'Her kararımızda müşteri memnuniyetini ön planda tutuyoruz.',
    Icon: FavoriteIcon,
  },
  {
    title: 'Güven ve Şeffaflık',
    text: 'Tüm işlemlerimizde dürüstlük ve açıklık ilkemizdir.',
    Icon: VerifiedIcon,
  },
  {
    title: 'Kalite Standartları',
    text: 'Orijinal ürünler ve profesyonel hizmet anlayışı.',
    Icon: CheckCircleIcon,
  },
  {
    title: 'Uzman Kadro',
    text: 'Deneyimli ekibimizle profesyonel çözümler sunuyoruz.',
    Icon: WorkspacesIcon,
  },
];

function VizyonMisyonSection() {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        contentVisibility: 'auto',
        containIntrinsicSize: '1100px',
        background:
          'linear-gradient(180deg, #02080f 0%, #050d18 50%, #02080f 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Stack alignItems="center" spacing={1.5} sx={{ mb: { xs: 5, md: 7 } }}>
          <Chip
            icon={<TrendingUpIcon sx={{ color: '#36C5D3 !important' }} />}
            label="Vizyon & Misyon"
            sx={{
              background: 'rgba(54,197,211,0.12)',
              border: '1px solid rgba(54,197,211,0.35)',
              color: '#36C5D3',
              fontWeight: 700,
              letterSpacing: 0.6,
              px: 1,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '2.6rem', md: '3.2rem' },
              color: '#fff',
              textAlign: 'center',
            }}
          >
            Geleceğe{' '}
            <Box
              component="span"
              sx={{
                background:
                  'linear-gradient(135deg, #04A7B8 0%, #36C5D3 50%, #7be3ee 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Birlikte
            </Box>{' '}
            Sürüyoruz
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.65)',
              textAlign: 'center',
              maxWidth: 720,
              fontSize: { xs: '0.9rem', md: '1rem' },
            }}
          >
            Değerlerimiz ve ilkelerimizle Mersin'in motosiklet kültürüne öncülük ediyoruz.
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: { xs: 5, md: 7 } }}>
          {[
            {
              title: 'Misyonumuz',
              Icon: TargetIcon,
              text: 'Mersin ve çevresindeki motosiklet tutkunlarına en kaliteli ürünleri ve hizmetleri sunmak. Her müşterimize güvenli, keyifli ve ekonomik bir motosiklet deneyimi yaşatmak.',
            },
            {
              title: 'Vizyonumuz',
              Icon: VisibilityIcon,
              text: "Türkiye'nin en güvenilir ve tercih edilen motosiklet bayilerinden biri olmak. Müşteri memnuniyetinde sektörün öncüsü olarak motosiklet kültürünü yaygınlaştırmak.",
            },
          ].map(({ title, Icon, text }) => (
            <Grid item xs={12} md={6} key={title}>
              <Card
                sx={{
                  height: '100%',
                  background:
                    'linear-gradient(160deg, rgba(54,197,211,0.10) 0%, rgba(4,167,184,0.04) 100%)',
                  border: '1px solid rgba(54,197,211,0.25)',
                  borderRadius: 4,
                  backdropFilter: 'blur(10px)',
                  p: { xs: 3, md: 4 },
                  transition: 'all 0.35s ease',
                  '&:hover': {
                    borderColor: '#36C5D3',
                    transform: 'translateY(-6px)',
                    boxShadow: '0 20px 50px rgba(54,197,211,0.25)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
                    color: '#fff',
                    boxShadow: '0 10px 28px rgba(54,197,211,0.5)',
                    mb: 2.5,
                  }}
                >
                  <Icon sx={{ fontSize: 28 }} />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.4rem', md: '1.6rem' },
                    color: '#36C5D3',
                    mb: 1.5,
                  }}
                >
                  {title}
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.78)',
                    lineHeight: 1.85,
                    fontSize: { xs: '0.95rem', md: '1rem' },
                  }}
                >
                  {text}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Temel İlkelerimiz */}
        <Card
          sx={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(2,8,15,0.6) 100%)',
            border: '1px solid rgba(54,197,211,0.2)',
            borderRadius: 4,
            p: { xs: 3, md: 5 },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{ mb: { xs: 3.5, md: 4.5 } }}
          >
            <GroupIcon sx={{ color: '#36C5D3' }} />
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.2rem', md: '1.4rem' },
                color: '#fff',
                letterSpacing: 0.5,
              }}
            >
              Temel İlkelerimiz
            </Typography>
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: { xs: 2.5, md: 3 },
              alignItems: 'stretch',
            }}
          >
            {PRINCIPLES.map(({ title, text, Icon }) => (
              <Box
                key={title}
                  sx={{
                    width: '100%',
                    height: { xs: 220, md: 240 },
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'rgba(2,8,15,0.6)',
                    border: '1px solid rgba(54,197,211,0.15)',
                    borderRadius: 3,
                    p: { xs: 2, md: 3 },
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'rgba(54,197,211,0.45)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      mx: 'auto',
                      mb: 2,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background:
                        'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
                      color: '#fff',
                      boxShadow: '0 8px 22px rgba(54,197,211,0.45)',
                    }}
                  >
                    <Icon />
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      color: '#fff',
                      mb: 1,
                    }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.82rem',
                      lineHeight: 1.55,
                    }}
                  >
                    {text}
                  </Typography>
              </Box>
            ))}
          </Box>
        </Card>
      </Container>
    </Box>
  );
}

export default VizyonMisyonSection;
