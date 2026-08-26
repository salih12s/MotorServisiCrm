import React from 'react';
import { FormControl, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { Receipt as ReceiptIcon } from '@mui/icons-material';
import FormSectionCard from './FormSectionCard';

function PaymentDetailsSection({ formData, setFormData, handleChange }) {
  const hasCariCollection = Number(formData.cari_nakit_tutar || 0) + Number(formData.cari_kart_tutar || 0) + Number(formData.cari_havale_tutar || 0) > 0;
  const paymentField = (name, label, color) => (
    <TextField disabled={hasCariCollection} fullWidth size="small" name={name} label={label} type="number" value={formData[name] || ''}
      onChange={handleChange} inputProps={{ min: 0, step: .01 }}
      InputProps={{ startAdornment: <InputAdornment position="start" sx={{ color }}>₺</InputAdornment> }} />
  );
  const selectedPaymentField = {
    nakit: ['nakit_tutar', 'Nakit Tutarı', '#16a34a'],
    kart: ['kart_tutar', 'Kart Tutarı', '#2563eb'],
    havale: ['havale_tutar', 'Havale / EFT Tutarı', '#9333ea'],
  }[formData.odeme_sekli];

  return (
    <FormSectionCard icon={<ReceiptIcon />} iconBg="success.lighter" iconColor="success.main" title="Ödeme Detayları">
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 1.5 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Ödeme Türü</InputLabel>
          <Select disabled={hasCariCollection} name="odeme_sekli" label="Ödeme Türü" value={formData.odeme_sekli || 'nakit'}
            onChange={(event) => setFormData((prev) => ({ ...prev, odeme_sekli: event.target.value, nakit_tutar: '', kart_tutar: '', havale_tutar: '' }))}>
            <MenuItem value="nakit">Nakit</MenuItem>
            <MenuItem value="kart">Kart</MenuItem>
            <MenuItem value="havale">Havale / EFT</MenuItem>
            <MenuItem value="karisik">Karışık / Çoklu Ödeme</MenuItem>
          </Select>
        </FormControl>
        <TextField fullWidth size="small" label="Satış Tarihi" name="satis_tarihi" type="date" value={formData.satis_tarihi} onChange={handleChange} InputLabelProps={{ shrink: true }} />
      </Stack>
      {formData.odeme_sekli === 'karisik' && <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }}>
        {paymentField('nakit_tutar', 'Nakit', '#16a34a')}
        {paymentField('kart_tutar', 'Kart', '#2563eb')}
        {paymentField('havale_tutar', 'Havale', '#9333ea')}
      </Stack>}
      {selectedPaymentField && <Stack sx={{ mb: 1.5 }}>
        {paymentField(...selectedPaymentField)}
      </Stack>}
      <TextField fullWidth multiline rows={2} size="small" name="odeme_detaylari" value={formData.odeme_detaylari} onChange={handleChange} placeholder="Ödeme detayları..." />
    </FormSectionCard>
  );
}

export default PaymentDetailsSection;
