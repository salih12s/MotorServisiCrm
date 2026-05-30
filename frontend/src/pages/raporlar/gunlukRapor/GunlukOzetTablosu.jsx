import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Typography,
  Collapse,
  IconButton,
  Tooltip,
  Avatar,
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
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { formatCurrency } from '../raporlarUtils';

const GunlukOzetTablosu = ({
  isMobile,
  gunlukRapor,
  expandedGun,
  handleGunlukOzetClick,
  expandedGunIsEmirleri,
  handleViewDetail,
}) => (
  <Card sx={{ mb: 3 }}>
    <CardContent sx={{ p: 0 }}>
      <Box sx={{ p: isMobile ? 1.5 : 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Günlük Özet</Typography>
      </Box>

      {(gunlukRapor.gunluk_veriler || gunlukRapor.is_emirleri || []).length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">Bu tarih aralığında iş emri bulunmuyor</Typography>
        </Box>
      ) : isMobile ? (
        /* Mobile Card View for Günlük Özet - Accordion tarzı */
        <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {(gunlukRapor.gunluk_veriler || []).map((item, index) => {
            const isExpanded = expandedGun === format(new Date(item.tarih), 'yyyy-MM-dd');

            return (
              <Box key={index}>
                <Card
                  variant="outlined"
                  sx={{
                    bgcolor: isExpanded ? '#e3f2fd' : '#fafafa',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: '#e3f2fd' }
                  }}
                  onClick={() => handleGunlukOzetClick(item)}
                >
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {isExpanded ? <ExpandLessIcon color="primary" fontSize="small" /> : <ExpandMoreIcon color="action" fontSize="small" />}
                        <Typography variant="subtitle2" fontWeight={700}>
                          {format(new Date(item.tarih), 'd MMMM yyyy', { locale: tr })}
                        </Typography>
                      </Box>
                      <Chip label={`${item.is_sayisi} iş`} size="small" color="primary" sx={{ height: 22 }} />
                    </Box>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Gelir</Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#2e7d32', fontSize: '0.85rem' }}>
                          {formatCurrency(item.toplam_gelir)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Maliyet</Typography>
                        <Typography variant="body2" sx={{ color: '#c62828', fontSize: '0.85rem' }}>
                          {formatCurrency(item.toplam_maliyet)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Kar</Typography>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{
                            color: parseFloat(item.toplam_kar) >= 0 ? '#2e7d32' : '#c62828',
                            fontSize: '0.85rem',
                          }}
                        >
                          {formatCurrency(item.toplam_kar)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                {/* Accordion içerik - Mobile */}
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, mt: 0.5, borderRadius: 1 }}>
                    {expandedGunIsEmirleri.length === 0 ? (
                      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
                        Bu güne ait iş emri bulunmuyor
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {expandedGunIsEmirleri.map((isEmri) => {
                          const gelir = parseFloat(isEmri.toplam_tutar || 0);
                          const maliyet = parseFloat(isEmri.toplam_maliyet || 0);
                          const kar = gelir - maliyet;

                          return (
                            <Card
                              key={isEmri.id}
                              sx={{ bgcolor: 'white', cursor: 'pointer' }}
                              onClick={(e) => e.stopPropagation()}
                              onDoubleClick={(e) => { e.stopPropagation(); handleViewDetail(isEmri); }}
                            >
                              <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography fontWeight={600} color="primary.main" fontSize="0.8rem">
                                    {isEmri.fis_no}
                                  </Typography>
                                  <Chip
                                    label={isEmri.durum || 'Bekliyor'}
                                    size="small"
                                    sx={{ fontSize: '0.6rem', height: 18 }}
                                  />
                                </Box>
                                <Typography fontSize="0.75rem" color="text.secondary">
                                  {isEmri.musteri_ad_soyad} • {isEmri.plaka}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                  <Typography fontSize="0.75rem" sx={{ color: '#2e7d32' }}>
                                    Gelir: {formatCurrency(gelir)}
                                  </Typography>
                                  <Typography fontSize="0.75rem" fontWeight={600} sx={{ color: kar >= 0 ? '#2e7d32' : '#c62828' }}>
                                    Kar: {formatCurrency(kar)}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </Box>
      ) : (
        /* Desktop Table View */
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 600, sm: '100%' } }}>
            <TableHead>
              <TableRow>
                <TableCell>Tarih</TableCell>
                <TableCell align="center">İş Sayısı</TableCell>
                <TableCell align="right">Gelir</TableCell>
                <TableCell align="right">Maliyet</TableCell>
                <TableCell align="right">Kar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(gunlukRapor.gunluk_veriler || []).map((item, index) => {
                const isExpanded = expandedGun === format(new Date(item.tarih), 'yyyy-MM-dd');

                return (
                  <React.Fragment key={index}>
                    <TableRow
                      hover
                      onClick={() => handleGunlukOzetClick(item)}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: isExpanded ? '#e3f2fd' : 'inherit',
                        '&:hover': { bgcolor: '#e3f2fd' }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {isExpanded ? <ExpandLessIcon color="primary" /> : <ExpandMoreIcon color="action" />}
                          <Typography fontWeight={600}>
                            {format(new Date(item.tarih), 'd MMMM yyyy', { locale: tr })}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={item.is_sayisi} size="small" color="primary" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600} sx={{ color: '#2e7d32' }}>
                          {formatCurrency(item.toplam_gelir)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ color: '#c62828' }}>
                          {formatCurrency(item.toplam_maliyet)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          fontWeight={700}
                          sx={{ color: parseFloat(item.toplam_kar) >= 0 ? '#2e7d32' : '#c62828' }}
                        >
                          {formatCurrency(item.toplam_kar)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {/* Accordion İçerik - İş Emirleri */}
                    <TableRow>
                      <TableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ bgcolor: '#f5f5f5', p: 2 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <DirectionsCarIcon fontSize="small" color="primary" />
                              {format(new Date(item.tarih), 'd MMMM yyyy', { locale: tr })} - İş Emirleri
                              <Chip label={expandedGunIsEmirleri.length} size="small" color="primary" sx={{ ml: 1 }} />
                            </Typography>
                            {expandedGunIsEmirleri.length === 0 ? (
                              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                Bu güne ait iş emri bulunmuyor
                              </Typography>
                            ) : (
                              <Table size="small" sx={{ bgcolor: 'white', borderRadius: 1 }}>
                                <TableHead>
                                  <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Fiş No</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Tarih</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Müşteri</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Araç</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Oluşturan</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Durum</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Ödeme Detayları</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Maliyet</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Gelir</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Kar</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>İşlem</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {expandedGunIsEmirleri.map((isEmri) => {
                                    const gelir = parseFloat(isEmri.gercek_toplam_ucret || isEmri.toplam_tutar || 0);
                                    const maliyet = parseFloat(isEmri.toplam_maliyet || 0);
                                    const kar = parseFloat(isEmri.kar) || (gelir - maliyet);

                                    return (
                                      <TableRow
                                        key={isEmri.id}
                                        hover
                                        onClick={(e) => e.stopPropagation()}
                                        onDoubleClick={(e) => { e.stopPropagation(); handleViewDetail(isEmri); }}
                                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#e3f2fd' } }}
                                      >
                                        <TableCell>
                                          <Typography fontWeight={700} color="primary.main" fontSize="0.8rem">
                                            {isEmri.fis_no}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography fontSize="0.8rem">
                                            {isEmri.created_at ? format(new Date(isEmri.created_at), 'dd.MM.yyyy', { locale: tr }) : '-'}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography fontWeight={600} fontSize="0.8rem">{isEmri.musteri_ad_soyad || '-'}</Typography>
                                          {isEmri.telefon && <Typography variant="caption" color="text.secondary">{isEmri.telefon}</Typography>}
                                        </TableCell>
                                        <TableCell>
                                          <Typography fontSize="0.8rem">{isEmri.marka} {isEmri.model_tip || isEmri.arac_bilgisi || '-'}</Typography>
                                          {isEmri.km && <Typography variant="caption" color="text.secondary">{isEmri.km} km</Typography>}
                                        </TableCell>
                                        <TableCell>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Avatar sx={{ width: 20, height: 20, fontSize: '0.65rem', bgcolor: isEmri.olusturan_kisi === 'Ortak' ? 'warning.main' : 'primary.main' }}>
                                              <PersonIcon sx={{ fontSize: 14 }} />
                                            </Avatar>
                                            <Box>
                                              <Typography fontSize="0.75rem" fontWeight={600}>{isEmri.olusturan_kisi || isEmri.olusturan_ad_soyad || '-'}</Typography>
                                              {isEmri.olusturan_kisi !== 'Ortak' && <Typography variant="caption" color="text.secondary">@{isEmri.olusturan_kullanici_adi || '-'}</Typography>}
                                            </Box>
                                          </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                          <Chip
                                            label={isEmri.durum === 'beklemede' ? 'Beklemede' : 'Tamamlandı'}
                                            size="small"
                                            sx={{
                                              fontSize: '0.65rem',
                                              height: 20,
                                              bgcolor: isEmri.durum === 'beklemede' ? '#fff3e0' : '#e8f5e9',
                                              color: isEmri.durum === 'beklemede' ? '#e65100' : '#2e7d32',
                                              fontWeight: 600
                                            }}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Tooltip title={isEmri.odeme_detaylari || '-'} arrow placement="top">
                                            <Typography fontSize="0.75rem" sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                              {isEmri.odeme_detaylari || '-'}
                                            </Typography>
                                          </Tooltip>
                                        </TableCell>
                                        <TableCell align="right">
                                          <Typography fontWeight={600} sx={{ color: '#c62828' }} fontSize="0.8rem">
                                            {formatCurrency(maliyet)}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                          <Typography fontWeight={600} sx={{ color: '#2e7d32' }} fontSize="0.8rem">
                                            {formatCurrency(gelir)}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                          <Typography fontWeight={700} sx={{ color: kar >= 0 ? '#2e7d32' : '#c62828' }} fontSize="0.8rem">
                                            {formatCurrency(kar)}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          <Tooltip title="Detayları Gör">
                                            <IconButton
                                              size="small"
                                              onClick={(e) => { e.stopPropagation(); handleViewDetail(isEmri); }}
                                              sx={{ color: 'primary.main' }}
                                            >
                                              <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            )}
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                              💡 Detayları görmek için iş emri satırına çift tıklayın veya göz simgesine basın
                            </Typography>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </CardContent>
  </Card>
);

export default GunlukOzetTablosu;
