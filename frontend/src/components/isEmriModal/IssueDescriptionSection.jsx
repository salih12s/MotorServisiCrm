import React from 'react';
import { Box, TextField, Chip } from '@mui/material';
import { Build as BuildIcon } from '@mui/icons-material';
import FormSectionCard from './FormSectionCard';

const HIZLI_SECIMLER = ['Periyodik Bakım', 'Ağır Bakım', 'Tamir', 'Sigorta'];

function IssueDescriptionSection({ formData, setFormData, handleChange }) {
  const addToAriza = (label) => {
    setFormData((prev) => ({
      ...prev,
      ariza_sikayetler: prev.ariza_sikayetler ? `${prev.ariza_sikayetler}, ${label}` : label,
    }));
  };

  return (
    <FormSectionCard icon={<BuildIcon />} iconBg="warning.lighter" iconColor="warning.main" title="Arıza ve Açıklama">
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {HIZLI_SECIMLER.map((label) => (
          <Chip
            key={label}
            label={label}
            onClick={() => addToAriza(label)}
            sx={{
              cursor: 'pointer',
              bgcolor: '#E5E5E5',
              '&:hover': { bgcolor: '#04A7B8', color: 'white' },
            }}
          />
        ))}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
        <TextField
          size="small"
          multiline
          rows={3}
          label="Arıza / Şikayetler"
          name="ariza_sikayetler"
          value={formData.ariza_sikayetler}
          onChange={handleChange}
          placeholder="Arıza ve şikayetler..."
        />
        <TextField
          size="small"
          multiline
          rows={3}
          label="Ek Açıklama"
          name="aciklama"
          value={formData.aciklama}
          onChange={handleChange}
          placeholder="Ek açıklamalar..."
        />
      </Box>
    </FormSectionCard>
  );
}

export default IssueDescriptionSection;
