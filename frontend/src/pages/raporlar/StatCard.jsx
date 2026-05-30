import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

// Stat Card Component
const StatCard = ({ title, value, icon, color, variant = 'default', isMobile = false }) => (
  <Card 
    sx={{ 
      height: '100%',
      ...(variant === 'highlight' && {
        bgcolor: color,
        color: 'white',
      }),
    }}
  >
    <CardContent sx={{ p: isMobile ? 1.5 : 2, '&:last-child': { pb: isMobile ? 1.5 : 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        {React.cloneElement(icon, { 
          sx: { 
            fontSize: isMobile ? 16 : 20, 
            color: variant === 'highlight' ? 'rgba(255,255,255,0.8)' : color 
          } 
        })}
        <Typography 
          variant="body2" 
          sx={{ 
            color: variant === 'highlight' ? 'rgba(255,255,255,0.9)' : 'text.secondary',
            fontWeight: 500,
            fontSize: isMobile ? '0.7rem' : '0.875rem',
          }}
        >
          {title}
        </Typography>
      </Box>
      <Typography 
        variant={isMobile ? 'h6' : 'h5'}
        fontWeight={800}
        sx={{ 
          color: variant === 'highlight' ? 'white' : color,
          fontSize: isMobile ? '1.1rem' : '1.5rem',
        }}
      >
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export default StatCard;
