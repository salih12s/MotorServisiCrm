import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

function IsEmriTamamlaModal({ open, onClose, workOrder, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={window.innerWidth < 600}
      PaperProps={{
        sx: {
          m: { xs: 0, sm: 2 },
          borderRadius: { xs: 0, sm: 2 },
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'success.main', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: { xs: 2, sm: 2.5 },
      }}>
        <CheckCircleIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          İş Emrini Tamamla
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ mt: { xs: 2, sm: 3 }, p: { xs: 2, sm: 3 } }}>
        {workOrder && (
          <Box>
            <Typography variant="body1" gutterBottom>
              Bu iş emrini tamamlandı olarak işaretlemek istediğinizden emin misiniz?
            </Typography>
            
            <Card sx={{ mt: 2, bgcolor: '#f5f5f5' }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Fiş No
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      {workOrder.fis_no}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Müşteri
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {workOrder.musteri_ad_soyad}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Araç
                    </Typography>
                    <Typography variant="body1">
                      {workOrder.marka} {workOrder.model_tip} - {workOrder.plaka}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Arıza/Şikayet
                    </Typography>
                    <Typography variant="body2">
                      {workOrder.ariza_sikayetler || '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: '#e8f5e9', 
              borderRadius: 1,
              border: '1px solid #2e7d32'
            }}>
              <Typography variant="body2" color="success.dark" fontWeight={600}>
                ✓ İş emri durumu "Tamamlandı" olarak güncellenecektir.
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
        >
          İptal
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          color="success"
          startIcon={<CheckCircleIcon />}
        >
          Tamamla
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default IsEmriTamamlaModal;
