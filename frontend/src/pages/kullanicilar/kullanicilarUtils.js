// Aktivite log işlem tipi etiket/renk yardımcıları ve sabit liste

export const getIslemTipiLabel = (islemTipi) => {
  const labelMap = {
    'LOGIN': 'Giriş Yaptı',
    'LOGIN_FAILED': 'Başarısız Giriş',
    'LOGOUT': 'Çıkış Yaptı',
    'REGISTER': 'Kayıt Oldu',
    'IS_EMRI_OLUSTUR': 'İş Emri Oluşturdu',
    'IS_EMRI_GUNCELLE': 'İş Emri Güncelledi',
    'IS_EMRI_SIL': 'İş Emri Sildi',
    'MUSTERI_EKLE': 'Müşteri Ekledi',
    'MUSTERI_GUNCELLE': 'Müşteri Güncelledi',
    'MUSTERI_SIL': 'Müşteri Sildi',
    'GIDER_EKLE': 'Gider Ekledi',
    'GIDER_GUNCELLE': 'Gider Güncelledi',
    'GIDER_SIL': 'Gider Sildi',
  };
  return labelMap[islemTipi] || islemTipi;
};

export const getIslemTipiColor = (islemTipi) => {
  if (islemTipi?.includes('SIL') || islemTipi === 'LOGIN_FAILED') return 'error';
  if (islemTipi?.includes('GUNCELLE')) return 'warning';
  if (islemTipi?.includes('OLUSTUR') || islemTipi?.includes('EKLE') || islemTipi === 'LOGIN' || islemTipi === 'REGISTER') return 'success';
  return 'default';
};

export const islemTipleri = [
  'LOGIN', 'LOGIN_FAILED', 'LOGOUT', 'REGISTER',
  'IS_EMRI_OLUSTUR', 'IS_EMRI_GUNCELLE', 'IS_EMRI_SIL',
  'MUSTERI_EKLE', 'MUSTERI_GUNCELLE', 'MUSTERI_SIL',
  'GIDER_EKLE', 'GIDER_GUNCELLE', 'GIDER_SIL',
];
