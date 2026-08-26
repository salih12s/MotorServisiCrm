import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  DirectionsCar as DirectionsCarIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  ShoppingBag as ShoppingBagIcon,
  TwoWheeler as TwoWheelerIcon,
  PedalBike as PedalBikeIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
} from '@mui/icons-material';
import { raporService, authService, motorSatisService } from '../../services/api';
import { useCustomTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import IsEmriDetayModal from './IsEmriDetayModal';
import AksesuarDetayModal from './AksesuarDetayModal';
import MotorSatisDetayModal from './MotorSatisDetayModal';
import AksesuarRaporTab from './AksesuarRaporTab';
import FisKarRaporTab from './FisKarRaporTab';
import MotorSatisRaporTab from './MotorSatisRaporTab';
import GunlukRaporTab from './GunlukRaporTab';
import BorcRaporTab from './BorcRaporTab';

function Raporlar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { setAksesuarTheme, setMotorSatisTheme, setHobiGrupTheme, setDefaultTheme } = useCustomTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Günlük Rapor State
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [gunlukRapor, setGunlukRapor] = useState(null);
  
  // Oluşturan Kişi Filtresi
  const [kullanicilar, setKullanicilar] = useState([]);
  const [selectedKullanici, setSelectedKullanici] = useState('');
  const [selectedOdemeDetay, setSelectedOdemeDetay] = useState('');
  
  // Fiş Kar State
  const [fisKarBaslangic, setFisKarBaslangic] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [fisKarBitis, setFisKarBitis] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [fisKarRapor, setFisKarRapor] = useState(null);

  // Detay Modal State
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Aksesuar Rapor State
  const [aksesuarSelectedDate, setAksesuarSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [aksesuarEndDate, setAksesuarEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [aksesuarRapor, setAksesuarRapor] = useState(null);
  const [selectedAksesuar, setSelectedAksesuar] = useState(null);
  const [aksesuarDetailModalOpen, setAksesuarDetailModalOpen] = useState(false);

  // Hobi Grup (Bisiklet) Rapor State
  const [bisikletSelectedDate, setBisikletSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [bisikletEndDate, setBisikletEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [bisikletRapor, setBisikletRapor] = useState(null);
  const [selectedBisiklet, setSelectedBisiklet] = useState(null);
  const [bisikletDetailModalOpen, setBisikletDetailModalOpen] = useState(false);
  const [selectedBisikletKullanici, setSelectedBisikletKullanici] = useState('');

  // Sıralama State'leri
  const [isEmriSortField, setIsEmriSortField] = useState('created_at');
  const [isEmriSortDirection, setIsEmriSortDirection] = useState('desc');
  const [aksesuarSortField] = useState('satis_tarihi');
  const [aksesuarSortDirection] = useState('desc');
  const [fisKarSortField, setFisKarSortField] = useState('created_at');
  const [fisKarSortDirection, setFisKarSortDirection] = useState('desc');

  // Seçili gün accordion state (modal yerine satır altında açılır)
  const [expandedGun, setExpandedGun] = useState(null);
  const [expandedGunIsEmirleri, setExpandedGunIsEmirleri] = useState([]);
  
  // Motor Satışları State
  const [motorSatisSelectedDate, setMotorSatisSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [motorSatisEndDate, setMotorSatisEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [motorSatislar, setMotorSatislar] = useState([]);
  const [motorModeller, setMotorModeller] = useState([]);
  const [expandedMotorSatis, setExpandedMotorSatis] = useState(null);
  const [selectedMotorSatisKullanici, setSelectedMotorSatisKullanici] = useState('');
  const [selectedAksesuarKullanici, setSelectedAksesuarKullanici] = useState('');
  
  // Motor Satış Detay Modal State (Fiş Kar Analizi için)
  const [selectedMotorSatis, setSelectedMotorSatis] = useState(null);
  const [motorSatisDetailModalOpen, setMotorSatisDetailModalOpen] = useState(false);
  
  // Navigate hook
  const navigate = useNavigate();

  // Kullanıcıları yükle
  useEffect(() => {
    const loadKullanicilar = async () => {
      try {
        const response = await authService.getUsers();
        setKullanicilar(response.data || []);
      } catch (error) {
        console.error('Kullanıcılar yüklenemedi:', error);
      }
    };
    loadKullanicilar();
  }, []);

  // Sekme değiştiğinde tema değişikliği
  useEffect(() => {
    if (activeTab === 0) {
      // Motor Satışları sekmesi - turuncu tema
      setMotorSatisTheme();
    } else if (activeTab === 2) {
      // Aksesuar Satışları sekmesi - mor tema
      setAksesuarTheme();
    } else if (activeTab === 3) {
      // Hobi Grup sekmesi - yeşil tema
      setHobiGrupTheme();
    } else {
      // Diğer sekmeler - varsayılan tema
      setDefaultTheme();
    }
  }, [activeTab, setAksesuarTheme, setMotorSatisTheme, setHobiGrupTheme, setDefaultTheme]);

  // Sayfa kapanınca varsayılan temaya dön
  useEffect(() => {
    return () => {
      setDefaultTheme();
    };
  }, [setDefaultTheme]);

  useEffect(() => {
    if (activeTab === 0) {
      loadMotorSatisRapor();
    } else if (activeTab === 1) {
      loadGunlukRapor();
    } else if (activeTab === 2) {
      loadAksesuarRapor();
    } else if (activeTab === 3) {
      loadBisikletRapor();
    } else if (activeTab === 4) {
      loadFisKarRapor();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedDate, endDate, fisKarBaslangic, fisKarBitis, aksesuarSelectedDate, aksesuarEndDate, bisikletSelectedDate, bisikletEndDate, motorSatisSelectedDate, motorSatisEndDate]);

  const loadGunlukRapor = async () => {
    try {
      setLoading(true);
      const response = await raporService.getAralik(selectedDate, endDate);
      setGunlukRapor(response.data);
    } catch (error) {
      console.error('Günlük rapor hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMotorSatisRapor = async () => {
    try {
      setLoading(true);
      const [satisRes, modelRes] = await Promise.all([
        motorSatisService.getAll(),
        motorSatisService.getModeller()
      ]);
      
      // Tarih aralığına göre filtrele ve sadece tamamlanan satışları göster
      const filteredSatislar = (satisRes.data || []).filter(satis => {
        // Sadece tamamlandi durumundakileri göster
        if (satis.durum !== 'tamamlandi') return false;
        
        // tarih alanını kullan (backend'den YYYY-MM-DD formatında geliyor)
        const satisTarih = satis.tarih || '';
        return satisTarih >= motorSatisSelectedDate && satisTarih <= motorSatisEndDate;
      });
      
      setMotorSatislar(filteredSatislar);
      setMotorModeller(modelRes.data || []);
    } catch (error) {
      console.error('Motor satış rapor hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFisKarRapor = async () => {
    try {
      setLoading(true);
      // Hem fiş kar raporu hem de motor satışlarını çek
      const [fisKarRes, motorSatisRes] = await Promise.all([
        raporService.getFisKar(fisKarBaslangic, fisKarBitis),
        motorSatisService.getAll()
      ]);
      
      // Motor satışlarını tarih aralığına göre filtrele (sadece tamamlananlar)
      const filteredMotorSatislar = (motorSatisRes.data || []).filter(satis => {
        if (satis.durum !== 'tamamlandi') return false;
        const satisTarih = satis.tarih || '';
        return satisTarih >= fisKarBaslangic && satisTarih <= fisKarBitis;
      });
      
      // Motor satış toplamlarını hesapla
      const motorSatisToplam = filteredMotorSatislar.reduce((acc, satis) => ({
        gelir: acc.gelir + parseFloat(satis.satis_fiyati || 0),
        maliyet: acc.maliyet + parseFloat(satis.iskontolu_alis_fiyati || satis.alis_fiyati || 0),
        kar: acc.kar + parseFloat(satis.kar || 0)
      }), { gelir: 0, maliyet: 0, kar: 0 });
      
      // Fiş kar raporuna motor satışlarını ekle
      const updatedFisKarRapor = {
        ...fisKarRes.data,
        motor_satislari: filteredMotorSatislar,
        motor_satis_toplam: motorSatisToplam,
        toplam: {
          gelir: (fisKarRes.data?.toplam?.gelir || 0) + motorSatisToplam.gelir,
          maliyet: (fisKarRes.data?.toplam?.maliyet || 0) + motorSatisToplam.maliyet,
          kar: (fisKarRes.data?.toplam?.kar || 0) + motorSatisToplam.kar
        }
      };
      
      setFisKarRapor(updatedFisKarRapor);
    } catch (error) {
      console.error('Fiş kar rapor hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAksesuarRapor = async () => {
    try {
      setLoading(true);
      const response = await raporService.getAksesuarAralik(aksesuarSelectedDate, aksesuarEndDate);
      setAksesuarRapor(response.data);
    } catch (error) {
      console.error('Aksesuar rapor hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBisikletRapor = async () => {
    try {
      setLoading(true);
      const response = await raporService.getBisikletAralik(bisikletSelectedDate, bisikletEndDate);
      setBisikletRapor(response.data);
    } catch (error) {
      console.error('Hobi grup rapor hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBisikletDetail = async (satis) => {
    if (!isAdmin) return;
    try {
      const response = await raporService.getBisikletDetay(satis.id);
      setSelectedBisiklet(response.data);
      setBisikletDetailModalOpen(true);
    } catch (error) {
      console.error('Hobi grup detay hatası:', error);
    }
  };

  const handleViewAksesuarDetail = async (aksesuar) => {
    if (!isAdmin) return;
    try {
      const response = await raporService.getAksesuarDetay(aksesuar.id);
      setSelectedAksesuar(response.data);
      setAksesuarDetailModalOpen(true);
    } catch (error) {
      console.error('Aksesuar detay hatası:', error);
    }
  };

  // Motor Satış Detay Handler (Fiş Kar Analizi için)
  const handleViewMotorSatisDetail = (motorSatis) => {
    if (!isAdmin) return;
    setSelectedMotorSatis(motorSatis);
    setMotorSatisDetailModalOpen(true);
  };

  const handleViewDetail = async (workOrder) => {
    if (!isAdmin) return;
    try {
      const response = await raporService.getIsEmriDetay(workOrder.id);
      setSelectedWorkOrder(response.data);
      setDetailModalOpen(true);
    } catch (error) {
      console.error('İş emri detay hatası:', error);
    }
  };

  // Günlük özet satırına tıklandığında accordion tarzı aç/kapa
  const handleGunlukOzetClick = (gunlukVeri) => {
    const tarih = format(new Date(gunlukVeri.tarih), 'yyyy-MM-dd');
    
    // Aynı güne tıklandıysa kapat
    if (expandedGun === tarih) {
      setExpandedGun(null);
      setExpandedGunIsEmirleri([]);
      return;
    }
    
    // O günün iş emirlerini filtrele - detayli_is_emirleri kullan ve tamamlama_tarihi'ne göre filtrele
    const gunIsEmirleri = (gunlukRapor.detayli_is_emirleri || []).filter(isEmri => {
      const isEmriTarih = format(new Date(isEmri.tamamlama_tarihi || isEmri.created_at), 'yyyy-MM-dd');
      return isEmriTarih === tarih;
    });
    
    setExpandedGun(tarih);
    setExpandedGunIsEmirleri(gunIsEmirleri);
  };

  // İş emrine çift tıklayınca detay modalını aç
  const handleIsEmriDoubleClick = async (isEmri) => {
    try {
      const response = await raporService.getIsEmriDetay(isEmri.id);
      setSelectedWorkOrder(response.data);
      setDetailModalOpen(true);
    } catch (error) {
      console.error('İş emri detay hatası:', error);
    }
  };

  // Oluşturan kişiye ve ödeme detayına göre filtrelenmiş iş emirleri
  const matchesCreatorFilter = (kayit, selectedCreator) => {
    if (!selectedCreator) return true;
    if (selectedCreator === 'Ortak') {
      return kayit.olusturan_kisi === 'Ortak';
    }
    if (kayit.olusturan_kisi === 'Ortak') return false;
    const selectedUser = kullanicilar.find(
      (kullanici) => kullanici.kullanici_adi === selectedCreator
    );
    return kayit.olusturan_kisi === selectedCreator ||
      kayit.olusturan_kisi === selectedUser?.ad_soyad ||
      kayit.olusturan_kullanici_adi === selectedCreator ||
      kayit.olusturan_ad_soyad === selectedCreator;
  };

  const filteredIsEmirleri = gunlukRapor?.detayli_is_emirleri?.filter(isEmri => {
    // Oluşturan kişi filtresi
    if (!matchesCreatorFilter(isEmri, selectedKullanici)) return false;
    // Ödeme detayı filtresi
    if (selectedOdemeDetay) {
      const odemeMatch = isEmri.odeme_detaylari && isEmri.odeme_detaylari.toLowerCase().includes(selectedOdemeDetay.toLowerCase());
      if (!odemeMatch) return false;
    }
    return true;
  }) || [];

  // Sıralama fonksiyonu
  const sortData = (data, field, direction) => {
    return [...data].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      
      // Tarih alanları için
      if (field === 'created_at' || field === 'satis_tarihi' || field === 'tarih') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      // Sayısal alanlar için
      else if (field === 'gercek_toplam_ucret' || field === 'toplam_satis' || field === 'kar' || field === 'toplam_maliyet') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }
      
      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  };

  // Sıralanmış iş emirleri
  const sortedIsEmirleri = sortData(filteredIsEmirleri, isEmriSortField, isEmriSortDirection);

  // İş emri sıralama toggle
  const toggleIsEmriSort = (field) => {
    if (isEmriSortField === field) {
      setIsEmriSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setIsEmriSortField(field);
      setIsEmriSortDirection('desc');
    }
  };

  // Fiş kar sıralama toggle
  const toggleFisKarSort = (field) => {
    if (fisKarSortField === field) {
      setFisKarSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setFisKarSortField(field);
      setFisKarSortDirection('desc');
    }
  };

  // Sıralanmış aksesuar verileri
  const filteredAksesuarlar = (aksesuarRapor?.detayli_aksesuarlar || [])
    .filter((aksesuar) => matchesCreatorFilter(aksesuar, selectedAksesuarKullanici));
  const sortedAksesuarlar = sortData(filteredAksesuarlar, aksesuarSortField, aksesuarSortDirection);
  const filteredMotorSatislar = motorSatislar
    .filter((motorSatis) => matchesCreatorFilter(motorSatis, selectedMotorSatisKullanici));

  const filteredAksesuarRapor = selectedAksesuarKullanici && aksesuarRapor
    ? {
        ...aksesuarRapor,
        detayli_aksesuarlar: filteredAksesuarlar,
        gunluk_veriler: Object.values(filteredAksesuarlar.reduce((gunler, aksesuar) => {
          const tarihDegeri = aksesuar.tamamlama_tarihi || aksesuar.created_at || aksesuar.satis_tarihi;
          const tarih = tarihDegeri ? format(new Date(tarihDegeri), 'yyyy-MM-dd') : 'Tarihsiz';
          if (!gunler[tarih]) {
            gunler[tarih] = {
              tarih,
              satis_sayisi: 0,
              toplam_satis: 0,
              toplam_maliyet: 0,
              toplam_kar: 0,
            };
          }
          gunler[tarih].satis_sayisi += 1;
          gunler[tarih].toplam_satis += parseFloat(aksesuar.toplam_satis || 0);
          gunler[tarih].toplam_maliyet += parseFloat(aksesuar.toplam_maliyet || 0);
          gunler[tarih].toplam_kar += parseFloat(aksesuar.kar || 0);
          return gunler;
        }, {})).sort((a, b) => b.tarih.localeCompare(a.tarih)),
        genel_ozet: {
          toplam_satis_sayisi: filteredAksesuarlar.length,
          toplam_satis: filteredAksesuarlar.reduce((sum, aksesuar) => sum + parseFloat(aksesuar.toplam_satis || 0), 0),
          toplam_maliyet: filteredAksesuarlar.reduce((sum, aksesuar) => sum + parseFloat(aksesuar.toplam_maliyet || 0), 0),
          toplam_kar: filteredAksesuarlar.reduce((sum, aksesuar) => sum + parseFloat(aksesuar.kar || 0), 0),
        },
      }
    : aksesuarRapor;

  // Sıralanmış hobi grup (bisiklet) verileri - aksesuar raporuyla aynı mantık
  const filteredBisikletler = (bisikletRapor?.detayli_aksesuarlar || [])
    .filter((satis) => matchesCreatorFilter(satis, selectedBisikletKullanici));
  const sortedBisikletler = sortData(filteredBisikletler, aksesuarSortField, aksesuarSortDirection);

  const filteredBisikletRapor = selectedBisikletKullanici && bisikletRapor
    ? {
        ...bisikletRapor,
        detayli_aksesuarlar: filteredBisikletler,
        gunluk_veriler: Object.values(filteredBisikletler.reduce((gunler, satis) => {
          const tarihDegeri = satis.tamamlama_tarihi || satis.created_at || satis.satis_tarihi;
          const tarih = tarihDegeri ? format(new Date(tarihDegeri), 'yyyy-MM-dd') : 'Tarihsiz';
          if (!gunler[tarih]) {
            gunler[tarih] = {
              tarih,
              satis_sayisi: 0,
              toplam_satis: 0,
              toplam_maliyet: 0,
              toplam_kar: 0,
            };
          }
          gunler[tarih].satis_sayisi += 1;
          gunler[tarih].toplam_satis += parseFloat(satis.toplam_satis || 0);
          gunler[tarih].toplam_maliyet += parseFloat(satis.toplam_maliyet || 0);
          gunler[tarih].toplam_kar += parseFloat(satis.kar || 0);
          return gunler;
        }, {})).sort((a, b) => b.tarih.localeCompare(a.tarih)),
        genel_ozet: {
          toplam_satis_sayisi: filteredBisikletler.length,
          toplam_satis: filteredBisikletler.reduce((sum, satis) => sum + parseFloat(satis.toplam_satis || 0), 0),
          toplam_maliyet: filteredBisikletler.reduce((sum, satis) => sum + parseFloat(satis.toplam_maliyet || 0), 0),
          toplam_kar: filteredBisikletler.reduce((sum, satis) => sum + parseFloat(satis.kar || 0), 0),
        },
      }
    : bisikletRapor;

  // Sıralama ikonu
  const SortIcon = ({ field, currentField, direction }) => {
    if (field !== currentField) return null;
    return direction === 'asc' ? <ArrowUpwardIcon sx={{ fontSize: 16, ml: 0.5 }} /> : <ArrowDownwardIcon sx={{ fontSize: 16, ml: 0.5 }} />;
  };

  // Filtrelenmiş verilere göre özet hesaplama
  const filteredOzet = {
    toplam_is: filteredIsEmirleri.length,
    toplam_gelir: filteredIsEmirleri.reduce((sum, ie) => sum + parseFloat(ie.gercek_toplam_ucret || 0), 0),
    toplam_maliyet: filteredIsEmirleri.reduce((sum, ie) => sum + parseFloat(ie.toplam_maliyet || 0), 0),
    net_kar: filteredIsEmirleri.reduce((sum, ie) => sum + parseFloat(ie.kar || 0), 0),
  };

  // Aksesuar Rapor Render
  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons="auto"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              py: 2,
            },
          }}
        >
          <Tab 
            label="Motor Satışları" 
            icon={<TwoWheelerIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="İş Emirleri" 
            icon={<DirectionsCarIcon />} 
            iconPosition="start"
          />
          <Tab
            label="Aksesuar Satışları"
            icon={<ShoppingBagIcon />}
            iconPosition="start"
          />
          <Tab
            label="Hobi Grup"
            icon={<PedalBikeIcon />}
            iconPosition="start"
          />
          <Tab
            label="Fiş Kar Analizi"
            icon={<ReceiptIcon />}
            iconPosition="start"
          />
          <Tab
            label="Borç"
            icon={<AccountBalanceWalletIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Card>

      {activeTab === 0 && (
        <MotorSatisRaporTab
          isMobile={isMobile}
          loading={loading}
          motorSatisSelectedDate={motorSatisSelectedDate}
          setMotorSatisSelectedDate={setMotorSatisSelectedDate}
          motorSatisEndDate={motorSatisEndDate}
          setMotorSatisEndDate={setMotorSatisEndDate}
          loadMotorSatisRapor={loadMotorSatisRapor}
          motorSatislar={filteredMotorSatislar}
          expandedMotorSatis={expandedMotorSatis}
          setExpandedMotorSatis={setExpandedMotorSatis}
          selectedKullanici={selectedMotorSatisKullanici}
          setSelectedKullanici={setSelectedMotorSatisKullanici}
          kullanicilar={kullanicilar}
          navigate={navigate}
        />
      )}
      {activeTab === 1 && (
        <GunlukRaporTab
          isMobile={isMobile}
          loading={loading}
          gunlukRapor={gunlukRapor}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          endDate={endDate}
          setEndDate={setEndDate}
          selectedKullanici={selectedKullanici}
          setSelectedKullanici={setSelectedKullanici}
          kullanicilar={kullanicilar}
          selectedOdemeDetay={selectedOdemeDetay}
          setSelectedOdemeDetay={setSelectedOdemeDetay}
          filteredOzet={filteredOzet}
          expandedGun={expandedGun}
          handleGunlukOzetClick={handleGunlukOzetClick}
          expandedGunIsEmirleri={expandedGunIsEmirleri}
          handleViewDetail={handleViewDetail}
          filteredIsEmirleri={filteredIsEmirleri}
          sortedIsEmirleri={sortedIsEmirleri}
          toggleIsEmriSort={toggleIsEmriSort}
          isEmriSortField={isEmriSortField}
          isEmriSortDirection={isEmriSortDirection}
          SortIcon={SortIcon}
        />
      )}
      {activeTab === 2 && (
        <AksesuarRaporTab
          theme={theme}
          isMobile={isMobile}
          loading={loading}
          aksesuarSelectedDate={aksesuarSelectedDate}
          setAksesuarSelectedDate={setAksesuarSelectedDate}
          aksesuarEndDate={aksesuarEndDate}
          setAksesuarEndDate={setAksesuarEndDate}
          aksesuarRapor={filteredAksesuarRapor}
          sortedAksesuarlar={sortedAksesuarlar}
          selectedKullanici={selectedAksesuarKullanici}
          setSelectedKullanici={setSelectedAksesuarKullanici}
          kullanicilar={kullanicilar}
          handleViewAksesuarDetail={handleViewAksesuarDetail}
        />
      )}
      {activeTab === 3 && (
        <AksesuarRaporTab
          theme={theme}
          isMobile={isMobile}
          loading={loading}
          aksesuarSelectedDate={bisikletSelectedDate}
          setAksesuarSelectedDate={setBisikletSelectedDate}
          aksesuarEndDate={bisikletEndDate}
          setAksesuarEndDate={setBisikletEndDate}
          aksesuarRapor={filteredBisikletRapor}
          sortedAksesuarlar={sortedBisikletler}
          selectedKullanici={selectedBisikletKullanici}
          setSelectedKullanici={setSelectedBisikletKullanici}
          kullanicilar={kullanicilar}
          handleViewAksesuarDetail={handleViewBisikletDetail}
          HeaderIcon={PedalBikeIcon}
          emptyText="Bu tarih aralığında hobi grup satışı bulunmuyor"
        />
      )}
      {activeTab === 4 && (
        <FisKarRaporTab
          loading={loading}
          isAdmin={isAdmin}
          fisKarBaslangic={fisKarBaslangic}
          setFisKarBaslangic={setFisKarBaslangic}
          fisKarBitis={fisKarBitis}
          setFisKarBitis={setFisKarBitis}
          fisKarRapor={fisKarRapor}
          fisKarSortField={fisKarSortField}
          fisKarSortDirection={fisKarSortDirection}
          toggleFisKarSort={toggleFisKarSort}
          sortData={sortData}
          SortIcon={SortIcon}
          handleViewDetail={handleViewDetail}
          handleViewAksesuarDetail={handleViewAksesuarDetail}
          handleViewMotorSatisDetail={handleViewMotorSatisDetail}
          handleViewBisikletDetail={handleViewBisikletDetail}
        />
      )}
      {activeTab === 5 && (
        <BorcRaporTab user={user} navigate={navigate} />
      )}

      {/* İş Emri Detay Modal */}
      <IsEmriDetayModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        isMobile={isMobile}
        selectedWorkOrder={selectedWorkOrder}
      />

      {/* Aksesuar Detay Modal */}
      <AksesuarDetayModal
        open={aksesuarDetailModalOpen}
        onClose={() => setAksesuarDetailModalOpen(false)}
        isMobile={isMobile}
        selectedAksesuar={selectedAksesuar}
      />

      {/* Hobi Grup Satış Detay Modal */}
      <AksesuarDetayModal
        open={bisikletDetailModalOpen}
        onClose={() => setBisikletDetailModalOpen(false)}
        isMobile={isMobile}
        selectedAksesuar={selectedBisiklet}
        baslik="Hobi Grup Satış Detayları"
        accentColor="#2E7D32"
        accentDark="#1B5E20"
      />

      {/* Motor Satış Detay Modal (Fiş Kar Analizi için) */}
      <MotorSatisDetayModal
        open={motorSatisDetailModalOpen}
        onClose={() => setMotorSatisDetailModalOpen(false)}
        isMobile={isMobile}
        selectedMotorSatis={selectedMotorSatis}
      />
    </Box>
  );
}

export default Raporlar;
