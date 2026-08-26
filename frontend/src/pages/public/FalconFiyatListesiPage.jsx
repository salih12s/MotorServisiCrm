import React, { useMemo, useState } from 'react';
import {
  Box, Button, Chip, Container, Divider, InputAdornment, Paper, Stack, Tab, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon, CreditCard as CreditCardIcon, OpenInNew as OpenIcon,
  PriceCheck as PriceCheckIcon, Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import SiteFooter from '../../components/SiteFooter';
import falconMotors from '../../data/falconMotors';

const money = (value) => value ? value.replace(/\s*TL$/i, ' ₺') : '——';

function FalconTable({ items, navigate }) {
  return (
    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(54,197,211,.15)', background: 'rgba(255,255,255,.03)', overflow: 'hidden' }}>
      <Table size="small" sx={{ minWidth: 760 }}>
        <TableHead><TableRow sx={{ background: 'linear-gradient(135deg, rgba(4,167,184,.18), rgba(54,197,211,.10))' }}>
          {['Resim', 'Model', 'Nakit Fiyat', 'Taksitli Fiyat', 'Ürünü İncele'].map((title, index) => (
            <TableCell key={title} align={index === 4 ? 'right' : 'left'} sx={{ color: '#36C5D3', fontWeight: 700, py: 1.5, borderBottom: '1px solid rgba(54,197,211,.2)', display: { xs: index > 1 && index < 4 ? 'none' : 'table-cell', lg: 'table-cell' } }}>{title}</TableCell>
          ))}
        </TableRow></TableHead>
        <TableBody>{items.map((motor, index) => (
          <TableRow key={motor.id} sx={{ '& td': { borderBottom: index < items.length - 1 ? '1px solid rgba(54,197,211,.08)' : 'none' }, '&:hover': { background: 'rgba(54,197,211,.06)' } }}>
            <TableCell sx={{ py: 1.5 }}><Box sx={{ width: { xs: 52, sm: 70 }, height: { xs: 40, sm: 52 }, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,.92)', border: '1px solid rgba(54,197,211,.12)', display: 'grid', placeItems: 'center', p: .5 }}><Box component="img" src={motor.coverImage} alt={motor.name} loading="lazy" sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} /></Box></TableCell>
            <TableCell sx={{ py: 1.5 }}><Typography sx={{ fontWeight: 700, color: '#fff' }}>{motor.name}</Typography><Stack sx={{ display: { xs: 'flex', lg: 'none' }, mt: .5 }}><Typography variant="caption" color="#fff">Nakit: {money(motor.price)}</Typography><Typography variant="caption" color="rgba(255,255,255,.6)">Taksitli: {money(motor.installmentPrice)}</Typography></Stack></TableCell>
            <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{motor.price ? <Typography sx={{ color: '#fff', fontWeight: 600 }}>{money(motor.price)}</Typography> : <Chip label="Fiyat Sorunuz" size="small" sx={{ color: '#36C5D3', border: '1px solid rgba(54,197,211,.3)' }} />}</TableCell>
            <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}><Typography sx={{ color: motor.installmentPrice ? '#fff' : 'rgba(255,255,255,.35)', fontWeight: motor.installmentPrice ? 600 : 400 }}>{money(motor.installmentPrice)}</Typography></TableCell>
            <TableCell align="right"><Button variant="contained" size="small" endIcon={<OpenIcon />} onClick={() => navigate(`/motorlar/${motor.id}`)} sx={{ background: 'linear-gradient(135deg,#04A7B8,#36C5D3)', color: '#fff', fontWeight: 700, textTransform: 'none', borderRadius: 2, whiteSpace: 'nowrap' }}>Ürünü İncele</Button></TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </TableContainer>
  );
}

function FalconFiyatListesiPage() {
  const navigate = useNavigate();
  const categories = useMemo(() => ['Tümü', ...new Set(falconMotors.map((motor) => motor.category))], []);
  const [category, setCategory] = useState('Tümü');
  const [search, setSearch] = useState('');
  const groups = useMemo(() => {
    const query = search.toLocaleLowerCase('tr-TR').trim();
    const visible = falconMotors.filter((motor) => (category === 'Tümü' || motor.category === category) && (!query || motor.name.toLocaleLowerCase('tr-TR').includes(query)));
    return [...new Set(visible.map((motor) => motor.category))].map((name) => ({ name, motors: visible.filter((motor) => motor.category === name) }));
  }, [category, search]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#02080f', color: '#fff', overflowX: 'hidden' }}>
      <PublicNav solid />
      <Box sx={{ pt: { xs: '72px', sm: '80px', md: '88px' }, pb: { xs: 4, md: 5 }, background: 'linear-gradient(180deg, rgba(4,167,184,.18) 0%, rgba(2,8,15,0) 100%)', borderBottom: '1px solid rgba(54,197,211,.12)' }}>
        <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 5 } }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/fiyat-listesi')} sx={{ color: 'rgba(255,255,255,.65)', mb: 2, textTransform: 'none', fontWeight: 700 }}>Marka Seçimine Dön</Button>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={1.5}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg,#04A7B8,#36C5D3)', display: 'grid', placeItems: 'center', boxShadow: '0 6px 20px rgba(54,197,211,.4)' }}><PriceCheckIcon /></Box>
            <Box><Typography component="h1" sx={{ fontWeight: 900, fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3rem' }, background: 'linear-gradient(135deg,#04A7B8,#7be3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>Falcon Fiyat Listesi</Typography><Typography sx={{ mt: .5, color: 'rgba(255,255,255,.6)' }}>2026 model yılı · Nakit ve taksitli tavsiye edilen satış fiyatları</Typography></Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ borderRadius: 3, border: '1px solid rgba(54,197,211,.2)', overflow: 'hidden', mb: { xs: 5, md: 7 } }}>
          <Box sx={{ px: 3, py: 2.5, background: 'linear-gradient(135deg,rgba(4,167,184,.18),rgba(54,197,211,.10))', borderBottom: '1px solid rgba(54,197,211,.15)', display: 'flex', alignItems: 'center', gap: 1.5 }}><Box sx={{ width: 36, height: 36, borderRadius: 1.5, background: 'linear-gradient(135deg,#04A7B8,#36C5D3)', display: 'grid', placeItems: 'center' }}><CreditCardIcon /></Box><Box><Typography fontWeight={800}>Taksit Seçenekleri</Typography><Typography variant="caption" color="rgba(255,255,255,.5)">Nakit ve kredi kartı ile ödeme seçenekleri</Typography></Box></Box>
          <Box sx={{ p: { xs: 1.5, sm: 2.5 }, background: 'rgba(255,255,255,.02)' }}><Box component="img" src="/Images/KrediKartlari.webp" alt="Taksit seçenekleri" sx={{ width: '100%', borderRadius: 2, display: 'block' }} /></Box>
        </Box>

        <TextField fullWidth placeholder="Falcon modeli ara..." value={search} onChange={(event) => setSearch(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#36C5D3' }} /></InputAdornment> }} sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 3, background: 'rgba(255,255,255,.04)', color: '#fff', '& fieldset': { borderColor: 'rgba(54,197,211,.25)' }, '&.Mui-focused fieldset': { borderColor: '#36C5D3' } }, '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,.35)', opacity: 1 } }} />
        <Box sx={{ borderRadius: 2.5, border: '1px solid rgba(54,197,211,.15)', background: 'rgba(255,255,255,.02)', overflow: 'hidden', mb: 4 }}><Tabs value={category} onChange={(_, value) => setCategory(value)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile sx={{ '& .MuiTab-root': { color: 'rgba(255,255,255,.5)', fontWeight: 600, textTransform: 'none' }, '& .Mui-selected': { color: '#36C5D3 !important', fontWeight: 700 }, '& .MuiTabs-indicator': { bgcolor: '#36C5D3', height: 3 } }}>{categories.map((item) => <Tab key={item} value={item} label={item} />)}</Tabs></Box>

        {!groups.length && <Box sx={{ py: 8, textAlign: 'center' }}><SearchIcon sx={{ fontSize: 48, color: 'rgba(54,197,211,.3)', mb: 2 }} /><Typography color="rgba(255,255,255,.5)">Aramanıza uygun Falcon modeli bulunamadı.</Typography></Box>}
        <Stack spacing={6}>{groups.map((group) => <Box key={group.name}><Stack direction="row" alignItems="center" spacing={2} mb={2.5}><Box sx={{ width: 4, height: 32, borderRadius: 2, background: 'linear-gradient(180deg,#04A7B8,#36C5D3)' }} /><Typography variant="h5" fontWeight={800}>{group.name}</Typography><Divider sx={{ flex: 1, borderColor: 'rgba(54,197,211,.15)' }} /><Typography color="rgba(255,255,255,.35)" fontSize=".78rem">{group.motors.length} model</Typography></Stack><FalconTable items={group.motors} navigate={navigate} /></Box>)}</Stack>

        <Box sx={{ mt: 6, p: 3, borderRadius: 3, background: 'rgba(54,197,211,.05)', border: '1px solid rgba(54,197,211,.15)' }}><Typography fontWeight={700} color="#36C5D3" mb={1}>Önemli Bilgi</Typography><Typography sx={{ fontSize: '.82rem', color: 'rgba(255,255,255,.55)', lineHeight: 1.7 }}>Listelenen tutarlar Falcon tarafından yayınlanan tavsiye edilen nakit ve taksitli satış fiyatlarıdır. Gerçek satış fiyatı ve stok durumu için mağazamızla iletişime geçiniz.</Typography></Box>
      </Container>
      <SiteFooter />
    </Box>
  );
}

export default FalconFiyatListesiPage;
