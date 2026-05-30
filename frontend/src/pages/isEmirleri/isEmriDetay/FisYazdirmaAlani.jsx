import React from 'react';
import { Box } from '@mui/material';
import { DragIndicator as DragIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { formatCurrency } from './printSettings';

const FisYazdirmaAlani = ({
  printRef,
  containerRef,
  editMode,
  settings,
  isEmri,
  getPositionStyle,
  handleDragStart,
  setSelectedField,
}) => (
  <Box ref={printRef}>
    <style type="text/css" media="print">
      {`
        @page { size: A4; margin: 0mm; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}
    </style>

    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '210mm',
        height: '297mm',
        backgroundImage: 'url(/Fis.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        margin: '0 auto',
        overflow: 'hidden',
        border: editMode ? '3px solid #1976d2' : '1px solid #ddd',
        borderRadius: editMode ? '8px' : '4px',
        '@media print': {
          margin: 0,
          border: 'none',
        }
      }}
    >
      {/* Fiş No */}
      {settings.fisNo?.visible && (
        <Box
          sx={getPositionStyle('fisNo')}
          onMouseDown={(e) => handleDragStart(e, 'fisNo')}
          onClick={() => editMode && setSelectedField('fisNo')}
        >
          {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
          <span style={{ fontWeight: 800 }}>{isEmri.fis_no}</span>
        </Box>
      )}

      {/* Tarih */}
      {settings.tarih?.visible && (
        <Box
          sx={getPositionStyle('tarih')}
          onMouseDown={(e) => handleDragStart(e, 'tarih')}
          onClick={() => editMode && setSelectedField('tarih')}
        >
          {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
          <span style={{ fontWeight: 700 }}>
            {isEmri.created_at ? format(new Date(isEmri.created_at), 'dd.MM.yyyy', { locale: tr }) : '-'}
          </span>
        </Box>
      )}

      {/* Müşteri Adı */}
      {settings.musteriAd?.visible && (
        <Box
          sx={getPositionStyle('musteriAd')}
          onMouseDown={(e) => handleDragStart(e, 'musteriAd')}
          onClick={() => editMode && setSelectedField('musteriAd')}
        >
          {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
          <span style={{ fontWeight: 700 }}>{isEmri.musteri_ad_soyad}</span>
        </Box>
      )}

      {/* Telefon */}
      {settings.telefon?.visible && (
        <Box
          sx={getPositionStyle('telefon')}
          onMouseDown={(e) => handleDragStart(e, 'telefon')}
          onClick={() => editMode && setSelectedField('telefon')}
        >
          {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
          <span>{isEmri.telefon || '-'}</span>
        </Box>
      )}

      {/* Adres */}
      {settings.adres?.visible && (
        <Box
          sx={{ ...getPositionStyle('adres'), maxWidth: '45%' }}
          onMouseDown={(e) => handleDragStart(e, 'adres')}
          onClick={() => editMode && setSelectedField('adres')}
        >
          {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
          <span>{isEmri.adres || '-'}</span>
        </Box>
      )}

      {/* Marka */}
      {settings.marka?.visible && (
        <Box
          sx={getPositionStyle('marka')}
          onMouseDown={(e) => handleDragStart(e, 'marka')}
          onClick={() => editMode && setSelectedField('marka')}
        >
          {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
          <span style={{ fontWeight: 700 }}>{isEmri.marka}</span>
        </Box>
      )}

      {/* Model */}
      {settings.model?.visible && (
        <Box
          sx={getPositionStyle('model')}
          onMouseDown={(e) => handleDragStart(e, 'model')}
          onClick={() => editMode && setSelectedField('model')}
        >
          {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
          <span>{isEmri.model_tip || '-'}</span>
        </Box>
      )}

      {/* Açıklama */}
      {settings.aciklama?.visible && (
        <Box
          sx={{ ...getPositionStyle('aciklama'), maxWidth: '85%' }}
          onMouseDown={(e) => handleDragStart(e, 'aciklama')}
          onClick={() => editMode && setSelectedField('aciklama')}
        >
          {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
          <span>{isEmri.aciklama || '-'}</span>
        </Box>
      )}

      {/* Arıza/Şikayetler */}
      {settings.arizaSikayetler?.visible && (
        <Box
          sx={{ ...getPositionStyle('arizaSikayetler'), maxWidth: '85%' }}
          onMouseDown={(e) => handleDragStart(e, 'arizaSikayetler')}
          onClick={() => editMode && setSelectedField('arizaSikayetler')}
        >
          {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
          <span>{isEmri.ariza_sikayetler || '-'}</span>
        </Box>
      )}

      {/* Tahmini Teslim */}
      {settings.tahminiTeslim?.visible && (
        <Box
          sx={getPositionStyle('tahminiTeslim')}
          onMouseDown={(e) => handleDragStart(e, 'tahminiTeslim')}
          onClick={() => editMode && setSelectedField('tahminiTeslim')}
        >
          {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
          <span>
            {isEmri.tahmini_teslim_tarihi ? format(new Date(isEmri.tahmini_teslim_tarihi), 'dd.MM.yyyy', { locale: tr }) : '-'}
          </span>
        </Box>
      )}

      {/* Parça Tablosu */}
      {isEmri.parcalar && isEmri.parcalar.length > 0 && (
        <>
          {/* Parça Kodları */}
          {(settings.parcaKodu === undefined || settings.parcaKodu?.visible !== false) && (
            <Box
              sx={{ ...getPositionStyle('parcaKodu'), cursor: editMode ? 'move' : 'default' }}
              onMouseDown={(e) => handleDragStart(e, 'parcaKodu')}
              onClick={() => editMode && setSelectedField('parcaKodu')}
            >
              {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
              <div>
                {isEmri.parcalar.map((parca, index) => (
                  <div key={index} style={{ marginBottom: '4px', lineHeight: '1.6' }}>
                    {index + 1}
                  </div>
                ))}
              </div>
            </Box>
          )}

          {/* Parça Adları */}
          {(settings.parcaAdi === undefined || settings.parcaAdi?.visible !== false) && (
            <Box
              sx={{ ...getPositionStyle('parcaAdi'), cursor: editMode ? 'move' : 'default' }}
              onMouseDown={(e) => handleDragStart(e, 'parcaAdi')}
              onClick={() => editMode && setSelectedField('parcaAdi')}
            >
              {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
              <div>
                {isEmri.parcalar.map((parca, index) => (
                  <div key={index} style={{ marginBottom: '4px', lineHeight: '1.6', fontWeight: 600 }}>
                    {parca.takilan_parca}
                  </div>
                ))}
              </div>
            </Box>
          )}

          {/* Parça Adetleri */}
          {(settings.parcaAdet === undefined || settings.parcaAdet?.visible !== false) && (
            <Box
              sx={{ ...getPositionStyle('parcaAdet'), cursor: editMode ? 'move' : 'default' }}
              onMouseDown={(e) => handleDragStart(e, 'parcaAdet')}
              onClick={() => editMode && setSelectedField('parcaAdet')}
            >
              {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
              <div>
                {isEmri.parcalar.map((parca, index) => (
                  <div key={index} style={{ marginBottom: '4px', lineHeight: '1.6' }}>
                    {parca.adet}
                  </div>
                ))}
              </div>
            </Box>
          )}

          {/* Parça Fiyatları */}
          {(settings.parcaFiyat === undefined || settings.parcaFiyat?.visible !== false) && (
            <Box
              sx={{ ...getPositionStyle('parcaFiyat'), cursor: editMode ? 'move' : 'default' }}
              onMouseDown={(e) => handleDragStart(e, 'parcaFiyat')}
              onClick={() => editMode && setSelectedField('parcaFiyat')}
            >
              {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
              <div>
                {isEmri.parcalar.map((parca, index) => (
                  <div key={index} style={{ marginBottom: '4px', lineHeight: '1.6' }}>
                    {formatCurrency(parca.adet * parca.birim_fiyat)}
                  </div>
                ))}
              </div>
            </Box>
          )}
        </>
      )}

      {/* Genel Toplam */}
      {(settings.genelToplam === undefined || settings.genelToplam?.visible !== false) && isEmri.parcalar && isEmri.parcalar.length > 0 && (
        <Box
          sx={getPositionStyle('genelToplam')}
          onMouseDown={(e) => handleDragStart(e, 'genelToplam')}
          onClick={() => editMode && setSelectedField('genelToplam')}
        >
          {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
          <span style={{ fontWeight: 800 }}>
            {formatCurrency(isEmri.parcalar.reduce((acc, p) => acc + (p.adet * p.birim_fiyat), 0))}
          </span>
        </Box>
      )}

      {/* Tahmini Toplam Ücret */}
      {(settings.tahminiUcret === undefined || settings.tahminiUcret?.visible !== false) && (
        <Box
          sx={getPositionStyle('tahminiUcret')}
          onMouseDown={(e) => handleDragStart(e, 'tahminiUcret')}
          onClick={() => editMode && setSelectedField('tahminiUcret')}
        >
          {editMode && <DragIcon sx={{ fontSize: 14, color: '#1976d2', mr: 0.5, verticalAlign: 'middle' }} />}
          <span style={{ fontWeight: 800 }}>
            {formatCurrency(isEmri.tahmini_toplam_ucret)}
          </span>
        </Box>
      )}
    </Box>
  </Box>
);

export default FisYazdirmaAlani;
