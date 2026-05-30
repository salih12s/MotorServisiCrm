import React from 'react';
import {
  Box, Typography, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, InputAdornment, Card,
  CardContent, Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

const ModelFormModal = ({
  open,
  onClose,
  isMobile,
  editingModel,
  modelForm,
  setModelForm,
  onSave,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 2 },
          m: { xs: 0, sm: 2 },
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: { xs: 1.5, sm: 2 },
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: { xs: 32, sm: 36 }, height: { xs: 32, sm: 36 } }}>
            <SettingsIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
          </Avatar>
          <Box>
            <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={700}>
              {editingModel ? 'Motor Modeli Düzenle' : 'Yeni Motor Modeli Tanımla'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Motor modeli bilgilerini girin
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            bgcolor: 'grey.200',
            '&:hover': { bgcolor: 'grey.300' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2, pt: 2 }}>
        <Card>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
              <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', width: 28, height: 28 }}>
                <CategoryIcon sx={{ fontSize: 16 }} />
              </Avatar>
              <Typography variant="subtitle2" fontWeight={600}>
                Model Detayları
              </Typography>
            </Box>
            <TextField
              fullWidth
              size="small"
              label="Model Adı"
              value={modelForm.model_adi}
              onChange={(e) => setModelForm({ ...modelForm, model_adi: e.target.value })}
              required
              placeholder="Örn: Yamaha YZF-R3, Honda CB500X"
              sx={{ mb: 1.5 }}
            />
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
              <TextField
                sx={{ flex: 1 }}
                size="small"
                label="CC (Motor Hacmi)"
                value={modelForm.cc}
                onChange={(e) => setModelForm({ ...modelForm, cc: e.target.value })}
                placeholder="Örn: 321, 500, 1000"
              />
              <TextField
                sx={{ flex: 1 }}
                size="small"
                label="ÖTV Oranı (%)"
                type="number"
                value={modelForm.otv_orani}
                onChange={(e) => setModelForm({ ...modelForm, otv_orani: e.target.value })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
                placeholder="Örn: 37, 60, 150"
              />
            </Box>
          </CardContent>
        </Card>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          İptal
        </Button>
        <Button onClick={onSave} variant="contained" color="primary" startIcon={<AddIcon />}>
          {editingModel ? 'Güncelle' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModelFormModal;
