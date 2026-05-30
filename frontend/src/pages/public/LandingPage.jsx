import React from 'react';
import { Box } from '@mui/material';
import PublicNav from '../../components/PublicNav';
import SiteFooter from '../../components/SiteFooter';
import HeroSection from './landing/HeroSection';
import FavoriMotorlarSection from './landing/FavoriMotorlarSection';
import RakamlarlaSection from './landing/RakamlarlaSection';
import HakkimizdaPreviewSection from './landing/HakkimizdaPreviewSection';
import VizyonMisyonSection from './landing/VizyonMisyonSection';

function LandingPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#02080f',
        color: '#fff',
        overflowX: 'hidden',
      }}
    >
      <PublicNav solid />

      {/* ============ HERO ============ */}
      <HeroSection />

      {/* ============ FAVORİ MOTORLARIMIZ ============ */}
      <FavoriMotorlarSection />

      {/* ============ RAKAMLARLA DEMİRKAN ============ */}
      <RakamlarlaSection />

      {/* ============ HAKKIMIZDA PREVIEW ============ */}
      <HakkimizdaPreviewSection />

      {/* ============ VİZYON & MİSYON ============ */}
      <VizyonMisyonSection />

      <SiteFooter />
    </Box>
  );
}

export default LandingPage;
