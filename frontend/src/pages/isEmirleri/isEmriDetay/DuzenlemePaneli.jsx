import React from 'react';
import { Box, Card, CardContent, Typography, Chip, IconButton, Tooltip, Slider } from '@mui/material';
import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import { fieldLabels } from './printSettings';

const DuzenlemePaneli = ({
  settings,
  selectedField,
  setSelectedField,
  toggleVisibility,
  changeFontSize,
  handleSliderChange,
}) => (
  <Card sx={{ mb: 3, bgcolor: '#e3f2fd' }}>
    <CardContent>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#1976d2' }}>
        📍 Alanları Sürükle & Bırak | Tıklayarak Seç | Boyut Ayarla
      </Typography>

      {/* Alan Seçici */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {Object.keys(settings).map((key) => (
          <Chip
            key={key}
            label={fieldLabels[key]}
            onClick={() => setSelectedField(selectedField === key ? null : key)}
            onDelete={() => toggleVisibility(key)}
            deleteIcon={settings[key].visible ? <DeleteIcon /> : <SaveIcon />}
            color={selectedField === key ? 'primary' : settings[key].visible ? 'default' : 'default'}
            variant={settings[key].visible ? 'filled' : 'outlined'}
            sx={{
              cursor: 'pointer',
              opacity: settings[key].visible ? 1 : 0.5,
              border: selectedField === key ? '2px solid #1976d2' : undefined,
            }}
          />
        ))}
      </Box>

      {/* Seçili Alan Boyut Kontrolü */}
      {selectedField && (
        <Box sx={{
          bgcolor: 'white',
          p: 2,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          boxShadow: 1
        }}>
          <Typography variant="body2" fontWeight={600} sx={{ minWidth: 100 }}>
            {fieldLabels[selectedField]}:
          </Typography>

          <Tooltip title="Küçült">
            <IconButton
              size="small"
              onClick={() => changeFontSize(selectedField, -0.1)}
              color="primary"
            >
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>

          <Slider
            value={settings[selectedField].fontSize}
            min={0.5}
            max={3}
            step={0.05}
            onChange={(e, val) => handleSliderChange(selectedField, val)}
            sx={{ width: 200 }}
          />

          <Tooltip title="Büyüt">
            <IconButton
              size="small"
              onClick={() => changeFontSize(selectedField, 0.1)}
              color="primary"
            >
              <ZoomInIcon />
            </IconButton>
          </Tooltip>

          <Typography variant="body2" sx={{ minWidth: 50 }}>
            {settings[selectedField].fontSize.toFixed(2)}rem
          </Typography>

          <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Konum: {settings[selectedField].top.toFixed(0)}% / {settings[selectedField].left.toFixed(0)}%
            </Typography>
          </Box>
        </Box>
      )}

      <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#666' }}>
        💡 Alan seçip boyutunu ayarlayın veya sürükleyerek taşıyın. Değişiklikler otomatik kaydedilir.
      </Typography>
    </CardContent>
  </Card>
);

export default DuzenlemePaneli;
