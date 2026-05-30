import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  Divider,
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
  History as HistoryIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { getIslemTipiLabel, getIslemTipiColor } from './kullanicilarUtils';

function KullaniciAktiviteDialog({ open, onClose, isMobile, user, userActivities, getIslemTipiIcon }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ bgcolor: '#036B74', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#36C5D3', width: 48, height: 48 }}>
            {user?.ad_soyad?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {user?.ad_soyad} - Aktivite Geçmişi
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              @{user?.kullanici_adi} • {user?.rol === 'admin' ? 'Yönetici' : 'Personel'}
            </Typography>
          </Box>
          <Chip
            label={`${userActivities.length} Aktivite`}
            sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
          />
        </Box>
      </DialogTitle>
      <DialogContent sx={{ mt: 2, px: 0 }}>
        {userActivities.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
            <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aktivite Kaydı Bulunamadı
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bu kullanıcıya ait henüz bir aktivite kaydı bulunmuyor
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={50} sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}></TableCell>
                  <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>İşlem</TableCell>
                  <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>Açıklama</TableCell>
                  <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>IP Adresi</TableCell>
                  <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}>Tarih/Saat</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userActivities.map((activity, index) => (
                  <TableRow
                    key={activity.id}
                    hover
                    sx={{
                      '&:hover': { bgcolor: 'rgba(4, 167, 184, 0.05)' },
                      borderLeft: index === 0 ? '4px solid #04A7B8' : 'none',
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        {getIslemTipiIcon(activity.islem_tipi)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getIslemTipiLabel(activity.islem_tipi)}
                        color={getIslemTipiColor(activity.islem_tipi)}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 400 }}>
                        {activity.aciklama}
                      </Typography>
                      {activity.detaylar && Object.keys(activity.detaylar).length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {activity.detaylar.fisNo && `Fiş: #${activity.detaylar.fisNo}`}
                          {activity.detaylar.musteriAdSoyad && ` • Müşteri: ${activity.detaylar.musteriAdSoyad}`}
                          {activity.detaylar.marka && activity.detaylar.modelTip && ` • ${activity.detaylar.marka} ${activity.detaylar.modelTip}`}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                        {activity.ip_adresi || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {new Date(activity.created_at).toLocaleDateString('tr-TR')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(activity.created_at).toLocaleTimeString('tr-TR')}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mr: 'auto' }}>
          Son {userActivities.length} aktivite gösteriliyor
        </Typography>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: '#036B74' }}>
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default KullaniciAktiviteDialog;
