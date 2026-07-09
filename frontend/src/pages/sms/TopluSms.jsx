import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
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
  Delete as DeleteIcon,
  GroupAdd as GroupAddIcon,
  PersonAdd as PersonAddIcon,
  PlaylistAdd as PlaylistAddIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Sms as SmsIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { smsService } from '../../services/api';

// Türkçe karakter içeren SMS'ler unicode sayılır: tek SMS 70, devamı 67 karakter.
// GSM alfabesinde: 160 / 153. Basit tahmin için Türkçe'ye göre hesaplıyoruz.
const hesaplaSmsAdedi = (mesaj) => {
  const len = mesaj.length;
  if (len === 0) return 0;
  const unicode = /[çÇğĞıİöÖşŞüÜ]/.test(mesaj);
  const tek = unicode ? 70 : 160;
  const coklu = unicode ? 67 : 153;
  return len <= tek ? 1 : Math.ceil(len / coklu);
};

const telefonGorunum = (t) =>
  t && t.length === 11 ? `${t.slice(0, 4)} ${t.slice(4, 7)} ${t.slice(7, 9)} ${t.slice(9)}` : t;

function TopluSms() {
  const [rehber, setRehber] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesaj, setMesaj] = useState('');
  const [secili, setSecili] = useState(new Set());
  const [arama, setArama] = useState('');
  const [snackbar, setSnackbar] = useState(null); // { severity, text }
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [gonderOnay, setGonderOnay] = useState(false);

  // Kişi ekle dialog
  const [kisiDialog, setKisiDialog] = useState(false);
  const [yeniIsim, setYeniIsim] = useState('');
  const [yeniTelefon, setYeniTelefon] = useState('');

  // Toplu ekle dialog
  const [topluDialog, setTopluDialog] = useState(false);
  const [topluMetin, setTopluMetin] = useState('');

  const yukle = async () => {
    try {
      setLoading(true);
      const res = await smsService.getRehber();
      setRehber(res.data);
    } catch {
      setSnackbar({ severity: 'error', text: 'Rehber yüklenemedi' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    yukle();
  }, []);

  const filtreli = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr');
    if (!q) return rehber;
    return rehber.filter(
      (k) =>
        (k.isim || '').toLocaleLowerCase('tr').includes(q) ||
        (k.telefon || '').includes(q.replace(/\D/g, '') || q)
    );
  }, [rehber, arama]);

  const tumuSecili = filtreli.length > 0 && filtreli.every((k) => secili.has(k.id));

  const toggleTumu = () => {
    setSecili((prev) => {
      const next = new Set(prev);
      if (tumuSecili) filtreli.forEach((k) => next.delete(k.id));
      else filtreli.forEach((k) => next.add(k.id));
      return next;
    });
  };

  const toggleKisi = (id) => {
    setSecili((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const kisiEkle = async () => {
    try {
      const res = await smsService.addKisiler([{ isim: yeniIsim, telefon: yeniTelefon }]);
      const { eklenen, gecersiz } = res.data;
      if (gecersiz > 0) {
        setSnackbar({ severity: 'error', text: 'Geçersiz telefon numarası (05XX XXX XX XX formatında olmalı)' });
        return;
      }
      setSnackbar({
        severity: eklenen > 0 ? 'success' : 'info',
        text: eklenen > 0 ? 'Kişi rehbere eklendi' : 'Bu numara zaten rehberde kayıtlı',
      });
      setKisiDialog(false);
      setYeniIsim('');
      setYeniTelefon('');
      if (eklenen > 0) yukle();
    } catch {
      setSnackbar({ severity: 'error', text: 'Kişi eklenemedi' });
    }
  };

  const topluEkle = async () => {
    // Her satır: "İsim;05xxxxxxxxx" veya "İsim,05xx..." veya sadece numara
    const kisiler = topluMetin
      .split('\n')
      .map((satir) => satir.trim())
      .filter(Boolean)
      .map((satir) => {
        const parcalar = satir.split(/[;,\t]/).map((p) => p.trim());
        if (parcalar.length >= 2) {
          const telIdx = parcalar.findIndex((p) => /\d{7,}/.test(p.replace(/\D/g, '')));
          const tel = telIdx >= 0 ? parcalar[telIdx] : parcalar[parcalar.length - 1];
          const isim = parcalar.filter((_, i) => i !== telIdx).join(' ');
          return { isim, telefon: tel };
        }
        return { isim: '', telefon: parcalar[0] };
      });

    if (kisiler.length === 0) return;

    try {
      const res = await smsService.addKisiler(kisiler);
      const { eklenen, mevcut, gecersiz } = res.data;
      setSnackbar({
        severity: 'success',
        text: `${eklenen} kişi eklendi${mevcut ? `, ${mevcut} zaten kayıtlı` : ''}${gecersiz ? `, ${gecersiz} geçersiz numara atlandı` : ''}`,
      });
      setTopluDialog(false);
      setTopluMetin('');
      yukle();
    } catch {
      setSnackbar({ severity: 'error', text: 'Toplu ekleme başarısız' });
    }
  };

  const musterilerdenAktar = async () => {
    try {
      const res = await smsService.musterilerdenAktar();
      const { taranan, eklenen, gecersiz } = res.data;
      setSnackbar({
        severity: 'success',
        text: `${taranan} müşteri tarandı, ${eklenen} yeni numara eklendi${gecersiz ? `, ${gecersiz} geçersiz numara atlandı` : ''}`,
      });
      yukle();
    } catch {
      setSnackbar({ severity: 'error', text: 'Müşterilerden aktarma başarısız' });
    }
  };

  const kisiSil = async (id) => {
    try {
      await smsService.deleteKisi(id);
      setSecili((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setRehber((prev) => prev.filter((k) => k.id !== id));
    } catch {
      setSnackbar({ severity: 'error', text: 'Kişi silinemedi' });
    }
  };

  const secilenleriSil = async () => {
    try {
      const ids = [...secili];
      const res = await smsService.topluSil(ids);
      setSnackbar({ severity: 'success', text: `${res.data.silinen} kişi silindi` });
      setSecili(new Set());
      yukle();
    } catch {
      setSnackbar({ severity: 'error', text: 'Silme işlemi başarısız' });
    }
  };

  const gonder = async () => {
    setGonderOnay(false);
    setGonderiliyor(true);
    try {
      const res = await smsService.gonder(mesaj.trim(), [...secili]);
      setSnackbar({ severity: 'success', text: res.data.message || 'SMS gönderildi' });
      setMesaj('');
    } catch (err) {
      const msg = err.response?.data?.message || 'SMS gönderilemedi';
      setSnackbar({ severity: err.response?.status === 503 ? 'warning' : 'error', text: msg });
    } finally {
      setGonderiliyor(false);
    }
  };

  const smsAdedi = hesaplaSmsAdedi(mesaj);

  return (
    <Box>
      {/* API bilgilendirme */}
      <Alert
        severity="info"
        icon={<InfoIcon />}
        sx={{ mb: 2.5, borderRadius: 2, alignItems: 'center' }}
      >
        <strong>SMS sağlayıcısı henüz bağlanmadı.</strong> Rehberinizi şimdiden oluşturup
        mesajınızı hazırlayabilirsiniz; API anahtarı alındığında gönderim bu ekrandan tek tuşla
        yapılacak.
      </Alert>

      <Grid container spacing={2.5}>
        {/* Sol: mesaj yazma */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, position: { md: 'sticky' }, top: { md: 80 } }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 2 }}>
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
                  <SmsIcon sx={{ color: '#fff', fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography fontWeight={800} fontSize="1.05rem">
                    Mesaj
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tüm seçili numaralara aynı mesaj gönderilir
                  </Typography>
                </Box>
              </Stack>

              <TextField
                fullWidth
                multiline
                minRows={6}
                placeholder={
                  'Merhaba, Demirkan Motorlu Araçlar olarak size özel kampanyamızdan haberdar olmanızı istedik...'
                }
                value={mesaj}
                onChange={(e) => setMesaj(e.target.value)}
              />

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mt: 1, mb: 2.5 }}
              >
                <Typography variant="caption" color="text.secondary">
                  {mesaj.length} karakter · ~{smsAdedi} SMS
                </Typography>
                <Chip
                  size="small"
                  label={`${secili.size} alıcı seçili`}
                  color={secili.size > 0 ? 'primary' : 'default'}
                  variant={secili.size > 0 ? 'filled' : 'outlined'}
                />
              </Stack>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={gonderiliyor ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                disabled={!mesaj.trim() || secili.size === 0 || gonderiliyor}
                onClick={() => setGonderOnay(true)}
                sx={{ py: 1.4, borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}
              >
                {secili.size > 0 ? `${secili.size} Kişiye Gönder` : 'Gönder'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Sağ: rehber */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                spacing={1.5}
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography fontWeight={800} fontSize="1.05rem">
                    Telefon Rehberi
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {rehber.length} kayıtlı numara
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setKisiDialog(true)}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Kişi Ekle
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PlaylistAddIcon />}
                    onClick={() => setTopluDialog(true)}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Toplu Ekle
                  </Button>
                  <Tooltip title="Müşteri kayıtlarındaki tüm telefon numaralarını rehbere aktarır">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<GroupAddIcon />}
                      onClick={musterilerdenAktar}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      Müşterilerden Aktar
                    </Button>
                  </Tooltip>
                  {secili.size > 0 && (
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      onClick={secilenleriSil}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      Seçilenleri Sil ({secili.size})
                    </Button>
                  )}
                </Stack>
              </Stack>

              <TextField
                fullWidth
                size="small"
                placeholder="İsim veya numara ara..."
                value={arama}
                onChange={(e) => setArama(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {loading ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <CircularProgress size={32} />
                </Box>
              ) : filtreli.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <SmsIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
                  <Typography color="text.secondary">
                    {rehber.length === 0
                      ? 'Henüz numara eklenmedi. "Kişi Ekle" ile başlayabilirsiniz.'
                      : 'Aramanızla eşleşen kayıt yok.'}
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ maxHeight: 480 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={tumuSecili}
                            indeterminate={!tumuSecili && filtreli.some((k) => secili.has(k.id))}
                            onChange={toggleTumu}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>İsim</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Telefon</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Kaynak</TableCell>
                        <TableCell align="right" />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtreli.map((kisi) => (
                        <TableRow
                          key={kisi.id}
                          hover
                          selected={secili.has(kisi.id)}
                          onClick={() => toggleKisi(kisi.id)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox checked={secili.has(kisi.id)} />
                          </TableCell>
                          <TableCell>{kisi.isim || '—'}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                            {telefonGorunum(kisi.telefon)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={kisi.kaynak === 'musteri' ? 'Müşteri' : 'Manuel'}
                              color={kisi.kaynak === 'musteri' ? 'info' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                kisiSil(kisi.id);
                              }}
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Kişi ekle dialog */}
      <Dialog open={kisiDialog} onClose={() => setKisiDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Kişi Ekle</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="İsim (opsiyonel)"
              value={yeniIsim}
              onChange={(e) => setYeniIsim(e.target.value)}
              fullWidth
            />
            <TextField
              label="Telefon"
              placeholder="05XX XXX XX XX"
              value={yeniTelefon}
              onChange={(e) => setYeniTelefon(e.target.value)}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setKisiDialog(false)} sx={{ textTransform: 'none' }}>
            Vazgeç
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={kisiEkle}
            disabled={!yeniTelefon.trim()}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toplu ekle dialog */}
      <Dialog open={topluDialog} onClose={() => setTopluDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Toplu Numara Ekle</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Her satıra bir kayıt girin. Sadece numara yazabilir veya{' '}
            <code>İsim;Numara</code> formatını kullanabilirsiniz:
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={8}
            placeholder={'Ahmet Yılmaz;0546 123 45 67\n0555 987 65 43\nMehmet Demir,05321234567'}
            value={topluMetin}
            onChange={(e) => setTopluMetin(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTopluDialog(false)} sx={{ textTransform: 'none' }}>
            Vazgeç
          </Button>
          <Button
            variant="contained"
            startIcon={<PlaylistAddIcon />}
            onClick={topluEkle}
            disabled={!topluMetin.trim()}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Gönderim onayı */}
      <Dialog open={gonderOnay} onClose={() => setGonderOnay(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Gönderim Onayı</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            <strong>{secili.size} kişiye</strong> aşağıdaki mesaj gönderilecek (~{smsAdedi} SMS/kişi):
          </Typography>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'action.hover',
              fontSize: '0.88rem',
              whiteSpace: 'pre-wrap',
              maxHeight: 160,
              overflowY: 'auto',
            }}
          >
            {mesaj}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setGonderOnay(false)} sx={{ textTransform: 'none' }}>
            Vazgeç
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={gonder}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Gönder
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={5000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {snackbar ? (
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar(null)}
            sx={{ borderRadius: 2 }}
          >
            {snackbar.text}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}

export default TopluSms;
