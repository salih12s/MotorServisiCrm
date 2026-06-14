import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Chip,
  Typography,
  CircularProgress,
  Divider,
  Stack,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  TwoWheeler as TwoWheelerIcon,
  AttachMoney as AttachMoneyIcon,
  MoneyOff as MoneyOffIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
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

const MotorSatisRaporTab = ({
  isMobile,
  loading,
  motorSatisSelectedDate,
  setMotorSatisSelectedDate,
  motorSatisEndDate,
  setMotorSatisEndDate,
  loadMotorSatisRapor,
  motorSatislar,
  expandedMotorSatis,
  setExpandedMotorSatis,
  selectedKullanici,
  setSelectedKullanici,
  kullanicilar,
  navigate,
}) => (
  <Box sx={{
    bgcolor: '#fff8f0',
    mx: -3,
    px: 3,
    py: 2,
    minHeight: 'calc(100vh - 200px)',
    borderRadius: 2
  }}>
    {/* Tarih Filtresi */}
    <Card sx={{ mb: 3, borderTop: '4px solid #e65100', boxShadow: 3 }}>
      <CardContent sx={{ py: 2.5, bgcolor: '#fff3e0' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm="auto">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TwoWheelerIcon sx={{ color: '#e65100' }} />
              <Typography variant="body2" fontWeight={700} sx={{ color: '#e65100', display: { xs: 'none', sm: 'block' } }}>
                Tarih Aralığı
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={5} md={2}>
            <TextField
              type="date"
              label="Başlangıç Tarihi"
              value={motorSatisSelectedDate}
              onChange={(e) => setMotorSatisSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '&:hover fieldset': { borderColor: '#e65100' },
                  '&.Mui-focused fieldset': { borderColor: '#e65100' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#e65100' },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={5} md={2}>
            <TextField
              type="date"
              label="Bitiş Tarihi"
              value={motorSatisEndDate}
              onChange={(e) => setMotorSatisEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '&:hover fieldset': { borderColor: '#e65100' },
                  '&.Mui-focused fieldset': { borderColor: '#e65100' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#e65100' },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={5} md={3} width={180}>
            <FormControl fullWidth size="small">
              <InputLabel>Oluşturan Kişi</InputLabel>
              <Select
                value={selectedKullanici}
                label="Oluşturan Kişi"
                onChange={(e) => setSelectedKullanici(e.target.value)}
                sx={{
                  bgcolor: 'white',
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#e65100' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#e65100' },
                }}
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
            <Button
              variant="contained"
              onClick={loadMotorSatisRapor}
              startIcon={<TwoWheelerIcon />}
              sx={{
                bgcolor: '#e65100',
                '&:hover': { bgcolor: '#bf360c' },
                height: 40,
                px: 3
              }}
            >
              Rapor Getir
            </Button>
          </Grid>
          <Grid item xs={12} sm="auto" sx={{ ml: 'auto' }}>
            <Chip
              label={motorSatisSelectedDate && motorSatisEndDate ?
                `${format(new Date(motorSatisSelectedDate), 'd MMM yyyy', { locale: tr })} - ${format(new Date(motorSatisEndDate), 'd MMM yyyy', { locale: tr })}`
                : 'Tarih Seçin'}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                bgcolor: '#e65100',
                color: 'white',
                fontWeight: 600
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>

    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress sx={{ color: '#e65100' }} />
      </Box>
    ) : (
      <>
        {/* Özet Kartları */}
        <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #ff9800 0%, #e65100 100%)',
              color: 'white',
              boxShadow: 3
            }}>
              <CardContent sx={{ p: isMobile ? 1.5 : 2, '&:last-child': { pb: isMobile ? 1.5 : 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <TwoWheelerIcon sx={{ fontSize: isMobile ? 16 : 20, opacity: 0.9 }} />
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: isMobile ? '0.7rem' : '0.875rem' }}>
                    Satış Sayısı
                  </Typography>
                </Box>
                <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700}>
                  {motorSatislar.length} Adet
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #66bb6a 0%, #388e3c 100%)',
              color: 'white',
              boxShadow: 3
            }}>
              <CardContent sx={{ p: isMobile ? 1.5 : 2, '&:last-child': { pb: isMobile ? 1.5 : 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <AttachMoneyIcon sx={{ fontSize: isMobile ? 16 : 20, opacity: 0.9 }} />
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: isMobile ? '0.7rem' : '0.875rem' }}>
                    Toplam Satış
                  </Typography>
                </Box>
                <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700}>
                  {formatCurrency(motorSatislar.reduce((sum, m) => sum + parseFloat(m.satis_fiyati || 0), 0))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #ef5350 0%, #c62828 100%)',
              color: 'white',
              boxShadow: 3
            }}>
              <CardContent sx={{ p: isMobile ? 1.5 : 2, '&:last-child': { pb: isMobile ? 1.5 : 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <MoneyOffIcon sx={{ fontSize: isMobile ? 16 : 20, opacity: 0.9 }} />
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: isMobile ? '0.7rem' : '0.875rem' }}>
                    Toplam Maliyet
                  </Typography>
                </Box>
                <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700}>
                  {formatCurrency(motorSatislar.reduce((sum, m) => sum + parseFloat(m.alis_fiyati || 0) - parseFloat(m.iskonto || 0), 0))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #42a5f5 0%, #1565c0 100%)',
              color: 'white',
              boxShadow: 3
            }}>
              <CardContent sx={{ p: isMobile ? 1.5 : 2, '&:last-child': { pb: isMobile ? 1.5 : 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <TrendingUpIcon sx={{ fontSize: isMobile ? 16 : 20, opacity: 0.9 }} />
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: isMobile ? '0.7rem' : '0.875rem' }}>
                    Toplam Kar
                  </Typography>
                </Box>
                <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700}>
                  {formatCurrency(motorSatislar.reduce((sum, m) => sum + parseFloat(m.kar || 0), 0))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Motor Satışları Listesi */}
        <Card sx={{ boxShadow: 3, border: '1px solid #ffe0b2' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{
              p: 2.5,
              borderBottom: '1px solid',
              borderColor: '#ffe0b2',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#fff3e0'
            }}>
              <TwoWheelerIcon sx={{ color: '#e65100' }} />
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, color: '#e65100' }}>
                Motor Satışları Listesi
              </Typography>
              <Chip
                label={`${motorSatislar.length} kayıt`}
                size="small"
                sx={{ ml: 'auto', bgcolor: '#e65100', color: 'white' }}
              />
            </Box>

            {/* Masaüstü Tablo */}
            {!isMobile ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#fff8f0' }}>
                      <TableCell sx={{ fontWeight: 700, width: 40 }}></TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Tarih</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Motor Model</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Müşteri</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Oluşturan</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Satış Fiyatı</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Alış Fiyatı</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#2e7d32' }}>Kar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {motorSatislar.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                          <TwoWheelerIcon sx={{ fontSize: 48, color: '#ffcc80', mb: 1 }} />
                          <Typography color="text.secondary">
                            Bu tarih aralığında motor satışı bulunmuyor
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      motorSatislar.map((motor) => (
                        <React.Fragment key={motor.id}>
                          <TableRow
                            hover
                            onClick={() => setExpandedMotorSatis(expandedMotorSatis === motor.id ? null : motor.id)}
                            sx={{
                              cursor: 'pointer',
                              bgcolor: expandedMotorSatis === motor.id ? '#fff3e0' : 'inherit',
                              '&:hover': { bgcolor: '#fff8f0' }
                            }}
                          >
                            <TableCell sx={{ width: 40 }}>
                              <IconButton size="small" sx={{ color: '#e65100' }}>
                                {expandedMotorSatis === motor.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {motor.tarih ? format(new Date(motor.tarih + 'T12:00:00'), 'dd.MM.yyyy', { locale: tr }) : '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight={700} sx={{ color: '#e65100' }}>
                                {motor.model_adi || '-'}
                              </Typography>
                              {motor.cc && (
                                <Typography variant="caption" color="text.secondary">{motor.cc} cc</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight={500}>
                                {motor.musteri_adi || '-'}
                              </Typography>
                              {motor.musteri_telefon && (
                                <Typography variant="caption" color="text.secondary">{motor.musteri_telefon}</Typography>
                              )}
                            </TableCell>
                            <TableCell>{renderCreator(motor)}</TableCell>
                            <TableCell align="right">
                              <Typography fontWeight={600} sx={{ color: '#2e7d32' }}>
                                {formatCurrency(motor.satis_fiyati)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography sx={{ color: '#c62828' }}>
                                {formatCurrency(motor.alis_fiyati)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                fontWeight={700}
                                sx={{
                                  color: parseFloat(motor.kar) >= 0 ? '#2e7d32' : '#c62828'
                                }}
                              >
                                {formatCurrency(motor.kar)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          {/* Detay Satırı - Tarih Aralığındaki İş Emirleri tablosu gibi detaylı */}
                          <TableRow>
                            <TableCell colSpan={8} sx={{ p: 0, borderBottom: expandedMotorSatis === motor.id ? '2px solid #e65100' : 'none' }}>
                              <Collapse in={expandedMotorSatis === motor.id} timeout="auto" unmountOnExit>
                                <Box sx={{ bgcolor: '#fff8f0', borderLeft: '4px solid #e65100' }}>
                                  {/* Detay Başlığı */}
                                  <Box sx={{ p: 2, bgcolor: '#fff3e0', borderBottom: '1px solid #ffe0b2', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TwoWheelerIcon sx={{ color: '#e65100' }} />
                                    <Typography fontWeight={700} sx={{ color: '#e65100' }}>
                                      {motor.model_adi || 'Motor'} - Detaylı Bilgiler
                                    </Typography>
                                  </Box>

                                  {/* Detay Tablosu */}
                                  <TableContainer>
                                    <Table size="small">
                                      <TableBody>
                                        {/* Müşteri Bilgileri */}
                                        <TableRow sx={{ bgcolor: 'white' }}>
                                          <TableCell sx={{ fontWeight: 600, width: 150, color: '#e65100' }}>Müşteri</TableCell>
                                          <TableCell>{motor.musteri_adi || '-'}</TableCell>
                                          <TableCell sx={{ fontWeight: 600, width: 150, color: '#e65100' }}>Telefon</TableCell>
                                          <TableCell>{motor.musteri_telefon || '-'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell sx={{ fontWeight: 600, color: '#e65100' }}>Şase No</TableCell>
                                          <TableCell sx={{ fontFamily: 'monospace' }}>{motor.sase_no || '-'}</TableCell>
                                          <TableCell sx={{ fontWeight: 600, color: '#e65100' }}>TC Kimlik No</TableCell>
                                          <TableCell>{motor.tc_kimlik_no || '-'}</TableCell>
                                        </TableRow>
                                        <TableRow sx={{ bgcolor: 'white' }}>
                                          <TableCell sx={{ fontWeight: 600, color: '#e65100' }}>Ödeme Şekli</TableCell>
                                          <TableCell>
                                            <Chip
                                              size="small"
                                              label={motor.odeme_sekli === 'nakit' ? 'Nakit' :
                                                     motor.odeme_sekli === 'kredi_karti' ? 'Kredi Kartı' :
                                                     motor.odeme_sekli === 'havale' ? 'Havale' :
                                                     motor.odeme_sekli === 'karisik' ? 'Karışık' : motor.odeme_sekli || '-'}
                                              sx={{ bgcolor: '#fff3e0', color: '#e65100' }}
                                            />
                                          </TableCell>
                                          <TableCell sx={{ fontWeight: 600, color: '#e65100' }}>Tarih</TableCell>
                                          <TableCell>{motor.tarih ? format(new Date(motor.tarih), 'dd.MM.yyyy', { locale: tr }) : motor.created_at ? format(new Date(motor.created_at), 'dd.MM.yyyy', { locale: tr }) : '-'}</TableCell>
                                        </TableRow>
                                        {/* Fiyat Bilgileri */}
                                        <TableRow>
                                          <TableCell sx={{ fontWeight: 600, color: '#e65100' }}>Fatura Fiyatı</TableCell>
                                          <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(motor.fatura_fiyati)}</TableCell>
                                          <TableCell sx={{ fontWeight: 600, color: '#e65100' }}>Satış Fiyatı</TableCell>
                                          <TableCell sx={{ fontWeight: 700, color: '#2e7d32' }}>{formatCurrency(motor.satis_fiyati)}</TableCell>
                                        </TableRow>
                                        <TableRow sx={{ bgcolor: 'white' }}>
                                          <TableCell sx={{ fontWeight: 600, color: '#e65100' }}>Alış Fiyatı</TableCell>
                                          <TableCell sx={{ color: '#c62828', fontWeight: 600 }}>{formatCurrency(motor.alis_fiyati)}</TableCell>
                                          <TableCell sx={{ fontWeight: 600, color: '#e65100' }}>İskonto (%{motor.iskonto || 0})</TableCell>
                                          <TableCell sx={{ color: '#7b1fa2', fontWeight: 600 }}>{formatCurrency(motor.iskonto_tutari)}</TableCell>
                                        </TableRow>
                                        {/* Vergi Bilgileri */}
                                        <TableRow>
                                          <TableCell sx={{ fontWeight: 600, color: '#e65100' }}>KDV (%20)</TableCell>
                                          <TableCell>{formatCurrency(motor.kdv_tutari)}</TableCell>
                                          <TableCell sx={{ fontWeight: 600, color: '#e65100' }}>ÖTV (%{motor.otv_orani || '-'})</TableCell>
                                          <TableCell>{formatCurrency(motor.otv_tutari)}</TableCell>
                                        </TableRow>
                                        <TableRow sx={{ bgcolor: 'white' }}>
                                          <TableCell sx={{ fontWeight: 600, color: '#e65100' }}>Damga Vergisi</TableCell>
                                          <TableCell>{formatCurrency(motor.damga_vergisi)}</TableCell>
                                          <TableCell sx={{ fontWeight: 600, color: '#e65100' }}>Toplam Vergiler</TableCell>
                                          <TableCell>{formatCurrency(motor.vergiler_toplami)}</TableCell>
                                        </TableRow>
                                        {/* Kar */}
                                        <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                                          <TableCell colSpan={2} sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#e65100' }}>
                                            NET KAR
                                          </TableCell>
                                          <TableCell colSpan={2} align="right" sx={{ fontWeight: 700, fontSize: '1.25rem', color: parseFloat(motor.kar) >= 0 ? '#2e7d32' : '#c62828' }}>
                                            {formatCurrency(motor.kar)}
                                          </TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
                                  </TableContainer>

                                  {/* Açıklama ve Buton */}
                                  {motor.aciklama && (
                                    <Box sx={{ p: 2, borderTop: '1px solid #ffe0b2' }}>
                                      <Typography variant="caption" color="text.secondary">Açıklama:</Typography>
                                      <Typography variant="body2">{motor.aciklama}</Typography>
                                    </Box>
                                  )}
                                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #ffe0b2' }}>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      startIcon={<VisibilityIcon />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/motor-satislari`);
                                      }}
                                      sx={{
                                        bgcolor: '#e65100',
                                        '&:hover': { bgcolor: '#bf360c' }
                                      }}
                                    >
                                      Motor Satışlarına Git
                                    </Button>
                                  </Box>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              /* Mobil Görünüm */
              <Box sx={{ p: 2 }}>
                {motorSatislar.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <TwoWheelerIcon sx={{ fontSize: 48, color: '#ffcc80', mb: 1 }} />
                    <Typography color="text.secondary">
                      Bu tarih aralığında motor satışı bulunmuyor
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {motorSatislar.map((motor) => (
                      <Card
                        key={motor.id}
                        sx={{
                          border: expandedMotorSatis === motor.id ? '2px solid #e65100' : '1px solid #ffe0b2',
                          bgcolor: expandedMotorSatis === motor.id ? '#fff8f0' : 'white'
                        }}
                        onClick={() => setExpandedMotorSatis(expandedMotorSatis === motor.id ? null : motor.id)}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TwoWheelerIcon sx={{ color: '#e65100', fontSize: 20 }} />
                              <Typography fontWeight={700} sx={{ color: '#e65100' }}>
                                {motor.model_adi || '-'}
                              </Typography>
                            </Box>
                            <IconButton size="small" sx={{ color: '#e65100' }}>
                              {expandedMotorSatis === motor.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {motor.musteri_adi || '-'}
                          </Typography>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Oluşturan
                            </Typography>
                            {renderCreator(motor)}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {motor.tarih ? format(new Date(motor.tarih + 'T12:00:00'), 'dd.MM.yyyy', { locale: tr }) : '-'}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">Satış</Typography>
                              <Typography fontWeight={600} sx={{ color: '#2e7d32' }}>
                                {formatCurrency(motor.satis_fiyati)}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">Kar</Typography>
                              <Typography
                                fontWeight={700}
                                sx={{ color: parseFloat(motor.kar) >= 0 ? '#2e7d32' : '#c62828' }}
                              >
                                {formatCurrency(motor.kar)}
                              </Typography>
                            </Grid>
                          </Grid>

                          {/* Mobil Detay Alanı */}
                          <Collapse in={expandedMotorSatis === motor.id} timeout="auto" unmountOnExit>
                            <Divider sx={{ my: 2 }} />
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Fatura Fiyatı</Typography>
                                <Typography variant="body2" fontWeight={600}>{formatCurrency(motor.fatura_fiyati)}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Alış Fiyatı</Typography>
                                <Typography variant="body2" fontWeight={600} sx={{ color: '#c62828' }}>{formatCurrency(motor.alis_fiyati)}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">İskonto</Typography>
                                <Typography variant="body2" fontWeight={600} sx={{ color: '#7b1fa2' }}>{formatCurrency(motor.iskonto)}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Damga Vergisi</Typography>
                                <Typography variant="body2" fontWeight={600}>{formatCurrency(motor.damga_vergisi)}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">KDV</Typography>
                                <Typography variant="body2" fontWeight={600}>{formatCurrency(motor.kdv_tutari)}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">ÖTV</Typography>
                                <Typography variant="body2" fontWeight={600}>{formatCurrency(motor.otv_tutari)}</Typography>
                              </Grid>
                            </Grid>
                            <Button
                              variant="contained"
                              size="small"
                              fullWidth
                              startIcon={<VisibilityIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/motor-satislari`);
                              }}
                              sx={{
                                mt: 2,
                                bgcolor: '#e65100',
                                '&:hover': { bgcolor: '#bf360c' }
                              }}
                            >
                              Motor Satışlarına Git
                            </Button>
                          </Collapse>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {/* Alt Bilgi */}
            {motorSatislar.length > 0 && (
              <Box sx={{ p: 2, bgcolor: '#fff3e0', borderTop: '1px solid #ffe0b2' }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  💡 Detayları görmek için satıra <strong>tıklayın</strong>
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </>
    )}
  </Box>
);

export default MotorSatisRaporTab;
