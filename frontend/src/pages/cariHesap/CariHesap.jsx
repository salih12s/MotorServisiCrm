import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, FormControl,
  IconButton, InputAdornment, MenuItem, Select, Snackbar, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, Typography,
} from '@mui/material';
import {
  AccountBalanceWallet as BalanceIcon, Clear as ClearIcon, History as HistoryIcon,
  Payments as PaymentsIcon, ReceiptLong as ReceiptIcon, Search as SearchIcon,
} from '@mui/icons-material';
import {
  aksesuarService, bisikletSatisService, isEmriService, motorSatisService, musteriService,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MusteriDetayDialog from '../musteriler/MusteriDetayDialog';

const currency = (value) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(value || 0));
const sourceInfo = {
  MOTOR_SATISI: { label: 'Satış', color: '#2563eb', bg: '#eff6ff' },
  SERVIS: { label: 'Servis', color: '#ca8a04', bg: '#fefce8' },
  AKSESUAR: { label: 'Aksesuar', color: '#7c3aed', bg: '#f5f3ff' },
  HOBI_GRUP: { label: 'Hobi Grup', color: '#0891b2', bg: '#ecfeff' },
};
const completionService = {
  MOTOR_SATISI: motorSatisService,
  SERVIS: isEmriService,
  AKSESUAR: aksesuarService,
  HOBI_GRUP: bisikletSatisService,
};

function SummaryCard({ label, value, icon, color }) {
  return <Card variant="outlined" sx={{ borderColor: `${color}44` }}><CardContent sx={{ py: 1.5, display: 'flex', gap: 1.5, alignItems: 'center', '&:last-child': { pb: 1.5 } }}>
    <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${color}16`, color, display: 'grid', placeItems: 'center' }}>{icon}</Box>
    <Box><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="h6" fontWeight={900}>{value}</Typography></Box>
  </CardContent></Card>;
}

function CariHesap() {
  const [rows, setRows] = useState([]);
  const [overview, setOverview] = useState({});
  const [summary, setSummary] = useState({});
  const [filter, setFilter] = useState('tumu');
  const [search, setSearch] = useState('');
  const [amounts, setAmounts] = useState({});
  const [mixedAmounts, setMixedAmounts] = useState({});
  const [methods, setMethods] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [notice, setNotice] = useState(null);
  const { user } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [receivables, financial] = await Promise.all([
        musteriService.getReceivables({ kaynak: filter, bekleyenlerin_tumu: true }),
        musteriService.getFinancialSummary(),
      ]);
      setRows(receivables.data.data || []);
      setOverview(receivables.data.ozet || {});
      setSummary(financial.data || {});
    } catch (error) {
      setNotice({ severity: 'error', text: error.response?.data?.message || 'Kalan bakiyeler yüklenemedi.' });
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const visibleRows = useMemo(() => {
    const query = search.toLocaleLowerCase('tr-TR').trim();
    if (!query) return rows;
    return rows.filter((row) => `${row.musteri} ${row.telefon} ${row.aciklama}`.toLocaleLowerCase('tr-TR').includes(query));
  }, [rows, search]);

  const rowKey = (row) => `${row.kaynak}-${row.referans_id}`;
  const collect = async (row) => {
    const key = rowKey(row);
    const method = methods[key] || 'NAKIT';
    const mixed = mixedAmounts[key] || {};
    const payments = method === 'KARISIK'
      ? [
          { odeme_yontemi: 'NAKIT', tutar: Number(mixed.NAKIT || 0) },
          { odeme_yontemi: 'KART', tutar: Number(mixed.KART || 0) },
          { odeme_yontemi: 'HAVALE_EFT', tutar: Number(mixed.HAVALE_EFT || 0) },
        ].filter((payment) => payment.tutar > 0)
      : [{ odeme_yontemi: method, tutar: Number(amounts[key]) }];
    const amount = payments.reduce((sum, payment) => sum + payment.tutar, 0);
    if (!amount || amount <= 0) return setNotice({ severity: 'warning', text: 'Tahsilat tutarını girin.' });
    if (amount > Number(row.kalan) + .005) return setNotice({ severity: 'warning', text: 'Tahsilat kalan bakiyeyi aşamaz.' });
    setSaving(key);
    try {
      await musteriService.collectReceivable({ musteri_id: row.musteri_id, kaynak: row.kaynak, referans_id: row.referans_id, odemeler: payments });
      setAmounts((prev) => ({ ...prev, [key]: '' }));
      setMixedAmounts((prev) => ({ ...prev, [key]: {} }));
      setNotice({ severity: 'success', text: `${currency(amount)} tahsilat kaydedildi.` });
      await load();
    } catch (error) {
      setNotice({ severity: 'error', text: error.response?.data?.message || 'Tahsilat kaydedilemedi.' });
    } finally { setSaving(null); }
  };

  const closeDebt = async (row) => {
    const key = rowKey(row);
    if (Number(row.kalan) > 0) {
      return setNotice({ severity: 'warning', text: 'Borcu kalan işlem kapatılamaz.' });
    }
    const service = completionService[row.kaynak];
    if (!service?.bulkComplete) {
      return setNotice({ severity: 'error', text: 'Bu işlem kaynağı kapatmayı desteklemiyor.' });
    }
    setSaving(key);
    try {
      await service.bulkComplete([Number(row.referans_id)]);
      setNotice({ severity: 'success', text: 'Borcu olmayan işlem kapatıldı ve Cari Hesaptan kaldırıldı.' });
      await load();
    } catch (error) {
      setNotice({ severity: 'error', text: error.response?.data?.message || 'İşlem kapatılamadı.' });
    } finally { setSaving(null); }
  };

  return <Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0,1fr))' }, gap: 1.5, mb: 2 }}>
      <SummaryCard label="Toplam Kalan Bakiye" value={currency(overview.toplam_acik_bakiye)} icon={<BalanceIcon />} color="#ea580c" />
      <SummaryCard label="Bekleyen İşlem" value={overview.acik_islem_sayisi || 0} icon={<ReceiptIcon />} color="#2563eb" />
      <SummaryCard label="Bugünkü Tahsilat" value={currency(summary.bugunku_tahsilat)} icon={<PaymentsIcon />} color="#059669" />
    </Box>

    <Card sx={{ mb: 2 }}><CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}><Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
      <Tabs value={filter} onChange={(_, value) => setFilter(value)} variant="scrollable" scrollButtons="auto">
        <Tab value="tumu" label="Tümü" /><Tab value="satis" label="Satış" /><Tab value="servis" label="Servis" />
        <Tab value="hobi" label="Hobi Grup" /><Tab value="aksesuar" label="Aksesuar" />
      </Tabs>
      <TextField size="small" placeholder="Müşteri, telefon veya işlem ara" value={search} onChange={(event) => setSearch(event.target.value)} sx={{ width: { xs: '100%', sm: 340 } }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>, endAdornment: search ? <InputAdornment position="end"><IconButton size="small" onClick={() => setSearch('')}><ClearIcon fontSize="small" /></IconButton></InputAdornment> : null }} />
    </Box></CardContent></Card>

    {loading ? <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box> : <Card>
      <TableContainer sx={{ overflowX: 'auto' }}><Table size="small" sx={{
        minWidth: 1210,
        tableLayout: 'fixed',
        '& th': { py: 1, px: 1, fontSize: '0.78rem', fontWeight: 800, whiteSpace: 'nowrap' },
        '& td': { py: 0.8, px: 1, fontSize: '0.78rem', verticalAlign: 'middle' },
      }}>
        <TableHead><TableRow><TableCell sx={{ width: 120 }}>Müşteri</TableCell><TableCell sx={{ width: 75 }}>Kaynak</TableCell><TableCell sx={{ width: 150 }}>İşlem</TableCell><TableCell align="right" sx={{ width: 95 }}>Toplam</TableCell><TableCell align="right" sx={{ width: 95 }}>Ödenen</TableCell><TableCell align="right" sx={{ width: 105 }}>Kalan</TableCell><TableCell sx={{ width: 120 }}>Ödeme Yöntemi</TableCell><TableCell sx={{ width: 190 }}>Tahsilat</TableCell><TableCell align="center" sx={{ width: 260 }}>İşlem</TableCell></TableRow></TableHead>
        <TableBody>{!visibleRows.length ? <TableRow><TableCell colSpan={9} align="center" sx={{ py: 7 }}><Typography color="text.secondary">Bu filtrede bekleyen işlem bulunmuyor.</Typography></TableCell></TableRow> : visibleRows.map((row) => {
          const key = rowKey(row); const info = sourceInfo[row.kaynak] || sourceInfo.SERVIS; const highDebt = Number(row.kalan) >= 100000; const hasDebt = Number(row.kalan) > 0;
          return <TableRow key={key} hover>
            <TableCell><Typography fontWeight={800} fontSize="0.82rem" noWrap>{row.musteri}</Typography><Typography variant="caption" color="text.secondary" noWrap>{row.telefon || '-'}</Typography></TableCell>
            <TableCell><Chip size="small" label={info.label} sx={{ color: info.color, bgcolor: info.bg, fontWeight: 800 }} /></TableCell>
            <TableCell><Typography fontWeight={700} fontSize="0.8rem" noWrap>{row.aciklama}</Typography><Typography variant="caption" color="text.secondary">#{row.referans_id}</Typography></TableCell>
            <TableCell align="right">{currency(row.toplam)}</TableCell><TableCell align="right" sx={{ color: '#059669', fontWeight: 700 }}>{currency(row.odenen)}</TableCell>
            <TableCell align="right"><Box sx={{ display: 'inline-block', px: 1.2, py: .65, borderRadius: 1.5, bgcolor: highDebt ? '#fee2e2' : '#ffedd5', color: highDebt ? '#b91c1c' : '#c2410c', fontWeight: 900 }}>{currency(row.kalan)}</Box></TableCell>
            <TableCell><FormControl size="small" fullWidth disabled={!hasDebt}><Select value={methods[key] || 'NAKIT'} onChange={(event) => setMethods((prev) => ({ ...prev, [key]: event.target.value }))} sx={{ fontSize: '0.75rem' }}><MenuItem value="NAKIT">🟢 Nakit</MenuItem><MenuItem value="KART">🔵 Kart</MenuItem><MenuItem value="HAVALE_EFT">🟣 Havale</MenuItem><MenuItem value="KARISIK">🟠 Karışık</MenuItem></Select></FormControl></TableCell>
            <TableCell>{(methods[key] || 'NAKIT') === 'KARISIK' ? <Box sx={{ display: 'grid', gap: .5 }}>
              {[['NAKIT', 'Nakit'], ['KART', 'Kart'], ['HAVALE_EFT', 'Havale']].map(([paymentMethod, label]) => <TextField key={paymentMethod} size="small" type="number" label={label} disabled={!hasDebt} value={mixedAmounts[key]?.[paymentMethod] || ''} onChange={(event) => setMixedAmounts((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), [paymentMethod]: event.target.value } }))} inputProps={{ min: 0, max: row.kalan, step: .01 }} fullWidth />)}
            </Box> : <TextField size="small" type="number" disabled={!hasDebt} value={amounts[key] || ''} onChange={(event) => setAmounts((prev) => ({ ...prev, [key]: event.target.value }))} placeholder="Tutar" inputProps={{ min: .01, max: row.kalan, step: .01 }} fullWidth />}</TableCell>
            <TableCell align="center"><Box sx={{ display: 'flex', gap: .5, justifyContent: 'center', alignItems: 'center' }}>{hasDebt ? <Button size="small" variant="contained" disabled={saving === key} onClick={() => collect(row)} sx={{ px: 1, minWidth: 80, fontSize: '0.7rem' }}>Tahsil Et</Button> : <><Chip size="small" label="Borç Yok" color="success" variant="outlined" /><Button size="small" variant="contained" color="success" disabled={saving === key} onClick={() => closeDebt(row)} sx={{ px: 1, minWidth: 96, fontSize: '0.7rem' }}>Borcu Kapat</Button></>}<Tooltip title="Hareket geçmişi"><IconButton size="small" onClick={() => setDetailId(row.musteri_id)}><HistoryIcon fontSize="small" /></IconButton></Tooltip></Box></TableCell>
          </TableRow>;
        })}</TableBody>
      </Table></TableContainer>
    </Card>}

    <MusteriDetayDialog open={Boolean(detailId)} customerId={detailId} onClose={() => setDetailId(null)} user={user} onChanged={load} />
    <Snackbar open={Boolean(notice)} autoHideDuration={4500} onClose={() => setNotice(null)}><Alert severity={notice?.severity || 'info'} onClose={() => setNotice(null)}>{notice?.text}</Alert></Snackbar>
  </Box>;
}

export default CariHesap;
