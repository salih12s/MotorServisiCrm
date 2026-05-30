import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

const formatTRY = (value) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value || 0);

function KullaniciIsEmirleriDialog({ open, onClose, isMobile, user, userWorkOrders, onViewDetail }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ bgcolor: '#04A7B8', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssignmentIcon />
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {user?.ad_soyad} - İş Emirleri
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {user?.kullanici_adi}
          </Typography>
        </Box>
        <Chip
          label={`${userWorkOrders.length} iş emri`}
          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', ml: 'auto' }}
        />
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {userWorkOrders.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Bu kullanıcı henüz iş emri oluşturmamış
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: { xs: 800, sm: '100%' } }}>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Fiş No</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tarih</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Müşteri</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Araç</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Durum</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Gelir</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Kar</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Detay</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userWorkOrders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Typography fontWeight={700} color="primary.main">{order.fis_no}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(order.created_at).toLocaleDateString('tr-TR')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(order.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{order.musteri_ad_soyad}</Typography>
                      <Typography variant="caption" color="text.secondary">{order.telefon}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{order.marka} {order.model_tip}</Typography>
                      {order.km && <Typography variant="caption" color="text.secondary">{order.km} km</Typography>}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={order.durum === 'beklemede' ? 'Beklemede' : 'Tamamlandı'}
                        sx={{
                          bgcolor: order.durum === 'beklemede' ? '#fff3e0' : '#e8f5e9',
                          color: order.durum === 'beklemede' ? '#e65100' : '#2e7d32',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600} sx={{ color: '#2e7d32' }}>
                        {formatTRY(order.gercek_toplam_ucret)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        fontWeight={700}
                        sx={{ color: parseFloat(order.kar) >= 0 ? '#2e7d32' : '#c62828' }}
                      >
                        {formatTRY(order.kar)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Detayları Gör">
                        <IconButton
                          size="small"
                          onClick={() => onViewDetail(order)}
                          sx={{ color: '#04A7B8' }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: '#036B74' }}>
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default KullaniciIsEmirleriDialog;
