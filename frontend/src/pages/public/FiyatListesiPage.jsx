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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import SiteFooter from '../../components/SiteFooter';

const priceData = [
  {
    category: 'Chopper',
    items: [
      { name: 'Dark Pow',         image: '/Images/Dark_pow.jpg',              taksit: '427.499,00 ₺', nakit: '367.815,00 ₺' },
      { name: 'Kai-Zen',          image: '/Images/Kai_zen.webp',             taksit: '318.100,00 ₺', nakit: '273.672,00 ₺' },
      { name: 'Milanio 250',      image: '/Images/Milanio_250.jpg',          taksit: '285.449,00 ₺', nakit: '245.641,00 ₺' },
      { name: 'Milanio S400',     image: '/Images/Milanio_s400.webp',        taksit: '345.500,00 ₺', nakit: null },
      { name: 'King Pow',         image: '/Images/King_pow.webp',            taksit: '354.710,00 ₺', nakit: '305.193,00 ₺' },
      { name: 'X-Pow',            image: '/Images/X_pow.webp',               taksit: null, nakit: null, yakinBayilerde: true },
      { name: 'Dark Pow Pro',     image: '/Images/Dark_pow_pro.webp',        taksit: null, nakit: null, yakinBayilerde: true },
    ],
  },
  {
    category: 'Racing',
    items: [
      { name: 'M125R',      image: '/Images/M125r.webp',      taksit: '169.499,00 ₺', nakit: '145.674,00 ₺' },
      { name: 'M250R',      image: '/Images/m250r.webp',      taksit: '255.499,00 ₺', nakit: '219.589,00 ₺' },
      { name: 'Vitron 250', image: '/Images/vitron250.webp',  taksit: null, nakit: null, yakinBayilerde: true },
    ],
  },
  {
    category: 'Scooter',
    items: [
      { name: 'Glamaro Max 125',            image: '/Images/Glamaro125.webp',               taksit: '112.499,00 ₺', nakit: '96.783,00 ₺' },
      { name: 'Glamaro Max 125 – Kameralı', image: '/Images/Glamaro_max125_kamerali.webp',  taksit: '101.193,00 ₺', nakit: '117.999,00 ₺' },
      { name: 'Lemuzin 125',                image: '/Images/Lemuzin_125.webp',              taksit: '82.437,00 ₺',  nakit: '71.500,00 ₺' },
      { name: 'Bella 50',                   image: '/Images/bella50.webp',                  taksit: '63.200,00 ₺',  nakit: '54.357,00 ₺' },
      { name: 'Rabel 50',                   image: '/Images/rabel50.webp',                  taksit: '88.233,00 ₺',  nakit: '75.895,00 ₺' },
      { name: 'Siena 50',                   image: '/Images/Siena50.webp',                  taksit: '82.385,00 ₺',  nakit: '70.835,00 ₺' },
      { name: 'Rajon 50X',                  image: '/Images/Rajon50x.webp',                 taksit: '98.324,00 ₺',  nakit: '84.420,00 ₺' },
      { name: 'Atekon 200',                 image: '/Images/atekon200.webp',                taksit: null, nakit: null, yakinBayilerde: true },
      { name: 'Siena 110',                  image: '/Images/siena110.webp',                 taksit: '76.942,00 ₺',  nakit: '66.201,00 ₺' },
      { name: 'Rajon 125X',                 image: '/Images/rajox125x.webp',                taksit: '102.983,00 ₺', nakit: '88.616,00 ₺' },
    ],
  },
  {
    category: 'ATV',
    items: [
      { name: 'Rage 400',  image: '/Images/rage400.webp',  taksit: null, nakit: null, yakinBayilerde: true },
      { name: 'İron X300', image: '/Images/ironx300.webp', taksit: null, nakit: null, yakinBayilerde: true },
      { name: 'İron X250', image: '/Images/ironx250.webp', taksit: null, nakit: null, yakinBayilerde: true },
      { name: 'İron X200', image: '/Images/ironx200.webp', taksit: '96.800,00 ₺', nakit: '83.000,00 ₺' },
    ],
  },
  {
    category: 'UTV',
    items: [
      { name: 'Off Track', image: '/Images/OffTruck.jpg', taksit: null, nakit: null, yakinBayilerde: true },
    ],
  },
  {
    category: 'E-Scooter',
    items: [
      { name: 'Sport 701 Pro',   image: '/Images/Sport701Pro.webp', taksit: '119.700,00 ₺', nakit: '99.800,00 ₺' },
      { name: 'Smarda – SMD X1', image: '/Images/SmardaSMDx1.png',  taksit: null, nakit: null, yakinBayilerde: true },
    ],
  },
  {
    category: 'E-Technology',
    items: [
      { name: 'Smarda – Marsilya Max 1600', image: '/Images/SmardaMarsilyamax1600.webp', taksit: '118.310,00 ₺', nakit: '99.900,00 ₺' },
      { name: 'Smarda – Soft Pro',          image: '/Images/SmardaSoftPro.webp',         taksit: '76.999,00 ₺',  nakit: '65.971,00 ₺' },
      { name: 'Smarda – Violet 1200',       image: '/Images/SmardaViolet1200.webp',      taksit: '107.150,00 ₺', nakit: '92.850,00 ₺' },
      { name: 'Smarda – Tork Pro',          image: '/Images/SmardaTorkPro.webp',         taksit: '97.710,00 ₺',  nakit: '84.183,00 ₺' },
      { name: 'Smarda – Dora 4000',         image: '/Images/SmardaDora400.webp',         taksit: '118.599,00 ₺', nakit: '99.900,00 ₺' },
      { name: 'Smarda – SMD X3',            image: '/Images/SmardaSMDx3.webp',           taksit: null, nakit: null, yakinBayilerde: true },
    ],
  },
  {
    category: 'E-Car',
    items: [
      { name: 'Smarda – Elegolf',   image: '/Images/SmardaEleGolf.webp',   taksit: null, nakit: null, yakinBayilerde: true },
      { name: 'Doch Pro 66000',     image: '/Images/DochPro66000.webp',    taksit: '289.750,00 ₺', nakit: '249.642,00 ₺' },
      { name: 'Smarda – Venedik',   image: '/Images/SmardaVenedik.webp',   taksit: '169.200,00 ₺', nakit: '134.840,00 ₺' },
      { name: 'Venedik Pro',        image: '/Images/VenedikPro.webp',      taksit: '180.918,00 ₺', nakit: '162.000,00 ₺' },
      { name: 'Smarda – Golftruck', image: '/Images/SmardaGolfTruck.webp', taksit: null, nakit: null, yakinBayilerde: true },
    ],
  },
  {
    category: 'Cross',
    items: [
      { name: 'M-Truck250', image: '/Images/Mtruck250.webp', taksit: null, nakit: null, yakinBayilerde: true },
    ],
  },
  {
    category: 'Su Araçları',
    items: [
      { name: 'Car Bot', image: '/Images/CarBot.webp', taksit: null, nakit: null, yakinBayilerde: true },
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
        mb: 0.5,
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow
            sx={{
              background:
                'linear-gradient(135deg, rgba(4,167,184,0.18) 0%, rgba(54,197,211,0.10) 100%)',
            }}
          >
            <TableCell
              sx={{
                color: '#36C5D3',
                fontWeight: 700,
                fontSize: { xs: '0.72rem', sm: '0.82rem' },
                borderBottom: '1px solid rgba(54,197,211,0.2)',
                py: 1.5,
                width: { xs: 60, sm: 80 },
              }}
            >
              Resim
            </TableCell>
            <TableCell
              sx={{
                color: '#36C5D3',
                fontWeight: 700,
                fontSize: { xs: '0.72rem', sm: '0.82rem' },
                borderBottom: '1px solid rgba(54,197,211,0.2)',
                py: 1.5,
              }}
            >
              Model
            </TableCell>
            <TableCell
              sx={{
                color: '#36C5D3',
                fontWeight: 700,
                fontSize: { xs: '0.72rem', sm: '0.82rem' },
                borderBottom: '1px solid rgba(54,197,211,0.2)',
                py: 1.5,
                display: { xs: 'none', md: 'table-cell' },
              }}
            >
              Tavsiye Edilen Taksitli Satış Fiyatı
            </TableCell>
            <TableCell
              sx={{
                color: '#36C5D3',
                fontWeight: 700,
                fontSize: { xs: '0.72rem', sm: '0.82rem' },
                borderBottom: '1px solid rgba(54,197,211,0.2)',
                py: 1.5,
                display: { xs: 'none', sm: 'table-cell' },
              }}
            >
              Tavsiye Edilen Nakit & Tek Çekim Fiyatı
            </TableCell>
            <TableCell
              sx={{
                color: '#36C5D3',
                fontWeight: 700,
                fontSize: { xs: '0.72rem', sm: '0.82rem' },
                borderBottom: '1px solid rgba(54,197,211,0.2)',
                py: 1.5,
                display: { xs: 'none', lg: 'table-cell' },
              }}
            >
              Ödeme Yöntemi
            </TableCell>
            <TableCell
              sx={{
                color: '#36C5D3',
                fontWeight: 700,
                fontSize: { xs: '0.72rem', sm: '0.82rem' },
                borderBottom: '1px solid rgba(54,197,211,0.2)',
                py: 1.5,
                textAlign: 'right',
              }}
            >
              Ürünü İncele
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, idx) => (
            <TableRow
              key={idx}
              sx={{
                borderBottom:
                  idx < items.length - 1
                    ? '1px solid rgba(54,197,211,0.08)'
                    : 'none',
                transition: 'background 0.2s',
                '&:hover': {
                  background: 'rgba(54,197,211,0.06)',
                },
              }}
            >
              {/* Resim */}
              <TableCell sx={{ py: 1.5, borderBottom: 'none' }}>
                <Box
                  sx={{
                    width: { xs: 52, sm: 70 },
                    height: { xs: 40, sm: 52 },
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(54,197,211,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      padding: '4px',
                    }}
                  />
                </Box>
              </TableCell>

              {/* Model */}
              <TableCell sx={{ py: 1.5, borderBottom: 'none' }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '0.95rem' },
                    color: '#fff',
                    lineHeight: 1.3,
                  }}
                >
                  {item.name}
                </Typography>
                {/* Mobile only: show prices below name */}
                <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 0.5 }}>
                  {item.yakinBayilerde ? (
                    <Chip
                      label="Yakında Bayilerde"
                      size="small"
                      sx={{
                        background: 'rgba(54,197,211,0.15)',
                        color: '#36C5D3',
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        height: 20,
                        border: '1px solid rgba(54,197,211,0.3)',
                      }}
                    />
                  ) : (
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                      {item.taksit && (
                        <Typography sx={{ fontSize: '0.7rem', color: '#36C5D3', fontWeight: 600 }}>
                          Taksit: {item.taksit}
                        </Typography>
                      )}
                      {item.nakit && (
                        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
                          Nakit: {item.nakit}
                        </Typography>
                      )}
                    </Stack>
                  )}
                </Box>
              </TableCell>

              {/* Taksit */}
              <TableCell sx={{ py: 1.5, borderBottom: 'none', display: { xs: 'none', md: 'table-cell' } }}>
                {item.yakinBayilerde ? (
                  <Chip
                    label="Yakında Bayilerde"
                    size="small"
                    sx={{
                      background: 'rgba(54,197,211,0.15)',
                      color: '#36C5D3',
                      fontWeight: 600,
                      fontSize: '0.72rem',
                      border: '1px solid rgba(54,197,211,0.3)',
                    }}
                  />
                ) : (
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: item.taksit ? '#fff' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {item.taksit || '——'}
                  </Typography>
                )}
              </TableCell>

              {/* Nakit */}
              <TableCell sx={{ py: 1.5, borderBottom: 'none', display: { xs: 'none', sm: 'table-cell' } }}>
                <Typography
                  sx={{
                    fontWeight: item.nakit ? 600 : 400,
                    fontSize: '0.9rem',
                    color: item.nakit ? 'rgba(255,165,0,0.9)' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {item.yakinBayilerde ? '——' : (item.nakit || '——')}
                </Typography>
              </TableCell>

              {/* Ödeme */}
              <TableCell sx={{ py: 1.5, borderBottom: 'none', display: { xs: 'none', lg: 'table-cell' } }}>
                <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
                  Nakit & Kredi Kartı
                </Typography>
              </TableCell>

              {/* İncele */}
              <TableCell sx={{ py: 1.5, borderBottom: 'none', textAlign: 'right' }}>
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<OpenInNewIcon sx={{ fontSize: '0.85rem !important' }} />}
                  onClick={() => navigate('/motorlar')}
                  sx={{
                    background: 'linear-gradient(135deg, #04A7B8 0%, #36C5D3 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: { xs: '0.7rem', sm: '0.78rem' },
                    px: { xs: 1.2, sm: 2 },
                    py: 0.6,
                    borderRadius: 2,
                    boxShadow: '0 4px 14px rgba(54,197,211,0.35)',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(54,197,211,0.6)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
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
          background:
            'linear-gradient(180deg, rgba(4,167,184,0.18) 0%, rgba(2,8,15,0.0) 100%)',
          borderBottom: '1px solid rgba(54,197,211,0.12)',
          pb: { xs: 4, md: 5 },
        }}
      >
        <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 5 } }}>
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
                Fiyat Listesi
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  color: 'rgba(255,255,255,0.6)',
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
              background: 'rgba(54,197,211,0.08)',
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
            <Typography sx={{ fontSize: { xs: '0.78rem', sm: '0.85rem' }, color: 'rgba(255,255,255,0.75)' }}>
              Fiyatlar bilgi amaçlıdır, güncel fiyat için bizimle iletişime geçiniz.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>

        {/* Taksit Seçenekleri */}
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
                background: 'rgba(255,255,255,0.04)',
                color: '#fff',
                '& fieldset': { borderColor: 'rgba(54,197,211,0.25)' },
                '&:hover fieldset': { borderColor: 'rgba(54,197,211,0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#36C5D3' },
              },
              '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.35)', opacity: 1 },
            }}
          />

          {/* Kategori Tabları */}
          <Box
            sx={{
              borderRadius: 2.5,
              border: '1px solid rgba(54,197,211,0.15)',
              background: 'rgba(255,255,255,0.02)',
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
                  color: 'rgba(255,255,255,0.5)',
                  fontWeight: 600,
                  fontSize: { xs: '0.72rem', sm: '0.78rem' },
                  textTransform: 'none',
                  minHeight: 44,
                  px: { xs: 1.5, sm: 2 },
                  transition: 'color 0.2s',
                  '&:hover': { color: '#36C5D3' },
                },
                '& .Mui-selected': { color: '#36C5D3 !important', fontWeight: 700 },
                '& .MuiTabs-scrollButtons': { color: 'rgba(255,255,255,0.4)' },
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
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem' }}>
              "<strong style={{ color: '#36C5D3' }}>{searchTerm}</strong>" için sonuç bulunamadı.
            </Typography>
          </Box>
        )}

        {filteredData.map((group, gIdx) => (
          <Box key={gIdx} sx={{ mb: { xs: 5, md: 7 } }}>
            {/* Kategori başlığı — sadece Tümü tabında veya arama varsa göster */}
            {(activeTab === 0 || searchTerm) && (
              <Stack direction="row" alignItems="center" spacing={2} mb={2.5}>
                <Box sx={{ width: 4, height: 32, borderRadius: 2, background: 'linear-gradient(180deg, #04A7B8, #36C5D3)', boxShadow: '0 0 12px rgba(54,197,211,0.6)', flexShrink: 0 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }, color: '#fff', letterSpacing: 0.5 }}>
                  {group.category}
                </Typography>
                <Divider sx={{ flex: 1, borderColor: 'rgba(54,197,211,0.15)' }} />
                <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
                  {group.items.length} model
                </Typography>
              </Stack>
            )}

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
          <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
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
