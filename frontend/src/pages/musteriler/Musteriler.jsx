import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { musteriService } from '../../services/api';

const emptyForm = { ad_soyad: '', telefon: '', adres: '' };

function Musteriler() {
  const [musteriler, setMusteriler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMusteri, setEditingMusteri] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const loadMusteriler = async () => {
    setLoading(true);
    try {
      const response = await musteriService.getAll({ durum: 'aktif' });
      setMusteriler(response.data);
    } catch (error) {
      setNotice({ severity: 'error', text: error.response?.data?.message || 'Müşteri listesi yüklenemedi.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMusteriler();
  }, []);

  const filteredMusteriler = useMemo(() => {
    const query = searchQuery.toLocaleLowerCase('tr-TR');
    return musteriler.filter((musteri) => (
      musteri.ad_soyad?.toLocaleLowerCase('tr-TR').includes(query)
      || musteri.telefon?.includes(searchQuery)
    ));
  }, [musteriler, searchQuery]);

  const openForm = (musteri = null) => {
    setEditingMusteri(musteri);
    setFormData(musteri ? {
      ad_soyad: musteri.ad_soyad || '',
      telefon: musteri.telefon || '',
      adres: musteri.adres || '',
    } : emptyForm);
    setDialogOpen(true);
  };

  const saveCustomer = async () => {
    if (!formData.ad_soyad.trim()) return;
    setSaving(true);
    try {
      if (editingMusteri) await musteriService.update(editingMusteri.id, formData);
      else await musteriService.create(formData);
      setNotice({ severity: 'success', text: editingMusteri ? 'Müşteri güncellendi.' : 'Müşteri eklendi.' });
      setDialogOpen(false);
      await loadMusteriler();
    } catch (error) {
      setNotice({ severity: 'error', text: error.response?.data?.message || 'Müşteri kaydedilemedi.' });
    } finally {
      setSaving(false);
    }
  };

  const avatarColor = (name) => (
    ['#1a237e', '#0d47a1', '#00897b', '#c62828', '#ff8f00', '#6a1b9a'][(name?.charCodeAt(0) || 0) % 6]
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <Typography variant="h5" fontWeight={800}>Müşteriler</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openForm()}>Yeni Müşteri</Button>
      </Box>

      <Card sx={{ mb: 2, p: 2 }}>
        <TextField
          placeholder="Müşteri Ara (İsim veya Telefon)"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          sx={{ maxWidth: 480 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
            endAdornment: searchQuery ? (
              <InputAdornment position="end"><IconButton size="small" onClick={() => setSearchQuery('')}><ClearIcon fontSize="small" /></IconButton></InputAdornment>
            ) : null,
          }}
        />
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
      ) : (
        <Card>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead><TableRow>
                <TableCell>Müşteri</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>Adres</TableCell>
                <TableCell align="center">İşlem</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {!filteredMusteriler.length ? (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 7 }}>Müşteri bulunamadı.</TableCell></TableRow>
                ) : filteredMusteriler.map((musteri) => (
                  <TableRow key={musteri.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: avatarColor(musteri.ad_soyad), width: 38, height: 38 }}>{musteri.ad_soyad?.charAt(0) || '?'}</Avatar>
                        <Typography fontWeight={700}>{musteri.ad_soyad}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{musteri.telefon || '-'}</TableCell>
                    <TableCell sx={{ maxWidth: 320 }}><Tooltip title={musteri.adres || ''}><Typography variant="body2" noWrap>{musteri.adres || '-'}</Typography></Tooltip></TableCell>
                    <TableCell align="center"><Tooltip title="Düzenle"><IconButton size="small" onClick={() => openForm(musteri)}><EditIcon fontSize="small" /></IconButton></Tooltip></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>{editingMusteri ? 'Müşteri Düzenle' : 'Yeni Müşteri'}</Typography>
          <IconButton onClick={() => setDialogOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent><Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12}><TextField fullWidth required label="Ad Soyad" value={formData.ad_soyad} onChange={(e) => setFormData((prev) => ({ ...prev, ad_soyad: e.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Telefon" value={formData.telefon} onChange={(e) => setFormData((prev) => ({ ...prev, telefon: e.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }} /></Grid>
          <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Adres" value={formData.adres} onChange={(e) => setFormData((prev) => ({ ...prev, adres: e.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start"><LocationIcon /></InputAdornment> }} /></Grid>
        </Grid></DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>İptal</Button>
          <Button variant="contained" disabled={saving || !formData.ad_soyad.trim()} onClick={saveCustomer}>{saving ? <CircularProgress size={22} /> : 'Kaydet'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(notice)} autoHideDuration={4500} onClose={() => setNotice(null)}>
        <Alert severity={notice?.severity || 'info'} onClose={() => setNotice(null)}>{notice?.text}</Alert>
      </Snackbar>
    </Box>
  );
}

export default Musteriler;
