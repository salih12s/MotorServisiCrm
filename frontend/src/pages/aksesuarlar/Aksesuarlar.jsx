import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { aksesuarService } from '../../services/api';
import { parseISO, isToday, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';
import AksesuarModal from '../../components/AksesuarModal';
import AksesuarHeader from './AksesuarHeader';
import AksesuarFiltreler from './AksesuarFiltreler';
import AksesuarTablo from './AksesuarTablo';
import AksesuarDetayDialog from './AksesuarDetayDialog';

function Aksesuarlar() {
  const [aksesuarlar, setAksesuarlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBugun, setFilterBugun] = useState(false);
  const [filterDurum, setFilterDurum] = useState('');
  const [baslangicTarihi, setBaslangicTarihi] = useState('');
  const [bitisTarihi, setBitisTarihi] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAksesuar, setSelectedAksesuar] = useState(null);

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
    loadAksesuarlar();
  }, []);

  const loadAksesuarlar = async () => {
    try {
      setLoading(true);
      const response = await aksesuarService.getAll();
      // ID'ye göre azalan sıralama (en yeni en üstte)
      const sorted = (response.data || []).sort((a, b) => b.id - a.id);
      setAksesuarlar(sorted);
    } catch (error) {
      console.error('Aksesuar listesi hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (aksesuar = null) => {
    if (aksesuar) {
      setEditingId(aksesuar.id);
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
    loadAksesuarlar();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu aksesuar kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await aksesuarService.delete(id);
        loadAksesuarlar();
      } catch (error) {
        console.error('Silme hatası:', error);
      }
    }
  };

  const handleViewDetails = (aksesuar) => {
    setSelectedAksesuar(aksesuar);
    setDetailDialogOpen(true);
  };

  // Filtreleme
  let filteredAksesuarlar = aksesuarlar.filter((a) =>
    a.ad_soyad?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.telefon?.includes(searchQuery)
  );

  // Durum filtresi
  if (filterDurum) {
    filteredAksesuarlar = filteredAksesuarlar.filter(a => a.durum === filterDurum);
  }

  // Bugün filtresi
  if (filterBugun) {
    filteredAksesuarlar = filteredAksesuarlar.filter(a => {
      try {
        return isToday(parseISO(a.created_at));
      } catch {
        return false;
      }
    });
  }

  // Tarih aralığı filtresi
  if (baslangicTarihi) {
    filteredAksesuarlar = filteredAksesuarlar.filter(a => {
      try {
        const tarih = parseISO(a.satis_tarihi || a.created_at);
        return isAfter(tarih, startOfDay(new Date(baslangicTarihi))) ||
               tarih.toDateString() === new Date(baslangicTarihi).toDateString();
      } catch {
        return false;
      }
    });
  }

  if (bitisTarihi) {
    filteredAksesuarlar = filteredAksesuarlar.filter(a => {
      try {
        const tarih = parseISO(a.satis_tarihi || a.created_at);
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
  const toplamSatis = aksesuarlar.length;
  const bugunkuSatis = aksesuarlar.filter(a => {
    try {
      return isToday(parseISO(a.created_at));
    } catch {
      return false;
    }
  }).length;
  const beklemedeSatis = aksesuarlar.filter(a => a.durum === 'beklemede').length;
  const islemdeSatis = aksesuarlar.filter(a => a.durum === 'islemde').length;
  const tamamlananSatis = aksesuarlar.filter(a => a.durum === 'tamamlandi').length;
  const iptalSatis = aksesuarlar.filter(a => a.durum === 'iptal_edildi').length;
  const toplamTutar = aksesuarlar.reduce((sum, a) => sum + parseFloat(a.toplam_satis || a.odeme_tutari || 0), 0);
  const toplamKar = aksesuarlar.reduce((sum, a) => sum + parseFloat(a.kar || 0), 0);

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
        filteredAksesuarlar={filteredAksesuarlar}
        isMobile={isMobile}
        isAdmin={isAdmin}
        themeColors={themeColors}
        handleViewDetails={handleViewDetails}
        handleOpenModal={handleOpenModal}
        handleDelete={handleDelete}
      />

      {/* Yeni/Düzenle Modal */}
      <AksesuarModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        editId={editingId}
      />

      {/* Detay Dialog */}
      <AksesuarDetayDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        selectedAksesuar={selectedAksesuar}
        isMobile={isMobile}
        isAdmin={isAdmin}
        themeColors={themeColors}
        handleOpenModal={handleOpenModal}
      />
    </Box>
  );
}

export default Aksesuarlar;
