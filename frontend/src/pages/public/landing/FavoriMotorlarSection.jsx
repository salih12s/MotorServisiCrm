import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  PhoneInTalk as PhoneIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import motors from '../../../data/motors';

const FEATURED = [
  { id: 'glamaro-max-125', badge: 'Çok Satan', tagline: 'Kuryelerin En Çok Tercih Ettiği' },
  { id: 'rajon-50x', badge: 'MTV Muaf', tagline: 'B Ehliyet ile Kullanım' },
  { id: 'doch-pro-66000', badge: 'Yeni', tagline: 'Profesyonel Model' },
];

function FavoriMotorlarSection() {
  const navigate = useNavigate();

  return (
    <Box
      id="favoriler"
      sx={{
        py: { xs: 8, md: 12 },
        background:
          'radial-gradient(ellipse at top, rgba(4,167,184,0.10) 0%, #02080f 60%)',
      }}
    >
      <Container maxWidth="lg">
        <Stack alignItems="center" spacing={1.5} sx={{ mb: { xs: 5, md: 7 } }}>
          <Chip
            icon={<AutoAwesomeIcon sx={{ color: '#36C5D3 !important' }} />}
            label="Öne Çıkanlar"
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
              letterSpacing: 0.5,
            }}
          >
            Favori{' '}
            <Box
              component="span"
              sx={{
                background:
                  'linear-gradient(135deg, #04A7B8 0%, #36C5D3 50%, #7be3ee 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Motorlarımız
            </Box>
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.65)',
              textAlign: 'center',
              maxWidth: 640,
              fontSize: { xs: '0.9rem', md: '1rem' },
            }}
          >
            En çok tercih edilen ve önerilen motor modellerimizi keşfedin
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center">
          {FEATURED.map((item) => {
            const motor = motors.find((m) => m.id === item.id);
            if (!motor) return null;
            return (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card
                  sx={{
                    position: 'relative',
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(2,8,15,0.6) 100%)',
                    border: '1px solid rgba(54,197,211,0.18)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.35s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      borderColor: 'rgba(54,197,211,0.55)',
                      boxShadow: '0 20px 50px rgba(4,167,184,0.35)',
                    },
                  }}
                >
                  <Chip
                    label={item.badge}
                    sx={{
                      position: 'absolute',
                      top: 14,
                      left: 14,
                      zIndex: 2,
                      background:
                        'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
                      color: '#fff',
                      fontWeight: 800,
                      letterSpacing: 0.5,
                      boxShadow: '0 6px 20px rgba(54,197,211,0.5)',
                    }}
                    size="small"
                  />
                  <Box sx={{ position: 'relative', pt: 2, px: 2 }}>
                    <CardMedia
                      component="img"
                      image={motor.coverImage}
                      alt={motor.name}
                      sx={{
                        height: { xs: 200, md: 230 },
                        objectFit: 'contain',
                        background:
                          'radial-gradient(ellipse at center, rgba(54,197,211,0.18) 0%, transparent 70%)',
                        borderRadius: 3,
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: '1.4rem',
                        color: '#fff',
                        mb: 0.5,
                      }}
                    >
                      {motor.name}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#36C5D3',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        mb: 1.5,
                        letterSpacing: 0.3,
                      }}
                    >
                      {motor.cc} • {motor.hp} • {motor.category}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.9rem',
                        mb: 2.5,
                        flex: 1,
                      }}
                    >
                      {item.tagline}
                    </Typography>
                    <Stack direction="row" spacing={1.2}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<PhoneIcon fontSize="small" />}
                        href="tel:+905465668792"
                        sx={{
                          background:
                            'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
                          color: '#fff',
                          fontWeight: 700,
                          textTransform: 'none',
                          borderRadius: 2.5,
                          py: 1,
                          boxShadow: '0 6px 20px rgba(54,197,211,0.4)',
                          '&:hover': {
                            background:
                              'linear-gradient(135deg, #36C5D3 0%, #04A7B8 100%)',
                          },
                        }}
                      >
                        Bilgi Al
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        endIcon={<ArrowForwardIcon fontSize="small" />}
                        onClick={() => navigate(`/motorlar?id=${motor.id}`)}
                        sx={{
                          color: '#fff',
                          borderColor: 'rgba(255,255,255,0.3)',
                          fontWeight: 700,
                          textTransform: 'none',
                          borderRadius: 2.5,
                          py: 1,
                          '&:hover': {
                            borderColor: '#36C5D3',
                            background: 'rgba(54,197,211,0.1)',
                          },
                        }}
                      >
                        Tümü
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Stack alignItems="center" sx={{ mt: { xs: 5, md: 7 } }}>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/motorlar')}
            sx={{
              background: 'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
              color: '#fff',
              fontWeight: 700,
              px: 5,
              py: 1.6,
              borderRadius: 50,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 10px 35px rgba(54,197,211,0.5)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 14px 45px rgba(54,197,211,0.8)',
              },
            }}
          >
            Tüm Modelleri Gör
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

export default FavoriMotorlarSection;
