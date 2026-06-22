import React, { useState } from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Stack,
  Button,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  WhatsApp as WhatsAppIcon,
  ShoppingCartOutlined as ShoppingCartOutlinedIcon,
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { getPublicAksesuarImageUrl } from '../services/api';
import { WHATSAPP_NUMBER } from '../config/site';

function formatCurrency(value) {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function cartItemImage(item) {
  if (item.resim) return item.resim;
  if (item.resim_var) return getPublicAksesuarImageUrl(item.id, item.updated_at);
  return null;
}

// Sepetteki ürünlerden WhatsApp sipariş mesajı oluşturur
function buildWhatsappMessage(items, total) {
  const satirlar = items
    .map(
      (i) =>
        `${i.stok_adi}\nAdet: ${i.adet}\nFiyat: ₺${formatCurrency(i.satis_fiyati)}`
    )
    .join('\n\n');
  return (
    'Merhaba, aşağıdaki ürünler için bilgi almak / sipariş vermek istiyorum:\n\n' +
    `${satirlar}\n\n` +
    `Toplam Tutar: ₺${formatCurrency(total)}`
  );
}

function CartDrawer({ open, onClose }) {
  const { items, increment, decrement, removeItem, clearCart, total, count } = useCart();
  const [uyari, setUyari] = useState('');

  const handleIncrement = (item) => {
    const ok = increment(item.id);
    if (!ok) {
      setUyari(`Stokta en fazla ${item.mevcut} ${item.birimi || 'adet'} var, daha fazla ekleyemezsiniz.`);
    }
  };

  const handleWhatsapp = () => {
    if (items.length === 0) return;
    const mesaj = encodeURIComponent(buildWhatsappMessage(items, total));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${mesaj}`, '_blank', 'noopener');
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          maxWidth: '100%',
          background: 'linear-gradient(180deg, #06141f 0%, #02080f 100%)',
          color: '#fff',
          borderLeft: '1px solid rgba(54,197,211,0.3)',
        },
      }}
    >
      {/* Başlık */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2, borderBottom: '1px solid rgba(54,197,211,0.18)' }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <ShoppingCartOutlinedIcon sx={{ color: '#36C5D3' }} />
          <Typography sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
            Sepetim {count > 0 && `(${count})`}
          </Typography>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: '#fff' }} aria-label="Kapat">
          <CloseIcon />
        </IconButton>
      </Stack>

      {/* İçerik */}
      {items.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center' }}>
          <ShoppingCartOutlinedIcon sx={{ fontSize: 56, color: 'rgba(54,197,211,0.3)', mb: 2 }} />
          <Typography sx={{ color: 'rgba(255,255,255,0.55)' }}>
            Sepetiniz boş.
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', mt: 0.5 }}>
            Aksesuar ve ekipman sayfasından ürün ekleyebilirsiniz.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          <Stack spacing={1.5}>
            {items.map((item) => {
              const img = cartItemImage(item);
              return (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    p: 1.25,
                    borderRadius: 2,
                    border: '1px solid rgba(54,197,211,0.15)',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >
                  {/* Görsel */}
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      flexShrink: 0,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      bgcolor: 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {img ? (
                      <Box component="img" src={img} alt={item.stok_adi} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ImageIcon sx={{ color: 'rgba(54,197,211,0.3)' }} />
                    )}
                  </Box>

                  {/* Bilgi */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.stok_adi}
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#36C5D3', mt: 0.25 }}>
                      ₺{formatCurrency(item.satis_fiyati)}
                    </Typography>

                    {/* Adet kontrolü + sil */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.75 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => decrement(item.id)}
                          sx={{ color: '#fff', border: '1px solid rgba(255,255,255,0.2)', p: 0.25 }}
                          aria-label="Adet azalt"
                        >
                          <RemoveIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <Typography sx={{ minWidth: 24, textAlign: 'center', fontWeight: 700 }}>
                          {item.adet}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleIncrement(item)}
                          disabled={item.mevcut != null && item.adet >= item.mevcut}
                          sx={{
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.2)',
                            p: 0.25,
                            '&.Mui-disabled': { color: 'rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.1)' },
                          }}
                          aria-label="Adet artır"
                        >
                          <AddIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                      <IconButton
                        size="small"
                        onClick={() => removeItem(item.id)}
                        sx={{ color: '#ff6b6b' }}
                        aria-label="Ürünü sil"
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Stack>
                  </Box>
                </Box>
              );
            })}
          </Stack>

          <Button
            onClick={clearCart}
            size="small"
            sx={{ mt: 1.5, color: 'rgba(255,255,255,0.5)', textTransform: 'none', '&:hover': { color: '#ff6b6b' } }}
          >
            Sepeti Temizle
          </Button>
        </Box>
      )}

      {/* Alt - toplam ve sipariş */}
      {items.length > 0 && (
        <Box sx={{ p: 2, borderTop: '1px solid rgba(54,197,211,0.18)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>Toplam Tutar</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#36C5D3' }}>
              ₺{formatCurrency(total)}
            </Typography>
          </Stack>
          <Divider sx={{ borderColor: 'rgba(54,197,211,0.12)', mb: 1.5 }} />
          <Button
            fullWidth
            variant="contained"
            startIcon={<WhatsAppIcon />}
            onClick={handleWhatsapp}
            sx={{
              background: 'linear-gradient(135deg, #1faf53 0%, #25D366 100%)',
              color: '#fff',
              fontWeight: 800,
              py: 1.3,
              borderRadius: 50,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 8px 24px rgba(37,211,102,0.4)',
              '&:hover': { background: 'linear-gradient(135deg, #25D366 0%, #1faf53 100%)' },
            }}
          >
            WhatsApp ile Sipariş Ver
          </Button>
        </Box>
      )}

      <Snackbar
        open={Boolean(uyari)}
        autoHideDuration={2500}
        onClose={() => setUyari('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setUyari('')} severity="warning" variant="filled" sx={{ fontWeight: 600 }}>
          {uyari}
        </Alert>
      </Snackbar>
    </Drawer>
  );
}

export default CartDrawer;
