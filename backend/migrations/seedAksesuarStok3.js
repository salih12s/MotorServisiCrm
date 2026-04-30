const pool = require('../config/db');

const seedKnmasterStokData = async () => {
  const stoklar = [
    // ===== KNMASTER ÜRÜNLER =====
    { stok_kodu: '8690000005338', stok_adi: 'KNMASTER 1000CH BARDAK TUTUCU', giren_miktar: 5, cikan_miktar: 0, alis_fiyati: 408.33, satis_fiyati: 975.00 },
    { stok_kodu: '8690000005345', stok_adi: 'KNMASTER KN2250 PRO İNTERCOM', giren_miktar: 6, cikan_miktar: 0, alis_fiyati: 1458.33, satis_fiyati: 2915.00 },
    { stok_kodu: '8690000005352', stok_adi: 'KNMASTER KN6100 PRO İNTERCOM', giren_miktar: 4, cikan_miktar: 0, alis_fiyati: 3208.33, satis_fiyati: 5350.00 },
    { stok_kodu: '8690000005369', stok_adi: 'KNMASTER KNTAG1 AKILLI TAKİP CİHAZI', giren_miktar: 25, cikan_miktar: 1, alis_fiyati: 225.00, satis_fiyati: 1250.00 },
    { stok_kodu: '8690000005376', stok_adi: 'KNMASTER KNTAG1 4LÜ AKILLI TAKİP', giren_miktar: 20, cikan_miktar: 0, alis_fiyati: 800.00, satis_fiyati: 1850.00 },
    { stok_kodu: '8690000005383', stok_adi: 'KNMASTER KNTAG1C İNCE AKILLI TAKİP', giren_miktar: 15, cikan_miktar: 0, alis_fiyati: 450.00, satis_fiyati: 1080.00 },
    { stok_kodu: '8690000005390', stok_adi: 'KNMASTER TT-500 TİTREŞİM ÖNLEYİCİ TEL', giren_miktar: 10, cikan_miktar: 0, alis_fiyati: 583.33, satis_fiyati: 1385.00 },
    { stok_kodu: '8690000005406', stok_adi: 'KNMASTER TT-950 KAPALI TEL TUTUCU', giren_miktar: 15, cikan_miktar: 0, alis_fiyati: 600.00, satis_fiyati: 1440.00 },
    { stok_kodu: '8690000005413', stok_adi: 'KNMASTER MC120 UZATMA APARATI', giren_miktar: 1, cikan_miktar: 0, alis_fiyati: 437.44, satis_fiyati: 1150.00 },
    { stok_kodu: '8690000005420', stok_adi: 'KNMASTER TT890L TİTREŞİM ÖNLEYİCİ TEL', giren_miktar: 5, cikan_miktar: 0, alis_fiyati: 816.66, satis_fiyati: 1950.00 },
    { stok_kodu: '8690000005437', stok_adi: 'KNMASTER TT950WUC KABLOSUZ ŞARJLI', giren_miktar: 1, cikan_miktar: 0, alis_fiyati: 1000.00, satis_fiyati: 2400.00 },
  ];

  const client = await pool.connect();
  let count = 0;

  try {
    await client.query('BEGIN');

    for (const stok of stoklar) {
      const mevcut = stok.giren_miktar - stok.cikan_miktar;
      const envanter_degeri = mevcut * stok.satis_fiyati;

      await client.query(
        `INSERT INTO aksesuar_stok (stok_kodu, stok_adi, giren_miktar, cikan_miktar, mevcut, birimi, alis_fiyati, satis_fiyati, envanter_degeri)
         VALUES ($1, $2, $3, $4, $5, 'Adet', $6, $7, $8)
         ON CONFLICT (stok_kodu) DO UPDATE SET
           stok_adi = EXCLUDED.stok_adi,
           giren_miktar = EXCLUDED.giren_miktar,
           cikan_miktar = EXCLUDED.cikan_miktar,
           mevcut = EXCLUDED.mevcut,
           alis_fiyati = EXCLUDED.alis_fiyati,
           satis_fiyati = EXCLUDED.satis_fiyati,
           envanter_degeri = EXCLUDED.envanter_degeri,
           updated_at = CURRENT_TIMESTAMP`,
        [stok.stok_kodu, stok.stok_adi, stok.giren_miktar, stok.cikan_miktar, mevcut, stok.alis_fiyati, stok.satis_fiyati, envanter_degeri]
      );
      count++;
    }

    await client.query('COMMIT');
    console.log(`✅ ${count} KNMASTER stok kaydı başarıyla eklendi!`);

    // Toplam göster
    const result = await pool.query('SELECT COUNT(*) as count, SUM(envanter_degeri::numeric) as toplam FROM aksesuar_stok');
    console.log(`📊 Toplam ürün: ${result.rows[0].count} | Toplam envanter: ${parseFloat(result.rows[0].toplam).toLocaleString('tr-TR')} TL`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Stok veri ekleme hatası:', error);
  } finally {
    client.release();
    process.exit(0);
  }
};

seedKnmasterStokData();
