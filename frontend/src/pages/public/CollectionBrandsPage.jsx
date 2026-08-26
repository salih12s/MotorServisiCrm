import React from 'react';
import { Box, ButtonBase, Container, Stack, Typography } from '@mui/material';
import { ArrowForward as ArrowIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import SiteFooter from '../../components/SiteFooter';
import { PUBLIC_BRANDS } from '../../data/brands';

function CollectionBrandsPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#081520', color: '#fff' }}>
      <PublicNav />
      <Box sx={{ pt: { xs: 14, md: 18 }, pb: { xs: 8, md: 12 }, background: 'radial-gradient(circle at top, rgba(54,197,211,.22), transparent 48%)' }}>
        <Container maxWidth="lg">
          <Stack alignItems="center" spacing={1.5} sx={{ mb: { xs: 4, md: 6 } }}>
            <Typography sx={{ color: '#36C5D3', letterSpacing: 4, fontWeight: 800, fontSize: '.78rem' }}>KOLEKSİYONLAR</Typography>
            <Typography component="h1" sx={{ fontSize: { xs: '2.2rem', md: '3.8rem' }, fontWeight: 900, textAlign: 'center' }}>Markanı Seç, Yolunu Keşfet</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,.7)', textAlign: 'center', maxWidth: 680 }}>Falcon ve Musatti koleksiyonlarına markaya özel kataloglardan ulaşın.</Typography>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: { xs: 2.5, md: 4 } }}>
            {PUBLIC_BRANDS.map((brand) => (
              <ButtonBase key={brand.slug} onClick={() => navigate(`/koleksiyon/${brand.slug}`)}
                sx={{ position: 'relative', minHeight: { xs: 300, md: 430 }, borderRadius: 4, overflow: 'hidden', textAlign: 'left', alignItems: 'stretch', boxShadow: '0 22px 70px rgba(0,0,0,.38)', border: '1px solid rgba(255,255,255,.12)', transition: 'transform .25s ease, box-shadow .25s ease', '&:hover': { transform: 'translateY(-7px)', boxShadow: `0 28px 80px ${brand.accent}33` } }}>
                <Box sx={{ position: 'absolute', inset: 0, background: brand.gradient }} />
                {brand.cardLayout === 'background' && brand.image && <Box component="img" src={brand.image} alt={`${brand.name} motosiklet`} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .48, mixBlendMode: 'screen' }} />}
                {brand.cardLayout === 'products' && brand.image && <Box component="img" src={brand.image} alt={`${brand.name} motosiklet`} sx={{ position: 'absolute', top: 24, right: -12, width: '78%', height: '62%', objectFit: 'contain', objectPosition: 'right center', opacity: .68, filter: 'drop-shadow(0 20px 24px rgba(0,0,0,.36))' }} />}
                {brand.cardLayout === 'products' && brand.secondaryImage && <Box component="img" src={brand.secondaryImage} alt="" sx={{ position: 'absolute', right: { xs: 10, md: 20 }, bottom: { xs: 80, md: 92 }, width: { xs: '31%', md: '34%' }, height: '31%', objectFit: 'contain', opacity: .42, filter: 'drop-shadow(0 12px 16px rgba(0,0,0,.4))' }} />}
                {!brand.image && <Typography aria-hidden="true" sx={{ position: 'absolute', right: -15, bottom: -30, fontSize: { xs: '5.5rem', md: '8rem' }, fontWeight: 950, color: 'rgba(255,255,255,.07)', letterSpacing: -5 }}>{brand.name.toUpperCase()}</Typography>}
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 15%, rgba(0,0,0,.82) 100%)' }} />
                <Stack justifyContent="flex-end" alignItems="flex-start" sx={{ position: 'relative', zIndex: 1, p: { xs: 3, md: 4 }, width: '100%' }}>
                  <Typography sx={{ color: brand.accent, letterSpacing: 5, fontWeight: 900, fontSize: '.82rem', mb: 1 }}>{brand.name.toUpperCase()}</Typography>
                  <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.35rem' }, lineHeight: 1.1, fontWeight: 900 }}>{brand.title}</Typography>
                  <Typography sx={{ mt: 1.5, color: 'rgba(255,255,255,.72)', lineHeight: 1.6 }}>{brand.description}</Typography>
                  <Box sx={{ mt: 2.5, display: 'flex', alignItems: 'center', gap: 1, color: brand.accent, fontWeight: 800 }}>Koleksiyona Git <ArrowIcon /></Box>
                </Stack>
              </ButtonBase>
            ))}
          </Box>
        </Container>
      </Box>
      <SiteFooter />
    </Box>
  );
}

export default CollectionBrandsPage;
