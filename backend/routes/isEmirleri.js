const express = require('express');
const pool = require('../config/db');
const { logAktivite, getRequestInfo, ISLEM_TIPLERI } = require('../config/activityLogger');

const router = express.Router();

// Bir sonraki fiş numarasını getir (1'den başlar)
const getNextFisNo = async () => {
  const result = await pool.query(
    "SELECT MAX(CAST(fis_no AS INTEGER)) as max_fis FROM is_emirleri"
  );
  
  const maxFis = result.rows[0].max_fis;
  return maxFis ? maxFis + 1 : 1;
};

// Tüm iş emirlerini getir
router.get('/', async (req, res) => {
  try {
    const { tarih, durum } = req.query;
    
    let query = `
      SELECT ie.*, 
        COALESCE(SUM(p.toplam_fiyat), 0) as toplam_parca_fiyat,
        COALESCE(SUM(p.maliyet * p.adet), 0) as toplam_parca_maliyet
      FROM is_emirleri ie
      LEFT JOIN parcalar p ON ie.id = p.is_emri_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (tarih) {
      params.push(tarih);
      conditions.push(`DATE(ie.created_at) = $${params.length}`);
    }
    
    if (durum) {
      params.push(durum);
      conditions.push(`ie.durum = $${params.length}`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY ie.id ORDER BY ie.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('İş emirleri listesi hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Bir sonraki fiş numarasını getir
router.get('/next-fis-no/preview', async (req, res) => {
  try {
    const nextFisNo = await getNextFisNo();
    res.json({ fis_no: nextFisNo });
  } catch (error) {
    console.error('Fiş numarası alma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Tek iş emri getir (parçalarıyla birlikte)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const isEmriResult = await pool.query(
      'SELECT * FROM is_emirleri WHERE id = $1',
      [id]
    );
    
    if (isEmriResult.rows.length === 0) {
      return res.status(404).json({ message: 'İş emri bulunamadı' });
    }
    
    const parcalarResult = await pool.query(
      'SELECT * FROM parcalar WHERE is_emri_id = $1 ORDER BY id',
      [id]
    );
    
    res.json({
      ...isEmriResult.rows[0],
      parcalar: parcalarResult.rows
    });
  } catch (error) {
    console.error('İş emri detay hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Boş string'leri null'a çevir (PostgreSQL için)
const emptyToNull = (value) => {
  if (value === '' || value === undefined) return null;
  return value;
};

// Boş string'leri 0'a çevir (sayısal alanlar için)
const emptyToZero = (value) => {
  if (value === '' || value === undefined || value === null) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// İş emri oluştur
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      musteri_ad_soyad,
      adres,
      telefon,
      km: rawKm,
      model_tip,
      marka,
      aciklama,
      ariza_sikayetler,
      tahmini_teslim_tarihi: rawTahminiTeslimTarihi,
      tahmini_toplam_ucret: rawTahminiToplamUcret,
      odeme_detaylari,
      parcalar
    } = req.body;
    
    // Boş string'leri uygun değerlere çevir
    const km = emptyToNull(rawKm);
    const tahmini_teslim_tarihi = emptyToNull(rawTahminiTeslimTarihi);
    const tahmini_toplam_ucret = emptyToZero(rawTahminiToplamUcret);
    
    const fis_no = await getNextFisNo();
    
    // Müşteriyi kontrol et veya oluştur
    let musteri_id = null;
    if (telefon) {
      const musteriResult = await client.query(
        'SELECT id FROM musteriler WHERE telefon = $1',
        [telefon]
      );
      
      if (musteriResult.rows.length > 0) {
        musteri_id = musteriResult.rows[0].id;
        // Müşteri bilgilerini güncelle
        await client.query(
          'UPDATE musteriler SET ad_soyad = $1, adres = $2 WHERE id = $3',
          [musteri_ad_soyad, adres, musteri_id]
        );
      } else {
        // Yeni müşteri oluştur
        const newMusteri = await client.query(
          'INSERT INTO musteriler (ad_soyad, adres, telefon) VALUES ($1, $2, $3) RETURNING id',
          [musteri_ad_soyad, adres, telefon]
        );
        musteri_id = newMusteri.rows[0].id;
      }
    }
    
    // İş emri oluştur
    const olusturan_kullanici_id = req.user?.id || null;
    
    const isEmriResult = await client.query(
      `INSERT INTO is_emirleri 
        (fis_no, musteri_id, musteri_ad_soyad, adres, telefon, km, model_tip, marka, aciklama, ariza_sikayetler, tahmini_teslim_tarihi, tahmini_toplam_ucret, durum, olusturan_kullanici_id, odeme_detaylari) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
       RETURNING *`,
      [fis_no, musteri_id, musteri_ad_soyad, adres, telefon, km, model_tip, marka, aciklama, ariza_sikayetler, tahmini_teslim_tarihi, tahmini_toplam_ucret, 'beklemede', olusturan_kullanici_id, odeme_detaylari || null]
    );
    
    const isEmri = isEmriResult.rows[0];
    
    // Parçaları ekle
    let toplamFiyat = 0;
    let toplamMaliyet = 0;
    const eklenenParcalar = [];
    
    if (parcalar && parcalar.length > 0) {
      for (const parca of parcalar) {
        const parcaToplam = (parca.adet || 1) * (parca.birim_fiyat || 0);
        const parcaMaliyet = (parca.adet || 1) * (parca.maliyet || 0);
        
        const parcaResult = await client.query(
          `INSERT INTO parcalar 
            (is_emri_id, parca_kodu, takilan_parca, adet, birim_fiyat, maliyet, toplam_fiyat) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) 
           RETURNING *`,
          [isEmri.id, parca.parca_kodu, parca.takilan_parca, parca.adet || 1, parca.birim_fiyat || 0, parca.maliyet || 0, parcaToplam]
        );
        
        eklenenParcalar.push(parcaResult.rows[0]);
        toplamFiyat += parcaToplam;
        toplamMaliyet += parcaMaliyet;
      }
    }
    
    // İş emri toplamlarını güncelle
    const kar = toplamFiyat - toplamMaliyet;
    await client.query(
      'UPDATE is_emirleri SET gercek_toplam_ucret = $1, toplam_maliyet = $2, kar = $3 WHERE id = $4',
      [toplamFiyat, toplamMaliyet, kar, isEmri.id]
    );
    
    await client.query('COMMIT');
    
    // Aktivite logla
    if (req.user?.id) {
      logAktivite(
        req.user.id,
        ISLEM_TIPLERI.IS_EMRI_OLUSTUR,
        `Yeni iş emri oluşturuldu - Fiş No: ${fis_no}, Müşteri: ${musteri_ad_soyad}, Araç: ${marka} ${model_tip}`,
        { isEmriId: isEmri.id, fisNo: fis_no, musteriAdSoyad: musteri_ad_soyad, marka, modelTip: model_tip, parcaSayisi: eklenenParcalar.length },
        getRequestInfo(req)
      );
    }
    
    res.status(201).json({
      ...isEmri,
      gercek_toplam_ucret: toplamFiyat,
      toplam_maliyet: toplamMaliyet,
      kar: kar,
      parcalar: eklenenParcalar
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('İş emri oluşturma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  } finally {
    client.release();
  }
});

// İş emri güncelle
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    // İş emri durumunu kontrol et - tamamlandıysa personel düzenlemesin
    const mevcutIsEmri = await client.query('SELECT durum FROM is_emirleri WHERE id = $1', [id]);
    if (mevcutIsEmri.rows.length > 0 && mevcutIsEmri.rows[0].durum === 'tamamlandi') {
      if (req.user?.rol !== 'admin') {
        await client.query('ROLLBACK');
        return res.status(403).json({ message: 'Tamamlanmış iş emirlerini düzenleyemezsiniz.' });
      }
    }
    
    const {
      musteri_ad_soyad,
      adres,
      telefon,
      km: rawKm,
      model_tip,
      marka,
      aciklama,
      ariza_sikayetler,
      tahmini_teslim_tarihi: rawTahminiTeslimTarihi,
      tahmini_toplam_ucret: rawTahminiToplamUcret,
      durum,
      musteri_imza,
      teslim_alan_ad_soyad,
      teslim_eden_teknisyen,
      teslim_tarihi: rawTeslimTarihi,
      odeme_detaylari,
      parcalar
    } = req.body;
    
    // Boş string'leri uygun değerlere çevir
    const km = emptyToNull(rawKm);
    const tahmini_teslim_tarihi = emptyToNull(rawTahminiTeslimTarihi);
    const tahmini_toplam_ucret = emptyToZero(rawTahminiToplamUcret);
    const teslim_tarihi = emptyToNull(rawTeslimTarihi);
    
    // İş emrini güncelle
    await client.query(
      `UPDATE is_emirleri SET 
        musteri_ad_soyad = $1, adres = $2, telefon = $3, km = $4, model_tip = $5, marka = $6,
        aciklama = $7, ariza_sikayetler = $8, tahmini_teslim_tarihi = $9, 
        tahmini_toplam_ucret = $10, durum = $11, musteri_imza = $12,
        teslim_alan_ad_soyad = $13, teslim_eden_teknisyen = $14, teslim_tarihi = $15,
        odeme_detaylari = $16, updated_at = CURRENT_TIMESTAMP
       WHERE id = $17`,
      [musteri_ad_soyad, adres, telefon, km, model_tip, marka, aciklama, ariza_sikayetler, 
       tahmini_teslim_tarihi, tahmini_toplam_ucret, durum || 'beklemede', musteri_imza || false,
       teslim_alan_ad_soyad, teslim_eden_teknisyen, teslim_tarihi, odeme_detaylari || null, id]
    );
    
    // Mevcut parçaları sil ve yenilerini ekle
    if (parcalar) {
      await client.query('DELETE FROM parcalar WHERE is_emri_id = $1', [id]);
      
      let toplamFiyat = 0;
      let toplamMaliyet = 0;
      
      for (const parca of parcalar) {
        const parcaToplam = (parca.adet || 1) * (parca.birim_fiyat || 0);
        const parcaMaliyet = (parca.adet || 1) * (parca.maliyet || 0);
        
        await client.query(
          `INSERT INTO parcalar 
            (is_emri_id, parca_kodu, takilan_parca, adet, birim_fiyat, maliyet, toplam_fiyat) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [id, parca.parca_kodu, parca.takilan_parca, parca.adet || 1, parca.birim_fiyat || 0, parca.maliyet || 0, parcaToplam]
        );
        
        toplamFiyat += parcaToplam;
        toplamMaliyet += parcaMaliyet;
      }
      
      const kar = toplamFiyat - toplamMaliyet;
      await client.query(
        'UPDATE is_emirleri SET gercek_toplam_ucret = $1, toplam_maliyet = $2, kar = $3 WHERE id = $4',
        [toplamFiyat, toplamMaliyet, kar, id]
      );
    }
    
    await client.query('COMMIT');
    
    // Güncellenmiş iş emrini getir
    const result = await pool.query(
      'SELECT * FROM is_emirleri WHERE id = $1',
      [id]
    );
    
    // Aktivite logla
    if (req.user?.id) {
      const isEmri = result.rows[0];
      logAktivite(
        req.user.id,
        ISLEM_TIPLERI.IS_EMRI_GUNCELLE,
        `İş emri güncellendi - Fiş No: ${isEmri.fis_no}, Müşteri: ${musteri_ad_soyad}, Durum: ${durum || 'beklemede'}`,
        { isEmriId: id, fisNo: isEmri.fis_no, musteriAdSoyad: musteri_ad_soyad, durum: durum || 'beklemede' },
        getRequestInfo(req)
      );
    }
    
    const parcalarResult = await pool.query(
      'SELECT * FROM parcalar WHERE is_emri_id = $1 ORDER BY id',
      [id]
    );
    
    res.json({
      ...result.rows[0],
      parcalar: parcalarResult.rows
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('İş emri güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  } finally {
    client.release();
  }
});

// İş emri sil (sadece admin)
router.delete('/:id', async (req, res) => {
  try {
    // Admin kontrolü
    if (req.user?.rol !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok. Sadece admin iş emri silebilir.' });
    }
    
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM is_emirleri WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'İş emri bulunamadı' });
    }
    
    // Aktivite logla
    const silinenIsEmri = result.rows[0];
    if (req.user?.id) {
      logAktivite(
        req.user.id,
        ISLEM_TIPLERI.IS_EMRI_SIL,
        `İş emri silindi - Fiş No: ${silinenIsEmri.fis_no}, Müşteri: ${silinenIsEmri.musteri_ad_soyad}`,
        { isEmriId: id, fisNo: silinenIsEmri.fis_no, musteriAdSoyad: silinenIsEmri.musteri_ad_soyad },
        getRequestInfo(req)
      );
    }
    
    res.json({ message: 'İş emri silindi' });
  } catch (error) {
    console.error('İş emri silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Parça ekle
router.post('/:id/parcalar', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { parca_kodu, takilan_parca, adet, birim_fiyat, maliyet } = req.body;
    
    const toplam_fiyat = (adet || 1) * (birim_fiyat || 0);
    const toplam_maliyet = (adet || 1) * (maliyet || 0);
    
    const parcaResult = await client.query(
      `INSERT INTO parcalar 
        (is_emri_id, parca_kodu, takilan_parca, adet, birim_fiyat, maliyet, toplam_fiyat) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [id, parca_kodu, takilan_parca, adet || 1, birim_fiyat || 0, maliyet || 0, toplam_fiyat]
    );
    
    // İş emri toplamlarını güncelle
    const toplamResult = await client.query(
      `SELECT 
        COALESCE(SUM(toplam_fiyat), 0) as toplam_fiyat,
        COALESCE(SUM(maliyet * adet), 0) as toplam_maliyet
       FROM parcalar WHERE is_emri_id = $1`,
      [id]
    );
    
    const yeniToplam = parseFloat(toplamResult.rows[0].toplam_fiyat);
    const yeniMaliyet = parseFloat(toplamResult.rows[0].toplam_maliyet);
    const kar = yeniToplam - yeniMaliyet;
    
    await client.query(
      'UPDATE is_emirleri SET gercek_toplam_ucret = $1, toplam_maliyet = $2, kar = $3 WHERE id = $4',
      [yeniToplam, yeniMaliyet, kar, id]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json(parcaResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Parça ekleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  } finally {
    client.release();
  }
});

// Parça sil
router.delete('/:id/parcalar/:parcaId', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id, parcaId } = req.params;
    
    // İş emri durumunu kontrol et - tamamlandıysa personel silemesin
    const isEmriResult = await client.query('SELECT durum FROM is_emirleri WHERE id = $1', [id]);
    if (isEmriResult.rows.length > 0 && isEmriResult.rows[0].durum === 'tamamlandi') {
      if (req.user?.rol !== 'admin') {
        await client.query('ROLLBACK');
        return res.status(403).json({ message: 'Tamamlanmış iş emirlerinde parça silemezsiniz.' });
      }
    }
    
    await client.query('DELETE FROM parcalar WHERE id = $1 AND is_emri_id = $2', [parcaId, id]);
    
    // İş emri toplamlarını güncelle
    const toplamResult = await client.query(
      `SELECT 
        COALESCE(SUM(toplam_fiyat), 0) as toplam_fiyat,
        COALESCE(SUM(maliyet * adet), 0) as toplam_maliyet
       FROM parcalar WHERE is_emri_id = $1`,
      [id]
    );
    
    const yeniToplam = parseFloat(toplamResult.rows[0].toplam_fiyat);
    const yeniMaliyet = parseFloat(toplamResult.rows[0].toplam_maliyet);
    const kar = yeniToplam - yeniMaliyet;
    
    await client.query(
      'UPDATE is_emirleri SET gercek_toplam_ucret = $1, toplam_maliyet = $2, kar = $3 WHERE id = $4',
      [yeniToplam, yeniMaliyet, kar, id]
    );
    
    await client.query('COMMIT');
    
    res.json({ message: 'Parça silindi' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Parça silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  } finally {
    client.release();
  }
});

// İş emrini tamamla
router.patch('/:id/tamamla', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(
      'UPDATE is_emirleri SET durum = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['tamamlandi', id]
    );
    
    res.json({ message: 'İş emri tamamlandı' });
  } catch (error) {
    console.error('İş emri tamamlama hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
