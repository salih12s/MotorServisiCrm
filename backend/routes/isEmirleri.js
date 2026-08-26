const express = require('express');
const pool = require('../config/db');
const { logAktivite, getRequestInfo, ISLEM_TIPLERI } = require('../config/activityLogger');
const { sourcePaymentJoin, sourcePaymentColumns } = require('../domain/sourcePaymentSummary');

const router = express.Router();

const serviceTotalExpression = `CASE
  WHEN LOWER(COALESCE(ie.durum, '')) IN ('iptal', 'iptal_edildi') THEN 0
  ELSE COALESCE(NULLIF(ie.gercek_toplam_ucret, 0), ie.tahmini_toplam_ucret, 0)
END`;

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
    const { tarih, durum, search, baslangic, bitis } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    
    let query = `
      SELECT ie.*, m.aktif AS musteri_aktif,
        COALESCE(SUM(p.toplam_fiyat), 0) as toplam_parca_fiyat,
        COALESCE(SUM(p.maliyet * p.adet), 0) as toplam_parca_maliyet,
        ${sourcePaymentColumns('ie', serviceTotalExpression)}
      FROM is_emirleri ie
      LEFT JOIN parcalar p ON ie.id = p.is_emri_id
      LEFT JOIN musteriler m ON ie.musteri_id = m.id
      ${sourcePaymentJoin('SERVIS', 'ie')}
    `;
    
    // Pasife alınan müşterinin kayıtları silinmez; günlük servis listesinden gizlenir.
    const conditions = ['(ie.musteri_id IS NULL OR m.aktif IS DISTINCT FROM FALSE)'];
    // İstatistik filtreleri müşteri görünürlüğünden bağımsızdır.
    const statsConditions = [];
    const params = [];
    
    if (tarih) {
      params.push(tarih);
      conditions.push(`DATE(ie.created_at) = $${params.length}`);
      statsConditions.push(`DATE(ie.created_at) = $${params.length}`);
    }
    
    if (durum) {
      params.push(durum);
      conditions.push(`ie.durum = $${params.length}`);
      statsConditions.push(`ie.durum = $${params.length}`);
    }

    if (search && String(search).trim()) {
      params.push(`%${String(search).trim()}%`);
      const searchCondition = `(
        ie.musteri_ad_soyad ILIKE $${params.length} OR
        ie.fis_no::text ILIKE $${params.length} OR
        ie.marka ILIKE $${params.length} OR
        ie.model_tip ILIKE $${params.length} OR
        ie.telefon ILIKE $${params.length}
      )`;
      conditions.push(searchCondition);
      statsConditions.push(searchCondition);
    }

    if (baslangic) {
      params.push(baslangic);
      conditions.push(`ie.created_at >= $${params.length}::date`);
      statsConditions.push(`ie.created_at >= $${params.length}::date`);
    }

    if (bitis) {
      params.push(bitis);
      conditions.push(`ie.created_at < ($${params.length}::date + INTERVAL '1 day')`);
      statsConditions.push(`ie.created_at < ($${params.length}::date + INTERVAL '1 day')`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
    const statsWhereClause = statsConditions.length > 0 ? ' WHERE ' + statsConditions.join(' AND ') : '';
    query += ` GROUP BY ie.id, m.id, cari_odeme.nakit_tutar, cari_odeme.kart_tutar, cari_odeme.havale_tutar, cari_odeme.toplam ORDER BY ie.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    const listParams = [...params, limit, (page - 1) * limit];
    const [result, countResult, statsResult, filteredStatsResult] = await Promise.all([
      pool.query(query, listParams),
      pool.query(`SELECT COUNT(*)::int AS total FROM is_emirleri ie LEFT JOIN musteriler m ON ie.musteri_id = m.id${whereClause}`, params),
      pool.query(`SELECT
        COUNT(*)::int AS toplam,
        COUNT(*) FILTER (WHERE DATE(ie.created_at) = CURRENT_DATE)::int AS bugun,
        COUNT(*) FILTER (WHERE ie.durum = 'beklemede')::int AS beklemede,
        COUNT(*) FILTER (WHERE ie.durum = 'islemde')::int AS islemde,
        COUNT(*) FILTER (WHERE ie.durum = 'odeme_bekleniyor')::int AS odeme_bekleniyor,
        COUNT(*) FILTER (WHERE ie.durum = 'tamamlandi')::int AS tamamlandi,
        COUNT(*) FILTER (WHERE ie.durum = 'iptal_edildi')::int AS iptal_edildi,
        COALESCE(SUM(${serviceTotalExpression}), 0) AS toplam_tutar
        FROM is_emirleri ie`),
      pool.query(`SELECT COALESCE(SUM(ie.kar), 0) AS toplam_kar FROM is_emirleri ie${statsWhereClause}`, params),
    ]);
    const total = countResult.rows[0].total;
    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
      stats: { ...statsResult.rows[0], toplam_kar: filteredStatsResult.rows[0].toplam_kar },
    });
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
      `SELECT ie.*, ${sourcePaymentColumns('ie', serviceTotalExpression)}
       FROM is_emirleri ie
       ${sourcePaymentJoin('SERVIS', 'ie')}
       WHERE ie.id = $1`,
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

const validatePaymentParts = (total, values) => {
  const parsed = values.map((value) => Number(value || 0));
  if (parsed.some((value) => !Number.isFinite(value) || value < 0)) return { error: 'Ödeme tutarları negatif veya geçersiz olamaz.' };
  if (parsed.reduce((sum, value) => sum + value, 0) > Number(total || 0) + 0.005) return { error: 'Girilen ödemeler servis toplamını aşamaz.' };
  return { values: parsed };
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
      odeme_sekli,
      nakit_tutar,
      kart_tutar,
      havale_tutar,
      olusturan_kisi,
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
        'SELECT id, aktif FROM musteriler WHERE telefon = $1 ORDER BY aktif DESC, id ASC LIMIT 1',
        [telefon]
      );
      
      if (musteriResult.rows.length > 0) {
        if (!musteriResult.rows[0].aktif) {
          await client.query('ROLLBACK');
          return res.status(409).json({
            message: 'Bu telefon numarası pasif bir müşteriye ait. Yeni iş emri açmadan önce müşteriyi yeniden aktif edin.'
          });
        }
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
        (fis_no, musteri_id, musteri_ad_soyad, adres, telefon, km, model_tip, marka, aciklama, ariza_sikayetler, tahmini_teslim_tarihi, tahmini_toplam_ucret, durum, olusturan_kullanici_id, odeme_detaylari, olusturan_kisi, odeme_sekli, nakit_tutar, kart_tutar, havale_tutar, odeme_bilgisi_girildi)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, TRUE)
       RETURNING *`,
      [fis_no, musteri_id, musteri_ad_soyad, adres, telefon, km, model_tip, marka, aciklama, ariza_sikayetler, tahmini_teslim_tarihi, tahmini_toplam_ucret, 'beklemede', olusturan_kullanici_id, odeme_detaylari || null, olusturan_kisi || null, odeme_sekli || 'nakit', emptyToZero(nakit_tutar), emptyToZero(kart_tutar), emptyToZero(havale_tutar)]
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
    const payment = validatePaymentParts(toplamFiyat, [nakit_tutar, kart_tutar, havale_tutar]);
    if (payment.error) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: payment.error });
    }
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
    const mevcutIsEmri = await client.query('SELECT durum, gercek_toplam_ucret FROM is_emirleri WHERE id = $1', [id]);
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
      odeme_sekli,
      nakit_tutar,
      kart_tutar,
      havale_tutar,
      olusturan_kisi,
      parcalar
    } = req.body;
    
    // Boş string'leri uygun değerlere çevir
    const km = emptyToNull(rawKm);
    const tahmini_teslim_tarihi = emptyToNull(rawTahminiTeslimTarihi);
    const tahmini_toplam_ucret = emptyToZero(rawTahminiToplamUcret);
    const teslim_tarihi = emptyToNull(rawTeslimTarihi);
    const calculatedTotal = Array.isArray(parcalar)
      ? parcalar.reduce((sum, parca) => sum + (Number(parca.adet) || 1) * (Number(parca.birim_fiyat) || 0), 0)
      : Number(mevcutIsEmri.rows[0]?.gercek_toplam_ucret || 0);
    const payment = validatePaymentParts(calculatedTotal, [nakit_tutar, kart_tutar, havale_tutar]);
    if (payment.error) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: payment.error });
    }
    
    // İş emrini güncelle
    // Eğer durum tamamlandı'ya çekiliyorsa tamamlama_tarihi'ni set et
    const shouldSetTamamlamaTarihi = durum === 'tamamlandi' && mevcutIsEmri.rows[0]?.durum !== 'tamamlandi';
    
    await client.query(
      `UPDATE is_emirleri SET 
        musteri_ad_soyad = $1, adres = $2, telefon = $3, km = $4, model_tip = $5, marka = $6,
        aciklama = $7, ariza_sikayetler = $8, tahmini_teslim_tarihi = $9, 
        tahmini_toplam_ucret = $10, durum = $11, musteri_imza = $12,
        teslim_alan_ad_soyad = $13, teslim_eden_teknisyen = $14, teslim_tarihi = $15,
        odeme_detaylari = $16, olusturan_kisi = $17, odeme_sekli = $18,
        nakit_tutar = $19, kart_tutar = $20, havale_tutar = $21, odeme_bilgisi_girildi = TRUE,
        tamamlama_tarihi = CASE WHEN $22::boolean THEN CURRENT_TIMESTAMP ELSE tamamlama_tarihi END,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $23`,
      [musteri_ad_soyad, adres, telefon, km, model_tip, marka, aciklama, ariza_sikayetler, 
       tahmini_teslim_tarihi, tahmini_toplam_ucret, durum || 'beklemede', musteri_imza || false,
       teslim_alan_ad_soyad, teslim_eden_teknisyen, teslim_tarihi, odeme_detaylari || null,
       olusturan_kisi || null, odeme_sekli || 'nakit', payment.values[0], payment.values[1], payment.values[2], shouldSetTamamlamaTarihi, id]
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
      'UPDATE is_emirleri SET durum = $1, tamamlama_tarihi = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['tamamlandi', id]
    );
    
    res.json({ message: 'İş emri tamamlandı' });
  } catch (error) {
    console.error('İş emri tamamlama hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

router.patch('/bulk/complete', async (req, res) => {
  if (req.user?.rol !== 'admin') return res.status(403).json({ message: 'Bu işlem için yönetici yetkisi gereklidir.' });
  const ids = [...new Set((Array.isArray(req.body.ids) ? req.body.ids : []).map(Number))];
  if (!ids.length || ids.length > 500 || ids.some((id) => !Number.isSafeInteger(id) || id <= 0)) {
    return res.status(400).json({ message: '1-500 geçerli servis kaydı seçilmelidir.' });
  }
  try {
    const result = await pool.query(`
      UPDATE is_emirleri
      SET durum = 'tamamlandi', tamamlama_tarihi = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($1::int[]) AND LOWER(COALESCE(durum, '')) NOT IN ('tamamlandi', 'iptal', 'iptal_edildi')
      RETURNING id
    `, [ids]);
    res.json({ message: `${result.rowCount} servis kaydı tamamlandı.`, count: result.rowCount, ids: result.rows.map((row) => row.id) });
  } catch (error) {
    console.error('Toplu servis tamamlama hatası:', error);
    res.status(500).json({ message: 'Servis kayıtları tamamlanamadı.' });
  }
});

module.exports = router;
