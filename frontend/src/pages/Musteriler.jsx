import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Avatar,
  Tooltip,
  Chip,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { musteriService } from '../services/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

function Musteriler() {
  const [musteriler, setMusteriler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMusteri, setEditingMusteri] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [formData, setFormData] = useState({
    ad_soyad: '',
    telefon: '',
    adres: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMusteriler();
  }, []);

  const loadMusteriler = async () => {
    try {
      setLoading(true);
      const response = await musteriService.getAll();
      setMusteriler(response.data);
    } catch (error) {
      console.error('Müşteri listesi hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (musteri = null) => {
    if (musteri) {
      setEditingMusteri(musteri);
      setFormData({
        ad_soyad: musteri.ad_soyad || '',
        telefon: musteri.telefon || '',
        adres: musteri.adres || '',
      });
    } else {
      setEditingMusteri(null);
      setFormData({ ad_soyad: '', telefon: '', adres: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMusteri(null);
    setFormData({ ad_soyad: '', telefon: '', adres: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.ad_soyad) return;

    setSaving(true);
    try {
      if (editingMusteri) {
        await musteriService.update(editingMusteri.id, formData);
      } else {
        await musteriService.create(formData);
      }
      loadMusteriler();
      handleCloseDialog();
    } catch (error) {
      console.error('Kaydetme hatası:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
      try {
        await musteriService.delete(id);
        loadMusteriler();
      } catch (error) {
        console.error('Silme hatası:', error);
      }
    }
  };

  const filteredMusteriler = musteriler.filter(
    (m) =>
      m.ad_soyad?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.telefon?.includes(searchQuery)
  );

  // Renk belirleme fonksiyonu
  const getAvatarColor = (name) => {
    const colors = ['#1a237e', '#0d47a1', '#00897b', '#c62828', '#ff8f00', '#6a1b9a', '#00695c'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  return (
    <Box>
      {/* Header with Stats */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Müşteriler
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Typography>
          </Box>
          {/* Inline Stats */}
          <Chip 
            label={`Toplam: ${musteriler.length}`} 
            sx={{ bgcolor: '#e3f2fd', color: '#1a237e', fontWeight: 600 }} 
          />
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
          sx={{ px: 3 }}
        >
          Yeni Müşteri
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5 }}>
          <TextField
            placeholder="Müşteri Ara (İsim veya Telefon)"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Table / Mobile Cards */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      ) : isMobile ? (
        /* Mobile Card View */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredMusteriler.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz müşteri bulunmuyor'}
                </Typography>
                {!searchQuery && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ mt: 2 }}
                  >
                    İlk Müşteriyi Ekle
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredMusteriler.map((musteri) => (
              <Card key={musteri.id} sx={{ overflow: 'hidden' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                    <Avatar 
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        bgcolor: getAvatarColor(musteri.ad_soyad),
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {musteri.ad_soyad?.charAt(0) || '?'}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>{musteri.ad_soyad}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {musteri.created_at ? format(new Date(musteri.created_at), 'dd MMM yyyy', { locale: tr }) : ''}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  {musteri.telefon && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <PhoneIcon fontSize="small" color="primary" sx={{ fontSize: '0.9rem' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{musteri.telefon}</Typography>
                    </Box>
                  )}
                  
                  {musteri.adres && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 1.5 }}>
                      <LocationIcon fontSize="small" color="action" sx={{ fontSize: '0.9rem', mt: 0.1 }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.875rem',
                          minWidth: 0,
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {musteri.adres}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon sx={{ fontSize: '1rem' }} />}
                      onClick={() => handleOpenDialog(musteri)}
                      sx={{ flex: 1, minWidth: 0, px: 1, fontSize: '0.75rem' }}
                    >
                      Düzenle
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon sx={{ fontSize: '1rem' }} />}
                      onClick={() => handleDelete(musteri.id)}
                      sx={{ flex: 1, minWidth: 0, px: 1, fontSize: '0.75rem' }}
                    >
                      Sil
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      ) : (
        /* Desktop Table View */
        <Card>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: { xs: 800, sm: '100%' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Müşteri</TableCell>
                  <TableCell>Telefon</TableCell>
                  <TableCell>Adres</TableCell>
                  <TableCell>Kayıt Tarihi</TableCell>
                  <TableCell align="center" width={120}>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMusteriler.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <PersonIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                        <Typography variant="h6" color="text.secondary">
                          {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz müşteri bulunmuyor'}
                        </Typography>
                        {!searchQuery && (
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                          >
                            İlk Müşteriyi Ekle
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMusteriler.map((musteri) => (
                    <TableRow key={musteri.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              width: 42, 
                              height: 42, 
                              bgcolor: getAvatarColor(musteri.ad_soyad),
                              fontWeight: 600,
                            }}
                          >
                            {musteri.ad_soyad?.charAt(0) || '?'}
                          </Avatar>
                          <Typography fontWeight={600}>{musteri.ad_soyad}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {musteri.telefon ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2">{musteri.telefon}</Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {musteri.adres ? (
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <LocationIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                maxWidth: 250,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {musteri.adres}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {musteri.created_at ? format(new Date(musteri.created_at), 'dd MMM yyyy', { locale: tr }) : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Düzenle">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(musteri)}
                            sx={{ mr: 0.5 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(musteri.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PersonIcon sx={{ color: 'white' }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              {editingMusteri ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ad Soyad"
                name="ad_soyad"
                value={formData.ad_soyad}
                onChange={handleChange}
                required
                placeholder="Müşteri adını girin"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Telefon"
                name="telefon"
                value={formData.telefon}
                onChange={handleChange}
                placeholder="05XX XXX XX XX"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adres"
                name="adres"
                value={formData.adres}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Müşteri adresini girin"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <LocationIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit">
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving || !formData.ad_soyad}
            sx={{ minWidth: 120 }}
          >
            {saving ? <CircularProgress size={24} /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Musteriler;
