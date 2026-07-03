const express = require('express');
const pool = require('../config/db');
const { logAktivite, getRequestInfo } = require('../config/activityLogger');

const router = express.Router();

// Tüm bisiklet satış kayıtlarını parçalarıyla birlikte getir
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.ad_soyad, b.telefon, b.odeme_sekli, b.aciklama, b.durum, b.odeme_detaylari,
       TO_CHAR(b.satis_tarihi, 'YYYY-MM-DD') as satis_tarihi,
       b.toplam_maliyet, b.toplam_satis, b.kar, b.odeme_tutari, b.created_at,
       b.olusturan_kisi, k.ad_soyad as olusturan_ad_soyad, k.kullanici_adi as olusturan_kullanici_adi
       FROM bisiklet_satislar b
       LEFT JOIN kullanicilar k ON b.olusturan_kullanici_id = k.id
       ORDER BY b.created_at DESC`
    );

    // Her satış için parçaları getir
    const satislar = await Promise.all(result.rows.map(async (satis) => {
      const parcalarResult = await pool.query(
        'SELECT * FROM bisiklet_satis_parcalar WHERE bisiklet_satis_id = $1 ORDER BY id',
        [satis.id]
      );
      return {
        ...satis,
        parcalar: parcalarResult.rows
      };
    }));

    res.json(satislar);
  } catch (error) {
    console.error('Bisiklet satış listesi hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Tek bisiklet satış kaydı parçalarıyla birlikte getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT b.id, b.ad_soyad, b.telefon, b.odeme_sekli, b.aciklama, b.durum, b.odeme_detaylari,
       TO_CHAR(b.satis_tarihi, 'YYYY-MM-DD') as satis_tarihi,
       b.toplam_maliyet, b.toplam_satis, b.kar, b.odeme_tutari, b.created_at,
       b.olusturan_kisi, k.ad_soyad as olusturan_ad_soyad, k.kullanici_adi as olusturan_kullanici_adi
       FROM bisiklet_satislar b
       LEFT JOIN kullanicilar k ON b.olusturan_kullanici_id = k.id
       WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Satış kaydı bulunamadı' });
    }

    const parcalarResult = await pool.query(
      'SELECT * FROM bisiklet_satis_parcalar WHERE bisiklet_satis_id = $1 ORDER BY id',
      [id]
    );

    res.json({
      ...result.rows[0],
      parcalar: parcalarResult.rows
    });
  } catch (error) {
    console.error('Bisiklet satış detay hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni bisiklet satış kaydı oluştur
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { ad_soyad, telefon, odeme_sekli, aciklama, durum, odeme_detaylari, satis_tarihi, olusturan_kisi, parcalar = [] } = req.body;
    const olusturan_kullanici_id = req.user?.id || null;

    // Toplamları hesapla
    let toplam_maliyet = 0;
    let toplam_satis = 0;

    parcalar.forEach(p => {
      const adet = parseInt(p.adet) || 1;
      toplam_maliyet += adet * (parseFloat(p.maliyet) || 0);
      toplam_satis += adet * (parseFloat(p.satis_fiyati) || 0);
    });

    const kar = toplam_satis - toplam_maliyet;

    const result = await client.query(
      `INSERT INTO bisiklet_satislar (ad_soyad, telefon, odeme_sekli, aciklama, durum, odeme_detaylari, satis_tarihi, toplam_maliyet, toplam_satis, kar, odeme_tutari, olusturan_kullanici_id, olusturan_kisi)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [ad_soyad, telefon, odeme_sekli, aciklama, durum || 'beklemede', odeme_detaylari, satis_tarihi || new Date(), toplam_maliyet, toplam_satis, kar, toplam_satis, olusturan_kullanici_id, olusturan_kisi || null]
    );

    const satisId = result.rows[0].id;

    // Parçaları ekle
    for (const parca of parcalar) {
      await client.query(
        `INSERT INTO bisiklet_satis_parcalar (bisiklet_satis_id, urun_adi, adet, maliyet, satis_fiyati)
         VALUES ($1, $2, $3, $4, $5)`,
        [satisId, parca.urun_adi, parseInt(parca.adet) || 1, parseFloat(parca.maliyet) || 0, parseFloat(parca.satis_fiyati) || 0]
      );
    }

    // Sadece durum 'tamamlandi' ise stoktan düş
    if ((durum || 'beklemede') === 'tamamlandi') {
      for (const parca of parcalar) {
        const adet = parseInt(parca.adet) || 1;
        await client.query(
          `UPDATE bisiklet_stok
           SET cikan_miktar = cikan_miktar + $1,
               mevcut = giren_miktar - (cikan_miktar + $1),
               envanter_degeri = (giren_miktar - (cikan_miktar + $1)) * satis_fiyati,
               updated_at = CURRENT_TIMESTAMP
           WHERE stok_adi = $2`,
          [adet, parca.urun_adi]
        );
      }
    }

    await client.query('COMMIT');

    const parcalarResult = await pool.query(
      'SELECT * FROM bisiklet_satis_parcalar WHERE bisiklet_satis_id = $1 ORDER BY id',
      [satisId]
    );

    // Aktivite logu
    try {
      const { kullaniciId, kullaniciAdi, ipAdresi, tarayiciBilgisi } = getRequestInfo(req);
      await logAktivite({
        kullaniciId,
        kullaniciAdi,
        islemTipi: 'BISIKLET_SATIS_OLUSTURMA',
        islemDetay: `Yeni hobi grup satışı: ${ad_soyad}`,
        hedefTablo: 'bisiklet_satislar',
        hedefId: satisId,
        ipAdresi,
        tarayiciBilgisi
      });
    } catch (logError) {
      console.error('Aktivite log hatası:', logError);
    }

    res.status(201).json({
      ...result.rows[0],
      parcalar: parcalarResult.rows
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Bisiklet satış oluşturma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  } finally {
    client.release();
  }
});

// Bisiklet satış kaydını güncelle
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { ad_soyad, telefon, odeme_sekli, aciklama, durum, odeme_detaylari, satis_tarihi, olusturan_kisi, parcalar = [] } = req.body;

    // Mevcut durumu al
    const mevcutDurum = await client.query('SELECT durum FROM bisiklet_satislar WHERE id = $1', [id]);
    const eskiDurum = mevcutDurum.rows[0]?.durum;

    // Toplamları hesapla
    let toplam_maliyet = 0;
    let toplam_satis = 0;

    parcalar.forEach(p => {
      const adet = parseInt(p.adet) || 1;
      toplam_maliyet += adet * (parseFloat(p.maliyet) || 0);
      toplam_satis += adet * (parseFloat(p.satis_fiyati) || 0);
    });

    const kar = toplam_satis - toplam_maliyet;

    // Tamamlama tarihi mantığı
    let tamamlamaTarihiQuery = '';
    if (durum === 'tamamlandi' && eskiDurum !== 'tamamlandi') {
      tamamlamaTarihiQuery = ', tamamlama_tarihi = CURRENT_TIMESTAMP';
    } else if (durum !== 'tamamlandi') {
      tamamlamaTarihiQuery = ', tamamlama_tarihi = NULL';
    }

    const result = await client.query(
      `UPDATE bisiklet_satislar
       SET ad_soyad = $1, telefon = $2, odeme_sekli = $3, aciklama = $4,
           durum = $5, odeme_detaylari = $6, satis_tarihi = $7, toplam_maliyet = $8, toplam_satis = $9,
           kar = $10, odeme_tutari = $11, olusturan_kisi = COALESCE($12, olusturan_kisi),
           olusturan_kullanici_id = COALESCE(olusturan_kullanici_id, $13),
           updated_at = CURRENT_TIMESTAMP${tamamlamaTarihiQuery}
       WHERE id = $14
       RETURNING *`,
      [ad_soyad, telefon, odeme_sekli, aciklama, durum || 'beklemede', odeme_detaylari, satis_tarihi, toplam_maliyet, toplam_satis, kar, toplam_satis, olusturan_kisi || null, req.user?.id || null, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Satış kaydı bulunamadı' });
    }

    // Eski durum tamamlandı ise eski parçaları stoğa geri ekle
    if (eskiDurum === 'tamamlandi') {
      const eskiParcalar = await client.query('SELECT urun_adi, adet FROM bisiklet_satis_parcalar WHERE bisiklet_satis_id = $1', [id]);
      for (const eskiParca of eskiParcalar.rows) {
        const adet = parseInt(eskiParca.adet) || 1;
        await client.query(
          `UPDATE bisiklet_stok
           SET cikan_miktar = GREATEST(cikan_miktar - $1, 0),
               mevcut = giren_miktar - GREATEST(cikan_miktar - $1, 0),
               envanter_degeri = (giren_miktar - GREATEST(cikan_miktar - $1, 0)) * satis_fiyati,
               updated_at = CURRENT_TIMESTAMP
           WHERE stok_adi = $2`,
          [adet, eskiParca.urun_adi]
        );
      }
    }

    // Mevcut parçaları sil
    await client.query('DELETE FROM bisiklet_satis_parcalar WHERE bisiklet_satis_id = $1', [id]);

    // Yeni parçaları ekle
    for (const parca of parcalar) {
      await client.query(
        `INSERT INTO bisiklet_satis_parcalar (bisiklet_satis_id, urun_adi, adet, maliyet, satis_fiyati)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, parca.urun_adi, parseInt(parca.adet) || 1, parseFloat(parca.maliyet) || 0, parseFloat(parca.satis_fiyati) || 0]
      );
    }

    // Yeni durum tamamlandı ise stoktan düş
    if (durum === 'tamamlandi') {
      for (const parca of parcalar) {
        const adet = parseInt(parca.adet) || 1;
        await client.query(
          `UPDATE bisiklet_stok
           SET cikan_miktar = cikan_miktar + $1,
               mevcut = giren_miktar - (cikan_miktar + $1),
               envanter_degeri = (giren_miktar - (cikan_miktar + $1)) * satis_fiyati,
               updated_at = CURRENT_TIMESTAMP
           WHERE stok_adi = $2`,
          [adet, parca.urun_adi]
        );
      }
    }

    await client.query('COMMIT');

    const parcalarResult = await pool.query(
      'SELECT * FROM bisiklet_satis_parcalar WHERE bisiklet_satis_id = $1 ORDER BY id',
      [id]
    );

    res.json({
      ...result.rows[0],
      parcalar: parcalarResult.rows
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Bisiklet satış güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  } finally {
    client.release();
  }
});

// Bisiklet satış kaydını sil
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    const mevcutKayit = await client.query('SELECT durum FROM bisiklet_satislar WHERE id = $1', [id]);
    if (mevcutKayit.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Satış kaydı bulunamadı' });
    }

    const eskiDurum = mevcutKayit.rows[0].durum;

    // Tamamlandı ise stokları geri ekle
    if (eskiDurum === 'tamamlandi') {
      const eskiParcalar = await client.query('SELECT urun_adi, adet FROM bisiklet_satis_parcalar WHERE bisiklet_satis_id = $1', [id]);
      for (const parca of eskiParcalar.rows) {
        const adet = parseInt(parca.adet) || 1;
        await client.query(
          `UPDATE bisiklet_stok
           SET cikan_miktar = GREATEST(cikan_miktar - $1, 0),
               mevcut = giren_miktar - GREATEST(cikan_miktar - $1, 0),
               envanter_degeri = (giren_miktar - GREATEST(cikan_miktar - $1, 0)) * satis_fiyati,
               updated_at = CURRENT_TIMESTAMP
           WHERE stok_adi = $2`,
          [adet, parca.urun_adi]
        );
      }
    }

    await client.query('DELETE FROM bisiklet_satislar WHERE id = $1', [id]);
    await client.query('COMMIT');

    res.json({ message: 'Satış kaydı silindi' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Bisiklet satış silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  } finally {
    client.release();
  }
});

module.exports = router;
