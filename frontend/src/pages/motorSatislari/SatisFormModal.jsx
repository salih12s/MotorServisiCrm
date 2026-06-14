import React from 'react';
import {
  Box, Paper, Typography, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, InputAdornment,
  Grid, FormControl, InputLabel, Select, Card, CardContent, Avatar, Divider
} from '@mui/material';
import {
  Add as AddIcon,
  TwoWheeler as MotorIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';

const DAMGA_VERGISI = 791;
const KDV_ORANI = 20;

const SatisFormModal = ({
  open,
  onClose,
  isMobile,
  editingSatis,
  satisForm,
  setSatisForm,
  modeller,
  getInputValue,
  handlePriceChange,
  handlePriceFocus,
  handlePriceBlur,
  isAdmin,
  user,
  formatCurrency,
  onSave,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          minHeight: { xs: '100vh', sm: '80vh' },
          borderRadius: { xs: 0, sm: 2 },
          m: { xs: 0, sm: 2 },
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: { xs: 2, sm: 2.5 },
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            <MotorIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {editingSatis ? 'Motor Satışı Düzenle' : 'Yeni Motor Satış'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Motor satış bilgilerini girin
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            bgcolor: 'grey.200',
            '&:hover': { bgcolor: 'grey.300' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 1.5, sm: 2 }, width: '100%' }}>
        <Grid container spacing={2}>
          {/* Motor Bilgileri */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', width: 28, height: 28 }}>
                    <MotorIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Motor Bilgileri
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mb: 1.5 }}>
                  <TextField
                    sx={{ flex: 1, mt: 1.1 }}
                    size="small"
                    label="Tarih"
                    type="date"
                    value={satisForm.tarih}
                    onChange={(e) => setSatisForm({ ...satisForm, tarih: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    sx={{ flex: 1, mt: 1.1 }}
                    size="small"
                    label="Şase No"
                    value={satisForm.sase_no}
                    onChange={(e) => setSatisForm({ ...satisForm, sase_no: e.target.value })}
                    required
                    placeholder="Şase numarasını girin"
                  />
                  <FormControl size="small" sx={{ flex: 1, mt: 1.1 }}>
                    <InputLabel>Durum</InputLabel>
                    <Select
                      value={satisForm.durum}
                      onChange={(e) => setSatisForm({ ...satisForm, durum: e.target.value })}
                      label="Durum"
                    >
                      <MenuItem value="beklemede">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff9800' }} />
                          Beklemede
                        </Box>
                      </MenuItem>
                      <MenuItem value="tamamlandi">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
                          Tamamlandı
                        </Box>
                      </MenuItem>
                      <MenuItem value="iptal">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f44336' }} />
                          İptal
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
                  <FormControl size="small" sx={{ flex: 1, mt: 1 }} required>
                    <InputLabel>Motor Modeli</InputLabel>
                    <Select
                      value={satisForm.motor_modeli_id}
                      onChange={(e) => setSatisForm({ ...satisForm, motor_modeli_id: e.target.value })}
                      label="Motor Modeli"
                    >
                      {modeller.map((model) => (
                        <MenuItem key={model.id} value={model.id}>
                          {model.model_adi} {model.cc && `(${model.cc}cc)`} {model.otv_orani && `- ÖTV: %${model.otv_orani}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ flex: 1, mt: 1 }}>
                    <InputLabel>Ödeme Şekli</InputLabel>
                    <Select
                      value={satisForm.odeme_sekli}
                      onChange={(e) => setSatisForm({ ...satisForm, odeme_sekli: e.target.value })}
                      label="Ödeme Şekli"
                    >
                      <MenuItem value="nakit">Nakit</MenuItem>
                      <MenuItem value="kart">Kart</MenuItem>
                      <MenuItem value="havale">Havale/EFT</MenuItem>
                      <MenuItem value="kredi">Kredi</MenuItem>
                      <MenuItem value="karisik">Karışık (Çoklu Ödeme)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Karışık Ödeme Detayları */}
                {satisForm.odeme_sekli === 'karisik' && (
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mt: 1.5 }}>
                    <TextField
                      sx={{ flex: 1 }}
                      size="small"
                      label="Nakit Tutar"
                      value={getInputValue('nakit_tutar')}
                      onChange={(e) => handlePriceChange('nakit_tutar', e.target.value)}
                      onFocus={() => handlePriceFocus('nakit_tutar')}
                      onBlur={() => handlePriceBlur('nakit_tutar')}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₺</InputAdornment>
                      }}
                      placeholder="0"
                    />
                    <TextField
                      sx={{ flex: 1 }}
                      size="small"
                      label="Kart Tutar"
                      value={getInputValue('kart_tutar')}
                      onChange={(e) => handlePriceChange('kart_tutar', e.target.value)}
                      onFocus={() => handlePriceFocus('kart_tutar')}
                      onBlur={() => handlePriceBlur('kart_tutar')}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₺</InputAdornment>
                      }}
                      placeholder="0"
                    />
                    <TextField
                      sx={{ flex: 1 }}
                      size="small"
                      label="Havale Tutar"
                      value={getInputValue('havale_tutar')}
                      onChange={(e) => handlePriceChange('havale_tutar', e.target.value)}
                      onFocus={() => handlePriceFocus('havale_tutar')}
                      onBlur={() => handlePriceBlur('havale_tutar')}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₺</InputAdornment>
                      }}
                      placeholder="0"
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Müşteri Bilgileri */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'secondary.lighter', color: 'secondary.main', width: 28, height: 28 }}>
                    <PersonIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Müşteri Bilgileri
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mb: 1.5 }}>
                  <TextField
                    sx={{ flex: 1 }}
                    size="small"
                    label="Müşteri Adı"
                    value={satisForm.musteri_adi}
                    onChange={(e) => setSatisForm({ ...satisForm, musteri_adi: e.target.value })}
                    placeholder="Müşteri adı soyadı"
                  />
                  <TextField
                    sx={{ flex: 1 }}
                    size="small"
                    label="Müşteri Telefon"
                    value={satisForm.musteri_telefon}
                    onChange={(e) => setSatisForm({ ...satisForm, musteri_telefon: e.target.value })}
                    placeholder="0555 555 55 55"
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
                  <TextField
                    sx={{ flex: 1 }}
                    size="small"
                    label="TC Kimlik No"
                    value={satisForm.tc_kimlik_no}
                    onChange={(e) => setSatisForm({ ...satisForm, tc_kimlik_no: e.target.value })}
                    placeholder="12345678901"
                    inputProps={{ maxLength: 11 }}
                  />
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel>Oluşturan Kişi</InputLabel>
                    <Select
                      value={satisForm.olusturan_kisi}
                      onChange={(e) => setSatisForm({ ...satisForm, olusturan_kisi: e.target.value })}
                      label="Oluşturan Kişi"
                    >
                      <MenuItem value={user?.name || user?.ad_soyad || ''}>
                        {user?.name || user?.ad_soyad || 'Ben'}
                      </MenuItem>
                      <MenuItem value="Ortak">Ortak</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Fiyat Bilgileri */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%', width: 595 }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main', width: 28, height: 28 }}>
                    <MoneyIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Fiyat Bilgileri
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mb: 1.5 }}>
                  <TextField
                    sx={{ flex: 1, mt: 1.1 }}
                    size="small"
                    label="Alış Fiyatı"
                    value={getInputValue('alis_fiyati')}
                    onChange={(e) => handlePriceChange('alis_fiyati', e.target.value)}
                    onFocus={() => handlePriceFocus('alis_fiyati')}
                    onBlur={() => handlePriceBlur('alis_fiyati')}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₺</InputAdornment>
                    }}
                    placeholder="76.791,67"
                  />
                  <TextField
                    sx={{ flex: 1, mt: 1.1 }}
                    size="small"
                    label="Satış Fiyatı"
                    value={getInputValue('satis_fiyati')}
                    onChange={(e) => handlePriceChange('satis_fiyati', e.target.value)}
                    onFocus={() => handlePriceFocus('satis_fiyati')}
                    onBlur={() => handlePriceBlur('satis_fiyati')}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₺</InputAdornment>
                    }}
                    placeholder="105.000"
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
                  <TextField
                    sx={{ flex: 1, mt: 1.1 }}
                    size="small"
                    label="Fatura Fiyatı"
                    value={getInputValue('fatura_fiyati')}
                    onChange={(e) => handlePriceChange('fatura_fiyati', e.target.value)}
                    onFocus={() => handlePriceFocus('fatura_fiyati')}
                    onBlur={() => handlePriceBlur('fatura_fiyati')}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₺</InputAdornment>
                    }}
                    placeholder="100.000"
                  />
                  <TextField
                    sx={{ flex: 1, mt: 1.1 }}
                    size="small"
                    label="İskonto (%)"
                    type="number"
                    value={satisForm.iskonto}
                    onChange={(e) => setSatisForm({ ...satisForm, iskonto: e.target.value })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Açıklama ve Kâr Özeti */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', width: 500 }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'warning.lighter', color: 'warning.main', width: 28, height: 28 }}>
                    <ReceiptIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Açıklama / Özet
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mb: 1.5 }}>
                  <TextField
                    sx={{ flex: 1 }}
                    size="small"
                    label="Açıklama / Not"
                    multiline
                    rows={4}
                    value={satisForm.aciklama}
                    onChange={(e) => setSatisForm({ ...satisForm, aciklama: e.target.value })}
                    placeholder="Satış ile ilgili notlar..."
                  />
                  <TextField
                    sx={{ flex: 1 }}
                    size="small"
                    label="Adres"
                    multiline
                    rows={4}
                    value={satisForm.adres}
                    onChange={(e) => setSatisForm({ ...satisForm, adres: e.target.value })}
                    placeholder="Müşteri adresi..."
                  />
                </Box>

                {/* Kâr Hesabı Özeti - Sadece Admin */}
                {isAdmin && (satisForm.alis_fiyati || satisForm.satis_fiyati || satisForm.fatura_fiyati) && (() => {
                  const model = modeller.find(m => m.id === satisForm.motor_modeli_id);
                  const otvOrani = parseFloat(model?.otv_orani || 0);
                  const alisFiyati = parseFloat(satisForm.alis_fiyati || 0);
                  const satisFiyati = parseFloat(satisForm.satis_fiyati || 0);
                  const faturaFiyati = parseFloat(satisForm.fatura_fiyati || 0);
                  const iskontoOrani = parseFloat(satisForm.iskonto || 0);
                  // Doğru hesaplama: Matrah = Fatura / ((1 + ÖTV) × (1 + KDV))
                  const matrah = faturaFiyati / ((1 + otvOrani / 100) * (1 + KDV_ORANI / 100));
                  // ÖTV = Matrah × ÖTV Oranı
                  const otvTutari = matrah * (otvOrani / 100);
                  // KDV Matrahı = Matrah + ÖTV
                  const kdvsizTutar = matrah + otvTutari;
                  // KDV = KDV Matrahı × KDV Oranı
                  const kdvTutari = kdvsizTutar * (KDV_ORANI / 100);
                  // İskonto hesabı - doğrudan alış fiyatı üzerinden
                  const iskontoTutari = alisFiyati * (iskontoOrani / 100);
                  const iskontoluAlis = alisFiyati - iskontoTutari;
                  // Vergiler toplamı
                  const vergilerToplami = kdvTutari + otvTutari + DAMGA_VERGISI;
                  // Kar = Satış Fiyatı - Vergiler Toplamı - İskontolu Alış
                  const kar = satisFiyati - vergilerToplami - iskontoluAlis;

                  return (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        bgcolor: 'grey.50',
                        borderStyle: 'solid',
                        borderColor: 'primary.main',
                        borderWidth: 2
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ mb: 1 }}>
                        📊 Canlı Hesaplama (Admin)
                      </Typography>

                      {/* Fiyatlar */}
                      <Box sx={{ mb: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">FİYATLAR</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.5, mt: 0.5 }}>
                          <Box>
                            <Typography variant="caption" color="error.main" fontSize="0.65rem">Alış</Typography>
                            <Typography variant="body2" fontWeight={600} color="error.main">{formatCurrency(alisFiyati)}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="success.main" fontSize="0.65rem">Satış</Typography>
                            <Typography variant="body2" fontWeight={600} color="success.main">{formatCurrency(satisFiyati)}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="info.main" fontSize="0.65rem">Fatura</Typography>
                            <Typography variant="body2" fontWeight={600} color="info.main">{formatCurrency(faturaFiyati)}</Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* İskonto */}
                      {iskontoOrani > 0 && (
                        <Box sx={{ mb: 1, p: 1, bgcolor: 'warning.50', borderRadius: 1 }}>
                          <Typography variant="caption" fontWeight={600} color="warning.dark">%{iskontoOrani} İSKONTO</Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">İskonto Tutarı:</Typography>
                            <Typography variant="body2" fontWeight={600} color="warning.dark">-{formatCurrency(iskontoTutari)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">İskontolu Alış:</Typography>
                            <Typography variant="body2" fontWeight={700} color="warning.dark">{formatCurrency(iskontoluAlis)}</Typography>
                          </Box>
                        </Box>
                      )}

                      {/* Vergiler */}
                      <Box sx={{ mb: 1, p: 1, bgcolor: 'error.50', borderRadius: 1 }}>
                        <Typography variant="caption" fontWeight={600} color="error.main">VERGİLER (Fatura üzerinden)</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, mt: 0.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">KDV (%{KDV_ORANI}):</Typography>
                            <Typography variant="caption" fontWeight={600}>{formatCurrency(kdvTutari)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">ÖTV (%{otvOrani}):</Typography>
                            <Typography variant="caption" fontWeight={600}>{formatCurrency(otvTutari)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">Damga V.:</Typography>
                            <Typography variant="caption" fontWeight={600}>{formatCurrency(DAMGA_VERGISI)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">Matrah:</Typography>
                            <Typography variant="caption" fontWeight={600}>{formatCurrency(matrah)}</Typography>
                          </Box>
                        </Box>
                        <Divider sx={{ my: 0.5 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" fontWeight={600} color="error.main">Vergiler Toplamı:</Typography>
                          <Typography variant="body2" fontWeight={700} color="error.main">{formatCurrency(vergilerToplami)}</Typography>
                        </Box>
                      </Box>

                      {/* Kar Hesabı */}
                      <Box sx={{ p: 1, bgcolor: kar >= 0 ? 'success.100' : 'error.100', borderRadius: 1, border: '2px solid', borderColor: kar >= 0 ? 'success.main' : 'error.main' }}>
                        <Typography variant="caption" fontWeight={600} color={kar >= 0 ? 'success.dark' : 'error.dark'}>KAR HESABI</Typography>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.65rem' }}>
                          {formatCurrency(satisFiyati)} (Satış) - {formatCurrency(vergilerToplami)} (Vergiler) - {formatCurrency(iskontoluAlis)} (İsk. Alış)
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="body1" fontWeight={700}>TAHMİNİ KAR:</Typography>
                          <Typography
                            variant="h6"
                            fontWeight={800}
                            color={kar >= 0 ? 'success.main' : 'error.main'}
                          >
                            {formatCurrency(kar)}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          İptal
        </Button>
        <Button onClick={onSave} variant="contained" color="primary" startIcon={<AddIcon />}>
          {editingSatis ? 'Güncelle' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SatisFormModal;
