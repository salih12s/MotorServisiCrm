const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Günlük rapor
router.get('/gunluk', async (req, res) => {
  try {
    const { tarih } = req.query;
    const selectedDate = tarih || new Date().toISOString().split('T')[0];
    
    // O günkü tamamlanan iş emirleri (tamamlama_tarihi'ne göre)
    const isEmirleriResult = await pool.query(
      `SELECT 
        ie.*,
        COALESCE(SUM(p.toplam_fiyat), 0) as toplam_gelir,
        COALESCE(SUM(p.maliyet * p.adet), 0) as toplam_maliyet
       FROM is_emirleri ie
       LEFT JOIN parcalar p ON ie.id = p.is_emri_id
       WHERE ie.durum = 'tamamlandi' AND DATE(COALESCE(ie.tamamlama_tarihi, ie.created_at)) = $1
       GROUP BY ie.id
       ORDER BY ie.tamamlama_tarihi DESC`,
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
      toplamGelir += parseFloat(ie.gercek_toplam_ucret) || 0;
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
    
    // Tarih aralığındaki tamamlanan iş emirleri (özet) - tamamlama_tarihi'ne göre
    const isEmirleriResult = await pool.query(
      `SELECT 
        DATE(COALESCE(ie.tamamlama_tarihi, ie.created_at)) as tarih,
        COUNT(*) as is_sayisi,
        COALESCE(SUM(ie.gercek_toplam_ucret), 0) as toplam_gelir,
        COALESCE(SUM(ie.toplam_maliyet), 0) as toplam_maliyet,
        COALESCE(SUM(ie.kar), 0) as toplam_kar
       FROM is_emirleri ie
       WHERE ie.durum = 'tamamlandi' AND DATE(COALESCE(ie.tamamlama_tarihi, ie.created_at)) BETWEEN $1 AND $2
       GROUP BY DATE(COALESCE(ie.tamamlama_tarihi, ie.created_at))
       ORDER BY DATE(COALESCE(ie.tamamlama_tarihi, ie.created_at)) DESC`,
      [baslangic, bitis]
    );
    
    // Tarih aralığındaki tüm iş emirleri (detaylı liste) - tamamlama_tarihi'ne göre
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
        ie.tamamlama_tarihi,
        k.ad_soyad as olusturan_ad_soyad,
        k.kullanici_adi as olusturan_kullanici_adi
       FROM is_emirleri ie
       LEFT JOIN kullanicilar k ON ie.olusturan_kullanici_id = k.id
       WHERE ie.durum = 'tamamlandi' AND DATE(COALESCE(ie.tamamlama_tarihi, ie.created_at)) BETWEEN $1 AND $2
       ORDER BY ie.tamamlama_tarihi DESC`,
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
    
    // Genel toplam (sadece tamamlanan işler)
    const genelToplam = await pool.query(
      `SELECT 
        COALESCE(SUM(gercek_toplam_ucret), 0) as toplam_gelir,
        COALESCE(SUM(toplam_maliyet), 0) as toplam_maliyet,
        COALESCE(SUM(kar), 0) as toplam_kar,
        COUNT(*) as toplam_is
       FROM is_emirleri
       WHERE durum = 'tamamlandi' AND DATE(COALESCE(tamamlama_tarihi, created_at)) BETWEEN $1 AND $2`,
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
    // Toplam istatistikler (sadece tamamlanan işler için finansal)
    const toplamResult = await pool.query(`
      SELECT 
        COUNT(*) as toplam_is,
        COALESCE(SUM(CASE WHEN durum = 'tamamlandi' THEN gercek_toplam_ucret ELSE 0 END), 0) as toplam_gelir,
        COALESCE(SUM(CASE WHEN durum = 'tamamlandi' THEN toplam_maliyet ELSE 0 END), 0) as toplam_maliyet,
        COALESCE(SUM(CASE WHEN durum = 'tamamlandi' THEN kar ELSE 0 END), 0) as toplam_kar
      FROM is_emirleri
    `);

    // Açık iş sayısı (tamamlanmamış)
    const acikIsResult = await pool.query(`
      SELECT COUNT(*) as acik_is FROM is_emirleri WHERE durum != 'tamamlandi' AND durum != 'iptal_edildi'
    `);
    
    // Açık/Kapalı iş emirleri
    const durumResult = await pool.query(`
      SELECT 
        durum,
        COUNT(*) as sayi
      FROM is_emirleri
      GROUP BY durum
    `);
    
    // Bu ayki veriler (tamamlama tarihine göre)
    const buAyResult = await pool.query(`
      SELECT 
        COUNT(*) as is_sayisi,
        COALESCE(SUM(gercek_toplam_ucret), 0) as gelir,
        COALESCE(SUM(kar), 0) as kar
      FROM is_emirleri
      WHERE durum = 'tamamlandi' AND DATE_TRUNC('month', COALESCE(tamamlama_tarihi, created_at)) = DATE_TRUNC('month', CURRENT_DATE)
    `);
    
    // Bugünkü veriler (tamamlama tarihine göre)
    const bugunResult = await pool.query(`
      SELECT 
        COUNT(*) as is_sayisi,
        COALESCE(SUM(gercek_toplam_ucret), 0) as gelir,
        COALESCE(SUM(kar), 0) as kar
      FROM is_emirleri
      WHERE durum = 'tamamlandi' AND DATE(COALESCE(tamamlama_tarihi, created_at)) = CURRENT_DATE
    `);
    
    // Toplam müşteri
    const musteriResult = await pool.query('SELECT COUNT(*) as toplam FROM musteriler');
    
    // Toplam gider
    const giderResult = await pool.query('SELECT COALESCE(SUM(tutar), 0) as toplam FROM giderler');
    
    res.json({
      genel: {
        toplam_is: parseInt(toplamResult.rows[0].toplam_is),
        acik_is: parseInt(acikIsResult.rows[0].acik_is),
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

// Fiş bazlı kar raporu (tarih aralığı destekli)
router.get('/fis-kar', async (req, res) => {
  try {
    const { baslangic, bitis, tarih } = req.query;
    
    // İş Emirleri
    let isEmriQuery = `
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
        ie.durum,
        'is_emri' as kaynak_tip
      FROM is_emirleri ie
    `;
    
    // Aksesuar Satışları
    let aksesuarQuery = `
      SELECT 
        a.id,
        CONCAT('AKS-', a.id) as fis_no,
        a.ad_soyad as musteri_ad_soyad,
        a.odeme_sekli as marka,
        '' as model_tip,
        a.toplam_satis as gercek_toplam_ucret,
        a.toplam_maliyet,
        a.kar,
        a.satis_tarihi as created_at,
        'tamamlandi' as durum,
        'aksesuar' as kaynak_tip
      FROM aksesuarlar a
    `;
    
    const params = [];
    
    if (baslangic && bitis) {
      params.push(baslangic, bitis);
      isEmriQuery += ` WHERE DATE(ie.created_at) BETWEEN $1 AND $2`;
      aksesuarQuery += ` WHERE DATE(a.satis_tarihi) BETWEEN $1 AND $2`;
    } else if (tarih) {
      params.push(tarih);
      isEmriQuery += ` WHERE DATE(ie.created_at) = $1`;
      aksesuarQuery += ` WHERE DATE(a.satis_tarihi) = $1`;
    }
    
    const isEmriResult = await pool.query(isEmriQuery + ' ORDER BY ie.created_at DESC', params);
    const aksesuarResult = await pool.query(aksesuarQuery + ' ORDER BY a.satis_tarihi DESC', params);
    
    // Birleştir ve tarihe göre sırala
    const tumKayitlar = [...isEmriResult.rows, ...aksesuarResult.rows].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    // Toplam hesapla
    const toplam = tumKayitlar.reduce((acc, row) => {
      acc.gelir += parseFloat(row.gercek_toplam_ucret) || 0;
      acc.maliyet += parseFloat(row.toplam_maliyet) || 0;
      acc.kar += parseFloat(row.kar) || 0;
      return acc;
    }, { gelir: 0, maliyet: 0, kar: 0 });
    
    // Ayrı toplamlar
    const isEmriToplam = isEmriResult.rows.reduce((acc, row) => {
      acc.gelir += parseFloat(row.gercek_toplam_ucret) || 0;
      acc.maliyet += parseFloat(row.toplam_maliyet) || 0;
      acc.kar += parseFloat(row.kar) || 0;
      return acc;
    }, { gelir: 0, maliyet: 0, kar: 0 });
    
    const aksesuarToplam = aksesuarResult.rows.reduce((acc, row) => {
      acc.gelir += parseFloat(row.gercek_toplam_ucret) || 0;
      acc.maliyet += parseFloat(row.toplam_maliyet) || 0;
      acc.kar += parseFloat(row.kar) || 0;
      return acc;
    }, { gelir: 0, maliyet: 0, kar: 0 });
    
    res.json({
      fisler: tumKayitlar,
      is_emirleri: isEmriResult.rows,
      aksesuarlar: aksesuarResult.rows,
      toplam,
      is_emri_toplam: isEmriToplam,
      aksesuar_toplam: aksesuarToplam
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

// ==================== AKSESUAR RAPORLARI ====================

// Aksesuar tarih aralığı raporu
router.get('/aksesuar/aralik', async (req, res) => {
  try {
    const { baslangic, bitis } = req.query;
    
    if (!baslangic || !bitis) {
      return res.status(400).json({ message: 'Başlangıç ve bitiş tarihi gerekli' });
    }
    
    // Tarih aralığındaki tamamlanan aksesuarlar (özet) - tamamlama_tarihi'ne göre
    const aksesuarlarOzet = await pool.query(
      `SELECT 
        DATE(COALESCE(tamamlama_tarihi, created_at)) as tarih,
        COUNT(*) as satis_sayisi,
        COALESCE(SUM(toplam_satis), 0) as toplam_satis,
        COALESCE(SUM(toplam_maliyet), 0) as toplam_maliyet,
        COALESCE(SUM(kar), 0) as toplam_kar
       FROM aksesuarlar
       WHERE durum = 'tamamlandi' AND DATE(COALESCE(tamamlama_tarihi, created_at)) BETWEEN $1 AND $2
       GROUP BY DATE(COALESCE(tamamlama_tarihi, created_at))
       ORDER BY DATE(COALESCE(tamamlama_tarihi, created_at)) DESC`,
      [baslangic, bitis]
    );
    
    // Tarih aralığındaki tüm tamamlanan aksesuarlar (detaylı liste)
    const detayliAksesuarlar = await pool.query(
      `SELECT 
        a.id,
        a.ad_soyad,
        a.telefon,
        a.odeme_sekli,
        a.toplam_satis,
        a.toplam_maliyet,
        a.kar,
        a.durum,
        a.created_at,
        a.tamamlama_tarihi,
        TO_CHAR(a.satis_tarihi, 'YYYY-MM-DD') as satis_tarihi
       FROM aksesuarlar a
       WHERE a.durum = 'tamamlandi' AND DATE(COALESCE(a.tamamlama_tarihi, a.created_at)) BETWEEN $1 AND $2
       ORDER BY a.tamamlama_tarihi DESC`,
      [baslangic, bitis]
    );
    
    // Her aksesuar için parçaları getir
    const aksesuarlarWithParcalar = await Promise.all(detayliAksesuarlar.rows.map(async (aksesuar) => {
      const parcalarResult = await pool.query(
        'SELECT * FROM aksesuar_parcalar WHERE aksesuar_id = $1 ORDER BY id',
        [aksesuar.id]
      );
      return {
        ...aksesuar,
        parcalar: parcalarResult.rows
      };
    }));
    
    // Genel toplam (sadece tamamlanan aksesuarlar)
    const genelToplam = await pool.query(
      `SELECT 
        COALESCE(SUM(toplam_satis), 0) as toplam_satis,
        COALESCE(SUM(toplam_maliyet), 0) as toplam_maliyet,
        COALESCE(SUM(kar), 0) as toplam_kar,
        COUNT(*) as toplam_satis_sayisi
       FROM aksesuarlar
       WHERE durum = 'tamamlandi' AND DATE(COALESCE(tamamlama_tarihi, created_at)) BETWEEN $1 AND $2`,
      [baslangic, bitis]
    );
    
    res.json({
      baslangic,
      bitis,
      gunluk_veriler: aksesuarlarOzet.rows,
      detayli_aksesuarlar: aksesuarlarWithParcalar,
      genel_ozet: {
        toplam_satis_sayisi: parseInt(genelToplam.rows[0].toplam_satis_sayisi),
        toplam_satis: parseFloat(genelToplam.rows[0].toplam_satis),
        toplam_maliyet: parseFloat(genelToplam.rows[0].toplam_maliyet),
        toplam_kar: parseFloat(genelToplam.rows[0].toplam_kar)
      }
    });
  } catch (error) {
    console.error('Aksesuar tarih aralığı rapor hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Aksesuar detayını getir (parçalarıyla birlikte)
router.get('/aksesuar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const aksesuarResult = await pool.query(
      `SELECT id, ad_soyad, telefon, odeme_sekli, aciklama, durum, odeme_detaylari,
       TO_CHAR(satis_tarihi, 'YYYY-MM-DD') as satis_tarihi,
       toplam_maliyet, toplam_satis, kar, odeme_tutari, created_at, tamamlama_tarihi
       FROM aksesuarlar WHERE id = $1`,
      [id]
    );
    
    if (aksesuarResult.rows.length === 0) {
      return res.status(404).json({ message: 'Aksesuar kaydı bulunamadı' });
    }
    
    const parcalarResult = await pool.query(
      'SELECT * FROM aksesuar_parcalar WHERE aksesuar_id = $1 ORDER BY id',
      [id]
    );
    
    res.json({
      ...aksesuarResult.rows[0],
      parcalar: parcalarResult.rows
    });
  } catch (error) {
    console.error('Aksesuar detay hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
