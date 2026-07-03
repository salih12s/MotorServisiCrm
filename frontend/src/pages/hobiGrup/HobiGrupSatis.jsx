import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { bisikletSatisService, bisikletStokService } from '../../services/api';
import { parseISO, isToday, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';
import AksesuarModal from '../../components/AksesuarModal';
import AksesuarHeader from '../aksesuarlar/AksesuarHeader';
import AksesuarFiltreler from '../aksesuarlar/AksesuarFiltreler';
import AksesuarTablo from '../aksesuarlar/AksesuarTablo';
import AksesuarDetayDialog from '../aksesuarlar/AksesuarDetayDialog';

// Hobi Grup Bisiklet & E-Bike satış ekranı - aksesuar satış ekranıyla aynı akış,
// bisiklet satış ve stok servislerine bağlı çalışır.
function HobiGrupSatis() {
  const [satislar, setSatislar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBugun, setFilterBugun] = useState(false);
  const [filterDurum, setFilterDurum] = useState('');
  const [baslangicTarihi, setBaslangicTarihi] = useState('');
  const [bitisTarihi, setBitisTarihi] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSatis, setSelectedSatis] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { themeColors } = useCustomTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  // Erişim kontrolü - admin veya aksesuar yetkisi olmalı
  useEffect(() => {
    if (user && user.role !== 'admin' && !user.aksesuar_yetkisi) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    loadSatislar();
  }, []);

  const loadSatislar = async () => {
    try {
      setLoading(true);
      const response = await bisikletSatisService.getAll();
      // ID'ye göre azalan sıralama (en yeni en üstte)
      const sorted = (response.data || []).sort((a, b) => b.id - a.id);
      setSatislar(sorted);
    } catch (error) {
      console.error('Bisiklet satış listesi hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (satis = null) => {
    if (satis) {
      setEditingId(satis.id);
    } else {
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSuccess = () => {
    loadSatislar();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu satış kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await bisikletSatisService.delete(id);
        loadSatislar();
      } catch (error) {
        console.error('Silme hatası:', error);
      }
    }
  };

  const handleViewDetails = (satis) => {
    setSelectedSatis(satis);
    setDetailDialogOpen(true);
  };

  // Filtreleme
  let filteredSatislar = satislar.filter((s) =>
    s.ad_soyad?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.telefon?.includes(searchQuery)
  );

  // Durum filtresi
  if (filterDurum) {
    filteredSatislar = filteredSatislar.filter(s => s.durum === filterDurum);
  }

  // Bugün filtresi
  if (filterBugun) {
    filteredSatislar = filteredSatislar.filter(s => {
      try {
        return isToday(parseISO(s.created_at));
      } catch {
        return false;
      }
    });
  }

  // Tarih aralığı filtresi
  if (baslangicTarihi) {
    filteredSatislar = filteredSatislar.filter(s => {
      try {
        const tarih = parseISO(s.satis_tarihi || s.created_at);
        return isAfter(tarih, startOfDay(new Date(baslangicTarihi))) ||
               tarih.toDateString() === new Date(baslangicTarihi).toDateString();
      } catch {
        return false;
      }
    });
  }

  if (bitisTarihi) {
    filteredSatislar = filteredSatislar.filter(s => {
      try {
        const tarih = parseISO(s.satis_tarihi || s.created_at);
        return isBefore(tarih, endOfDay(new Date(bitisTarihi))) ||
               tarih.toDateString() === new Date(bitisTarihi).toDateString();
      } catch {
        return false;
      }
    });
  }

  // Aktif filtre kontrolü
  const hasActiveFilters = searchQuery || filterDurum || filterBugun || baslangicTarihi || bitisTarihi;

  // Filtreleri temizle
  const clearFilters = () => {
    setSearchQuery('');
    setFilterDurum('');
    setFilterBugun(false);
    setBaslangicTarihi('');
    setBitisTarihi('');
  };

  // İstatistikler
  const toplamSatis = satislar.length;
  const bugunkuSatis = satislar.filter(s => {
    try {
      return isToday(parseISO(s.created_at));
    } catch {
      return false;
    }
  }).length;
  const beklemedeSatis = satislar.filter(s => s.durum === 'beklemede').length;
  const islemdeSatis = satislar.filter(s => s.durum === 'islemde').length;
  const tamamlananSatis = satislar.filter(s => s.durum === 'tamamlandi').length;
  const iptalSatis = satislar.filter(s => s.durum === 'iptal_edildi').length;
  const toplamTutar = satislar.reduce((sum, s) => sum + parseFloat(s.toplam_satis || s.odeme_tutari || 0), 0);
  const toplamKar = satislar.reduce((sum, s) => sum + parseFloat(s.kar || 0), 0);

  // Filtre chip'ine tıklandığında
  const handleFilterClick = (type) => {
    if (type === 'bugun') {
      setFilterBugun(!filterBugun);
      setFilterDurum('');
    } else if (type === 'beklemede') {
      setFilterDurum(filterDurum === 'beklemede' ? '' : 'beklemede');
      setFilterBugun(false);
    } else if (type === 'islemde') {
      setFilterDurum(filterDurum === 'islemde' ? '' : 'islemde');
      setFilterBugun(false);
    } else if (type === 'tamamlandi') {
      setFilterDurum(filterDurum === 'tamamlandi' ? '' : 'tamamlandi');
      setFilterBugun(false);
    } else if (type === 'iptal_edildi') {
      setFilterDurum(filterDurum === 'iptal_edildi' ? '' : 'iptal_edildi');
      setFilterBugun(false);
    } else {
      setFilterBugun(false);
      setFilterDurum('');
    }
  };

  return (
    <Box>
      <AksesuarHeader
        toplamSatis={toplamSatis}
        bugunkuSatis={bugunkuSatis}
        beklemedeSatis={beklemedeSatis}
        islemdeSatis={islemdeSatis}
        tamamlananSatis={tamamlananSatis}
        iptalSatis={iptalSatis}
        toplamTutar={toplamTutar}
        toplamKar={toplamKar}
        filterBugun={filterBugun}
        filterDurum={filterDurum}
        handleFilterClick={handleFilterClick}
        isAdmin={isAdmin}
        themeColors={themeColors}
        handleOpenModal={handleOpenModal}
      />

      <AksesuarFiltreler
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        baslangicTarihi={baslangicTarihi}
        setBaslangicTarihi={setBaslangicTarihi}
        bitisTarihi={bitisTarihi}
        setBitisTarihi={setBitisTarihi}
        setFilterBugun={setFilterBugun}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
      />

      <AksesuarTablo
        loading={loading}
        filteredAksesuarlar={filteredSatislar}
        isMobile={isMobile}
        isAdmin={isAdmin}
        themeColors={themeColors}
        handleViewDetails={handleViewDetails}
        handleOpenModal={handleOpenModal}
        handleDelete={handleDelete}
      />

      {/* Yeni/Düzenle Modal - bisiklet satış ve stok servisleriyle */}
      <AksesuarModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        editId={editingId}
        service={bisikletSatisService}
        stokService={bisikletStokService}
        baslik="Hobi Grup"
      />

      {/* Detay Dialog */}
      <AksesuarDetayDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        selectedAksesuar={selectedSatis}
        isMobile={isMobile}
        isAdmin={isAdmin}
        themeColors={themeColors}
        handleOpenModal={handleOpenModal}
        baslik="Hobi Grup Satış Detayları"
      />
    </Box>
  );
}

export default HobiGrupSatis;
