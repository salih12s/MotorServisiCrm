import React from 'react';
import { Box, Typography, Stack, Card, CardActionArea, Chip } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { BRAND_COLORS, FALLBACK_IMAGE } from './motorlarConstants';

function MotorCard({ motor, onClick }) {
  const colors = BRAND_COLORS[motor.brand] || BRAND_COLORS.Musatti;

  return (
    <Card
      sx={{
        width: '100%',
        height: 520,
        background: '#0d1f2d',
        border: '1px solid rgba(54,197,211,0.22)',
        borderRadius: 4,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 45px rgba(0,0,0,0.25)',
        transition: 'all 0.35s cubic-bezier(.25,.8,.25,1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          borderColor: colors.from,
          boxShadow: `0 24px 65px ${colors.glow}`,
        },
        '&:hover .motor-image': {
          transform: 'scale(1.025)',
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 260,
            background: '#071827',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <Chip
            label={motor.cc}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 3,
              background: 'rgba(0,0,0,0.72)',
              color: '#fff',
              fontWeight: 800,
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          />

          <Box
            className="motor-image"
            component="img"
            src={motor.coverImage || FALLBACK_IMAGE}
            alt={motor.name}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 42%',
              display: 'block',
              transition: 'transform 0.55s ease',
            }}
          />
        </Box>

        <Box
          sx={{
            p: 2.5,
            width: '100%',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            sx={{
              fontSize: '1.55rem',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.1,
              mb: 0.7,
              height: 34,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {motor.name}
          </Typography>

          <Typography
            sx={{
              fontSize: '0.92rem',
              fontWeight: 900,
              color: colors.from,
              mb: 1.2,
              height: 24,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {motor.cc} • {motor.hp} • {motor.category}
          </Typography>

          <Typography
            sx={{
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.72)',
              lineHeight: 1.55,
              height: 46,
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {motor.description}
          </Typography>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.2 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#4caf50',
                boxShadow: '0 0 8px #4caf50',
              }}
            />
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#4caf50',
                fontWeight: 900,
                letterSpacing: 1,
              }}
            >
              STOKTA
            </Typography>
          </Stack>

          <Box
            sx={{
              height: 44,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
              color: '#fff',
              fontWeight: 900,
              fontSize: '0.95rem',
              boxShadow: `0 8px 24px ${colors.glow}`,
            }}
          >
            <InfoIcon sx={{ fontSize: 18 }} />
            Detaylar
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}

export default MotorCard;
