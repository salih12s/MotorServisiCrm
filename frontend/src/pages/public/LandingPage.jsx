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
  EmojiEvents as TrophyIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
  GpsFixed as TargetIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  VerifiedUser as VerifiedIcon,
  CheckCircle as CheckCircleIcon,
  Workspaces as WorkspacesIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import PublicNav from '../../components/PublicNav';
import SiteFooter from '../../components/SiteFooter';
import motors from '../../data/motors';
import HeroSection from './landing/HeroSection';

const FEATURED = [
  { id: 'glamaro-max-125', badge: 'Çok Satan', tagline: 'Kuryelerin En Çok Tercih Ettiği' },
  { id: 'rajon-50x', badge: 'MTV Muaf', tagline: 'B Ehliyet ile Kullanım' },
  { id: 'doch-pro-66000', badge: 'Yeni', tagline: 'Profesyonel Model' },
];

const STATS = [
  { value: '997+', label: 'Mutlu Müşteri', Icon: GroupIcon },
  { value: '16+', label: 'Motor Modeli', Icon: TrophyIcon },
  { value: '5+', label: 'Yıllık Deneyim', Icon: ScheduleIcon },
  { value: '1', label: 'Lokasyon', Icon: LocationIcon },
];

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

function LandingPage() {
  const navigate = useNavigate();

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

      {/* ============ HERO ============ */}
      <HeroSection />

      {/* ============ FAVORİ MOTORLARIMIZ ============ */}
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

      {/* ============ RAKAMLARLA DEMİRKAN ============ */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background:
            'linear-gradient(180deg, #02080f 0%, #050d18 50%, #02080f 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Stack alignItems="center" spacing={1.5} sx={{ mb: { xs: 5, md: 7 } }}>
            <Chip
              icon={<TrendingUpIcon sx={{ color: '#36C5D3 !important' }} />}
              label="Başarılarımız"
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
              Rakamlarla{' '}
              <Box
                component="span"
                sx={{
                  background:
                    'linear-gradient(135deg, #04A7B8 0%, #36C5D3 50%, #7be3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Demirkan
              </Box>
            </Typography>
          </Stack>

          <Grid container spacing={{ xs: 2.5, md: 3.5 }} alignItems="stretch">
            {STATS.map(({ value, label, Icon }) => (
              <Grid item xs={6} md={3} key={label} sx={{ display: 'flex' }}>
                <Card
                  sx={{
                    width: '100%',
                    minHeight: { xs: 200, md: 230 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(2,8,15,0.7) 100%)',
                    border: '1px solid rgba(54,197,211,0.18)',
                    borderRadius: 4,
                    p: { xs: 2.5, md: 3.5 },
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      borderColor: 'rgba(54,197,211,0.5)',
                      boxShadow: '0 16px 40px rgba(4,167,184,0.3)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2.5,
                      mx: 'auto',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background:
                        'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
                      color: '#fff',
                      boxShadow: '0 8px 24px rgba(54,197,211,0.45)',
                    }}
                  >
                    <Icon />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: { xs: '2rem', md: '2.6rem' },
                      fontWeight: 900,
                      color: '#fff',
                      lineHeight: 1,
                      mb: 1,
                    }}
                  >
                    {value}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ============ HAKKIMIZDA PREVIEW ============ */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background:
            'radial-gradient(ellipse at bottom right, rgba(4,167,184,0.12) 0%, #02080f 60%)',
        }}
      >
        <Container maxWidth="lg">
          <Card
            sx={{
              background:
                'linear-gradient(160deg, rgba(54,197,211,0.08) 0%, rgba(4,167,184,0.02) 100%)',
              border: '1px solid rgba(54,197,211,0.2)',
              borderRadius: 4,
              backdropFilter: 'blur(10px)',
              p: { xs: 3, md: 5 },
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 2, sm: 3 }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              sx={{ mb: 3 }}
            >
              <Box
                sx={{
                  width: { xs: 64, md: 80 },
                  height: { xs: 64, md: 80 },
                  minWidth: { xs: 64, md: 80 },
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid rgba(54,197,211,0.6)',
                  boxShadow: '0 0 30px rgba(54,197,211,0.45)',
                }}
              >
                <img
                  src="/Demirkan.jpeg"
                  alt="Demirkan"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Chip
                  label="Hakkımızda"
                  size="small"
                  sx={{
                    background: 'rgba(54,197,211,0.12)',
                    border: '1px solid rgba(54,197,211,0.4)',
                    color: '#36C5D3',
                    fontWeight: 700,
                    letterSpacing: 0.6,
                    mb: 1.2,
                  }}
                />
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.5rem', sm: '1.9rem', md: '2.4rem' },
                    color: '#fff',
                    lineHeight: 1.2,
                  }}
                >
                  Mersin'in Güvenilir Musatti{' '}
                  <Box
                    component="span"
                    sx={{
                      background:
                        'linear-gradient(135deg, #04A7B8 0%, #36C5D3 50%, #7be3ee 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Motosiklet Bayisi
                  </Box>
                </Typography>
              </Box>
            </Stack>

            <Typography
              sx={{
                color: 'rgba(255,255,255,0.78)',
                fontSize: { xs: '0.95rem', md: '1rem' },
                lineHeight: 1.85,
                mb: 2,
              }}
            >
              Demirkan Motorlu Araçlar olarak Mersin'de motosiklet tutkunlarına{' '}
              <Box component="strong" sx={{ color: '#fff' }}>
                Musatti yetkili servisi
              </Box>{' '}
              ve ana bayisi olarak hizmet veriyoruz. Orijinal ürünler, garantili
              sıfır ve 2. el satış ile profesyonel servis hizmeti sunuyoruz.
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.78)',
                fontSize: { xs: '0.95rem', md: '1rem' },
                lineHeight: 1.85,
                mb: 3.5,
              }}
            >
              Geniş motor yelpazemizin yanı sıra,{' '}
              <Box component="strong" sx={{ color: '#fff' }}>
                eski motorunuzu değerinde takas alma
              </Box>{' '}
              imkânı da sunuyoruz. Ayrıca yetkili servisimiz sayesinde yedek parça,
              uzman bakım ve onarım desteği ile satış sonrasında da hep yanınızdayız.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Card
                  sx={{
                    background: 'rgba(54,197,211,0.08)',
                    border: '1px solid rgba(54,197,211,0.3)',
                    borderRadius: 3,
                    p: 2,
                    boxShadow: 'none',
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: '1.4rem',
                      background:
                        'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    9-12
                  </Typography>
                  <Typography
                    sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}
                  >
                    Taksit İmkânı
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card
                  sx={{
                    background: 'rgba(54,197,211,0.08)',
                    border: '1px solid rgba(54,197,211,0.3)',
                    borderRadius: 3,
                    p: 2,
                    boxShadow: 'none',
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: '1.4rem',
                      background:
                        'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    100%
                  </Typography>
                  <Typography
                    sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}
                  >
                    Müşteri Memnuniyeti
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Card>
        </Container>
      </Box>

      {/* ============ VİZYON & MİSYON ============ */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
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
            <Grid container spacing={{ xs: 2.5, md: 3 }} alignItems="stretch">
              {PRINCIPLES.map(({ title, text, Icon }) => (
                <Grid item xs={6} md={3} key={title} sx={{ display: 'flex' }}>
                  <Box
                    sx={{
                      width: '100%',
                      minHeight: { xs: 200, md: 240 },
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
                </Grid>
              ))}
            </Grid>
          </Card>
        </Container>
      </Box>

      <SiteFooter />
    </Box>
  );
}

export default LandingPage;
