import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  DirectionsCar as DirectionsCarIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { formatCurrency } from '../raporlarUtils';

const IsEmirleriListesi = ({
  isMobile,
  filteredIsEmirleri,
  sortedIsEmirleri,
  selectedKullanici,
  handleViewDetail,
  toggleIsEmriSort,
  isEmriSortField,
  isEmriSortDirection,
  SortIcon,
}) => (
  <Card sx={{ mb: 3 }}>
    <CardContent sx={{ p: 0 }}>
      <Box sx={{ p: { xs: 1.5, sm: 2.5 }, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <DirectionsCarIcon color="primary" />
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Tarih Aralığındaki İş Emirleri
        </Typography>
        {filteredIsEmirleri && (
          <Chip
            label={`${filteredIsEmirleri.length} iş emri`}
            size="small"
            color="primary"
            sx={{ ml: { xs: 0, sm: 'auto' } }}
          />
        )}
      </Box>

      {isMobile ? (
        /* Mobile Card View */
        <Box sx={{ p: 1.5 }}>
          {(!filteredIsEmirleri || filteredIsEmirleri.length === 0) ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">{selectedKullanici ? 'Bu kişiye ait iş emri bulunmuyor' : 'Bu tarih aralığında iş emri bulunmuyor'}</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {filteredIsEmirleri.map((isEmri) => (
                <Card
                  key={isEmri.id}
                  sx={{
                    overflow: 'hidden',
                    bgcolor: '#fafafa',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: '#e3f2fd', transform: 'scale(1.01)' }
                  }}
                  onDoubleClick={() => handleViewDetail(isEmri)}
                >
                  <CardContent sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700} color="primary.main" noWrap>
                          {isEmri.fis_no}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {format(new Date(isEmri.created_at), 'dd.MM.yyyy', { locale: tr })}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={isEmri.durum === 'beklemede' ? 'Beklemede' : 'Tamamlandı'}
                        sx={{
                          bgcolor: isEmri.durum === 'beklemede' ? '#fff3e0' : '#e8f5e9',
                          color: isEmri.durum === 'beklemede' ? '#e65100' : '#2e7d32',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: '20px',
                          flexShrink: 0,
                        }}
                      />
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Müşteri</Typography>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: '0.875rem' }}>
                        {isEmri.musteri_ad_soyad}
                      </Typography>
                      {isEmri.telefon && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {isEmri.telefon}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Araç</Typography>
                      <Typography variant="body2" noWrap sx={{ fontSize: '0.875rem' }}>
                        {isEmri.marka} {isEmri.model_tip}
                      </Typography>
                      {isEmri.km && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {isEmri.km} km
                        </Typography>
                      )}
                    </Box>

                    {isEmri.olusturan_ad_soyad && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Oluşturan</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Avatar sx={{ width: 20, height: 20, fontSize: '0.65rem', bgcolor: 'primary.main' }}>
                            <PersonIcon sx={{ fontSize: '0.8rem' }} />
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: '0.8rem' }}>
                              {isEmri.olusturan_ad_soyad}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Gelir</Typography>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#2e7d32', fontSize: '0.9rem' }} noWrap>
                          {formatCurrency(isEmri.gercek_toplam_ucret)}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Kar</Typography>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          sx={{
                            fontSize: '0.9rem',
                            color: parseFloat(isEmri.kar) >= 0 ? '#2e7d32' : '#c62828',
                          }}
                          noWrap
                        >
                          {formatCurrency(isEmri.kar)}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetail(isEmri)}
                        sx={{ color: 'primary.main', p: 0.5 }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        /* Desktop Table View */
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: { xs: 900, sm: '100%' } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 700 }}>Fiş No</TableCell>
                <TableCell
                  sx={{ fontWeight: 700, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => toggleIsEmriSort('created_at')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Tarih
                    <SortIcon field="created_at" currentField={isEmriSortField} direction={isEmriSortDirection} />
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Müşteri</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Araç</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Oluşturan</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ödeme Detayları</TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 700, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => toggleIsEmriSort('toplam_maliyet')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    Maliyet
                    <SortIcon field="toplam_maliyet" currentField={isEmriSortField} direction={isEmriSortDirection} />
                  </Box>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 700, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => toggleIsEmriSort('gercek_toplam_ucret')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    Gelir
                    <SortIcon field="gercek_toplam_ucret" currentField={isEmriSortField} direction={isEmriSortDirection} />
                  </Box>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 700, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => toggleIsEmriSort('kar')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    Kar
                    <SortIcon field="kar" currentField={isEmriSortField} direction={isEmriSortDirection} />
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(!sortedIsEmirleri || sortedIsEmirleri.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                    <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">{selectedKullanici ? 'Bu kişiye ait iş emri bulunmuyor' : 'Bu tarih aralığında iş emri bulunmuyor'}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedIsEmirleri.map((isEmri) => (
                  <TableRow
                    key={isEmri.id}
                    hover
                    onDoubleClick={() => handleViewDetail(isEmri)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#e3f2fd' }
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight={700} color="primary.main">{isEmri.fis_no}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(isEmri.created_at), 'dd.MM.yyyy', { locale: tr })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{isEmri.musteri_ad_soyad}</Typography>
                      <Typography variant="caption" color="text.secondary">{isEmri.telefon}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{isEmri.marka} {isEmri.model_tip}</Typography>
                      {isEmri.km && <Typography variant="caption" color="text.secondary">{isEmri.km} km</Typography>}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: isEmri.olusturan_kisi === 'Ortak' ? 'warning.main' : 'primary.main' }}>
                          <PersonIcon fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {isEmri.olusturan_kisi || isEmri.olusturan_ad_soyad || '-'}
                          </Typography>
                          {isEmri.olusturan_kisi !== 'Ortak' && (
                            <Typography variant="caption" color="text.secondary">
                              @{isEmri.olusturan_kullanici_adi || '-'}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={isEmri.durum === 'beklemede' ? 'Beklemede' : 'Tamamlandı'}
                        sx={{
                          bgcolor: isEmri.durum === 'beklemede' ? '#fff3e0' : '#e8f5e9',
                          color: isEmri.durum === 'beklemede' ? '#e65100' : '#2e7d32',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={isEmri.odeme_detaylari || '-'} arrow placement="top">
                        <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                          {isEmri.odeme_detaylari || '-'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600} sx={{ color: '#c62828' }}>
                        {formatCurrency(isEmri.toplam_maliyet || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600} sx={{ color: '#2e7d32' }}>
                        {formatCurrency(isEmri.gercek_toplam_ucret)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        fontWeight={700}
                        sx={{ color: parseFloat(isEmri.kar) >= 0 ? '#2e7d32' : '#c62828' }}
                      >
                        {formatCurrency(isEmri.kar)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Detayları Gör">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetail(isEmri)}
                          sx={{ color: 'primary.main' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </CardContent>
  </Card>
);

export default IsEmirleriListesi;
