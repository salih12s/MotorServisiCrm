import React from 'react';
import { Box, Container, Typography, Stack, Grid, Card, Chip } from '@mui/material';

function HakkimizdaPreviewSection() {
  return (
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
  );
}

export default HakkimizdaPreviewSection;
