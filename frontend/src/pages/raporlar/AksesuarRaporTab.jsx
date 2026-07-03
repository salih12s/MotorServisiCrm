import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  CalendarMonth as CalendarIcon,
  AttachMoney as AttachMoneyIcon,
  MoneyOff as MoneyOffIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import StatCard from './StatCard';
import { formatCurrency } from './raporlarUtils';

const renderCreator = (kayit) => (
  <Box>
    <Typography variant="body2" fontWeight={600}>
      {kayit.olusturan_kisi || kayit.olusturan_ad_soyad || '-'}
    </Typography>
    {kayit.olusturan_kisi !== 'Ortak' && kayit.olusturan_kullanici_adi && (
      <Typography variant="caption" color="text.secondary">
        @{kayit.olusturan_kullanici_adi}
      </Typography>
    )}
  </Box>
);

// HeaderIcon ve emptyText propları ile hobi grup (bisiklet) raporu için de kullanılır;
// varsayılanlar aksesuar raporu davranışını korur.
const AksesuarRaporTab = ({
  theme,
  isMobile,
  loading,
  aksesuarSelectedDate,
  setAksesuarSelectedDate,
  aksesuarEndDate,
  setAksesuarEndDate,
  aksesuarRapor,
  sortedAksesuarlar,
  selectedKullanici,
  setSelectedKullanici,
  kullanicilar,
  handleViewAksesuarDetail,
  HeaderIcon = ShoppingBagIcon,
  emptyText = 'Bu tarih aralığında aksesuar satışı bulunmuyor',
}) => (
  <Box>
    {/* Tarih Aralığı */}
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ py: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm="auto">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon color="primary" />
              <Typography variant="body2" fontWeight={600} sx={{ display: { xs: 'none', sm: 'block' } }}>
                Tarih Aralığı
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={5} md={2}>
            <TextField
              type="date"
              label="Başlangıç Tarihi"
              value={aksesuarSelectedDate}
              onChange={(e) => setAksesuarSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={5} md={2}>
            <TextField
              type="date"
              label="Bitiş Tarihi"
              value={aksesuarEndDate}
              onChange={(e) => setAksesuarEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={5} md={3} width={180}>
            <FormControl fullWidth size="small">
              <InputLabel>Oluşturan Kişi</InputLabel>
              <Select
                value={selectedKullanici}
                label="Oluşturan Kişi"
                onChange={(e) => setSelectedKullanici(e.target.value)}
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="Ortak">Ortak</MenuItem>
                {kullanicilar.map((kullanici) => (
                  <MenuItem key={kullanici.id} value={kullanici.kullanici_adi}>
                    {kullanici.ad_soyad}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm="auto">
            <Chip 
              label={aksesuarSelectedDate && aksesuarEndDate ? 
                `${format(new Date(aksesuarSelectedDate), 'd MMM yyyy', { locale: tr })} - ${format(new Date(aksesuarEndDate), 'd MMM yyyy', { locale: tr })}` 
                : 'Tarih Seçin'}
              sx={{ 
                width: { xs: '100%', sm: 'auto' },
                bgcolor: '#f3e5f5',
                color: 'primary.main',
                borderColor: 'primary.main',
              }}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>

    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress color="primary" />
      </Box>
    ) : aksesuarRapor ? (
      <>
        {/* Özet Kartları */}
        <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <StatCard
              title="Satış Sayısı"
              value={aksesuarRapor.genel_ozet?.toplam_satis_sayisi || 0}
              icon={<AssignmentIcon />}
              color={theme.palette.primary.main}
              isMobile={isMobile}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard
              title="Toplam Satış"
              value={formatCurrency(aksesuarRapor.genel_ozet?.toplam_satis || 0)}
              icon={<AttachMoneyIcon />}
              color="#2e7d32"
              isMobile={isMobile}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard
              title="Toplam Maliyet"
              value={formatCurrency(aksesuarRapor.genel_ozet?.toplam_maliyet || 0)}
              icon={<MoneyOffIcon />}
              color="#c62828"
              isMobile={isMobile}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard
              title="Net Kar"
              value={formatCurrency(aksesuarRapor.genel_ozet?.toplam_kar || 0)}
              icon={<TrendingUpIcon />}
              color={theme.palette.primary.main}
              variant="highlight"
              isMobile={isMobile}
            />
          </Grid>
        </Grid>

        {/* Günlük Veriler Tablosu */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: isMobile ? 1.5 : 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
              <HeaderIcon color="primary" />
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Günlük Özet</Typography>
            </Box>
            
            {(aksesuarRapor.gunluk_veriler || []).length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <HeaderIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">{emptyText}</Typography>
              </Box>
            ) : isMobile ? (
              /* Mobile Card View */
              <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {(aksesuarRapor.gunluk_veriler || []).map((item, index) => (
                  <Card key={index} variant="outlined" sx={{ bgcolor: '#faf5fc' }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {format(new Date(item.tarih), 'd MMMM yyyy', { locale: tr })}
                        </Typography>
                        <Chip label={`${item.satis_sayisi} satış`} size="small" color="primary" sx={{ height: 22 }} />
                      </Box>
                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Satış</Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ color: '#2e7d32', fontSize: '0.85rem' }}>
                            {formatCurrency(item.toplam_satis)}
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
                ))}
              </Box>
            ) : (
              /* Desktop Table View */
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: { xs: 600, sm: '100%' } }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f3e5f5' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Tarih</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Satış Sayısı</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Satış Tutarı</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Maliyet</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Kar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(aksesuarRapor.gunluk_veriler || []).map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography fontWeight={600}>
                            {format(new Date(item.tarih), 'd MMMM yyyy', { locale: tr })}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={item.satis_sayisi} size="small" color="primary" />
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600} sx={{ color: '#2e7d32' }}>
                            {formatCurrency(item.toplam_satis)}
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
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Detaylı Aksesuar Listesi */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: isMobile ? 1.5 : 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HeaderIcon color="primary" />
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Detaylı Satışlar
                </Typography>
              </Box>
              <Chip 
                label={`${sortedAksesuarlar.length} satış`}
                size="small" 
                color="primary"
              />
            </Box>
            
            {sortedAksesuarlar.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <HeaderIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">{emptyText}</Typography>
              </Box>
            ) : isMobile ? (
              /* Mobile Card View */
              <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {sortedAksesuarlar.map((aksesuar, index) => (
                  <Card key={aksesuar.id || index} variant="outlined" sx={{ bgcolor: '#faf5fc' }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>{aksesuar.ad_soyad}</Typography>
                          <Typography variant="caption" color="text.secondary">{aksesuar.telefon}</Typography>
                        </Box>
                        <Tooltip title="Detay Görüntüle">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewAksesuarDetail(aksesuar)}
                            color="primary"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Satış</Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ color: '#2e7d32', fontSize: '0.85rem' }}>
                            {formatCurrency(aksesuar.toplam_satis)}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Maliyet</Typography>
                          <Typography variant="body2" sx={{ color: '#c62828', fontSize: '0.85rem' }}>
                            {formatCurrency(aksesuar.toplam_maliyet)}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Kar</Typography>
                          <Typography 
                            variant="body2" 
                            fontWeight={700}
                            sx={{ color: parseFloat(aksesuar.kar) >= 0 ? '#2e7d32' : '#c62828', fontSize: '0.85rem' }}
                          >
                            {formatCurrency(aksesuar.kar)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Oluşturan</Typography>
                          {renderCreator(aksesuar)}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              /* Desktop Table View */
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: { xs: 600, sm: '100%' } }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f3e5f5' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Müşteri</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Telefon</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Oluşturan</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Ödeme Şekli</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Satış</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Maliyet</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Kar</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>İşlem</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedAksesuarlar.map((aksesuar, index) => (
                      <TableRow key={aksesuar.id || index} hover>
                        <TableCell>
                          <Typography fontWeight={600}>{aksesuar.ad_soyad}</Typography>
                        </TableCell>
                        <TableCell>{aksesuar.telefon}</TableCell>
                        <TableCell>{renderCreator(aksesuar)}</TableCell>
                        <TableCell>{aksesuar.odeme_sekli || '-'}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600} sx={{ color: '#2e7d32' }}>
                            {formatCurrency(aksesuar.toplam_satis)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ color: '#c62828' }}>
                            {formatCurrency(aksesuar.toplam_maliyet)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            fontWeight={700}
                            sx={{ color: parseFloat(aksesuar.kar) >= 0 ? '#2e7d32' : '#c62828' }}
                          >
                            {formatCurrency(aksesuar.kar)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Detay Görüntüle">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewAksesuarDetail(aksesuar)}
                              color="primary"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </>
    ) : null}
  </Box>
);

export default AksesuarRaporTab;
