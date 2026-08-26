import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
  Paper,
  Divider,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
  PriceCheck as PriceCheckIcon,
  CreditCard as CreditCardIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import SiteFooter from '../../components/SiteFooter';
import motors from '../../data/motors';

// "İron X300", "Smarda – SMD X1" gibi liste adlarını motors.js kayıtlarıyla eşleştirir
const normalizeName = (name) =>
  name
    .toLocaleLowerCase('tr')
    .replace(/i̇/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9]/g, '');

const findMotorId = (itemName) => {
  const target = normalizeName(itemName);
  const motor =
    motors.find((m) => normalizeName(m.name) === target) ||
    motors.find((m) => target.startsWith(normalizeName(m.name)));
  return motor ? motor.id : null;
};

// Fiyatlar musattimotor.com/fiyat-listesi sayfasındaki tavsiye edilen satış fiyatlarıdır.
const priceData = [
  {
    category: 'Chopper',
    items: [
      { name: 'Dark Pow',         image: '/Images/Dark_pow.jpg',              fiyat: '374.900,00 ₺', taksitliFiyat: '435.400,00 ₺' },
      { name: 'Kai-Zen',          image: '/Images/Kai_zen.webp',             fiyat: '281.900,00 ₺', taksitliFiyat: '324.400,00 ₺' },
      { name: 'Milanio 250',      image: '/Images/Milanio_250.jpg',          fiyat: '260.750,00 ₺', taksitliFiyat: '299.700,00 ₺' },
      { name: 'Milanio S400',     image: '/Images/Milanio_s400.webp',        fiyat: null, taksitliFiyat: '379.500,00 ₺' },
      { name: 'King Pow',         image: '/Images/King_pow.webp',            fiyat: '323.800,00 ₺', taksitliFiyat: '372.400,00 ₺' },
      { name: 'X-Pow',            image: '/Images/X_pow.webp',               fiyat: null, yakinBayilerde: true },
      { name: 'Dark Pow Pro',     image: '/Images/Dark_pow_pro.webp',        fiyat: null, yakinBayilerde: true },
    ],
  },
  {
    category: 'Racing',
    items: [
      { name: 'M125R',      image: '/Images/M125r.webp',      fiyat: '154.600,00 ₺', taksitliFiyat: '177.750,00 ₺' },
      { name: 'M250R',      image: '/Images/m250r.webp',      fiyat: '225.900,00 ₺', taksitliFiyat: '259.800,00 ₺' },
      { name: 'Vitron 250', image: '/Images/vitron250.webp',  fiyat: null, yakinBayilerde: true },
    ],
  },
  {
    category: 'Scooter',
    items: [
      { name: 'Glamaro Max 125',            image: '/Images/Glamaro125.webp',               fiyat: '102.500,00 ₺', taksitliFiyat: '117.900,00 ₺' },
      { name: 'Glamaro Max 125 – Kameralı', image: '/Images/Glamaro_max125_kamerali.webp',  fiyat: '107.400,00 ₺', taksitliFiyat: '123.400,00 ₺' },
      { name: 'Lemuzin 125',                image: '/Images/Lemuzin_125.webp',              fiyat: '76.600,00 ₺', taksitliFiyat: '87.950,00 ₺' },
      { name: 'Bella 50',                   image: '/Images/bella50.webp',                  fiyat: '57.700,00 ₺', taksitliFiyat: '65.900,00 ₺' },
      { name: 'Rabel 50',                   image: '/Images/rabel50.webp',                  fiyat: '77.900,00 ₺', taksitliFiyat: '89.900,00 ₺' },
      { name: 'Siena 50',                   image: '/Images/Siena50.webp',                  fiyat: '74.900,00 ₺', taksitliFiyat: '86.400,00 ₺' },
      { name: 'Rajon 50X',                  image: '/Images/Rajon50x.webp',                 fiyat: '89.500,00 ₺', taksitliFiyat: '102.900,00 ₺' },
      { name: 'Atekon 200',                 image: '/Images/atekon200.webp',                fiyat: null, yakinBayilerde: true },
      { name: 'Siena 110',                  image: '/Images/siena110.webp',                 fiyat: '74.950,00 ₺', taksitliFiyat: '86.400,00 ₺' },
      { name: 'Rajon 125X',                 image: '/Images/rajox125x.webp',                fiyat: '93.900,00 ₺', taksitliFiyat: '107.900,00 ₺' },
    ],
  },
  {
    category: 'ATV',
    items: [
      { name: 'Rage 400',  image: '/Images/rage400.webp',  fiyat: null, yakinBayilerde: true },
      { name: 'İron X300', image: '/Images/ironx300.webp', fiyat: null, yakinBayilerde: true },
      { name: 'İron X250', image: '/Images/ironx250.webp', fiyat: null, yakinBayilerde: true },
      { name: 'İron X200', image: '/Images/ironx200.webp', fiyat: null, taksitliFiyat: '119.900,00 ₺' },
    ],
  },
  {
    category: 'UTV',
    items: [
      { name: 'Off Track', image: '/Images/OffTruck.jpg', fiyat: null, yakinBayilerde: true },
    ],
  },
  {
    category: 'E-Scooter',
    items: [
      { name: 'Sport 701 Pro',   image: '/Images/Sport701Pro.webp', fiyat: '105.900,00 ₺', taksitliFiyat: '121.900,00 ₺' },
      { name: 'Smarda – SMD X1', image: '/Images/SmardaSMDx1.png',  fiyat: '30.500,00 ₺', taksitliFiyat: '33.900,00 ₺' },
    ],
  },
  {
    category: 'E-Technology',
    items: [
      { name: 'Smarda – Marsilya Max 1600', image: '/Images/SmardaMarsilyamax1600.webp', fiyat: '107.850,00 ₺', taksitliFiyat: '123.900,00 ₺' },
      { name: 'Smarda – Soft Pro',          image: '/Images/SmardaSoftPro.webp',         fiyat: '69.800,00 ₺', taksitliFiyat: '80.450,00 ₺' },
      { name: 'Smarda – Violet 1200',       image: '/Images/SmardaViolet1200.webp',      fiyat: '93.850,00 ₺', taksitliFiyat: '107.900,00 ₺' },
      { name: 'Smarda – Tork Pro',          image: '/Images/SmardaTorkPro.webp',         fiyat: '88.950,00 ₺', taksitliFiyat: '102.500,00 ₺' },
      { name: 'Smarda – Dora 4000',         image: '/Images/SmardaDora400.webp',         fiyat: '107.950,00 ₺', taksitliFiyat: '124.400,00 ₺' },
      { name: 'Smarda – SMD X3',            image: '/Images/SmardaSMDx3.webp',           fiyat: null, yakinBayilerde: true },
    ],
  },
  {
    category: 'E-Car',
    items: [
      { name: 'Smarda – Elegolf',   image: '/Images/SmardaEleGolf.webp',   fiyat: null, yakinBayilerde: true },
      { name: 'Doch Pro 66000',     image: '/Images/DochPro66000.webp',    fiyat: '264.800,00 ₺', taksitliFiyat: '303.900,00 ₺' },
      { name: 'Smarda – Venedik',   image: '/Images/SmardaVenedik.webp',   fiyat: '170.900,00 ₺', taksitliFiyat: '194.800,00 ₺' },
      { name: 'Venedik Pro',        image: '/Images/VenedikPro.webp',      fiyat: '177.900,00 ₺', taksitliFiyat: '204.900,00 ₺' },
      { name: 'Smarda – Golftruck', image: '/Images/SmardaGolfTruck.webp', fiyat: null, yakinBayilerde: true },
    ],
  },
  {
    category: 'Cross',
    items: [
      { name: 'M-Truck250', image: '/Images/Mtruck250.webp', fiyat: null, yakinBayilerde: true },
    ],
  },
  {
    category: 'Su Araçları',
    items: [
      { name: 'Car Bot', image: '/Images/CarBot.webp', fiyat: null, yakinBayilerde: true },
    ],
  },
];

function TaksitSection() {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: '1px solid rgba(54,197,211,0.2)',
        overflow: 'hidden',
        mb: { xs: 5, md: 7 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: { xs: 2.5, sm: 3 }, py: { xs: 2, sm: 2.5 },
          background: 'linear-gradient(135deg, rgba(4,167,184,0.18) 0%, rgba(54,197,211,0.10) 100%)',
          borderBottom: '1px solid rgba(54,197,211,0.15)',
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}
      >
        <Box sx={{ width: 36, height: 36, borderRadius: 1.5, background: 'linear-gradient(135deg, #04A7B8, #36C5D3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(54,197,211,0.4)', flexShrink: 0 }}>
          <CreditCardIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.1rem' }, color: '#fff' }}>Taksit Seçenekleri</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Nakit & Kredi Kartı ile ödeme · Vade farksız taksit imkânı</Typography>
        </Box>
      </Box>

      {/* Taksit görseli */}
      <Box sx={{ p: { xs: 1.5, sm: 2.5 }, background: 'rgba(255,255,255,0.02)' }}>
        <img
          src="/Images/KrediKartlari.webp"
          alt="Taksit Seçenekleri - Ticari ve Bireysel Kartlar"
          style={{ width: '100%', borderRadius: 8, display: 'block' }}
        />
      </Box>
    </Box>
  );
}

function CategoryTable({ items, navigate }) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid rgba(54,197,211,0.15)',
        background: 'rgba(255,255,255,0.03)',
        overflow: 'hidden',
        mb: .5,
      }}
    >
      <Table size="small" sx={{ minWidth: 760 }}>
        <TableHead>
          <TableRow sx={{ background: 'linear-gradient(135deg, rgba(4,167,184,.18), rgba(54,197,211,.10))' }}>
            {['Resim', 'Model', 'Nakit Fiyat', 'Taksitli Fiyat', 'Ürünü İncele'].map((title, index) => (
              <TableCell key={title} align={index === 4 ? 'right' : 'left'} sx={{ color: '#36C5D3', fontWeight: 700, py: 1.5, borderBottom: '1px solid rgba(54,197,211,.2)', display: { xs: index > 1 && index < 4 ? 'none' : 'table-cell', lg: 'table-cell' } }}>{title}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, idx) => (
            <TableRow
              key={item.name}
              sx={{
                '& td': { borderBottom: idx < items.length - 1 ? '1px solid rgba(54,197,211,.08)' : 'none' },
                '&:hover': { background: 'rgba(54,197,211,.06)' },
              }}
            >
              <TableCell sx={{ py: 1.5 }}>
                <Box sx={{ width: { xs: 52, sm: 70 }, height: { xs: 40, sm: 52 }, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,.05)', border: '1px solid rgba(54,197,211,.12)', display: 'grid', placeItems: 'center', p: .5 }}>
                  <Box component="img" src={item.image} alt={item.name} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </Box>
              </TableCell>
              <TableCell sx={{ py: 1.5 }}>
                <Typography sx={{ fontWeight: 700, color: '#fff' }}>{item.name}</Typography>
                <Stack sx={{ display: { xs: 'flex', lg: 'none' }, mt: .5 }}><Typography variant="caption" color="#fff">Nakit: {item.fiyat || '——'}</Typography><Typography variant="caption" color="rgba(255,255,255,.6)">Taksitli: {item.taksitliFiyat || '——'}</Typography></Stack>
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{item.yakinBayilerde ? <Chip label="Yakında Bayilerde" size="small" sx={{ color: '#36C5D3', border: '1px solid rgba(54,197,211,.3)' }} /> : <Typography sx={{ color: '#fff', fontWeight: 600 }}>{item.fiyat || '——'}</Typography>}</TableCell>
              <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}><Typography sx={{ color: item.taksitliFiyat ? '#fff' : 'rgba(255,255,255,.35)', fontWeight: item.taksitliFiyat ? 600 : 400 }}>{item.taksitliFiyat || '——'}</Typography></TableCell>
              <TableCell align="right" sx={{ py: 1.5 }}>
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<OpenInNewIcon sx={{ fontSize: '0.85rem !important' }} />}
                  onClick={() => {
                    const motorId = findMotorId(item.name);
                    navigate(motorId ? `/motorlar/${motorId}` : '/motorlar');
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #04A7B8, #36C5D3)',
                    color: '#fff',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: { xs: 1.2, sm: 2 },
                    py: .6,
                    borderRadius: 2,
                    boxShadow: '0 4px 14px rgba(54,197,211,.35)',
                    whiteSpace: 'nowrap',
                    '&:hover': { boxShadow: '0 6px 20px rgba(54,197,211,.6)', transform: 'translateY(-1px)' },
                  }}
                >
                  Ürünü İncele
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function FiyatListesiPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0 = Tümü

  const categories = ['Tümü', ...priceData.map((g) => g.category)];

  const filteredData = priceData
    .filter((group) => activeTab === 0 || group.category === categories[activeTab])
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#02080f', color: '#fff', overflowX: 'hidden' }}>
      <PublicNav solid />

      {/* Hero Banner */}
      <Box
        sx={{
          pt: { xs: '72px', sm: '80px', md: '88px' },
          background: 'linear-gradient(180deg, rgba(4,167,184,0.18) 0%, rgba(2,8,15,0) 100%)',
          borderBottom: '1px solid rgba(54,197,211,.12)',
          pb: { xs: 4, md: 5 },
        }}
      >
        <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 5 } }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/fiyat-listesi')} sx={{ color: 'rgba(255,255,255,.65)', mb: 2, textTransform: 'none', fontWeight: 700 }}>
            Marka Seçimine Dön
          </Button>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            mb={1.5}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #04A7B8, #36C5D3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(54,197,211,0.4)',
                flexShrink: 0,
              }}
            >
              <PriceCheckIcon sx={{ color: '#fff', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3rem' },
                  background: 'linear-gradient(135deg, #04A7B8 0%, #36C5D3 50%, #7be3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                }}
              >
                Musatti Fiyat Listesi
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  color: 'rgba(255,255,255,.6)',
                  fontWeight: 400,
                }}
              >
                2026 Model Yılı · Musatti & Smarda Yetkili Bayii · Mersin
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              mt: 2,
              p: { xs: 1.5, sm: 2 },
              borderRadius: 2,
                background: 'rgba(54,197,211,.08)',
              border: '1px solid rgba(54,197,211,0.2)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#36C5D3',
                boxShadow: '0 0 8px #36C5D3',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.4 },
                },
              }}
            />
              <Typography sx={{ fontSize: { xs: '0.78rem', sm: '0.85rem' }, color: 'rgba(255,255,255,.75)' }}>
              Fiyatlar bilgi amaçlıdır, güncel fiyat için bizimle iletişime geçiniz.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>

        <TaksitSection />

        {/* Arama & Kategori Filtreleme */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          {/* Arama */}
          <TextField
            fullWidth
            placeholder="Motor ara... (örn: Dark Pow, M250R, Scooter...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#36C5D3' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                background: 'rgba(255,255,255,.04)',
                color: '#fff',
                '& fieldset': { borderColor: 'rgba(54,197,211,0.25)' },
                '&:hover fieldset': { borderColor: 'rgba(54,197,211,0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#36C5D3' },
              },
              '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,.35)', opacity: 1 },
            }}
          />

          {/* Kategori Tabları */}
          <Box
            sx={{
              borderRadius: 2.5,
              border: '1px solid rgba(54,197,211,0.15)',
              background: 'rgba(255,255,255,.02)',
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              TabIndicatorProps={{ style: { background: 'linear-gradient(90deg,#04A7B8,#36C5D3)', height: 3 } }}
              sx={{
                minHeight: 44,
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,.5)',
                  fontWeight: 600,
                  fontSize: { xs: '0.72rem', sm: '0.78rem' },
                  textTransform: 'none',
                  minHeight: 44,
                  px: { xs: 1.5, sm: 2 },
                  transition: 'color 0.2s',
                  '&:hover': { color: '#36C5D3' },
                },
                '& .Mui-selected': { color: '#36C5D3 !important', fontWeight: 700 },
                '& .MuiTabs-scrollButtons': { color: 'rgba(255,255,255,.4)' },
              }}
            >
              {categories.map((cat, idx) => (
                <Tab key={cat} label={cat} value={idx} />
              ))}
            </Tabs>
          </Box>
        </Box>

        {/* Sonuç yoksa */}
        {filteredData.length === 0 && (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <SearchIcon sx={{ fontSize: 48, color: 'rgba(54,197,211,0.3)', mb: 2 }} />
            <Typography sx={{ color: 'rgba(255,255,255,.4)', fontSize: '1rem' }}>
              "<strong style={{ color: '#36C5D3' }}>{searchTerm}</strong>" için sonuç bulunamadı.
            </Typography>
          </Box>
        )}

        {filteredData.map((group, gIdx) => (
          <Box key={gIdx} sx={{ mb: { xs: 5, md: 7 } }}>
            {(activeTab === 0 || searchTerm) && <Stack direction="row" alignItems="center" spacing={2} mb={2.5}>
              <Box sx={{ width: 4, height: 32, borderRadius: 2, background: 'linear-gradient(180deg,#04A7B8,#36C5D3)' }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff' }}>{group.category}</Typography>
              <Divider sx={{ flex: 1, borderColor: 'rgba(54,197,211,.15)' }} />
              <Typography sx={{ color: 'rgba(255,255,255,.35)', fontSize: '.78rem' }}>{group.items.length} model</Typography>
            </Stack>}
            <CategoryTable items={group.items} navigate={navigate} />
          </Box>
        ))}

        {/* Disclaimer */}
        <Box
          sx={{
            mt: 2,
            p: { xs: 2.5, sm: 3 },
            borderRadius: 3,
            background: 'rgba(54,197,211,0.05)',
            border: '1px solid rgba(54,197,211,0.15)',
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#36C5D3',
              mb: 1,
            }}
          >
            Önemli Bilgi
          </Typography>
          <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,.55)', lineHeight: 1.7 }}>
            Listelenen fiyatlar Musatti Motor tarafından belirlenen tavsiye edilen perakende satış fiyatlarıdır.
            Gerçek satış fiyatı bayi politikasına göre farklılık gösterebilir. KDV dahildir.
            "Yakında Bayilerde" olarak işaretlenmiş ürünler henüz stoğa girmemiş olup fiyat bilgisi için
            mağazamızla iletişime geçiniz. Fiyatlar önceden haber verilmeksizin değiştirilebilir.
          </Typography>
        </Box>
      </Container>

      <SiteFooter />
    </Box>
  );
}

export default FiyatListesiPage;
