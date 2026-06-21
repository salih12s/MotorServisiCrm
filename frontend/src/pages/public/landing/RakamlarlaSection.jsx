import React from 'react';
import { Box, Container, Typography, Stack, Card, Chip } from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
} from '@mui/icons-material';

const STATS = [
  { value: '997+', label: 'Mutlu Müşteri', Icon: GroupIcon },
  { value: '16+', label: 'Motor Modeli', Icon: TrophyIcon },
  { value: '5+', label: 'Yıllık Deneyim', Icon: ScheduleIcon },
  { value: '1', label: 'Lokasyon', Icon: LocationIcon },
];

function RakamlarlaSection() {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        contentVisibility: 'auto',
        containIntrinsicSize: '700px',
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

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
            gap: { xs: 2.5, md: 3.5 },
            alignItems: 'stretch',
          }}
        >
          {STATS.map(({ value, label, Icon }) => (
            <Card
              key={label}
                sx={{
                  width: '100%',
                  height: { xs: 230, md: 250 },
                  boxSizing: 'border-box',
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
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default RakamlarlaSection;
