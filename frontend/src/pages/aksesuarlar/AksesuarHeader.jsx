import React from 'react';
import { Box, Button, Chip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { formatCurrency } from './aksesuarlarUtils';

const AksesuarHeader = ({
  toplamSatis,
  bugunkuSatis,
  beklemedeSatis,
  islemdeSatis,
  tamamlananSatis,
  iptalSatis,
  toplamTutar,
  toplamKar,
  filterBugun,
  filterDurum,
  handleFilterClick,
  isAdmin,
  themeColors,
  handleOpenModal,
}) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      {/* İstatistik Chip'leri - Renkli ve Tıklanabilir */}
      <Chip
        label={`Toplam: ${toplamSatis}`}
        size="small"
        onClick={() => handleFilterClick('toplam')}
        sx={{
          bgcolor: !filterBugun && !filterDurum ? '#1a237e' : '#e3f2fd',
          color: !filterBugun && !filterDurum ? 'white' : '#1a237e',
          fontWeight: 600,
          cursor: 'pointer',
          '&:hover': { bgcolor: '#1a237e', color: 'white' },
        }}
      />
      <Chip
        label={`Bugün: ${bugunkuSatis}`}
        size="small"
        onClick={() => handleFilterClick('bugun')}
        sx={{
          bgcolor: filterBugun ? '#1565c0' : '#bbdefb',
          color: filterBugun ? 'white' : '#1565c0',
          fontWeight: 600,
          cursor: 'pointer',
          '&:hover': { bgcolor: '#1565c0', color: 'white' },
        }}
      />
      <Chip
        label={`Beklemede: ${beklemedeSatis}`}
        size="small"
        onClick={() => handleFilterClick('beklemede')}
        sx={{
          bgcolor: filterDurum === 'beklemede' ? '#e65100' : '#fff3e0',
          color: filterDurum === 'beklemede' ? 'white' : '#e65100',
          fontWeight: 600,
          cursor: 'pointer',
          '&:hover': { bgcolor: '#e65100', color: 'white' },
        }}
      />
      <Chip
        label={`İşlemde: ${islemdeSatis}`}
        size="small"
        onClick={() => handleFilterClick('islemde')}
        sx={{
          bgcolor: filterDurum === 'islemde' ? '#0277bd' : '#e3f2fd',
          color: filterDurum === 'islemde' ? 'white' : '#0277bd',
          fontWeight: 600,
          cursor: 'pointer',
          '&:hover': { bgcolor: '#0277bd', color: 'white' },
        }}
      />
      <Chip
        label={`Tamamlandı: ${tamamlananSatis}`}
        size="small"
        onClick={() => handleFilterClick('tamamlandi')}
        sx={{
          bgcolor: filterDurum === 'tamamlandi' ? '#2e7d32' : '#e8f5e9',
          color: filterDurum === 'tamamlandi' ? 'white' : '#2e7d32',
          fontWeight: 600,
          cursor: 'pointer',
          '&:hover': { bgcolor: '#2e7d32', color: 'white' },
        }}
      />
      <Chip
        label={`İptal: ${iptalSatis}`}
        size="small"
        onClick={() => handleFilterClick('iptal_edildi')}
        sx={{
          bgcolor: filterDurum === 'iptal_edildi' ? '#c62828' : '#ffebee',
          color: filterDurum === 'iptal_edildi' ? 'white' : '#c62828',
          fontWeight: 600,
          cursor: 'pointer',
          '&:hover': { bgcolor: '#c62828', color: 'white' },
        }}
      />
      <Chip
        label={formatCurrency(toplamTutar)}
        size="small"
        sx={{
          bgcolor: '#e3f2fd',
          color: '#1565c0',
          fontWeight: 600,
        }}
      />
      {isAdmin && (
        <Chip
          label={`Kar: ${formatCurrency(toplamKar)}`}
          size="small"
          sx={{
            bgcolor: toplamKar >= 0 ? '#e8f5e9' : '#ffebee',
            color: toplamKar >= 0 ? '#2e7d32' : '#c62828',
            fontWeight: 600,
          }}
        />
      )}
    </Box>

    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => handleOpenModal()}
      sx={{
        bgcolor: themeColors.primary,
        '&:hover': { bgcolor: themeColors.primaryDark },
      }}
    >
      Yeni Satış
    </Button>
  </Box>
);

export default AksesuarHeader;
