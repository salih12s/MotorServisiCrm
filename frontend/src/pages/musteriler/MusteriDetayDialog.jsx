import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AccountBalanceWallet as AccountIcon,
  Close as CloseIcon,
  History as HistoryIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { musteriService } from '../../services/api';

const today = () => new Date().toISOString().slice(0, 10);
const newTransaction = () => ({
  hareket_tipi: 'TAHSILAT',
  tutar: '',
  islem_tarihi: today(),
  odeme_yontemi: 'NAKIT',
  aciklama: '',
});

const formatCurrency = (value) => new Intl.NumberFormat('tr-TR', {
  style: 'currency', currency: 'TRY', minimumFractionDigits: 2, maximumFractionDigits: 2,
}).format(Number(value || 0));

const formatDate = (value) => value
  ? format(new Date(value), 'dd MMM yyyy', { locale: tr })
  : '-';

const sourceLabels = {
  SERVIS: 'Servis',
  MOTOR_SATISI: 'Motor Satışı',
  AKSESUAR: 'Aksesuar',
  HOBI_GRUP: 'Hobi Grup / Bisiklet',
  MANUEL: 'Manuel',
  TERS_KAYIT: 'Ters Kayıt',
};

function SummaryCard({ label, value, color }) {
  return (
    <Card variant="outlined" sx={{ height: '100%', borderColor: `${color}55` }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="h6" fontWeight={800} sx={{ color }}>{formatCurrency(value)}</Typography>
      </CardContent>
    </Card>
  );
}

function MusteriDetayDialog({ open, customerId, onClose, user, onChanged }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(newTransaction);
  const [notice, setNotice] = useState(null);
  const isAdmin = user?.role === 'admin';

  const load = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const response = await musteriService.getDetail(customerId);
      setData(response.data);
    } catch (error) {
      setNotice({ severity: 'error', text: error.response?.data?.message || 'Müşteri detayı yüklenemedi.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && customerId) {
      setTab(0);
      setForm(newTransaction());
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customerId]);

  const submitTransaction = async () => {
    if (!form.tutar) return;
    setSaving(true);
    try {
      await musteriService.addAccountTransaction(customerId, {
        ...form,
        odeme_yontemi: form.hareket_tipi === 'TAHSILAT' ? form.odeme_yontemi : null,
      });
      setForm(newTransaction());
      setNotice({ severity: 'success', text: form.hareket_tipi === 'TAHSILAT' ? 'Tahsilat kaydedildi.' : 'Borç hareketi kaydedildi.' });
      await load();
      onChanged?.();
    } catch (error) {
      setNotice({ severity: 'error', text: error.response?.data?.message || 'Cari hareket kaydedilemedi.' });
    } finally {
      setSaving(false);
    }
  };

  const reverseTransaction = async (transaction) => {
    if (!window.confirm('Bu finansal hareket için dengeleyici bir ters kayıt oluşturulsun mu? Orijinal kayıt silinmeyecektir.')) return;
    try {
      await musteriService.reverseAccountTransaction(customerId, transaction.id, 'Kullanıcı tarafından ters çevrildi');
      setNotice({ severity: 'success', text: 'Ters kayıt oluşturuldu; orijinal hareket korundu.' });
      await load();
      onChanged?.();
    } catch (error) {
      setNotice({ severity: 'error', text: error.response?.data?.message || 'Ters kayıt oluşturulamadı.' });
    }
  };

  const account = data?.cari || { ozet: {}, hareketler: [] };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth fullScreen={false}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight={800} noWrap>{data?.musteri?.ad_soyad || 'Müşteri Detayı'}</Typography>
            {data?.musteri && (
              <Chip size="small" label={data.musteri.aktif ? 'Aktif' : 'Pasif'} color={data.musteri.aktif ? 'success' : 'default'} />
            )}
          </Box>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: { xs: 1.5, sm: 3 } }}>
          {loading && !data ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
          ) : (
            <>
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}><SummaryCard label="Toplam Borç" value={account.ozet?.toplam_borc} color="#b45309" /></Grid>
                <Grid item xs={12} sm={4}><SummaryCard label="Toplam Tahsilat" value={account.ozet?.toplam_tahsilat} color="#047857" /></Grid>
                <Grid item xs={12} sm={4}><SummaryCard label="Kalan Borç" value={account.ozet?.kalan_bakiye} color="#1d4ed8" /></Grid>
              </Grid>

              <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" allowScrollButtonsMobile sx={{ mb: 2 }}>
                <Tab icon={<AccountIcon />} iconPosition="start" label="Cari Hesap" />
                <Tab icon={<HistoryIcon />} iconPosition="start" label="Geçmiş Operasyonlar" />
              </Tabs>

              {tab === 0 && (
                <Stack spacing={2}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography fontWeight={700} gutterBottom>Yeni Cari Hareket</Typography>
                      <Grid container spacing={1.5} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <TextField select fullWidth size="small" label="İşlem" value={form.hareket_tipi}
                            onChange={(e) => setForm((prev) => ({ ...prev, hareket_tipi: e.target.value }))}>
                            <MenuItem value="TAHSILAT">Tahsilat</MenuItem>
                            {isAdmin && <MenuItem value="BORC">Manuel Borç</MenuItem>}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField fullWidth size="small" label="Tutar" value={form.tutar} inputProps={{ inputMode: 'decimal' }}
                            onChange={(e) => setForm((prev) => ({ ...prev, tutar: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField fullWidth size="small" type="date" label="Tarih" InputLabelProps={{ shrink: true }} value={form.islem_tarihi}
                            onChange={(e) => setForm((prev) => ({ ...prev, islem_tarihi: e.target.value }))} />
                        </Grid>
                        {form.hareket_tipi === 'TAHSILAT' && (
                          <Grid item xs={12} sm={3}>
                            <TextField select fullWidth size="small" label="Ödeme Yöntemi" value={form.odeme_yontemi}
                              onChange={(e) => setForm((prev) => ({ ...prev, odeme_yontemi: e.target.value }))}>
                              <MenuItem value="NAKIT">Nakit</MenuItem>
                              <MenuItem value="HAVALE_EFT">Havale / EFT</MenuItem>
                              <MenuItem value="KART">Kart</MenuItem>
                              <MenuItem value="DIGER">Diğer</MenuItem>
                            </TextField>
                          </Grid>
                        )}
                        <Grid item xs={12} sm={9}>
                          <TextField fullWidth size="small" label="Açıklama / Not" value={form.aciklama}
                            onChange={(e) => setForm((prev) => ({ ...prev, aciklama: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Button fullWidth variant="contained" disabled={saving || !form.tutar} onClick={submitTransaction}>
                            {saving ? <CircularProgress size={22} /> : 'Kaydet'}
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table size="small" sx={{ minWidth: 780 }}>
                      <TableHead><TableRow>
                        <TableCell>Tarih</TableCell><TableCell>İşlem</TableCell><TableCell>Kaynak</TableCell><TableCell>Açıklama</TableCell>
                        <TableCell align="right">Borç</TableCell><TableCell align="right">Tahsilat</TableCell>
                        <TableCell align="right">Bakiye</TableCell>{isAdmin && <TableCell align="center">Düzelt</TableCell>}
                      </TableRow></TableHead>
                      <TableBody>
                        {!account.hareketler?.length ? (
                          <TableRow><TableCell colSpan={isAdmin ? 8 : 7} align="center" sx={{ py: 5 }}>Henüz cari hareket yok.</TableCell></TableRow>
                        ) : account.hareketler.map((item) => {
                          const isDebit = ['BORC', 'BORC_DUZELTME', 'TAHSILAT_TERS'].includes(item.hareket_tipi);
                          const isReversal = ['BORC_TERS', 'TAHSILAT_TERS'].includes(item.hareket_tipi);
                          return (
                            <TableRow key={item.id} sx={{ opacity: isReversal ? 0.72 : 1 }}>
                              <TableCell>{formatDate(item.islem_tarihi)}</TableCell>
                              <TableCell><Chip size="small" label={item.hareket_tipi.replaceAll('_', ' ')} color={isDebit ? 'warning' : 'success'} variant="outlined" /></TableCell>
                              <TableCell>{item.referans_tipi ? `${sourceLabels[item.referans_tipi] || item.referans_tipi} #${item.referans_id}` : 'Manuel'}</TableCell>
                              <TableCell>{item.aciklama || '-'}</TableCell>
                              <TableCell align="right">{isDebit ? formatCurrency(item.tutar) : '-'}</TableCell>
                              <TableCell align="right">{!isDebit ? formatCurrency(item.tutar) : '-'}</TableCell>
                              <TableCell align="right"><b>{formatCurrency(item.bakiye)}</b></TableCell>
                              {isAdmin && <TableCell align="center">
                                <Tooltip title={item.ters_cevrildi ? 'Daha önce ters çevrildi' : 'Ters kayıt oluştur'}>
                                  <span><IconButton size="small" disabled={item.otomatik || item.ters_cevrildi || isReversal} onClick={() => reverseTransaction(item)}><UndoIcon fontSize="small" /></IconButton></span>
                                </Tooltip>
                              </TableCell>}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              )}

              {tab === 1 && (
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 680 }}>
                    <TableHead><TableRow><TableCell>Tarih</TableCell><TableCell>Kaynak</TableCell><TableCell>İşlem</TableCell><TableCell>Durum</TableCell><TableCell align="right">Toplam</TableCell><TableCell align="right">Kayıtlı Ödeme</TableCell><TableCell align="right">Açık Tutar</TableCell><TableCell align="center">Cari Durumu</TableCell></TableRow></TableHead>
                    <TableBody>
                      {!data?.operasyonlar?.length ? (
                        <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5 }}>Eşleşen geçmiş operasyon bulunamadı.</TableCell></TableRow>
                      ) : data.operasyonlar.map((item) => (
                        <TableRow key={`${item.kaynak}-${item.id}`}>
                          <TableCell>{formatDate(item.tarih)}</TableCell><TableCell>{sourceLabels[item.kaynak] || item.kaynak.replaceAll('_', ' ')}</TableCell>
                          <TableCell>{item.baslik || '-'}</TableCell><TableCell>{item.durum || '-'}</TableCell><TableCell align="right">{formatCurrency(item.tutar)}</TableCell>
                          <TableCell align="right">{item.kaynak === 'SERVIS' ? 'Belirtilmemiş' : formatCurrency(item.odenen_tutar)}</TableCell>
                          <TableCell align="right"><b>{formatCurrency(item.onerilen_borc)}</b></TableCell>
                          <TableCell align="center"><Chip size="small" color={Number(item.onerilen_borc) > 0 ? 'warning' : 'success'} variant="outlined" label={Number(item.onerilen_borc) > 0 ? 'Otomatik borç' : 'Kapandı'} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions><Button onClick={onClose}>Kapat</Button></DialogActions>
      </Dialog>
      <Snackbar open={Boolean(notice)} autoHideDuration={4500} onClose={() => setNotice(null)}>
        <Alert severity={notice?.severity || 'info'} onClose={() => setNotice(null)}>{notice?.text}</Alert>
      </Snackbar>
    </>
  );
}

export default MusteriDetayDialog;
