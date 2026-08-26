const express = require('express');
const pool = require('../config/db');
const { logAktivite, getRequestInfo, ISLEM_TIPLERI } = require('../config/activityLogger');
const {
  ACCOUNT_TRANSACTION_TYPES,
  DEBIT_TYPES,
  CREDIT_TYPES,
  validateTransactionInput,
  getReversalType,
} = require('../domain/customerAccount');

const router = express.Router();
const debitTypesSql = DEBIT_TYPES.map((type) => `'${type}'`).join(', ');
const creditTypesSql = CREDIT_TYPES.map((type) => `'${type}'`).join(', ');
const automaticSourceTypesSql = "'SERVIS', 'MOTOR_SATISI', 'AKSESUAR', 'HOBI_GRUP'";

const automaticReceivablesSelect = (customerAlias) => {
  const customerSource = customerAlias === 'm' ? '' : ', hedef h';
  return `
  SELECT 'SERVIS'::TEXT AS referans_tipi, ie.id::TEXT AS referans_id,
    COALESCE(ie.tamamlama_tarihi, ie.created_at, CURRENT_TIMESTAMP) AS islem_tarihi,
    CONCAT_WS(' ', 'Servis', NULLIF(ie.marka, ''), NULLIF(ie.model_tip, ''))::TEXT AS aciklama,
    COALESCE(NULLIF(ie.gercek_toplam_ucret, 0), ie.tahmini_toplam_ucret, 0)::NUMERIC(14,2) AS tutar,
    COALESCE(ie.nakit_tutar, 0)::NUMERIC(14,2) AS nakit_tutar,
    COALESCE(ie.kart_tutar, 0)::NUMERIC(14,2) AS kart_tutar,
    COALESCE(ie.havale_tutar, 0)::NUMERIC(14,2) AS havale_tutar,
    0::NUMERIC(14,2) AS diger_tutar
  FROM is_emirleri ie${customerSource}
  WHERE (ie.musteri_id = ${customerAlias}.id OR (
      REGEXP_REPLACE(COALESCE(${customerAlias}.telefon, ''), '[^0-9]', '', 'g') <> '' AND
      REGEXP_REPLACE(COALESCE(ie.telefon, ''), '[^0-9]', '', 'g') = REGEXP_REPLACE(COALESCE(${customerAlias}.telefon, ''), '[^0-9]', '', 'g')
    ))
    AND LOWER(COALESCE(ie.durum, '')) NOT IN ('tamamlandi', 'iptal', 'iptal_edildi')
    AND COALESCE(NULLIF(ie.gercek_toplam_ucret, 0), ie.tahmini_toplam_ucret, 0) > 0
  UNION ALL
  SELECT 'MOTOR_SATISI', ms.id::TEXT, COALESCE(ms.tarih::timestamp, ms.created_at),
    CONCAT_WS(' ', 'Motosiklet satışı', NULLIF(mm.model_adi, '')),
    COALESCE(ms.satis_fiyati, ms.fatura_fiyati, 0)::NUMERIC(14,2),
    COALESCE(ms.nakit_tutar, 0)::NUMERIC(14,2),
    COALESCE(ms.kart_tutar, 0)::NUMERIC(14,2),
    COALESCE(ms.havale_tutar, 0)::NUMERIC(14,2),
    0::NUMERIC(14,2)
  FROM motor_satislari ms
  LEFT JOIN motor_modelleri mm ON mm.id = ms.motor_modeli_id${customerSource}
  WHERE REGEXP_REPLACE(COALESCE(${customerAlias}.telefon, ''), '[^0-9]', '', 'g') <> ''
    AND REGEXP_REPLACE(COALESCE(ms.musteri_telefon, ''), '[^0-9]', '', 'g') = REGEXP_REPLACE(COALESCE(${customerAlias}.telefon, ''), '[^0-9]', '', 'g')
    AND LOWER(COALESCE(ms.durum, '')) NOT IN ('tamamlandi', 'iptal', 'iptal_edildi')
    AND COALESCE(ms.satis_fiyati, ms.fatura_fiyati, 0) > 0
  UNION ALL
  SELECT 'AKSESUAR', a.id::TEXT, COALESCE(a.satis_tarihi::timestamp, a.created_at),
    COALESCE(NULLIF(a.urun_adi, ''), 'Aksesuar satışı'), COALESCE(a.toplam_satis, 0)::NUMERIC(14,2),
    CASE WHEN a.odeme_bilgisi_girildi THEN COALESCE(a.nakit_tutar, 0) ELSE 0 END::NUMERIC(14,2),
    CASE WHEN a.odeme_bilgisi_girildi THEN COALESCE(a.kart_tutar, 0) ELSE 0 END::NUMERIC(14,2),
    CASE WHEN a.odeme_bilgisi_girildi THEN COALESCE(a.havale_tutar, 0) ELSE 0 END::NUMERIC(14,2),
    CASE WHEN a.odeme_bilgisi_girildi THEN 0 ELSE COALESCE(a.odeme_tutari, 0) END::NUMERIC(14,2)
  FROM aksesuarlar a${customerSource}
  WHERE REGEXP_REPLACE(COALESCE(${customerAlias}.telefon, ''), '[^0-9]', '', 'g') <> ''
    AND REGEXP_REPLACE(COALESCE(a.telefon, ''), '[^0-9]', '', 'g') = REGEXP_REPLACE(COALESCE(${customerAlias}.telefon, ''), '[^0-9]', '', 'g')
    AND LOWER(COALESCE(a.durum, '')) NOT IN ('tamamlandi', 'iptal', 'iptal_edildi')
    AND COALESCE(a.toplam_satis, 0) > 0
  UNION ALL
  SELECT 'HOBI_GRUP', b.id::TEXT, COALESCE(b.satis_tarihi::timestamp, b.created_at),
    'Hobi grup / bisiklet satışı', COALESCE(b.toplam_satis, 0)::NUMERIC(14,2),
    CASE WHEN b.odeme_bilgisi_girildi THEN COALESCE(b.nakit_tutar, 0) ELSE 0 END::NUMERIC(14,2),
    CASE WHEN b.odeme_bilgisi_girildi THEN COALESCE(b.kart_tutar, 0) ELSE 0 END::NUMERIC(14,2),
    CASE WHEN b.odeme_bilgisi_girildi THEN COALESCE(b.havale_tutar, 0) ELSE 0 END::NUMERIC(14,2),
    CASE WHEN b.odeme_bilgisi_girildi THEN 0 ELSE COALESCE(b.odeme_tutari, 0) END::NUMERIC(14,2)
  FROM bisiklet_satislar b${customerSource}
  WHERE REGEXP_REPLACE(COALESCE(${customerAlias}.telefon, ''), '[^0-9]', '', 'g') <> ''
    AND REGEXP_REPLACE(COALESCE(b.telefon, ''), '[^0-9]', '', 'g') = REGEXP_REPLACE(COALESCE(${customerAlias}.telefon, ''), '[^0-9]', '', 'g')
    AND LOWER(COALESCE(b.durum, '')) NOT IN ('tamamlandi', 'iptal', 'iptal_edildi')
    AND COALESCE(b.toplam_satis, 0) > 0
`;
};

const parsePositiveId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const requireAdmin = (req, res) => {
  if (req.user?.rol !== 'admin') {
    res.status(403).json({ message: 'Bu işlem için yönetici yetkisi gereklidir.' });
    return false;
  }
  return true;
};

const accountTotalsJoin = `
  LEFT JOIN LATERAL (
    SELECT
      (COALESCE((SELECT SUM(CASE WHEN hareket_tipi IN (${debitTypesSql}) THEN tutar ELSE 0 END)
        FROM musteri_cari_hareketleri
        WHERE musteri_id = m.id AND NOT (hareket_tipi = 'BORC' AND referans_tipi IN (${automaticSourceTypesSql}))), 0)
       + COALESCE((SELECT SUM(tutar) FROM (${automaticReceivablesSelect('m')}) otomatik), 0))::NUMERIC(14,2) AS toplam_borc,
      COALESCE((SELECT SUM(CASE WHEN hareket_tipi IN (${creditTypesSql}) THEN tutar ELSE 0 END)
        FROM musteri_cari_hareketleri WHERE musteri_id = m.id), 0)
       + COALESCE((SELECT SUM(nakit_tutar + kart_tutar + havale_tutar + diger_tutar)
         FROM (${automaticReceivablesSelect('m')}) otomatik), 0)::NUMERIC(14,2) AS toplam_tahsilat
  ) cari ON TRUE
`;

const receivablesCte = `
  kaynaklar_ham AS (
    SELECT m.id AS musteri_id, m.ad_soyad AS musteri, m.telefon,
      o.referans_tipi AS kaynak, o.referans_id, o.islem_tarihi AS tarih, o.aciklama,
      o.tutar AS toplam, o.nakit_tutar, o.kart_tutar, o.havale_tutar, o.diger_tutar
    FROM musteriler m
    CROSS JOIN LATERAL (${automaticReceivablesSelect('m')}) o
  ), kaynaklar AS (
    SELECT DISTINCT ON (kaynak, referans_id) *
    FROM kaynaklar_ham
    ORDER BY kaynak, referans_id, musteri_id
  ), sonraki_tahsilatlar AS (
    SELECT COALESCE(orijinal.referans_tipi, h.referans_tipi) AS kaynak,
      COALESCE(orijinal.referans_id, h.referans_id) AS referans_id,
      COALESCE(SUM(CASE
        WHEN h.hareket_tipi = 'TAHSILAT' THEN h.tutar
        WHEN h.hareket_tipi = 'TAHSILAT_TERS' THEN -h.tutar
        ELSE 0 END), 0)::NUMERIC(14,2) AS tutar
    FROM musteri_cari_hareketleri h
    LEFT JOIN musteri_cari_hareketleri orijinal ON orijinal.id = h.ters_hareket_id
    WHERE h.hareket_tipi IN ('TAHSILAT', 'TAHSILAT_TERS')
      AND COALESCE(orijinal.referans_tipi, h.referans_tipi) IN (${automaticSourceTypesSql})
    GROUP BY COALESCE(orijinal.referans_tipi, h.referans_tipi), COALESCE(orijinal.referans_id, h.referans_id)
  ), alacaklar AS (
    SELECT k.*,
      (k.nakit_tutar + k.kart_tutar + k.havale_tutar + k.diger_tutar)::NUMERIC(14,2) AS ilk_odenen,
      COALESCE(st.tutar, 0)::NUMERIC(14,2) AS sonradan_odenen,
      (k.nakit_tutar + k.kart_tutar + k.havale_tutar + k.diger_tutar + COALESCE(st.tutar, 0))::NUMERIC(14,2) AS odenen,
      GREATEST(k.toplam - k.nakit_tutar - k.kart_tutar - k.havale_tutar - k.diger_tutar - COALESCE(st.tutar, 0), 0)::NUMERIC(14,2) AS kalan
    FROM kaynaklar k
    LEFT JOIN sonraki_tahsilatlar st ON st.kaynak = k.kaynak AND st.referans_id = k.referans_id
  )
`;

async function getAccount(customerId, db = pool) {
  const summary = await db.query(`
    WITH hedef AS (SELECT id, telefon FROM musteriler WHERE id = $1),
    otomatik AS (${automaticReceivablesSelect('h')})
    SELECT
      (COALESCE((SELECT SUM(CASE WHEN hareket_tipi IN (${debitTypesSql}) THEN tutar ELSE 0 END)
        FROM musteri_cari_hareketleri WHERE musteri_id = $1
          AND NOT (hareket_tipi = 'BORC' AND referans_tipi IN (${automaticSourceTypesSql}))), 0)
       + COALESCE((SELECT SUM(tutar) FROM otomatik), 0))::NUMERIC(14,2) AS toplam_borc,
      COALESCE((SELECT SUM(CASE WHEN hareket_tipi IN (${creditTypesSql}) THEN tutar ELSE 0 END)
        FROM musteri_cari_hareketleri WHERE musteri_id = $1), 0)
       + COALESCE((SELECT SUM(nakit_tutar + kart_tutar + havale_tutar + diger_tutar) FROM otomatik), 0)::NUMERIC(14,2) AS toplam_tahsilat
    FROM hedef h
  `, [customerId]);

  const transactions = await db.query(`
    WITH hareketler AS (
      SELECT h.*,
        CASE
          WHEN h.hareket_tipi IN (${debitTypesSql}) THEN h.tutar
          WHEN h.hareket_tipi IN (${creditTypesSql}) THEN -h.tutar
          ELSE 0
        END AS signed_amount,
        EXISTS (
          SELECT 1 FROM musteri_cari_hareketleri ters WHERE ters.ters_hareket_id = h.id
        ) AS ters_cevrildi
      FROM musteri_cari_hareketleri h
      WHERE h.musteri_id = $1
        AND NOT (h.hareket_tipi = 'BORC' AND h.referans_tipi IN (${automaticSourceTypesSql}))
    ), bakiyeli AS (
      SELECT hareketler.*,
        SUM(signed_amount) OVER (ORDER BY islem_tarihi ASC, id ASC)::NUMERIC(14,2) AS bakiye
      FROM hareketler
    )
    SELECT b.*, k.ad_soyad AS olusturan_kisi
    FROM bakiyeli b
    LEFT JOIN kullanicilar k ON k.id = b.olusturan_kullanici_id
    ORDER BY b.islem_tarihi DESC, b.id DESC
  `, [customerId]);

  const automaticTransactions = await db.query(`
    WITH hedef AS (SELECT id, telefon FROM musteriler WHERE id = $1)
    SELECT * FROM (${automaticReceivablesSelect('h')}) otomatik
    ORDER BY islem_tarihi DESC, referans_id DESC
  `, [customerId]);
  const automaticMovements = automaticTransactions.rows.flatMap((item) => {
    const base = { ...item, otomatik: true, ters_cevrildi: false, olusturan_kisi: 'Sistem' };
    const rows = [{ ...base, id: `AUTO-BORC-${item.referans_tipi}-${item.referans_id}`, hareket_tipi: 'BORC' }];
    [['NAKIT', item.nakit_tutar], ['KART', item.kart_tutar], ['HAVALE_EFT', item.havale_tutar], ['DIGER', item.diger_tutar]].forEach(([method, amount]) => {
      if (Number(amount) > 0) rows.push({ ...base, id: `AUTO-${method}-${item.referans_tipi}-${item.referans_id}`, hareket_tipi: 'TAHSILAT', tutar: amount, odeme_yontemi: method, aciklama: `${item.aciklama} - İlk ödeme` });
    });
    return rows;
  });
  const movements = [...transactions.rows, ...automaticMovements]
    .sort((a, b) => new Date(a.islem_tarihi) - new Date(b.islem_tarihi) || String(a.id).localeCompare(String(b.id)));
  let balance = 0;
  movements.forEach((item) => {
    balance += DEBIT_TYPES.includes(item.hareket_tipi) ? Number(item.tutar) : -Number(item.tutar);
    item.bakiye = balance.toFixed(2);
  });
  movements.reverse();
  const totals = summary.rows[0] || { toplam_borc: 0, toplam_tahsilat: 0 };
  totals.kalan_bakiye = Math.max(Number(totals.toplam_borc) - Number(totals.toplam_tahsilat), 0).toFixed(2);
  return { ozet: totals, hareketler: movements };
}

// Default listing contains active customers only. Financial values are derived from ledger rows,
// and no report/operation table is filtered by customer visibility.
router.get('/', async (req, res) => {
  try {
    const durum = String(req.query.durum || 'aktif').toLowerCase();
    const search = String(req.query.q || '').trim();
    if (!['aktif', 'pasif', 'tumu'].includes(durum)) {
      return res.status(400).json({ message: 'Geçersiz müşteri durumu.' });
    }

    const params = [];
    const where = [];
    if (durum !== 'tumu') {
      params.push(durum === 'aktif');
      where.push(`m.aktif = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      where.push(`(m.ad_soyad ILIKE $${params.length} OR m.telefon ILIKE $${params.length})`);
    }

    const result = await pool.query(`
      SELECT m.*,
        cari.toplam_borc,
        cari.toplam_tahsilat,
        GREATEST(cari.toplam_borc - cari.toplam_tahsilat, 0)::NUMERIC(14,2) AS kalan_bakiye
      FROM musteriler m
      ${accountTotalsJoin}
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY m.created_at DESC, m.id DESC
    `, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Müşteri listesi hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Inactive customers remain included by design: visibility must never erase receivables.
router.get('/finans/ozet', async (req, res) => {
  try {
    const result = await pool.query(`
      WITH bakiyeler AS (
        SELECT m.id AS musteri_id, GREATEST(cari.toplam_borc - cari.toplam_tahsilat, 0)::NUMERIC(14,2) AS bakiye
        FROM musteriler m ${accountTotalsJoin}
      )
      SELECT
        COALESCE((SELECT SUM(GREATEST(bakiye, 0)) FROM bakiyeler), 0)::NUMERIC(14,2) AS toplam_musteri_alacagi,
        COALESCE((SELECT SUM(tutar) FROM musteri_cari_hareketleri
          WHERE hareket_tipi = '${ACCOUNT_TRANSACTION_TYPES.PAYMENT}' AND islem_tarihi = CURRENT_DATE), 0)::NUMERIC(14,2) AS bugunku_tahsilat,
        COALESCE((SELECT SUM(tutar) FROM musteri_cari_hareketleri
          WHERE hareket_tipi = '${ACCOUNT_TRANSACTION_TYPES.PAYMENT}'
            AND DATE_TRUNC('month', islem_tarihi) = DATE_TRUNC('month', CURRENT_DATE)), 0)::NUMERIC(14,2) AS bu_ay_tahsilat,
        COALESCE((SELECT COUNT(*) FROM bakiyeler WHERE bakiye > 0), 0)::INTEGER AS borclu_musteri_sayisi
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Cari genel özet hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

router.get('/finans/alacaklar', async (req, res) => {
  try {
    const source = String(req.query.kaynak || 'tumu').toLowerCase();
    const sourceMap = { satis: 'MOTOR_SATISI', servis: 'SERVIS', aksesuar: 'AKSESUAR', hobi: 'HOBI_GRUP' };
    if (source !== 'tumu' && !sourceMap[source]) return res.status(400).json({ message: 'Geçersiz kaynak filtresi.' });
    const params = [];
    let sourceFilter = '';
    if (source !== 'tumu') {
      params.push(sourceMap[source]);
      sourceFilter = ` AND kaynak = $${params.length}`;
    }
    const result = await pool.query(`
      WITH ${receivablesCte}
      SELECT *,
        COALESCE(SUM(kalan) OVER (), 0)::NUMERIC(14,2) AS toplam_acik_bakiye,
        COUNT(*) OVER ()::INTEGER AS acik_islem_sayisi
      FROM alacaklar
      WHERE kalan > 0${sourceFilter}
      ORDER BY tarih ASC, musteri ASC
    `, params);
    res.json({
      data: result.rows,
      ozet: {
        toplam_acik_bakiye: result.rows[0]?.toplam_acik_bakiye || '0.00',
        acik_islem_sayisi: result.rows[0]?.acik_islem_sayisi || 0,
      },
    });
  } catch (error) {
    console.error('Açık bakiye listesi hatası:', error);
    res.status(500).json({ message: 'Açık bakiyeler yüklenemedi.' });
  }
});

router.post('/finans/tahsilat', async (req, res) => {
  const customerId = parsePositiveId(req.body.musteri_id);
  const referenceId = parsePositiveId(req.body.referans_id);
  const source = String(req.body.kaynak || '').toUpperCase();
  const requestedPayments = Array.isArray(req.body.odemeler)
    ? req.body.odemeler
    : [{ odeme_yontemi: req.body.odeme_yontemi, tutar: req.body.tutar }];
  const parsedPayments = requestedPayments.map((payment) => ({
    method: String(payment?.odeme_yontemi || '').toUpperCase(),
    amount: Number(payment?.tutar),
  }));
  const hasInvalidPayment = parsedPayments.some(
    (payment) => !Number.isFinite(payment.amount) || payment.amount < 0 || !['NAKIT', 'KART', 'HAVALE_EFT'].includes(payment.method)
  );
  const payments = parsedPayments.filter((payment) => payment.amount > 0);
  const amount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const sourceTables = { MOTOR_SATISI: 'motor_satislari', SERVIS: 'is_emirleri', AKSESUAR: 'aksesuarlar', HOBI_GRUP: 'bisiklet_satislar' };
  if (!customerId || !referenceId || !sourceTables[source] || payments.length < 1 || payments.length > 3
    || hasInvalidPayment || !Number.isFinite(amount) || amount <= 0
    || new Set(payments.map((payment) => payment.method)).size !== payments.length) {
    return res.status(400).json({ message: 'Müşteri, kaynak, pozitif tutar ve ödeme yöntemi gereklidir.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const locked = await client.query(`SELECT id FROM ${sourceTables[source]} WHERE id = $1 FOR UPDATE`, [referenceId]);
    if (!locked.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Tahsilat kaynağı bulunamadı.' });
    }
    const receivable = await client.query(`
      WITH ${receivablesCte}
      SELECT * FROM alacaklar
      WHERE musteri_id = $1 AND kaynak = $2 AND referans_id = $3 AND kalan > 0
    `, [customerId, source, String(referenceId)]);
    if (!receivable.rowCount) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'Bu işlemde tahsil edilecek açık bakiye bulunmuyor.' });
    }
    const row = receivable.rows[0];
    if (amount > Number(row.kalan) + 0.005) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: `Tahsilat kalan bakiyeyi aşamaz. Güncel kalan: ${row.kalan} TL` });
    }
    const inserted = [];
    for (const payment of payments) {
      const result = await client.query(`
        INSERT INTO musteri_cari_hareketleri
          (musteri_id, hareket_tipi, tutar, islem_tarihi, aciklama, odeme_yontemi, referans_tipi, referans_id, olusturan_kullanici_id)
        VALUES ($1, 'TAHSILAT', $2::NUMERIC, CURRENT_DATE, $3, $4, $5, $6, $7)
        RETURNING *
      `, [customerId, payment.amount.toFixed(2), `${row.aciklama} için tahsilat`, payment.method, source, String(referenceId), req.user.id]);
      inserted.push(result.rows[0]);
    }
    await client.query('COMMIT');
    await logAktivite(req.user.id, ISLEM_TIPLERI.CARI_HAREKET_EKLE,
      `${row.musteri} için ${amount.toFixed(2)} TL tahsilat kaydedildi.`,
      { musteriId: customerId, kaynak: source, referansId: referenceId, hareketIds: inserted.map((item) => item.id) }, getRequestInfo(req));
    res.status(201).json({ hareketler: inserted, kalan: Math.max(Number(row.kalan) - amount, 0).toFixed(2) });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Kaynak tahsilatı hatası:', error);
    res.status(500).json({ message: 'Tahsilat kaydedilemedi.' });
  } finally {
    client.release();
  }
});

router.patch('/bulk-status', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const ids = [...new Set((Array.isArray(req.body.ids) ? req.body.ids : []).map(parsePositiveId))];
  const { aktif } = req.body;
  if (!ids.length || ids.includes(null) || ids.length > 500 || typeof aktif !== 'boolean') {
    return res.status(400).json({ message: '1-500 geçerli müşteri ID’si ve aktif durumu gereklidir.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const locked = await client.query(
      'SELECT id FROM musteriler WHERE id = ANY($1::int[]) FOR UPDATE',
      [ids]
    );
    if (locked.rowCount !== ids.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Seçilen müşterilerden biri veya birkaçı bulunamadı.' });
    }

    const result = await client.query(`
      UPDATE musteriler
      SET aktif = $2,
          pasife_alinma_tarihi = CASE WHEN $2 THEN NULL ELSE CURRENT_TIMESTAMP END,
          pasife_alan_kullanici_id = CASE WHEN $2 THEN NULL ELSE $3::INTEGER END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($1::int[])
      RETURNING id, ad_soyad, aktif
    `, [ids, aktif, req.user.id]);
    await client.query(`
      INSERT INTO aktivite_log (kullanici_id, kullanici_adi, islem_tipi, islem_detay, hedef_tablo, ip_adresi, tarayici_bilgisi)
      VALUES ($1, $2, $3, $4, 'musteriler', $5, $6)
    `, [
      req.user.id,
      req.user.kullanici_adi || null,
      aktif ? ISLEM_TIPLERI.MUSTERI_AKTIF_ET : ISLEM_TIPLERI.MUSTERI_PASIFE_AL,
      `${ids.length} müşteri ${aktif ? 'yeniden aktif edildi' : 'pasife alındı'}.`,
      getRequestInfo(req).ip_adresi,
      getRequestInfo(req).tarayici_bilgisi,
    ]);
    await client.query('COMMIT');
    res.json({ message: `${result.rowCount} müşteri ${aktif ? 'yeniden aktif edildi' : 'pasife alındı'}.`, count: result.rowCount });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Toplu müşteri durum güncelleme hatası:', error);
    res.status(500).json({ message: 'Toplu işlem tamamlanamadı.' });
  } finally {
    client.release();
  }
});

router.get('/ara/:query', async (req, res) => {
  try {
    const query = String(req.params.query || '').trim();
    const result = await pool.query(`
      SELECT m.* FROM musteriler m
      WHERE m.aktif = TRUE AND (m.ad_soyad ILIKE $1 OR m.telefon ILIKE $1)
      ORDER BY m.ad_soyad
    `, [`%${query}%`]);
    res.json(result.rows);
  } catch (error) {
    console.error('Müşteri arama hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

router.get('/:id/detay', async (req, res) => {
  const id = parsePositiveId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Geçersiz müşteri ID’si.' });
  try {
    const customer = await pool.query(`
      SELECT m.*, cari.toplam_borc, cari.toplam_tahsilat,
        GREATEST(cari.toplam_borc - cari.toplam_tahsilat, 0)::NUMERIC(14,2) AS kalan_bakiye
      FROM musteriler m ${accountTotalsJoin} WHERE m.id = $1
    `, [id]);
    if (!customer.rowCount) return res.status(404).json({ message: 'Müşteri bulunamadı.' });

    const operations = await pool.query(`
      WITH hedef AS (
        SELECT id, REGEXP_REPLACE(COALESCE(telefon, ''), '[^0-9]', '', 'g') AS telefon
        FROM musteriler WHERE id = $1
      ), operasyonlar AS (
        SELECT 'SERVIS'::TEXT AS kaynak, ie.id, COALESCE(ie.tamamlama_tarihi, ie.created_at) AS tarih,
          CONCAT_WS(' ', NULLIF(ie.marka, ''), NULLIF(ie.model_tip, ''))::TEXT AS baslik,
          COALESCE(NULLIF(ie.gercek_toplam_ucret, 0), ie.tahmini_toplam_ucret, 0)::NUMERIC(14,2) AS tutar,
          CASE WHEN ie.odeme_bilgisi_girildi THEN COALESCE(ie.nakit_tutar, 0) + COALESCE(ie.kart_tutar, 0) + COALESCE(ie.havale_tutar, 0)
            WHEN LOWER(COALESCE(ie.durum, '')) = 'tamamlandi' THEN COALESCE(NULLIF(ie.gercek_toplam_ucret, 0), ie.tahmini_toplam_ucret, 0) ELSE 0 END::NUMERIC(14,2) AS odenen_tutar,
          CASE WHEN LOWER(COALESCE(ie.durum, '')) = 'tamamlandi' AND ie.odeme_bilgisi_girildi
            THEN GREATEST(COALESCE(NULLIF(ie.gercek_toplam_ucret, 0), ie.tahmini_toplam_ucret, 0) - COALESCE(ie.nakit_tutar, 0) - COALESCE(ie.kart_tutar, 0) - COALESCE(ie.havale_tutar, 0), 0) ELSE 0 END::NUMERIC(14,2) AS onerilen_borc,
          ie.durum::TEXT
        FROM is_emirleri ie, hedef h
        WHERE ie.musteri_id = h.id OR (h.telefon <> '' AND REGEXP_REPLACE(COALESCE(ie.telefon, ''), '[^0-9]', '', 'g') = h.telefon)
        UNION ALL
        SELECT 'MOTOR_SATISI', ms.id, COALESCE(ms.tarih::timestamp, ms.created_at),
          CONCAT_WS(' / ', NULLIF(mm.model_adi, ''), NULLIF(ms.sase_no, '')),
          COALESCE(ms.satis_fiyati, ms.fatura_fiyati, 0)::NUMERIC(14,2),
          CASE WHEN ms.odeme_bilgisi_girildi THEN COALESCE(ms.nakit_tutar, 0) + COALESCE(ms.kart_tutar, 0) + COALESCE(ms.havale_tutar, 0)
            WHEN LOWER(COALESCE(ms.durum, '')) = 'tamamlandi' THEN COALESCE(ms.satis_fiyati, ms.fatura_fiyati, 0) ELSE 0 END::NUMERIC(14,2),
          CASE WHEN LOWER(COALESCE(ms.durum, '')) = 'tamamlandi' AND ms.odeme_bilgisi_girildi
            THEN GREATEST(COALESCE(ms.satis_fiyati, ms.fatura_fiyati, 0) - COALESCE(ms.nakit_tutar, 0) - COALESCE(ms.kart_tutar, 0) - COALESCE(ms.havale_tutar, 0), 0) ELSE 0 END::NUMERIC(14,2),
          ms.durum
        FROM motor_satislari ms LEFT JOIN motor_modelleri mm ON mm.id = ms.motor_modeli_id, hedef h
        WHERE h.telefon <> '' AND REGEXP_REPLACE(COALESCE(ms.musteri_telefon, ''), '[^0-9]', '', 'g') = h.telefon
        UNION ALL
        SELECT 'AKSESUAR', a.id, COALESCE(a.satis_tarihi::timestamp, a.created_at),
          COALESCE(a.urun_adi, 'Aksesuar satışı'), COALESCE(a.toplam_satis, 0)::NUMERIC(14,2),
          COALESCE(a.odeme_tutari, 0)::NUMERIC(14,2),
          CASE WHEN LOWER(COALESCE(a.durum, '')) = 'tamamlandi'
            THEN GREATEST(COALESCE(a.toplam_satis, 0) - COALESCE(a.odeme_tutari, 0), 0) ELSE 0 END::NUMERIC(14,2), a.durum
        FROM aksesuarlar a, hedef h
        WHERE h.telefon <> '' AND REGEXP_REPLACE(COALESCE(a.telefon, ''), '[^0-9]', '', 'g') = h.telefon
        UNION ALL
        SELECT 'HOBI_GRUP', b.id, COALESCE(b.satis_tarihi::timestamp, b.created_at),
          'Hobi grup satışı', COALESCE(b.toplam_satis, 0)::NUMERIC(14,2),
          COALESCE(b.odeme_tutari, 0)::NUMERIC(14,2),
          CASE WHEN LOWER(COALESCE(b.durum, '')) = 'tamamlandi'
            THEN GREATEST(COALESCE(b.toplam_satis, 0) - COALESCE(b.odeme_tutari, 0), 0) ELSE 0 END::NUMERIC(14,2), b.durum
        FROM bisiklet_satislar b, hedef h
        WHERE h.telefon <> '' AND REGEXP_REPLACE(COALESCE(b.telefon, ''), '[^0-9]', '', 'g') = h.telefon
      )
      SELECT o.*,
        EXISTS (
          SELECT 1 FROM musteri_cari_hareketleri ch
          WHERE ch.musteri_id = $1 AND ch.referans_tipi = o.kaynak
            AND ch.referans_id = o.id::TEXT AND ch.hareket_tipi = 'BORC'
        ) AS cari_baglandi
      FROM operasyonlar o
      ORDER BY o.tarih DESC, o.id DESC LIMIT 200
    `, [id]);
    const account = await getAccount(id);
    res.json({ musteri: customer.rows[0], operasyonlar: operations.rows, cari: account });
  } catch (error) {
    console.error('Müşteri detay hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

router.get('/:id/cari', async (req, res) => {
  const id = parsePositiveId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Geçersiz müşteri ID’si.' });
  try {
    const customer = await pool.query('SELECT id FROM musteriler WHERE id = $1', [id]);
    if (!customer.rowCount) return res.status(404).json({ message: 'Müşteri bulunamadı.' });
    res.json(await getAccount(id));
  } catch (error) {
    console.error('Cari hesap hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

router.post('/:id/cari', async (req, res) => {
  const id = parsePositiveId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Geçersiz müşteri ID’si.' });
  const validation = validateTransactionInput(req.body, { isAdmin: req.user?.rol === 'admin' });
  if (validation.error) return res.status(validation.status || 400).json({ message: validation.error });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const customer = await client.query('SELECT id, ad_soyad FROM musteriler WHERE id = $1 FOR UPDATE', [id]);
    if (!customer.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Müşteri bulunamadı.' });
    }
    const value = validation.value;
    const inserted = await client.query(`
      INSERT INTO musteri_cari_hareketleri
        (musteri_id, hareket_tipi, tutar, islem_tarihi, aciklama, odeme_yontemi,
         referans_tipi, referans_id, olusturan_kullanici_id)
      VALUES ($1, $2, $3::NUMERIC, $4::DATE, $5, $6, $7, $8, $9)
      RETURNING *
    `, [id, value.hareket_tipi, value.tutar, value.islem_tarihi, value.aciklama,
      value.odeme_yontemi, value.referans_tipi, value.referans_id, req.user.id]);
    const account = await getAccount(id, client);
    await client.query('COMMIT');
    await logAktivite(req.user.id, ISLEM_TIPLERI.CARI_HAREKET_EKLE,
      `${customer.rows[0].ad_soyad} için ${value.hareket_tipi} hareketi eklendi.`,
      { musteriId: id, hareketId: inserted.rows[0].id }, getRequestInfo(req));
    res.status(201).json({ hareket: inserted.rows[0], cari: account });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Bu referansa ait finansal hareket daha önce oluşturulmuş.' });
    }
    console.error('Cari hareket ekleme hatası:', error);
    res.status(500).json({ message: 'Cari hareket kaydedilemedi.' });
  } finally {
    client.release();
  }
});

router.post('/:id/cari/:hareketId/ters-kayit', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = parsePositiveId(req.params.id);
  const hareketId = parsePositiveId(req.params.hareketId);
  if (!id || !hareketId) return res.status(400).json({ message: 'Geçersiz kayıt ID’si.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const original = await client.query(
      'SELECT * FROM musteri_cari_hareketleri WHERE id = $1 AND musteri_id = $2 FOR UPDATE',
      [hareketId, id]
    );
    if (!original.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Cari hareket bulunamadı.' });
    }
    const reversalType = getReversalType(original.rows[0].hareket_tipi);
    if (!reversalType) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'Ters kayıt yeniden ters çevrilemez.' });
    }
    const reversal = await client.query(`
      INSERT INTO musteri_cari_hareketleri
        (musteri_id, hareket_tipi, tutar, islem_tarihi, aciklama, referans_tipi,
         referans_id, ters_hareket_id, olusturan_kullanici_id)
      VALUES ($1, $2, $3, CURRENT_DATE, $4, 'TERS_KAYIT', $5, $6, $7)
      RETURNING id
    `, [id, reversalType, original.rows[0].tutar,
      String(req.body.aciklama || `#${hareketId} numaralı hareketin ters kaydı`).slice(0, 1000),
      String(hareketId), hareketId, req.user.id]);
    await client.query(`
      INSERT INTO aktivite_log (kullanici_id, kullanici_adi, islem_tipi, islem_detay, hedef_tablo, hedef_id)
      VALUES ($1, $2, $3, $4, 'musteri_cari_hareketleri', $5)
    `, [req.user.id, req.user.kullanici_adi || null, ISLEM_TIPLERI.CARI_HAREKET_TERS,
      `#${hareketId} numaralı cari hareket ters çevrildi.`, reversal.rows[0].id]);
    const account = await getAccount(id, client);
    await client.query('COMMIT');
    res.status(201).json({ message: 'Ters kayıt oluşturuldu.', cari: account });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') return res.status(409).json({ message: 'Bu hareket daha önce ters çevrilmiş.' });
    console.error('Ters kayıt hatası:', error);
    res.status(500).json({ message: 'Ters kayıt oluşturulamadı.' });
  } finally {
    client.release();
  }
});

router.get('/:id', async (req, res) => {
  const id = parsePositiveId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Geçersiz müşteri ID’si.' });
  try {
    const result = await pool.query(`
      SELECT m.*, cari.toplam_borc, cari.toplam_tahsilat,
        GREATEST(cari.toplam_borc - cari.toplam_tahsilat, 0)::NUMERIC(14,2) AS kalan_bakiye
      FROM musteriler m ${accountTotalsJoin} WHERE m.id = $1
    `, [id]);
    if (!result.rowCount) return res.status(404).json({ message: 'Müşteri bulunamadı.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Müşteri detay hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { ad_soyad, adres, telefon } = req.body;
    if (!String(ad_soyad || '').trim()) return res.status(400).json({ message: 'Müşteri adı gereklidir.' });
    const result = await pool.query(
      'INSERT INTO musteriler (ad_soyad, adres, telefon, aktif) VALUES ($1, $2, $3, TRUE) RETURNING *',
      [String(ad_soyad).trim(), adres || null, telefon || null]
    );
    await logAktivite(req.user?.id, ISLEM_TIPLERI.MUSTERI_OLUSTUR,
      `Yeni müşteri eklendi - ${result.rows[0].ad_soyad}`, { musteriId: result.rows[0].id }, getRequestInfo(req));
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Müşteri ekleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

router.put('/:id', async (req, res) => {
  const id = parsePositiveId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Geçersiz müşteri ID’si.' });
  try {
    const { ad_soyad, adres, telefon } = req.body;
    if (!String(ad_soyad || '').trim()) return res.status(400).json({ message: 'Müşteri adı gereklidir.' });
    const result = await pool.query(`
      UPDATE musteriler SET ad_soyad = $1, adres = $2, telefon = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 RETURNING *
    `, [String(ad_soyad).trim(), adres || null, telefon || null, id]);
    if (!result.rowCount) return res.status(404).json({ message: 'Müşteri bulunamadı.' });
    await logAktivite(req.user?.id, ISLEM_TIPLERI.MUSTERI_GUNCELLE,
      `Müşteri güncellendi - ${result.rows[0].ad_soyad}`, { musteriId: id }, getRequestInfo(req));
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Müşteri güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Backward-compatible endpoint: DELETE now archives the customer and never removes a row.
router.delete('/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = parsePositiveId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Geçersiz müşteri ID’si.' });
  try {
    const result = await pool.query(`
      UPDATE musteriler SET aktif = FALSE, pasife_alinma_tarihi = CURRENT_TIMESTAMP,
        pasife_alan_kullanici_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `, [id, req.user.id]);
    if (!result.rowCount) return res.status(404).json({ message: 'Müşteri bulunamadı.' });
    await logAktivite(req.user.id, ISLEM_TIPLERI.MUSTERI_PASIFE_AL,
      `Müşteri pasife alındı - ${result.rows[0].ad_soyad}`, { musteriId: id }, getRequestInfo(req));
    res.json({ message: 'Müşteri pasife alındı; ticari geçmişi korunuyor.' });
  } catch (error) {
    console.error('Müşteri pasife alma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
