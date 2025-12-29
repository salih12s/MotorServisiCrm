const pool = require('./db');

/**
 * Aktivite logla
 * Supports two calling patterns:
 * 1. Object: logAktivite({ kullanici_id, islem_tipi, islem_detay, ... })
 * 2. Positional: logAktivite(kullanici_id, islem_tipi, islem_detay, detayObj, requestInfo)
 */
const logAktivite = async (arg1, arg2, arg3, arg4, arg5) => {
  let kullanici_id, kullanici_adi, islem_tipi, islem_detay, hedef_tablo, hedef_id, ip_adresi, tarayici_bilgisi;
  
  // Check if called with object pattern or positional pattern
  if (typeof arg1 === 'object' && arg1 !== null && !Array.isArray(arg1) && arg2 === undefined) {
    // Object pattern
    ({
      kullanici_id,
      kullanici_adi,
      islem_tipi,
      islem_detay,
      hedef_tablo = null,
      hedef_id = null,
      ip_adresi = null,
      tarayici_bilgisi = null
    } = arg1);
  } else {
    // Positional pattern: logAktivite(userId, islemTipi, detayStr, detayObj, requestInfo)
    kullanici_id = arg1;
    islem_tipi = arg2;
    islem_detay = arg3;
    kullanici_adi = null;
    hedef_tablo = null;
    hedef_id = null;
    
    // Handle requestInfo
    if (arg5 && typeof arg5 === 'object') {
      ip_adresi = arg5.ip_adresi || null;
      tarayici_bilgisi = arg5.tarayici_bilgisi || null;
    } else {
      ip_adresi = null;
      tarayici_bilgisi = null;
    }
  }
  
  // Validate required fields
  if (!kullanici_id || !islem_tipi) {
    console.error('Aktivite loglama hatası: kullanici_id ve islem_tipi zorunlu alanlar');
    return;
  }
  
  try {
    await pool.query(
      `INSERT INTO aktivite_log 
       (kullanici_id, kullanici_adi, islem_tipi, islem_detay, hedef_tablo, hedef_id, ip_adresi, tarayici_bilgisi) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [kullanici_id, kullanici_adi, islem_tipi, islem_detay, hedef_tablo, hedef_id, ip_adresi, tarayici_bilgisi]
    );
  } catch (error) {
    console.error('Aktivite loglama hatası:', error);
    // Loglama hatası ana işlemi durdurmamalı
  }
};

/**
 * Request'ten IP ve tarayıcı bilgisini al
 */
const getRequestInfo = (req) => {
  const ip_adresi = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || 'Bilinmiyor';
  const tarayici_bilgisi = req.headers['user-agent'] || 'Bilinmiyor';
  return { ip_adresi, tarayici_bilgisi };
};

/**
 * İşlem tipi sabitleri
 */
const ISLEM_TIPLERI = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  REGISTER: 'REGISTER',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VIEW: 'VIEW',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  PRINT: 'PRINT',
  EXPORT: 'EXPORT'
};

module.exports = {
  logAktivite,
  getRequestInfo,
  ISLEM_TIPLERI
};
