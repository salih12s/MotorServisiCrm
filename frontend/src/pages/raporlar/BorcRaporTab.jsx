import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
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
  AccountBalanceWallet as AccountIcon,
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
  OpenInNew as OpenInNewIcon,
  Payments as PaymentsIcon,
  People as PeopleIcon,
  ReceiptLong as ReceiptIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { musteriService } from '../../services/api';
import MusteriDetayDialog from '../musteriler/MusteriDetayDialog';

const currency = (value) => new Intl.NumberFormat('tr-TR', {
  style: 'currency', currency: 'TRY', minimumFractionDigits: 2, maximumFractionDigits: 2,
}).format(Number(value || 0));

const date = (value) => value
  ? new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
  : '-';

const sourceInfo = {
  MOTOR_SATISI: { label: 'Motor Satışı', color: '#2563eb', bg: '#eff6ff' },
  SERVIS: { label: 'Servis', color: '#ca8a04', bg: '#fefce8' },
  AKSESUAR: { label: 'Aksesuar', color: '#7c3aed', bg: '#f5f3ff' },
  HOBI_GRUP: { label: 'Hobi Grup', color: '#0891b2', bg: '#ecfeff' },
  MANUEL: { label: 'Manuel', color: '#475569', bg: '#f1f5f9' },
};

const movementLabel = {
  BORC: 'Borç',
  TAHSILAT: 'Tahsilat',
  BORC_TERS: 'Borç ters kaydı',
  TAHSILAT_TERS: 'Tahsilat ters kaydı',
};

function SummaryCard({ label, value, icon, color, currencyValue = false }) {
  return (
    <Card variant="outlined" sx={{ borderColor: `${color}44`, height: '100%' }}>
      <CardContent sx={{ py: 1.5, display: 'flex', gap: 1.25, alignItems: 'center', '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: `${color}15`, color, display: 'grid', placeItems: 'center' }}>{icon}</Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
          <Typography variant="h6" fontWeight={900} noWrap>{currencyValue ? currency(value) : value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function BorcRaporTab({ user, navigate }) {
  const [rows, setRows] = useState([]);
  const [financial, setFinancial] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('TUMU');
  const [sort, setSort] = useState('BORC_DESC');
  const [expandedId, setExpandedId] = useState(null);
  const [accounts, setAccounts] = useState({});
  const [accountLoading, setAccountLoading] = useState(null);
  const [detailId, setDetailId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [receivables, summary] = await Promise.all([
        musteriService.getReceivables({ kaynak: 'tumu' }),
        musteriService.getFinancialSummary(),
      ]);
      setRows(receivables.data?.data || []);
      setFinancial(summary.data || {});
      setAccounts({});
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Borç raporu yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const debtors = useMemo(() => {
    const selectedRows = source === 'TUMU' ? rows : rows.filter((row) => row.kaynak === source);
    const grouped = new Map();
    selectedRows.forEach((row) => {
      const current = grouped.get(row.musteri_id) || {
        id: row.musteri_id,
        name: row.musteri,
        phone: row.telefon,
        total: 0,
        paid: 0,
        remaining: 0,
        oldestDate: row.tarih,
        sources: new Set(),
        rows: [],
      };
      current.total += Number(row.toplam || 0);
      current.paid += Number(row.odenen || 0);
      current.remaining += Number(row.kalan || 0);
      current.oldestDate = !current.oldestDate || new Date(row.tarih) < new Date(current.oldestDate) ? row.tarih : current.oldestDate;
      current.sources.add(row.kaynak);
      current.rows.push(row);
      grouped.set(row.musteri_id, current);
    });

    const query = search.toLocaleLowerCase('tr-TR').trim();
    const result = [...grouped.values()].filter((debtor) => (
      !query || `${debtor.name} ${debtor.phone || ''} ${debtor.rows.map((row) => row.aciklama).join(' ')}`
        .toLocaleLowerCase('tr-TR').includes(query)
    ));
    result.forEach((debtor) => debtor.rows.sort((a, b) => Number(b.kalan) - Number(a.kalan)));
    return result.sort((a, b) => {
      if (sort === 'BORC_ASC') return a.remaining - b.remaining;
      if (sort === 'AD') return a.name.localeCompare(b.name, 'tr');
      if (sort === 'ESKI') return new Date(a.oldestDate) - new Date(b.oldestDate);
      return b.remaining - a.remaining;
    });
  }, [rows, search, source, sort]);

  const filteredRemaining = debtors.reduce((sum, debtor) => sum + debtor.remaining, 0);
  const filteredOperations = debtors.reduce((sum, debtor) => sum + debtor.rows.length, 0);

  const toggleDebtor = async (customerId) => {
    if (expandedId === customerId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(customerId);
    if (accounts[customerId]) return;
    setAccountLoading(customerId);
    try {
      const response = await musteriService.getAccount(customerId);
      setAccounts((current) => ({ ...current, [customerId]: response.data }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Cari hareketler yüklenemedi.');
    } finally {
      setAccountLoading(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5, mb: 2 }}>
        <SummaryCard label="Toplam Açık Borç" value={filteredRemaining} icon={<AccountIcon />} color="#dc2626" currencyValue />
        <SummaryCard label="Borçlu Müşteri" value={debtors.length} icon={<PeopleIcon />} color="#7c3aed" />
        <SummaryCard label="Açık İşlem" value={filteredOperations} icon={<ReceiptIcon />} color="#2563eb" />
        <SummaryCard label="Bugünkü Tahsilat" value={financial.bugunku_tahsilat} icon={<PaymentsIcon />} color="#059669" currencyValue />
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(260px, 1fr) 190px 190px auto auto' }, gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Müşteri, telefon veya işlem ara"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />
            <FormControl size="small">
              <Select value={source} onChange={(event) => setSource(event.target.value)}>
                <MenuItem value="TUMU">Tüm Kaynaklar</MenuItem>
                <MenuItem value="MOTOR_SATISI">Motor Satışı</MenuItem>
                <MenuItem value="SERVIS">Servis</MenuItem>
                <MenuItem value="AKSESUAR">Aksesuar</MenuItem>
                <MenuItem value="HOBI_GRUP">Hobi Grup</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <Select value={sort} onChange={(event) => setSort(event.target.value)}>
                <MenuItem value="BORC_DESC">En Yüksek Borç</MenuItem>
                <MenuItem value="BORC_ASC">En Düşük Borç</MenuItem>
                <MenuItem value="AD">Müşteri Adı</MenuItem>
                <MenuItem value="ESKI">En Eski Borç</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load}>Yenile</Button>
            <Button variant="contained" startIcon={<OpenInNewIcon />} onClick={() => navigate('/cari-hesap')}>Cari Hesap</Button>
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {loading ? (
        <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>
      ) : (
        <Card>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#fff1f2' }}>
                  <TableCell sx={{ width: 42 }} />
                  <TableCell sx={{ fontWeight: 800 }}>Borçlu</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Kaynaklar</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Açık İşlem</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Toplam</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Ödenen</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Kalan Borç</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>En Eski İşlem</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Detay</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!debtors.length ? (
                  <TableRow><TableCell colSpan={9} align="center" sx={{ py: 7 }}><Typography color="text.secondary">Filtrelere uygun açık borç bulunmuyor.</Typography></TableCell></TableRow>
                ) : debtors.map((debtor) => {
                  const expanded = expandedId === debtor.id;
                  const account = accounts[debtor.id];
                  return (
                    <React.Fragment key={debtor.id}>
                      <TableRow hover selected={expanded} sx={{ '& td': { py: 1 } }}>
                        <TableCell padding="checkbox">
                          <IconButton size="small" onClick={() => toggleDebtor(debtor.id)} aria-label={`${debtor.name} borç detayını aç`}>
                            <ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                          </IconButton>
                        </TableCell>
                        <TableCell><Typography fontWeight={800}>{debtor.name}</Typography><Typography variant="caption" color="text.secondary">{debtor.phone || 'Telefon yok'}</Typography></TableCell>
                        <TableCell><Box sx={{ display: 'flex', gap: .5, flexWrap: 'wrap' }}>{[...debtor.sources].map((item) => { const info = sourceInfo[item] || sourceInfo.MANUEL; return <Chip key={item} label={info.label} size="small" sx={{ color: info.color, bgcolor: info.bg, fontWeight: 700 }} />; })}</Box></TableCell>
                        <TableCell align="center"><Chip label={debtor.rows.length} size="small" /></TableCell>
                        <TableCell align="right">{currency(debtor.total)}</TableCell>
                        <TableCell align="right" sx={{ color: '#059669', fontWeight: 700 }}>{currency(debtor.paid)}</TableCell>
                        <TableCell align="right"><Typography fontWeight={900} sx={{ color: '#b91c1c' }}>{currency(debtor.remaining)}</Typography></TableCell>
                        <TableCell>{date(debtor.oldestDate)}</TableCell>
                        <TableCell align="center"><Tooltip title="Tüm müşteri ve cari detayları"><IconButton color="primary" onClick={() => setDetailId(debtor.id)}><HistoryIcon /></IconButton></Tooltip></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={9} sx={{ p: 0, borderBottom: expanded ? undefined : 0 }}>
                          <Collapse in={expanded} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2, bgcolor: '#f8fafc' }}>
                              <Typography fontWeight={900} mb={1}>Açık Borç Detayları</Typography>
                              <TableContainer sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                <Table size="small">
                                  <TableHead><TableRow><TableCell>Kaynak</TableCell><TableCell>Tarih</TableCell><TableCell>İşlem</TableCell><TableCell align="right">Toplam</TableCell><TableCell align="right">Ödenen</TableCell><TableCell align="right">Kalan</TableCell></TableRow></TableHead>
                                  <TableBody>{debtor.rows.map((row) => { const info = sourceInfo[row.kaynak] || sourceInfo.MANUEL; return <TableRow key={`${row.kaynak}-${row.referans_id}`}><TableCell><Chip label={info.label} size="small" sx={{ color: info.color, bgcolor: info.bg }} /></TableCell><TableCell>{date(row.tarih)}</TableCell><TableCell><Typography fontWeight={700}>{row.aciklama}</Typography><Typography variant="caption" color="text.secondary">Referans #{row.referans_id}</Typography></TableCell><TableCell align="right">{currency(row.toplam)}</TableCell><TableCell align="right" sx={{ color: '#059669' }}>{currency(row.odenen)}</TableCell><TableCell align="right" sx={{ color: '#b91c1c', fontWeight: 800 }}>{currency(row.kalan)}</TableCell></TableRow>; })}</TableBody>
                                </Table>
                              </TableContainer>

                              <Typography fontWeight={900} mt={2} mb={1}>Son Cari Hareketler</Typography>
                              {accountLoading === debtor.id ? <CircularProgress size={24} /> : (
                                <TableContainer sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                  <Table size="small">
                                    <TableHead><TableRow><TableCell>Tarih</TableCell><TableCell>Hareket</TableCell><TableCell>Açıklama</TableCell><TableCell>Ödeme</TableCell><TableCell align="right">Tutar</TableCell><TableCell align="right">Bakiye</TableCell></TableRow></TableHead>
                                    <TableBody>{(account?.hareketler || []).slice(0, 10).map((movement) => <TableRow key={movement.id}><TableCell>{date(movement.islem_tarihi)}</TableCell><TableCell>{movementLabel[movement.hareket_tipi] || movement.hareket_tipi}</TableCell><TableCell>{movement.aciklama || '-'}</TableCell><TableCell>{movement.odeme_yontemi || '-'}</TableCell><TableCell align="right" sx={{ color: movement.hareket_tipi?.startsWith('TAHSILAT') ? '#059669' : '#b91c1c', fontWeight: 700 }}>{currency(movement.tutar)}</TableCell><TableCell align="right">{currency(movement.bakiye)}</TableCell></TableRow>)}</TableBody>
                                  </Table>
                                </TableContainer>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <MusteriDetayDialog open={Boolean(detailId)} customerId={detailId} onClose={() => setDetailId(null)} user={user} onChanged={load} />
    </Box>
  );
}

export default BorcRaporTab;
