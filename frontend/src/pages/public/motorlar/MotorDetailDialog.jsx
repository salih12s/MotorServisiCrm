import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Dialog,
  DialogContent,
  IconButton,
  Chip,
  Slide,
  Fade,
} from '@mui/material';
import {
  Close as CloseIcon,
  Speed as SpeedIcon,
  EmojiEvents as TrophyIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { BRAND_COLORS, FALLBACK_IMAGE, getMotorImage } from './motorlarConstants';

const SlideTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} timeout={400} />;
});

function MotorDetailDialog({ motor, open, onClose }) {
  if (!motor) return null;

  const colors = BRAND_COLORS[motor.brand] || BRAND_COLORS.Musatti;
  const imageSrc = getMotorImage(motor);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth={false}
      TransitionComponent={SlideTransition}
      PaperProps={{
        sx: {
          width: 'min(1440px, calc(100vw - 48px))',
          height: 'min(760px, calc(100vh - 56px))',
          background: 'linear-gradient(135deg, #0a1929 0%, #050d18 100%)',
          color: '#fff',
          borderRadius: 4,
          border: '1px solid rgba(54,197,211,0.3)',
          overflow: 'hidden',
          boxShadow: `0 30px 90px ${colors.glow}, 0 0 0 1px rgba(255,255,255,0.05)`,
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          position: 'relative',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 20,
            color: '#fff',
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            '&:hover': { background: 'rgba(0,0,0,0.85)' },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box
          sx={{
            height: '100%',
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '58% 42%',
            },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: { xs: 360, md: '100%' },
              background:
                'radial-gradient(ellipse at center, rgba(16,42,60,0.9) 0%, #071827 70%)',
              overflow: 'hidden',
              borderRight: {
                xs: 'none',
                md: '1px solid rgba(54,197,211,0.18)',
              },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 1.5, md: 2 },
            }}
          >
            <Chip
              label={motor.cc}
              sx={{
                position: 'absolute',
                top: 18,
                right: 18,
                zIndex: 5,
                background: 'rgba(0,0,0,0.72)',
                color: '#fff',
                fontWeight: 900,
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.18)',
              }}
            />

            <Box
              component="img"
              src={imageSrc}
              alt={motor.name}
              onError={(e) => {
                e.currentTarget.src = motor.coverImage || FALLBACK_IMAGE;
              }}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center center',
                display: 'block',
                borderRadius: 2.5,
                animation: 'fadeZoom 0.45s ease forwards',
                '@keyframes fadeZoom': {
                  from: { opacity: 0, transform: 'scale(1.02)' },
                  to: { opacity: 1, transform: 'scale(1)' },
                },
              }}
            />
          </Box>

          <Box
            sx={{
              height: '100%',
              p: { xs: 3, md: 4 },
              overflowY: 'auto',
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(54,197,211,0.4)',
                borderRadius: 3,
              },
            }}
          >
            <Fade in timeout={500}>
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: '2rem', md: '2.6rem' },
                    fontWeight: 900,
                    lineHeight: 1.05,
                    mb: 1,
                    background: 'linear-gradient(90deg, #fff 0%, #36C5D3 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {motor.name}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 900,
                    color: colors.from,
                    mb: 2,
                  }}
                >
                  {motor.cc} • {motor.hp} • {motor.category}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '0.98rem',
                    color: 'rgba(255,255,255,0.78)',
                    mb: 3,
                    lineHeight: 1.65,
                  }}
                >
                  {motor.description}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <SpeedIcon sx={{ color: colors.from }} />
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 900 }}>
                    Teknik Özellikler
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, minmax(0, 1fr))',
                    },
                    gap: 1.2,
                    mb: 3,
                  }}
                >
                  {Object.entries(motor.specs || {}).map(([key, value], idx) => (
                    <Box
                      key={key}
                      sx={{
                        p: 1.5,
                        minHeight: 76,
                        borderRadius: 2.5,
                        background: 'rgba(255,255,255,0.045)',
                        border: '1px solid rgba(54,197,211,0.18)',
                        transition: 'all 0.25s ease',
                        opacity: 0,
                        animation: `slideIn 0.35s ease ${idx * 0.035}s forwards`,
                        '@keyframes slideIn': {
                          from: { opacity: 0, transform: 'translateY(8px)' },
                          to: { opacity: 1, transform: 'translateY(0)' },
                        },
                        '&:hover': {
                          background: 'rgba(54,197,211,0.08)',
                          borderColor: colors.from,
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.7rem',
                          color: 'rgba(255,255,255,0.55)',
                          fontWeight: 800,
                          letterSpacing: 0.4,
                          textTransform: 'uppercase',
                          mb: 0.45,
                        }}
                      >
                        {key}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: '0.95rem',
                          fontWeight: 900,
                          color: '#fff',
                          lineHeight: 1.3,
                        }}
                      >
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {motor.features && motor.features.length > 0 && (
                  <>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                      <TrophyIcon sx={{ color: colors.from }} />
                      <Typography sx={{ fontSize: '1.2rem', fontWeight: 900 }}>
                        Öne Çıkan Özellikler
                      </Typography>
                    </Stack>

                    <Stack spacing={1} sx={{ mb: 2 }}>
                      {motor.features.map((feature) => (
                        <Stack key={feature} direction="row" alignItems="center" spacing={1.2}>
                          <CheckIcon sx={{ color: colors.from, fontSize: 20 }} />
                          <Typography
                            sx={{
                              fontSize: '0.95rem',
                              color: 'rgba(255,255,255,0.86)',
                            }}
                          >
                            {feature}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </>
                )}
              </Box>
            </Fade>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default MotorDetailDialog;
