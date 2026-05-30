import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
} from '@mui/icons-material';

const IsEmriMusteriArac = ({ formData, handleChange, setFormData, user }) => (
  <>
    {/* Müşteri Bilgileri */}
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', width: 32, height: 32 }}>
            <PersonIcon fontSize="small" />
          </Avatar>
          <Typography variant="subtitle1" fontWeight={600}>
            Müşteri Bilgileri
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Müşteri Adı Soyadı"
              name="musteri_ad_soyad"
              value={formData.musteri_ad_soyad}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Telefon"
              name="telefon"
              value={formData.telefon}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="KM"
              name="km"
              value={formData.km}
              onChange={handleChange}
              type="number"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">km</InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} mt={5}>
            <FormControl fullWidth size="small" mt={2}>
              <InputLabel>Oluşturan Kişi</InputLabel>
              <Select
                name="olusturan_kisi"
                value={formData.olusturan_kisi}
                label="Oluşturan Kişi"
                onChange={handleChange}
              >
                <MenuItem value={user?.name || user?.ad_soyad || ''}>
                  {user?.name || user?.ad_soyad || 'Ben'}
                </MenuItem>
                <MenuItem value="Ortak">Ortak</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>

    {/* Araç Bilgileri */}
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'secondary.lighter', color: 'secondary.main', width: 32, height: 32 }}>
            <CarIcon fontSize="small" />
          </Avatar>
          <Typography variant="subtitle1" fontWeight={600}>
            Araç Bilgileri
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Marka"
              name="marka"
              value={formData.marka}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Model (Tip)"
              name="model_tip"
              value={formData.model_tip}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Tahmini Teslim Tarihi"
              name="tahmini_teslim_tarihi"
              value={formData.tahmini_teslim_tarihi}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Tahmini Toplam Ücret"
              name="tahmini_toplam_ucret"
              value={formData.tahmini_toplam_ucret}
              onChange={handleChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">₺</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>

    {/* Arıza ve Açıklama */}
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'warning.lighter', color: 'warning.main', width: 32, height: 32 }}>
            <BuildIcon fontSize="small" />
          </Avatar>
          <Typography variant="subtitle1" fontWeight={600}>
            Arıza ve Açıklama
          </Typography>
        </Box>

        {/* Hızlı Seçim Butonları */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip
            label="Periyodik Bakım"
            onClick={() => setFormData(prev => ({
              ...prev,
              ariza_sikayetler: prev.ariza_sikayetler ? `${prev.ariza_sikayetler}, Periyodik Bakım` : 'Periyodik Bakım'
            }))}
            sx={{
              cursor: 'pointer',
              bgcolor: '#E5E5E5',
              '&:hover': { bgcolor: '#04A7B8', color: 'white' }
            }}
          />
          <Chip
            label="Ağır Bakım"
            onClick={() => setFormData(prev => ({
              ...prev,
              ariza_sikayetler: prev.ariza_sikayetler ? `${prev.ariza_sikayetler}, Ağır Bakım` : 'Ağır Bakım'
            }))}
            sx={{
              cursor: 'pointer',
              bgcolor: '#E5E5E5',
              '&:hover': { bgcolor: '#04A7B8', color: 'white' }
            }}
          />
          <Chip
            label="Tamir"
            onClick={() => setFormData(prev => ({
              ...prev,
              ariza_sikayetler: prev.ariza_sikayetler ? `${prev.ariza_sikayetler}, Tamir` : 'Tamir'
            }))}
            sx={{
              cursor: 'pointer',
              bgcolor: '#E5E5E5',
              '&:hover': { bgcolor: '#04A7B8', color: 'white' }
            }}
          />
          <Chip
            label="Sigorta"
            onClick={() => setFormData(prev => ({
              ...prev,
              ariza_sikayetler: prev.ariza_sikayetler ? `${prev.ariza_sikayetler}, Sigorta` : 'Sigorta'
            }))}
            sx={{
              cursor: 'pointer',
              bgcolor: '#E5E5E5',
              '&:hover': { bgcolor: '#04A7B8', color: 'white' }
            }}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Arıza ve Şikayetler"
              name="ariza_sikayetler"
              value={formData.ariza_sikayetler}
              onChange={handleChange}
              multiline
              rows={4}
              placeholder="Periyodik bakım, Hız sapması, Geri düşüşü ve hız..."
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Ek Açıklama"
              name="aciklama"
              value={formData.aciklama}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  </>
);

export default IsEmriMusteriArac;
