import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  InputAdornment,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { formatCurrency } from './isEmriFormUtils';

const IsEmriParcalar = ({
  isEdit,
  isAdmin,
  formData,
  handleChange,
  newParca,
  handleParcaChange,
  addParca,
  removeParca,
  setNewParca,
  parcalar,
  totals,
}) => (
  <>
    {/* Parça Ekleme */}
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main', width: 32, height: 32 }}>
            <ReceiptIcon fontSize="small" />
          </Avatar>
          <Typography variant="subtitle1" fontWeight={600}>
            Parçalar ve İşçilik
          </Typography>
          <Chip
            label={`${parcalar.length} parça`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ ml: 'auto' }}
          />
        </Box>

        {/* Yeni Parça Ekleme Formu */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 2,
            bgcolor: 'grey.50',
            borderStyle: 'dashed'
          }}
        >
          <Grid container spacing={1.5}>
            <Grid item xs={6} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Parça Kodu"
                name="parca_kodu"
                value={newParca.parca_kodu}
                onChange={handleParcaChange}
              />
            </Grid>
            <Grid item xs={6} sm={8}>
              <TextField
                fullWidth
                size="small"
                label="Takılan Parça / İşçilik"
                name="takilan_parca"
                value={newParca.takilan_parca}
                onChange={handleParcaChange}
              />
            </Grid>
            <Grid item xs={isEdit && isAdmin ? 4 : 6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Adet"
                name="adet"
                value={newParca.adet}
                onChange={handleParcaChange}
              />
            </Grid>
            {isEdit && isAdmin && (
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Maliyet"
                  name="maliyet"
                  value={newParca.maliyet}
                  onChange={handleParcaChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                  }}
                />
              </Grid>
            )}
            <Grid item xs={isEdit && isAdmin ? 4 : 6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Satış Fiyatı"
                name="birim_fiyat"
                value={newParca.birim_fiyat}
                onChange={handleParcaChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addParca}
              >
                Parça Ekle
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Parça Listesi */}
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Parça</TableCell>
                <TableCell align="center">Adet</TableCell>
                {isEdit && isAdmin && <TableCell align="right">Maliyet</TableCell>}
                <TableCell align="right">Satış</TableCell>
                {isEdit && <TableCell align="center" width={50}>Düzenle</TableCell>}
                <TableCell align="center" width={50}>Sil</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parcalar.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={(isEdit && isAdmin) ? 6 : (isEdit ? 5 : 4)} align="center" sx={{ py: 4 }}>
                    <ReceiptIcon sx={{ fontSize: 40, color: 'grey.300', mb: 1 }} />
                    <Typography color="text.secondary">
                      Henüz parça eklenmedi
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                parcalar.map((parca, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {parca.takilan_parca}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {parca.parca_kodu || 'Kod yok'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{parca.adet}</TableCell>
                    {isEdit && isAdmin && (
                      <TableCell align="right">
                        <Typography variant="body2" color="error.main">
                          {formatCurrency(parca.maliyet || 0)}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(parca.birim_fiyat)}
                      </Typography>
                    </TableCell>
                    {isEdit && (
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            setNewParca({
                              parca_kodu: parca.parca_kodu || '',
                              takilan_parca: parca.takilan_parca,
                              adet: parca.adet,
                              birim_fiyat: parca.birim_fiyat,
                              maliyet: parca.maliyet || 0,
                            });
                            removeParca(index);
                          }}
                        >
                          <BuildIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeParca(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Toplamlar */}
        {parcalar.length > 0 && (
          <Paper sx={{ mt: 2, p: 2, bgcolor: 'grey.50' }}>
            <Grid container spacing={2}>
              {isEdit && isAdmin ? (
                <>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">
                      Toplam Maliyet
                    </Typography>
                    <Typography variant="h6" color="error.main" fontWeight={600}>
                      {formatCurrency(totals.toplamMaliyet)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Toplam Satış
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {formatCurrency(totals.toplamFiyat)}
                    </Typography>
                  </Grid>
                </>
              ) : (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Toplam Tutar
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {formatCurrency(totals.toplamFiyat)}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}
      </CardContent>
    </Card>

    {/* Durum (Sadece düzenleme modunda) */}
    {isEdit && (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'info.lighter', color: 'info.main', width: 32, height: 32 }}>
              <ShippingIcon fontSize="small" />
            </Avatar>
            <Typography variant="subtitle1" fontWeight={600}>
              Durum
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Durum</InputLabel>
                <Select
                  name="durum"
                  value={formData.durum}
                  label="Durum"
                  onChange={handleChange}
                >
                  <MenuItem value="acik">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                      Açık
                    </Box>
                  </MenuItem>
                  <MenuItem value="kapali">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                      Kapalı
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )}
  </>
);

export default IsEmriParcalar;
