const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Günlük rapor
router.get('/gunluk', async (req, res) => {
  try {
    const { tarih } = req.query;
    const selectedDate = tarih || new Date().toISOString().split('T')[0];
    
    // O günkü iş emirleri
    const isEmirleriResult = await pool.query(
      `SELECT 
        ie.*,
        COALESCE(SUM(p.toplam_fiyat), 0) as toplam_gelir,
        COALESCE(SUM(p.maliyet * p.adet), 0) as toplam_maliyet
       FROM is_emirleri ie
       LEFT JOIN parcalar p ON ie.id = p.is_emri_id
       WHERE DATE(ie.created_at) = $1
       GROUP BY ie.id
       ORDER BY ie.created_at DESC`,
      [selectedDate]
    );
    
    // O günkü giderler
    const giderlerResult = await pool.query(
      'SELECT * FROM giderler WHERE tarih = $1',
      [selectedDate]
    );
    
    // Toplam hesaplamalar
    let toplamGelir = 0;
    let toplamMaliyet = 0;
    
    isEmirleriResult.rows.forEach(ie => {
      toplamGelir += parseFloat(ie.toplam_gelir) || 0;
      toplamMaliyet += parseFloat(ie.toplam_maliyet) || 0;
    });
    
    const toplamGider = giderlerResult.rows.reduce((sum, g) => sum + parseFloat(g.tutar), 0);
    const brutKar = toplamGelir - toplamMaliyet;
    const netKar = brutKar - toplamGider;
    
    res.json({
      tarih: selectedDate,
      is_emirleri: isEmirleriResult.rows,
      giderler: giderlerResult.rows,
      ozet: {
        toplam_is_emri: isEmirleriResult.rows.length,
        toplam_gelir: toplamGelir,
        toplam_maliyet: toplamMaliyet,
        toplam_gider: toplamGider,
        brut_kar: brutKar,
        net_kar: netKar
      }
    });
  } catch (error) {
    console.error('Günlük rapor hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Tarih aralığı raporu
router.get('/aralik', async (req, res) => {
  try {
    const { baslangic, bitis } = req.query;
    
    if (!baslangic || !bitis) {
      return res.status(400).json({ message: 'Başlangıç ve bitiş tarihi gerekli' });
    }
    
    // Tarih aralığındaki iş emirleri (özet)
    const isEmirleriResult = await pool.query(
      `SELECT 
        DATE(ie.created_at) as tarih,
        COUNT(*) as is_sayisi,
        COALESCE(SUM(ie.gercek_toplam_ucret), 0) as toplam_gelir,
        COALESCE(SUM(ie.toplam_maliyet), 0) as toplam_maliyet,
        COALESCE(SUM(ie.kar), 0) as toplam_kar
       FROM is_emirleri ie
       WHERE DATE(ie.created_at) BETWEEN $1 AND $2
       GROUP BY DATE(ie.created_at)
       ORDER BY DATE(ie.created_at) DESC`,
      [baslangic, bitis]
    );
    
    // Tarih aralığındaki tüm iş emirleri (detaylı liste)
    const detayliIsEmirleri = await pool.query(
      `SELECT 
        ie.id,
        ie.fis_no,
        ie.musteri_ad_soyad,
        ie.telefon,
        ie.marka,
        ie.model_tip,
        ie.km,
        ie.ariza_sikayetler,
        ie.aciklama,
        ie.durum,
        ie.gercek_toplam_ucret,
        ie.toplam_maliyet,
        ie.kar,
        ie.tahmini_toplam_ucret,
        ie.created_at,
        k.ad_soyad as olusturan_ad_soyad,
        k.kullanici_adi as olusturan_kullanici_adi
       FROM is_emirleri ie
       LEFT JOIN kullanicilar k ON ie.olusturan_kullanici_id = k.id
       WHERE DATE(ie.created_at) BETWEEN $1 AND $2
       ORDER BY ie.created_at DESC`,
      [baslangic, bitis]
    );
    
    // Tarih aralığındaki giderler
    const giderlerResult = await pool.query(
      `SELECT 
        tarih,
        SUM(tutar) as toplam_gider
       FROM giderler
       WHERE tarih BETWEEN $1 AND $2
       GROUP BY tarih
       ORDER BY tarih DESC`,
      [baslangic, bitis]
    );
    
    // Genel toplam
    const genelToplam = await pool.query(
      `SELECT 
        COALESCE(SUM(gercek_toplam_ucret), 0) as toplam_gelir,
        COALESCE(SUM(toplam_maliyet), 0) as toplam_maliyet,
        COALESCE(SUM(kar), 0) as toplam_kar,
        COUNT(*) as toplam_is
       FROM is_emirleri
       WHERE DATE(created_at) BETWEEN $1 AND $2`,
      [baslangic, bitis]
    );
    
    const toplamGider = await pool.query(
      'SELECT COALESCE(SUM(tutar), 0) as toplam FROM giderler WHERE tarih BETWEEN $1 AND $2',
      [baslangic, bitis]
    );
    
    res.json({
      baslangic,
      bitis,
      gunluk_veriler: isEmirleriResult.rows,
      detayli_is_emirleri: detayliIsEmirleri.rows,
      giderler: giderlerResult.rows,
      genel_ozet: {
        toplam_is: parseInt(genelToplam.rows[0].toplam_is),
        toplam_gelir: parseFloat(genelToplam.rows[0].toplam_gelir),
        toplam_maliyet: parseFloat(genelToplam.rows[0].toplam_maliyet),
        toplam_gider: parseFloat(toplamGider.rows[0].toplam),
        brut_kar: parseFloat(genelToplam.rows[0].toplam_kar),
        net_kar: parseFloat(genelToplam.rows[0].toplam_kar) - parseFloat(toplamGider.rows[0].toplam)
      }
    });
  } catch (error) {
    console.error('Tarih aralığı rapor hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Genel istatistikler
router.get('/genel', async (req, res) => {
  try {
    // Toplam istatistikler
    const toplamResult = await pool.query(`
      SELECT 
        COUNT(*) as toplam_is,
        COALESCE(SUM(gercek_toplam_ucret), 0) as toplam_gelir,
        COALESCE(SUM(toplam_maliyet), 0) as toplam_maliyet,
        COALESCE(SUM(kar), 0) as toplam_kar
      FROM is_emirleri
    `);
    
    // Açık/Kapalı iş emirleri
    const durumResult = await pool.query(`
      SELECT 
        durum,
        COUNT(*) as sayi
      FROM is_emirleri
      GROUP BY durum
    `);
    
    // Bu ayki veriler
    const buAyResult = await pool.query(`
      SELECT 
        COUNT(*) as is_sayisi,
        COALESCE(SUM(gercek_toplam_ucret), 0) as gelir,
        COALESCE(SUM(kar), 0) as kar
      FROM is_emirleri
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `);
    
    // Bugünkü veriler
    const bugunResult = await pool.query(`
      SELECT 
        COUNT(*) as is_sayisi,
        COALESCE(SUM(gercek_toplam_ucret), 0) as gelir,
        COALESCE(SUM(kar), 0) as kar
      FROM is_emirleri
      WHERE DATE(created_at) = CURRENT_DATE
    `);
    
    // Toplam müşteri
    const musteriResult = await pool.query('SELECT COUNT(*) as toplam FROM musteriler');
    
    // Toplam gider
    const giderResult = await pool.query('SELECT COALESCE(SUM(tutar), 0) as toplam FROM giderler');
    
    res.json({
      genel: {
        toplam_is: parseInt(toplamResult.rows[0].toplam_is),
        toplam_gelir: parseFloat(toplamResult.rows[0].toplam_gelir),
        toplam_maliyet: parseFloat(toplamResult.rows[0].toplam_maliyet),
        toplam_kar: parseFloat(toplamResult.rows[0].toplam_kar),
        toplam_gider: parseFloat(giderResult.rows[0].toplam),
        net_kar: parseFloat(toplamResult.rows[0].toplam_kar) - parseFloat(giderResult.rows[0].toplam),
        toplam_musteri: parseInt(musteriResult.rows[0].toplam)
      },
      durum: durumResult.rows,
      bu_ay: buAyResult.rows[0],
      bugun: bugunResult.rows[0]
    });
  } catch (error) {
    console.error('Genel rapor hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Fiş bazlı kar raporu
router.get('/fis-kar', async (req, res) => {
  try {
    const { tarih } = req.query;
    
    let query = `
      SELECT 
        ie.id,
        ie.fis_no,
        ie.musteri_ad_soyad,
        ie.marka,
        ie.model_tip,
        ie.gercek_toplam_ucret,
        ie.toplam_maliyet,
        ie.kar,
        ie.created_at,
        ie.durum
      FROM is_emirleri ie
    `;
    
    const params = [];
    
    if (tarih) {
      params.push(tarih);
      query += ` WHERE DATE(ie.created_at) = $1`;
    }
    
    query += ' ORDER BY ie.created_at DESC';
    
    const result = await pool.query(query, params);
    
    // Toplam hesapla
    const toplam = result.rows.reduce((acc, row) => {
      acc.gelir += parseFloat(row.gercek_toplam_ucret) || 0;
      acc.maliyet += parseFloat(row.toplam_maliyet) || 0;
      acc.kar += parseFloat(row.kar) || 0;
      return acc;
    }, { gelir: 0, maliyet: 0, kar: 0 });
    
    res.json({
      fisler: result.rows,
      toplam
    });
  } catch (error) {
    console.error('Fiş kar raporu hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// İş emri detayını getir (parçalarıyla birlikte)
router.get('/is-emri/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const isEmriResult = await pool.query(
      `SELECT ie.*, k.ad_soyad as olusturan_ad_soyad, k.kullanici_adi as olusturan_kullanici_adi
       FROM is_emirleri ie
       LEFT JOIN kullanicilar k ON ie.olusturan_kullanici_id = k.id
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

module.exports = router;
