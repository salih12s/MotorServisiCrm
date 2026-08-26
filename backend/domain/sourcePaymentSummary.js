const sourcePaymentJoin = (sourceType, sourceAlias) => `
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(SUM(signed_amount) FILTER (WHERE method = 'NAKIT'), 0)::NUMERIC(14,2) AS nakit_tutar,
      COALESCE(SUM(signed_amount) FILTER (WHERE method = 'KART'), 0)::NUMERIC(14,2) AS kart_tutar,
      COALESCE(SUM(signed_amount) FILTER (WHERE method = 'HAVALE_EFT'), 0)::NUMERIC(14,2) AS havale_tutar,
      COALESCE(SUM(signed_amount), 0)::NUMERIC(14,2) AS toplam
    FROM (
      SELECT
        CASE WHEN h.hareket_tipi = 'TAHSILAT' THEN h.tutar ELSE -h.tutar END AS signed_amount,
        COALESCE(orijinal.odeme_yontemi, h.odeme_yontemi) AS method
      FROM musteri_cari_hareketleri h
      LEFT JOIN musteri_cari_hareketleri orijinal ON orijinal.id = h.ters_hareket_id
      WHERE h.hareket_tipi IN ('TAHSILAT', 'TAHSILAT_TERS')
        AND COALESCE(orijinal.referans_tipi, h.referans_tipi) = '${sourceType}'
        AND COALESCE(orijinal.referans_id, h.referans_id) = ${sourceAlias}.id::TEXT
    ) hareketler
  ) cari_odeme ON TRUE
`;

const sourcePaymentColumns = (sourceAlias, totalExpression, otherInitialExpression = '0') => `
  ${sourceAlias}.nakit_tutar AS ilk_nakit_tutar,
  ${sourceAlias}.kart_tutar AS ilk_kart_tutar,
  ${sourceAlias}.havale_tutar AS ilk_havale_tutar,
  (${otherInitialExpression})::NUMERIC(14,2) AS ilk_diger_tutar,
  COALESCE(cari_odeme.nakit_tutar, 0)::NUMERIC(14,2) AS cari_nakit_tutar,
  COALESCE(cari_odeme.kart_tutar, 0)::NUMERIC(14,2) AS cari_kart_tutar,
  COALESCE(cari_odeme.havale_tutar, 0)::NUMERIC(14,2) AS cari_havale_tutar,
  (COALESCE(${sourceAlias}.nakit_tutar, 0) + COALESCE(cari_odeme.nakit_tutar, 0))::NUMERIC(14,2) AS nakit_tutar,
  (COALESCE(${sourceAlias}.kart_tutar, 0) + COALESCE(cari_odeme.kart_tutar, 0))::NUMERIC(14,2) AS kart_tutar,
  (COALESCE(${sourceAlias}.havale_tutar, 0) + COALESCE(cari_odeme.havale_tutar, 0))::NUMERIC(14,2) AS havale_tutar,
  COALESCE(cari_odeme.toplam, 0)::NUMERIC(14,2) AS sonradan_tahsilat,
  LEAST((${totalExpression}), COALESCE(${sourceAlias}.nakit_tutar, 0) + COALESCE(${sourceAlias}.kart_tutar, 0) + COALESCE(${sourceAlias}.havale_tutar, 0) + (${otherInitialExpression}) + COALESCE(cari_odeme.toplam, 0))::NUMERIC(14,2) AS toplam_odenen,
  CASE
    WHEN LOWER(COALESCE(${sourceAlias}.durum, '')) IN ('tamamlandi', 'iptal', 'iptal_edildi') THEN 0
    ELSE GREATEST((${totalExpression}) - COALESCE(${sourceAlias}.nakit_tutar, 0) - COALESCE(${sourceAlias}.kart_tutar, 0) - COALESCE(${sourceAlias}.havale_tutar, 0) - (${otherInitialExpression}) - COALESCE(cari_odeme.toplam, 0), 0)
  END::NUMERIC(14,2) AS kalan_bakiye
`;

module.exports = { sourcePaymentJoin, sourcePaymentColumns };
