import React from 'react';
import { Box, Card, CardContent, Avatar, Typography } from '@mui/material';

// AksesuarModal içindeki tüm bölümler için ortak kart/başlık düzeni
function FormSectionCard({ icon, iconBg = 'primary.lighter', iconColor = 'primary.main', title, action, children, sx }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, ...sx }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
          <Avatar sx={{ bgcolor: iconBg, color: iconColor, width: 26, height: 26 }}>
            {React.cloneElement(icon, { sx: { fontSize: 15 } })}
          </Avatar>
          <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
          {action && <Box sx={{ ml: 'auto' }}>{action}</Box>}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

export default FormSectionCard;
