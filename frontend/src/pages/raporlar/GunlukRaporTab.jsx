import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import GunlukRaporFiltreler from './gunlukRapor/GunlukRaporFiltreler';
import GunlukOzetKartlari from './gunlukRapor/GunlukOzetKartlari';
import GunlukOzetTablosu from './gunlukRapor/GunlukOzetTablosu';
import IsEmirleriListesi from './gunlukRapor/IsEmirleriListesi';
import GiderlerTablosu from './gunlukRapor/GiderlerTablosu';

const GunlukRaporTab = ({
  isMobile,
  loading,
  gunlukRapor,
  selectedDate,
  setSelectedDate,
  endDate,
  setEndDate,
  selectedKullanici,
  setSelectedKullanici,
  kullanicilar,
  selectedOdemeDetay,
  setSelectedOdemeDetay,
  filteredOzet,
  expandedGun,
  handleGunlukOzetClick,
  expandedGunIsEmirleri,
  handleViewDetail,
  filteredIsEmirleri,
  sortedIsEmirleri,
  toggleIsEmriSort,
  isEmriSortField,
  isEmriSortDirection,
  SortIcon,
}) => (
  <Box>
    <GunlukRaporFiltreler
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      endDate={endDate}
      setEndDate={setEndDate}
      selectedKullanici={selectedKullanici}
      setSelectedKullanici={setSelectedKullanici}
      kullanicilar={kullanicilar}
      selectedOdemeDetay={selectedOdemeDetay}
      setSelectedOdemeDetay={setSelectedOdemeDetay}
    />

    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    ) : gunlukRapor ? (
      <>
        <GunlukOzetKartlari
          isMobile={isMobile}
          gunlukRapor={gunlukRapor}
          selectedKullanici={selectedKullanici}
          filteredOzet={filteredOzet}
        />

        <GunlukOzetTablosu
          isMobile={isMobile}
          gunlukRapor={gunlukRapor}
          expandedGun={expandedGun}
          handleGunlukOzetClick={handleGunlukOzetClick}
          expandedGunIsEmirleri={expandedGunIsEmirleri}
          handleViewDetail={handleViewDetail}
        />

        <IsEmirleriListesi
          isMobile={isMobile}
          filteredIsEmirleri={filteredIsEmirleri}
          sortedIsEmirleri={sortedIsEmirleri}
          selectedKullanici={selectedKullanici}
          handleViewDetail={handleViewDetail}
          toggleIsEmriSort={toggleIsEmriSort}
          isEmriSortField={isEmriSortField}
          isEmriSortDirection={isEmriSortDirection}
          SortIcon={SortIcon}
        />

        <GiderlerTablosu gunlukRapor={gunlukRapor} />
      </>
    ) : null}
  </Box>
);

export default GunlukRaporTab;
