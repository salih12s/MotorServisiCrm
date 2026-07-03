import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'demirkan_sepet';

// Aksesuar ve bisiklet ürünlerinin id'leri çakışabileceği için sepet öğeleri
// tür + id birleşimiyle anahtarlanır. Eski kayıtlar (key alanı olmayan) aksesuar sayılır.
export const cartItemKey = (item) => item.key || `aksesuar:${item.id}`;

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadInitial);

  // Sepet her değiştiğinde localStorage'a yaz (sayfa yenilense de kalıcı olsun)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* depolama dolu/erişilemez - sessiz geç */
    }
  }, [items]);

  // Ürünü sepete ekler; aynı ürün varsa adedini artırır.
  // Stoktaki miktar (mevcut) aşılamaz; aşılırsa { ok:false, reason:'limit' } döner.
  // tur: 'aksesuar' (varsayılan) veya 'bisiklet' - görsel ve anahtarlama için kullanılır.
  const addItem = useCallback((urun, adet = 1, tur = 'aksesuar') => {
    if (!urun || urun.id == null) return { ok: false, reason: 'invalid' };
    const stok = Number(urun.mevcut);
    const stokVar = Number.isFinite(stok);
    const key = `${tur}:${urun.id}`;
    let result = { ok: true };

    setItems((prev) => {
      const mevcut = prev.find((i) => cartItemKey(i) === key);

      // Stokta hiç yoksa eklenmez
      if (stokVar && stok <= 0) {
        result = { ok: false, reason: 'outofstock', stok };
        return prev;
      }

      if (mevcut) {
        const guncelMevcut = stokVar ? stok : mevcut.mevcut;
        const istenen = mevcut.adet + adet;
        if (stokVar && istenen > stok) {
          result = { ok: false, reason: 'limit', stok };
          // Mevcut adedi stok sınırına sabitle (zaten sınırdaysa değişmez)
          return prev.map((i) => (cartItemKey(i) === key ? { ...i, adet: stok, mevcut: guncelMevcut } : i));
        }
        return prev.map((i) => (cartItemKey(i) === key ? { ...i, adet: istenen, mevcut: guncelMevcut } : i));
      }

      let baslangic = adet;
      if (stokVar && baslangic > stok) {
        baslangic = stok;
        result = { ok: false, reason: 'limit', stok };
      }
      return [
        ...prev,
        {
          id: urun.id,
          key,
          tur,
          stok_adi: urun.stok_adi,
          satis_fiyati: Number(urun.satis_fiyati) || 0,
          birimi: urun.birimi || 'Adet',
          resim: urun.resim || null,
          resim_var: Boolean(urun.resim || urun.resim_var),
          updated_at: urun.updated_at || null,
          mevcut: stokVar ? stok : null,
          adet: baslangic,
        },
      ];
    });

    return result;
  }, []);

  // Aşağıdaki işlemler tür+id anahtarı (cartItemKey) ile çalışır.
  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((i) => cartItemKey(i) !== key));
  }, []);

  // Adedi belirli bir değere ayarlar; 0 veya altına inerse üründen çıkarır.
  // Stok sınırını aşamaz.
  const setQuantity = useCallback((key, adet) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (cartItemKey(i) !== key) return i;
          const sinirli = i.mevcut != null ? Math.min(adet, i.mevcut) : adet;
          return { ...i, adet: sinirli };
        })
        .filter((i) => i.adet > 0)
    );
  }, []);

  // Adedi 1 artırır; stok sınırına ulaşıldıysa artırmaz ve false döner.
  const increment = useCallback((key) => {
    let ok = true;
    setItems((prev) =>
      prev.map((i) => {
        if (cartItemKey(i) !== key) return i;
        if (i.mevcut != null && i.adet >= i.mevcut) {
          ok = false;
          return i;
        }
        return { ...i, adet: i.adet + 1 };
      })
    );
    return ok;
  }, []);

  const decrement = useCallback((key) => {
    setItems((prev) =>
      prev
        .map((i) => (cartItemKey(i) === key ? { ...i, adet: i.adet - 1 } : i))
        .filter((i) => i.adet > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((acc, i) => acc + i.adet, 0), [items]);
  const total = useMemo(
    () => items.reduce((acc, i) => acc + i.adet * (Number(i.satis_fiyati) || 0), 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, addItem, removeItem, setQuantity, increment, decrement, clearCart, count, total }),
    [items, addItem, removeItem, setQuantity, increment, decrement, clearCart, count, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart, CartProvider içinde kullanılmalıdır');
  return ctx;
}

export default CartContext;
