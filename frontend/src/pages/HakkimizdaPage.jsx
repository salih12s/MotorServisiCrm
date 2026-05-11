import React from 'react';
import { Box, Container, Typography, Stack, Card, CardContent, Grid } from '@mui/material';
import { Star as StarIcon, Build as BuildIcon, TwoWheeler as TwoWheelerIcon } from '@mui/icons-material';
import PublicNav from '../components/PublicNav';
import SiteFooter from '../components/SiteFooter';

const SECTIONS = [
  {
    title: 'Biz Kimiz?',
    icon: <StarIcon sx={{ fontSize: 36 }} />,
    text: `Musatti Motor, Türkiye'de motosiklet tutkunlarının ihtiyaçlarına yönelik yenilikçi, kaliteli ve güvenilir çözümler sunan öncü bir markadır. 2011 yılında Altıngrup bünyesinde farklı sektörlerde hizmet vermeye başlayan şirketimiz, 2020 yılında motosiklet sektörüne adım atarak kısa sürede güçlü bir konuma ulaşmıştır.

Bugün, Afyon'da 45.000 m²'lik modern üretim tesisimizde tüm modellerimizin üretimini gerçekleştiriyoruz. Doğru stratejiler ve emin adımlarla kontrollü bir büyüme sağlayarak, 2024 yılı itibarıyla Türkiye genelinde 55 ilde 150 bayi ve servise ulaştık.

Müşteri odaklı yaklaşımımız, kalite anlayışımız ve yenilikçi ruhumuzla yalnızca Türkiye'de değil, uluslararası arenada da güçlü bir marka olma hedefiyle ilerliyoruz.`,
  },
  {
    title: 'Misyonumuz',
    icon: <BuildIcon sx={{ fontSize: 36 }} />,
    text: `Musatti Motor olarak misyonumuz, yüksek kaliteli ve yenilikçi motosikletler üretmek, kullanıcılarımıza güvenli ve keyifli bir sürüş deneyimi sunmak, müşteri memnuniyetini en üst seviyede tutarak sürdürülebilir başarı sağlamaktır. Geniş bayi ve servis ağımız ile kullanıcılarımıza erişilebilir, güvenilir ve uzun ömürlü ürünler sunarken, sektörde kalite standartlarını belirleyen bir marka olmayı sürdürüyoruz.`,
  },
  {
    title: 'Vizyonumuz',
    icon: <TwoWheelerIcon sx={{ fontSize: 36 }} />,
    text: `Musatti Motor'un temel vizyonu, teknolojiyi ve yenilikleri motosiklet sektörüne entegre ederek küresel ölçekte rekabet edebilir bir marka haline gelmek ve Türkiye'nin motosiklet sektöründeki lider konumunu güçlendirmektir.

Sektördeki gelişmeleri yakından takip ederek, modern üretim tesisimizde dünya standartlarında motosikletler üretiyor ve Türkiye'den dünyaya güçlü bir marka inşa etmeyi hedefliyoruz.`,
  },
];

function HakkimizdaPage() {
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
              — Hakkımızda —
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
              Biz Kimiz?
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
              Musatti Motor — Misyon, vizyon ve değerlerimiz.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Cards - Full width stacked */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          background:
            'linear-gradient(180deg, #050d18 0%, #0a1929 50%, #050d18 100%)',
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            {SECTIONS.map((item) => (
              <Grid item xs={12} key={item.title}>
                <Card
                  sx={{
                    background:
                      'linear-gradient(160deg, rgba(54,197,211,0.10) 0%, rgba(4,167,184,0.04) 100%)',
                    border: '1px solid rgba(54,197,211,0.3)',
                    borderRadius: 4,
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.4s ease',
                    '&:hover': {
                      borderColor: '#36C5D3',
                      boxShadow: '0 20px 60px rgba(54,197,211,0.25)',
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 6 } }}>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={4}
                      alignItems={{ xs: 'flex-start', md: 'flex-start' }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          minWidth: 80,
                          borderRadius: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background:
                            'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
                          color: '#fff',
                          boxShadow: '0 10px 30px rgba(54,197,211,0.5)',
                        }}
                      >
                        {item.icon}
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            fontSize: { xs: '1.6rem', md: '2rem' },
                            fontWeight: 900,
                            color: '#fff',
                            mb: 2,
                            background:
                              'linear-gradient(90deg, #fff 0%, #36C5D3 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          component="div"
                          sx={{
                            color: 'rgba(255,255,255,0.78)',
                            lineHeight: 1.85,
                            fontSize: { xs: '1rem', md: '1.05rem' },
                            whiteSpace: 'pre-line',
                          }}
                        >
                          {item.text}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <SiteFooter />
    </Box>
  );
}

export default HakkimizdaPage;
