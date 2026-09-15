const express = require('express');
const pool = require('../config/db');
const { logAktivite, getRequestInfo } = require('../config/activityLogger');
const { sourcePaymentJoin, sourcePaymentColumns } = require('../domain/sourcePaymentSummary');

const router = express.Router();

const validatePayments = (total, values) => {
  const parsed = values.map((value) => Number(value || 0));
  if (parsed.some((value) => !Number.isFinite(value) || value < 0)) {
    return { error: 'Ödeme tutarları geçersiz olamaz.' };
  }
  const paid = parsed.reduce((sum, value) => sum + value, 0);
  if (paid > Number(total || 0) + 0.005) return { error: 'Girilen ödemeler satış tutarını aşamaz.' };
  return { values: parsed, paid };
};

const ensureCustomer = async (client, name, phone) => {
  const normalizedPhone = String(phone || '').replace(/[^0-9]/g, '');
  const normalizedName = String(name || '').trim();
  let existing = { rowCount: 0, rows: [] };
  if (normalizedPhone) {
    existing = await client.query(
      "SELECT id FROM musteriler WHERE REGEXP_REPLACE(COALESCE(telefon, ''), '[^0-9]', '', 'g') = $1 ORDER BY id LIMIT 1",
      [normalizedPhone]
    );
  } else if (normalizedName && normalizedName !== '-') {
    existing = await client.query(
      "SELECT id FROM musteriler WHERE LOWER(TRIM(COALESCE(ad_soyad, ''))) = LOWER($1) ORDER BY id LIMIT 1",
      [normalizedName]
    );
  }
  if (existing.rowCount) return existing.rows[0].id;
  const inserted = await client.query(
    'INSERT INTO musteriler (ad_soyad, telefon, aktif) VALUES ($1, $2, TRUE) RETURNING id',
    [normalizedName || 'Yedek Parça Müşterisi', normalizedPhone ? phone : null]
  );
  return inserted.rows[0].id;
};

const calculateTotals = (parcalar) => parcalar.reduce((totals, parca) => {
  const adet = parseInt(parca.adet, 10) || 1;
  totals.toplamMaliyet += adet * (parseFloat(parca.maliyet) || 0);
  totals.toplamSatis += adet * (parseFloat(parca.satis_fiyati) || 0);
  return totals;
}, { toplamMaliyet: 0, toplamSatis: 0 });

const changeStock = async (client, parcalar, direction) => {
  for (const parca of parcalar) {
    const adet = parseInt(parca.adet, 10) || 1;
    if (direction === 'out') {
      await client.query(
        `UPDATE yedek_parca_stok
         SET cikan_miktar = cikan_miktar + $1,
             mevcut = giren_miktar - (cikan_miktar + $1),
             envanter_degeri = (giren_miktar - (cikan_miktar + $1)) * satis_fiyati,
             updated_at = CURRENT_TIMESTAMP
         WHERE stok_adi = $2`,
        [adet, parca.urun_adi]
      );
    } else {
      await client.query(
        `UPDATE yedek_parca_stok
         SET cikan_miktar = GREATEST(cikan_miktar - $1, 0),
             mevcut = giren_miktar - GREATEST(cikan_miktar - $1, 0),
             envanter_degeri = (giren_miktar - GREATEST(cikan_miktar - $1, 0)) * satis_fiyati,
             updated_at = CURRENT_TIMESTAMP
         WHERE stok_adi = $2`,
        [adet, parca.urun_adi]
      );
    }
  }
};

const getParts = async (client, saleId) => {
  const result = await client.query(
    'SELECT * FROM yedek_parca_satis_parcalar WHERE yedek_parca_satis_id = $1 ORDER BY id',
    [saleId]
  );
  return result.rows;
};

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.ad_soyad, s.telefon, s.odeme_sekli, s.aciklama, s.durum, s.odeme_detaylari,
              TO_CHAR(s.satis_tarihi, 'YYYY-MM-DD') AS satis_tarihi,
              s.toplam_maliyet, s.toplam_satis, s.kar, s.odeme_tutari, s.created_at,
              s.olusturan_kisi, k.ad_soyad AS olusturan_ad_soyad, k.kullanici_adi AS olusturan_kullanici_adi,
              ${sourcePaymentColumns('s', 'COALESCE(s.toplam_satis, 0)', "CASE WHEN s.odeme_bilgisi_girildi THEN 0 ELSE COALESCE(s.odeme_tutari, 0) END")}
       FROM yedek_parca_satislar s
       LEFT JOIN kullanicilar k ON s.olusturan_kullanici_id = k.id
       ${sourcePaymentJoin('YEDEK_PARCA', 's')}
       ORDER BY s.created_at DESC`
    );
    const satislar = await Promise.all(result.rows.map(async (satis) => ({
      ...satis,
      parcalar: await getParts(pool, satis.id),
    })));
    res.json(satislar);
  } catch (error) {
    console.error('Yedek parça satış listesi hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.ad_soyad, s.telefon, s.odeme_sekli, s.aciklama, s.durum, s.odeme_detaylari,
              TO_CHAR(s.satis_tarihi, 'YYYY-MM-DD') AS satis_tarihi,
              s.toplam_maliyet, s.toplam_satis, s.kar, s.odeme_tutari, s.created_at,
              s.olusturan_kisi, k.ad_soyad AS olusturan_ad_soyad, k.kullanici_adi AS olusturan_kullanici_adi,
              ${sourcePaymentColumns('s', 'COALESCE(s.toplam_satis, 0)', "CASE WHEN s.odeme_bilgisi_girildi THEN 0 ELSE COALESCE(s.odeme_tutari, 0) END")}
       FROM yedek_parca_satislar s
       LEFT JOIN kullanicilar k ON s.olusturan_kullanici_id = k.id
       ${sourcePaymentJoin('YEDEK_PARCA', 's')}
       WHERE s.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Satış kaydı bulunamadı' });
    res.json({ ...result.rows[0], parcalar: await getParts(pool, req.params.id) });
  } catch (error) {
    console.error('Yedek parça satış detay hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      ad_soyad, telefon, odeme_sekli, nakit_tutar, kart_tutar, havale_tutar,
      aciklama, durum, odeme_detaylari, satis_tarihi, olusturan_kisi, parcalar = [],
    } = req.body;
    const musteriId = await ensureCustomer(client, ad_soyad, telefon);
    const { toplamMaliyet, toplamSatis } = calculateTotals(parcalar);
    const payment = validatePayments(toplamSatis, [nakit_tutar, kart_tutar, havale_tutar]);
    if (payment.error) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: payment.error });
    }
    const result = await client.query(
      `INSERT INTO yedek_parca_satislar
       (ad_soyad, telefon, odeme_sekli, aciklama, durum, odeme_detaylari, satis_tarihi,
        toplam_maliyet, toplam_satis, kar, odeme_tutari, olusturan_kullanici_id, olusturan_kisi,
        nakit_tutar, kart_tutar, havale_tutar, odeme_bilgisi_girildi, musteri_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,TRUE,$17) RETURNING *`,
      [ad_soyad, telefon, odeme_sekli, aciklama, durum || 'beklemede', odeme_detaylari,
        satis_tarihi || new Date(), toplamMaliyet, toplamSatis, toplamSatis - toplamMaliyet,
        payment.paid, req.user?.id || null, olusturan_kisi || null, ...payment.values, musteriId]
    );
    const saleId = result.rows[0].id;
    for (const parca of parcalar) {
      await client.query(
        `INSERT INTO yedek_parca_satis_parcalar
         (yedek_parca_satis_id, urun_adi, adet, maliyet, satis_fiyati) VALUES ($1,$2,$3,$4,$5)`,
        [saleId, parca.urun_adi, parseInt(parca.adet, 10) || 1,
          parseFloat(parca.maliyet) || 0, parseFloat(parca.satis_fiyati) || 0]
      );
    }
    if ((durum || 'beklemede') === 'tamamlandi') await changeStock(client, parcalar, 'out');
    const savedParts = await getParts(client, saleId);
    await client.query('COMMIT');

    try {
      const info = getRequestInfo(req);
      await logAktivite({
        kullaniciId: info.kullaniciId,
        kullaniciAdi: info.kullaniciAdi,
        islemTipi: 'YEDEK_PARCA_SATIS_OLUSTURMA',
        islemDetay: `Yeni yedek parça satışı: ${ad_soyad}`,
        hedefTablo: 'yedek_parca_satislar',
        hedefId: saleId,
        ipAdresi: info.ipAdresi,
        tarayiciBilgisi: info.tarayiciBilgisi,
      });
    } catch (logError) {
      console.error('Aktivite log hatası:', logError);
    }
    res.status(201).json({ ...result.rows[0], parcalar: savedParts });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Yedek parça satış oluşturma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const {
      ad_soyad, telefon, odeme_sekli, nakit_tutar, kart_tutar, havale_tutar,
      aciklama, durum, odeme_detaylari, satis_tarihi, olusturan_kisi, parcalar = [],
    } = req.body;
    const current = await client.query('SELECT durum FROM yedek_parca_satislar WHERE id = $1 FOR UPDATE', [id]);
    if (current.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Satış kaydı bulunamadı' });
    }
    const oldStatus = current.rows[0].durum;
    const oldParts = await getParts(client, id);
    const musteriId = await ensureCustomer(client, ad_soyad, telefon);
    const { toplamMaliyet, toplamSatis } = calculateTotals(parcalar);
    const payment = validatePayments(toplamSatis, [nakit_tutar, kart_tutar, havale_tutar]);
    if (payment.error) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: payment.error });
    }
    if (oldStatus === 'tamamlandi') await changeStock(client, oldParts, 'in');

    const completionSql = durum === 'tamamlandi' && oldStatus !== 'tamamlandi'
      ? ', tamamlama_tarihi = CURRENT_TIMESTAMP'
      : durum !== 'tamamlandi' ? ', tamamlama_tarihi = NULL' : '';
    const result = await client.query(
      `UPDATE yedek_parca_satislar
       SET ad_soyad=$1, telefon=$2, odeme_sekli=$3, aciklama=$4, durum=$5,
           odeme_detaylari=$6, satis_tarihi=$7, toplam_maliyet=$8, toplam_satis=$9,
           kar=$10, odeme_tutari=$11, olusturan_kisi=COALESCE($12, olusturan_kisi),
           olusturan_kullanici_id=COALESCE(olusturan_kullanici_id,$13), nakit_tutar=$14,
           kart_tutar=$15, havale_tutar=$16, odeme_bilgisi_girildi=TRUE, musteri_id=$17,
           updated_at=CURRENT_TIMESTAMP${completionSql}
       WHERE id=$18 RETURNING *`,
      [ad_soyad, telefon, odeme_sekli, aciklama, durum || 'beklemede', odeme_detaylari,
        satis_tarihi, toplamMaliyet, toplamSatis, toplamSatis - toplamMaliyet, payment.paid,
        olusturan_kisi || null, req.user?.id || null, ...payment.values, musteriId, id]
    );
    await client.query('DELETE FROM yedek_parca_satis_parcalar WHERE yedek_parca_satis_id = $1', [id]);
    for (const parca of parcalar) {
      await client.query(
        `INSERT INTO yedek_parca_satis_parcalar
         (yedek_parca_satis_id, urun_adi, adet, maliyet, satis_fiyati) VALUES ($1,$2,$3,$4,$5)`,
        [id, parca.urun_adi, parseInt(parca.adet, 10) || 1,
          parseFloat(parca.maliyet) || 0, parseFloat(parca.satis_fiyati) || 0]
      );
    }
    if (durum === 'tamamlandi') await changeStock(client, parcalar, 'out');
    const savedParts = await getParts(client, id);
    await client.query('COMMIT');
    res.json({ ...result.rows[0], parcalar: savedParts });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Yedek parça satış güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  } finally {
    client.release();
  }
});

router.patch('/bulk/complete', async (req, res) => {
  if (req.user?.rol !== 'admin') return res.status(403).json({ message: 'Bu işlem için yönetici yetkisi gereklidir.' });
  const ids = [...new Set((Array.isArray(req.body.ids) ? req.body.ids : []).map(Number))];
  if (!ids.length || ids.length > 500 || ids.some((id) => !Number.isSafeInteger(id) || id <= 0)) {
    return res.status(400).json({ message: '1-500 geçerli Yedek Parça satışı seçilmelidir.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const locked = await client.query('SELECT id FROM yedek_parca_satislar WHERE id = ANY($1::int[]) FOR UPDATE', [ids]);
    if (locked.rowCount !== ids.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Seçilen Yedek Parça satışlarından biri bulunamadı.' });
    }
    const quantities = await client.query(
      `SELECT p.urun_adi, SUM(p.adet)::int AS adet
       FROM yedek_parca_satis_parcalar p
       JOIN yedek_parca_satislar s ON s.id = p.yedek_parca_satis_id
       WHERE s.id = ANY($1::int[]) AND LOWER(COALESCE(s.durum,'')) NOT IN ('tamamlandi','iptal','iptal_edildi')
       GROUP BY p.urun_adi`,
      [ids]
    );
    await changeStock(client, quantities.rows, 'out');
    const result = await client.query(
      `UPDATE yedek_parca_satislar
       SET durum='tamamlandi', tamamlama_tarihi=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP
       WHERE id = ANY($1::int[]) AND LOWER(COALESCE(durum,'')) NOT IN ('tamamlandi','iptal','iptal_edildi')
       RETURNING id`,
      [ids]
    );
    await client.query('COMMIT');
    res.json({ message: `${result.rowCount} Yedek Parça satışı tamamlandı.`, count: result.rowCount, ids: result.rows.map((row) => row.id) });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Toplu Yedek Parça tamamlama hatası:', error);
    res.status(500).json({ message: 'Yedek Parça satışları tamamlanamadı.' });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const current = await client.query('SELECT durum FROM yedek_parca_satislar WHERE id = $1 FOR UPDATE', [req.params.id]);
    if (current.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Satış kaydı bulunamadı' });
    }
    if (current.rows[0].durum === 'tamamlandi') {
      await changeStock(client, await getParts(client, req.params.id), 'in');
    }
    await client.query('DELETE FROM yedek_parca_satislar WHERE id = $1', [req.params.id]);
    await client.query('COMMIT');
    res.json({ message: 'Satış kaydı silindi' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Yedek parça satış silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  } finally {
    client.release();
  }
});

module.exports = router;
