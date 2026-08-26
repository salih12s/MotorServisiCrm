import React from 'react';
import { Box, Typography, Stack, Card, CardActionArea, Chip } from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { BRAND_COLORS, FALLBACK_IMAGE, getMotorImage } from './motorlarConstants';

function MotorCard({ motor, onClick }) {
  const colors = BRAND_COLORS[motor.brand] || BRAND_COLORS.Musatti;
  const cardImage = getMotorImage(motor);

  return (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        background: '#0d1f2d',
        border: '1px solid rgba(54,197,211,0.18)',
        borderRadius: 4,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 14px 36px rgba(0,0,0,0.28)',
        transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
        '&:hover': {
          transform: 'translateY(-6px)',
          borderColor: colors.from,
          boxShadow: `0 22px 55px ${colors.glow}`,
        },
        '&:hover .motor-image': {
          transform: 'scale(1.05)',
        },
        '&:hover .incele-btn': {
          background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
          color: '#fff',
          borderColor: 'transparent',
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
            aspectRatio: '16 / 11',
            background: `radial-gradient(circle at 50% 45%, ${colors.from}22 0%, transparent 58%), linear-gradient(145deg, #d8dfe3 0%, #eef1f2 100%)`,
            overflow: 'hidden',
            flexShrink: 0,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Chip
            label={motor.brand}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 3,
              background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
              color: '#fff',
              fontWeight: 800,
              letterSpacing: 0.5,
            }}
          />

          {motor.cc && (
            <Chip
              label={motor.cc}
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 3,
                background: 'rgba(10,25,41,0.85)',
                color: '#fff',
                fontWeight: 800,
              }}
            />
          )}

          <Box
            className="motor-image"
            component="img"
            src={cardImage}
            alt={motor.name}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              display: 'block',
              transition: 'transform 0.45s ease',
              filter: 'drop-shadow(0 14px 18px rgba(0,0,0,0.18))',
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
              fontSize: '1.35rem',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.15,
              mb: 0.5,
            }}
          >
            {motor.name}
          </Typography>

          <Typography
            sx={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: colors.from,
              mb: 1.2,
            }}
          >
            {[motor.cc, motor.hp, motor.category].filter(Boolean).join(' • ')}
          </Typography>

          <Typography
            sx={{
              fontSize: '0.88rem',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.55,
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

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1.5}
          >
            {motor.price ? (
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.62rem',
                    color: 'rgba(255,255,255,0.5)',
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Fiyat
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.15rem',
                    fontWeight: 900,
                    color: '#fff',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {motor.price.replace('TL', '₺')}
                </Typography>
              </Box>
            ) : (
              <Chip
                label="Çok Yakında"
                size="small"
                sx={{
                  background: 'rgba(255,193,7,0.15)',
                  color: '#ffc107',
                  fontWeight: 800,
                  border: '1px solid rgba(255,193,7,0.4)',
                }}
              />
            )}

            <Box
              className="incele-btn"
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                border: `1px solid ${colors.from}`,
                color: colors.from,
                fontWeight: 800,
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.25s ease',
              }}
            >
              Ürünü İncele
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </Box>
          </Stack>
        </Box>
      </CardActionArea>
    </Card>
  );
}

export default MotorCard;
