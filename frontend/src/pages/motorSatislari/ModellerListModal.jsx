import React from 'react';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, Card, CardContent, Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  TwoWheeler as MotorIcon,
  Close as CloseIcon,
  ListAlt as ListIcon
} from '@mui/icons-material';

const ModellerListModal = ({
  open,
  onClose,
  isMobile,
  modeller,
  onEditModel,
  onDeleteModel,
  onAddModel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
            <ListIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Tanımlı Motor Modelleri
            </Typography>
            <Chip
              label={`${modeller.length} model`}
              color="primary"
              size="small"
              sx={{ mt: 0.5 }}
            />
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
      <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
        {modeller.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <MotorIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography color="text.secondary">
              Henüz motor modeli tanımlanmamış
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                onClose();
                onAddModel();
              }}
              sx={{ mt: 2 }}
            >
              İlk Modeli Tanımla
            </Button>
          </Paper>
        ) : isMobile ? (
          /* Mobil Kart Görünümü */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {modeller.map((model) => (
              <Card key={model.id} variant="outlined">
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        <MotorIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>{model.model_adi}</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                          {model.cc && <Chip label={`${model.cc} cc`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />}
                          {model.otv_orani && <Chip label={`ÖTV %${model.otv_orani}`} size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />}
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          onClose();
                          onEditModel(model);
                        }}
                        color="primary"
                        sx={{ p: 0.5 }}
                      >
                        <EditIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onDeleteModel(model.id)}
                        color="error"
                        sx={{ p: 0.5 }}
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          /* Masaüstü Tablo Görünümü */
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Model Adı</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Motor Hacmi</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ÖTV Oranı</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {modeller.map((model) => (
                  <TableRow key={model.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MotorIcon color="primary" fontSize="small" />
                        <Typography fontWeight={500}>{model.model_adi}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {model.cc ? (
                        <Chip label={`${model.cc} cc`} size="small" variant="outlined" />
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {model.otv_orani ? (
                        <Chip label={`%${model.otv_orani}`} size="small" color="warning" variant="outlined" />
                      ) : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => {
                          onClose();
                          onEditModel(model);
                        }}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onDeleteModel(model.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Kapat
        </Button>
        <Button
          onClick={() => {
            onClose();
            onAddModel();
          }}
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Yeni Model Ekle
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModellerListModal;
