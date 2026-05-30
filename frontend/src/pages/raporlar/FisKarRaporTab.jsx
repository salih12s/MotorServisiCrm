import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Chip,
  Typography,
  CircularProgress,
  Divider,
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
  ShoppingBag as ShoppingBagIcon,
  TwoWheeler as TwoWheelerIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { formatCurrency } from './raporlarUtils';

const FisKarRaporTab = ({
  loading,
  isAdmin,
  fisKarBaslangic,
  setFisKarBaslangic,
  fisKarBitis,
  setFisKarBitis,
  fisKarRapor,
  fisKarSortField,
  fisKarSortDirection,
  toggleFisKarSort,
  sortData,
  SortIcon,
  handleViewDetail,
  handleViewAksesuarDetail,
  handleViewMotorSatisDetail,
}) => (
  <Box>
    {/* Tarih Aralığı Seçici */}
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ py: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm="auto">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon color="primary" />
              <Typography variant="body2" fontWeight={600} sx={{ display: { xs: 'none', sm: 'block' } }}>
                Tarih Aralığı
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={5} md={2}>
            <TextField
              type="date"
              label="Başlangıç Tarihi"
              value={fisKarBaslangic}
              onChange={(e) => setFisKarBaslangic(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={5} md={2}>
            <TextField
              type="date"
              label="Bitiş Tarihi"
              value={fisKarBitis}
              onChange={(e) => setFisKarBitis(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm="auto">
            <Chip
              label={fisKarBaslangic && fisKarBitis ?
                `${format(new Date(fisKarBaslangic), 'd MMM yyyy', { locale: tr })} - ${format(new Date(fisKarBitis), 'd MMM yyyy', { locale: tr })}`
                : 'Tarih Seçin'}
              color="primary"
              variant="outlined"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>

    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    ) : fisKarRapor ? (
      <>
        {/* Toplam Özet - Genel */}
        <Card sx={{ mb: 3, bgcolor: '#1a237e' }}>
          <CardContent sx={{ py: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Toplam Gelir</Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: '#4caf50' }}>
                  {formatCurrency(fisKarRapor.toplam.gelir)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Toplam Maliyet</Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: '#ef5350' }}>
                  {formatCurrency(fisKarRapor.toplam.maliyet)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Toplam Kar</Typography>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#fff' }}>
                  {formatCurrency(fisKarRapor.toplam.kar)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Kategori Bazlı Özet - Yan Yana */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* İş Emirleri Özet */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderTop: '4px solid #1976d2' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <DirectionsCarIcon sx={{ color: '#1976d2' }} />
                  <Typography variant="h6" fontWeight={700}>İş Emirleri</Typography>
                  <Chip label={`${fisKarRapor.is_emirleri?.length || 0}`} size="small" sx={{ ml: 'auto' }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Gelir:</Typography>
                  <Typography fontWeight={600} sx={{ color: '#2e7d32' }}>
                    {formatCurrency(fisKarRapor.is_emri_toplam?.gelir || 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Maliyet:</Typography>
                  <Typography fontWeight={600} sx={{ color: '#c62828' }}>
                    {formatCurrency(fisKarRapor.is_emri_toplam?.maliyet || 0)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight={700}>Kar:</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: (fisKarRapor.is_emri_toplam?.kar || 0) >= 0 ? '#2e7d32' : '#c62828' }}>
                    {formatCurrency(fisKarRapor.is_emri_toplam?.kar || 0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Aksesuar Satışları Özet */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderTop: '4px solid #9c27b0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ShoppingBagIcon sx={{ color: '#9c27b0' }} />
                  <Typography variant="h6" fontWeight={700}>Aksesuar</Typography>
                  <Chip label={`${fisKarRapor.aksesuarlar?.length || 0}`} size="small" sx={{ ml: 'auto' }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Gelir:</Typography>
                  <Typography fontWeight={600} sx={{ color: '#2e7d32' }}>
                    {formatCurrency(fisKarRapor.aksesuar_toplam?.gelir || 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Maliyet:</Typography>
                  <Typography fontWeight={600} sx={{ color: '#c62828' }}>
                    {formatCurrency(fisKarRapor.aksesuar_toplam?.maliyet || 0)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight={700}>Kar:</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: (fisKarRapor.aksesuar_toplam?.kar || 0) >= 0 ? '#2e7d32' : '#c62828' }}>
                    {formatCurrency(fisKarRapor.aksesuar_toplam?.kar || 0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Motor Satışları Özet */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderTop: '4px solid #e65100' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TwoWheelerIcon sx={{ color: '#e65100' }} />
                  <Typography variant="h6" fontWeight={700}>Motor Satış</Typography>
                  <Chip label={`${fisKarRapor.motor_satislari?.length || 0}`} size="small" sx={{ ml: 'auto' }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Gelir:</Typography>
                  <Typography fontWeight={600} sx={{ color: '#2e7d32' }}>
                    {formatCurrency(fisKarRapor.motor_satis_toplam?.gelir || 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Maliyet:</Typography>
                  <Typography fontWeight={600} sx={{ color: '#c62828' }}>
                    {formatCurrency(fisKarRapor.motor_satis_toplam?.maliyet || 0)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight={700}>Kar:</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: (fisKarRapor.motor_satis_toplam?.kar || 0) >= 0 ? '#2e7d32' : '#c62828' }}>
                    {formatCurrency(fisKarRapor.motor_satis_toplam?.kar || 0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* İş Emirleri Tablosu */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsCarIcon color="primary" />
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                İş Emirleri
              </Typography>
              <Chip
                label={`${fisKarRapor.is_emirleri?.length || 0} kayıt`}
                size="small"
                color="primary"
                sx={{ ml: 'auto' }}
              />
              {fisKarRapor.is_emri_toplam && (
                <Chip
                  label={`Kar: ${formatCurrency(fisKarRapor.is_emri_toplam.kar)}`}
                  size="small"
                  sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
                />
              )}
            </Box>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: { xs: 700, sm: '100%' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Fiş No</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Müşteri</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Araç</TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => toggleFisKarSort('created_at')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        Tarih
                        <SortIcon field="created_at" currentField={fisKarSortField} direction={fisKarSortDirection} />
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Durum</TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => toggleFisKarSort('gercek_toplam_ucret')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        Gelir
                        <SortIcon field="gercek_toplam_ucret" currentField={fisKarSortField} direction={fisKarSortDirection} />
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Maliyet</TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => toggleFisKarSort('kar')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        Kar
                        <SortIcon field="kar" currentField={fisKarSortField} direction={fisKarSortDirection} />
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(fisKarRapor.is_emirleri || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <ReceiptIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">Bu tarih aralığında iş emri bulunmuyor</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortData(fisKarRapor.is_emirleri, fisKarSortField, fisKarSortDirection).map((f) => (
                      <TableRow
                        key={f.id}
                        hover
                        onDoubleClick={() => handleViewDetail(f)}
                        sx={{ cursor: isAdmin ? 'pointer' : 'default' }}
                      >
                        <TableCell>
                          <Typography fontWeight={700} color="primary.main">{f.fis_no}</Typography>
                        </TableCell>
                        <TableCell>{f.musteri_ad_soyad}</TableCell>
                        <TableCell>{f.marka} {f.model_tip}</TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {format(new Date(f.created_at), 'dd.MM.yyyy', { locale: tr })}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={f.durum === 'acik' ? 'Açık' : 'Tamamlandı'}
                            sx={{
                              bgcolor: f.durum === 'acik' ? '#fff3e0' : '#e8f5e9',
                              color: f.durum === 'acik' ? '#e65100' : '#2e7d32',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ color: '#2e7d32' }}>
                            {formatCurrency(f.gercek_toplam_ucret)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ color: '#c62828' }}>
                            {formatCurrency(f.toplam_maliyet)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            fontWeight={700}
                            sx={{
                              color: parseFloat(f.kar) >= 0 ? '#2e7d32' : '#c62828'
                            }}
                          >
                            {formatCurrency(f.kar)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Aksesuar Satışları Tablosu */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShoppingBagIcon color="primary" />
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Aksesuar Satışları
              </Typography>
              <Chip
                label={`${fisKarRapor.aksesuarlar?.length || 0} kayıt`}
                size="small"
                color="primary"
                sx={{ ml: 'auto' }}
              />
              {fisKarRapor.aksesuar_toplam && (
                <Chip
                  label={`Kar: ${formatCurrency(fisKarRapor.aksesuar_toplam.kar)}`}
                  size="small"
                  sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
                />
              )}
            </Box>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: { xs: 600, sm: '100%' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Fiş No</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Müşteri</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Ödeme Şekli</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Tarih</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Satış</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Maliyet</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Kar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(fisKarRapor.aksesuarlar || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <ShoppingBagIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">Bu tarih aralığında aksesuar satışı bulunmuyor</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    (fisKarRapor.aksesuarlar || []).map((a) => (
                      <TableRow
                        key={a.id}
                        hover
                        onDoubleClick={() => handleViewAksesuarDetail(a)}
                        sx={{ cursor: isAdmin ? 'pointer' : 'default' }}
                      >
                        <TableCell>
                          <Typography fontWeight={700} color="primary.main">{a.fis_no}</Typography>
                        </TableCell>
                        <TableCell>{a.musteri_ad_soyad}</TableCell>
                        <TableCell>{a.marka || '-'}</TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {format(new Date(a.created_at), 'dd.MM.yyyy', { locale: tr })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ color: '#2e7d32' }}>
                            {formatCurrency(a.gercek_toplam_ucret)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ color: '#c62828' }}>
                            {formatCurrency(a.toplam_maliyet)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            fontWeight={700}
                            sx={{
                              color: parseFloat(a.kar) >= 0 ? '#2e7d32' : '#c62828'
                            }}
                          >
                            {formatCurrency(a.kar)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Motor Satışları Tablosu */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
              <TwoWheelerIcon sx={{ color: '#e65100' }} />
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, color: '#e65100' }}>
                Motor Satışları
              </Typography>
              <Chip
                label={`${fisKarRapor.motor_satislari?.length || 0} kayıt`}
                size="small"
                sx={{ bgcolor: '#fff3e0', color: '#e65100', ml: 'auto' }}
              />
              {fisKarRapor.motor_satis_toplam && (
                <Chip
                  label={`Kar: ${formatCurrency(fisKarRapor.motor_satis_toplam.kar)}`}
                  size="small"
                  sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
                />
              )}
            </Box>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: { xs: 600, sm: '100%' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Tarih</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Motor Model</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Müşteri</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Satış</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Maliyet</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Kar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(fisKarRapor.motor_satislari || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <TwoWheelerIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">Bu tarih aralığında motor satışı bulunmuyor</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    (fisKarRapor.motor_satislari || []).map((m) => (
                      <TableRow
                        key={m.id}
                        hover
                        onDoubleClick={() => handleViewMotorSatisDetail(m)}
                        sx={{ cursor: isAdmin ? 'pointer' : 'default' }}
                      >
                        <TableCell>
                          <Typography variant="body2">
                            {m.tarih ? format(new Date(m.tarih + 'T12:00:00'), 'dd.MM.yyyy', { locale: tr }) : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={700} sx={{ color: '#e65100' }}>{m.model_adi || '-'}</Typography>
                          {m.cc && <Typography variant="caption" color="text.secondary">{m.cc} cc</Typography>}
                        </TableCell>
                        <TableCell>
                          <Typography>{m.musteri_adi || '-'}</Typography>
                          {m.musteri_telefon && <Typography variant="caption" color="text.secondary">{m.musteri_telefon}</Typography>}
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ color: '#2e7d32' }}>
                            {formatCurrency(m.satis_fiyati)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ color: '#c62828' }}>
                            {formatCurrency(m.iskontolu_alis_fiyati || m.alis_fiyati)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            fontWeight={700}
                            sx={{
                              color: parseFloat(m.kar) >= 0 ? '#2e7d32' : '#c62828'
                            }}
                          >
                            {formatCurrency(m.kar)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </>
    ) : null}
  </Box>
);

export default FisKarRaporTab;
