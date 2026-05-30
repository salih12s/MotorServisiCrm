import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

const AksesuarFiltreler = ({
  searchQuery,
  setSearchQuery,
  baslangicTarihi,
  setBaslangicTarihi,
  bitisTarihi,
  setBitisTarihi,
  setFilterBugun,
  hasActiveFilters,
  clearFilters,
}) => (
  <Card sx={{ mb: 2 }}>
    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Ad veya telefon ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 200, flex: { xs: 1, sm: 'none' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Tarih Filtreleri */}
        <TextField
          size="small"
          type="date"
          label="Başlangıç Tarihi"
          value={baslangicTarihi}
          onChange={(e) => { setBaslangicTarihi(e.target.value); setFilterBugun(false); }}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 160 }}
        />
        <TextField
          size="small"
          type="date"
          label="Bitiş Tarihi"
          value={bitisTarihi}
          onChange={(e) => { setBitisTarihi(e.target.value); setFilterBugun(false); }}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 160 }}
        />

        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={clearFilters}
            color="inherit"
          >
            Filtreleri Temizle
          </Button>
        )}
      </Box>
    </CardContent>
  </Card>
);

export default AksesuarFiltreler;
