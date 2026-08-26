const pool = require('../config/db');

const operationSources = [
  {
    table: 'is_emirleri',
    nameColumn: 'musteri_ad_soyad',
    phoneColumn: 'telefon',
    addressColumn: 'adres',
    fallbackName: 'Servis Müşterisi',
  },
  {
    table: 'aksesuarlar',
    nameColumn: 'ad_soyad',
    phoneColumn: 'telefon',
    addressColumn: null,
    fallbackName: 'Aksesuar Müşterisi',
  },
  {
    table: 'bisiklet_satislar',
    nameColumn: 'ad_soyad',
    phoneColumn: 'telefon',
    addressColumn: null,
    fallbackName: 'Hobi Grup Müşterisi',
  },
  {
    table: 'motor_satislari',
    nameColumn: 'musteri_adi',
    phoneColumn: 'musteri_telefon',
    addressColumn: 'adres',
    fallbackName: 'Motosiklet Müşterisi',
  },
];

const normalizedPhone = (value) =>
  `REGEXP_REPLACE(COALESCE(${value}, ''), '[^0-9]', '', 'g')`;

async function linkSourceCustomers(client, source) {
  const { table, nameColumn, phoneColumn, addressColumn, fallbackName } = source;
  const sourcePhone = normalizedPhone(`s.${phoneColumn}`);
  const customerPhone = normalizedPhone('m.telefon');
  const addressSelect = addressColumn ? `s.${addressColumn}` : 'NULL::TEXT';

  await client.query(`
    INSERT INTO musteriler (ad_soyad, telefon, adres, aktif)
    SELECT kaynak.ad_soyad, kaynak.telefon, kaynak.adres, TRUE
    FROM (
      SELECT DISTINCT ON (${sourcePhone})
        COALESCE(NULLIF(TRIM(s.${nameColumn}), ''), $1) AS ad_soyad,
        s.${phoneColumn} AS telefon,
        ${addressSelect} AS adres,
        ${sourcePhone} AS telefon_anahtari
      FROM ${table} s
      WHERE ${sourcePhone} <> ''
      ORDER BY ${sourcePhone}, s.id
    ) kaynak
    WHERE NOT EXISTS (
      SELECT 1 FROM musteriler m
      WHERE ${customerPhone} = kaynak.telefon_anahtari
    )
  `, [fallbackName]);

  await client.query(`
    INSERT INTO musteriler (ad_soyad, telefon, adres, aktif)
    SELECT kaynak.ad_soyad, NULL, kaynak.adres, TRUE
    FROM (
      SELECT DISTINCT ON (LOWER(TRIM(s.${nameColumn})))
        TRIM(s.${nameColumn}) AS ad_soyad,
        ${addressSelect} AS adres
      FROM ${table} s
      WHERE ${sourcePhone} = ''
        AND NULLIF(TRIM(s.${nameColumn}), '') IS NOT NULL
        AND TRIM(s.${nameColumn}) <> '-'
      ORDER BY LOWER(TRIM(s.${nameColumn})), s.id
    ) kaynak
    WHERE NOT EXISTS (
      SELECT 1 FROM musteriler m
      WHERE LOWER(TRIM(COALESCE(m.ad_soyad, ''))) = LOWER(kaynak.ad_soyad)
    )
  `);

  await client.query(`
    UPDATE ${table} s
    SET musteri_id = (
      SELECT m.id
      FROM musteriler m
      WHERE ${customerPhone} = ${sourcePhone}
      ORDER BY m.id
      LIMIT 1
    )
    WHERE s.musteri_id IS NULL
      AND ${sourcePhone} <> ''
  `);

  await client.query(`
    UPDATE ${table} s
    SET musteri_id = (
      SELECT m.id
      FROM musteriler m
      WHERE LOWER(TRIM(COALESCE(m.ad_soyad, ''))) = LOWER(TRIM(s.${nameColumn}))
      ORDER BY m.id
      LIMIT 1
    )
    WHERE s.musteri_id IS NULL
      AND NULLIF(TRIM(s.${nameColumn}), '') IS NOT NULL
      AND TRIM(s.${nameColumn}) <> '-'
  `);

  // Adı ve telefonu da boş olan bekleyen işlem yine de caride görünmelidir.
  const unmatched = await client.query(`
    SELECT s.id
    FROM ${table} s
    WHERE s.musteri_id IS NULL
      AND LOWER(COALESCE(s.durum, '')) = 'beklemede'
    ORDER BY s.id
  `);
  for (const row of unmatched.rows) {
    const customer = await client.query(
      'INSERT INTO musteriler (ad_soyad, aktif) VALUES ($1, TRUE) RETURNING id',
      [`${fallbackName} #${row.id}`]
    );
    await client.query(
      `UPDATE ${table} SET musteri_id = $1 WHERE id = $2 AND musteri_id IS NULL`,
      [customer.rows[0].id, row.id]
    );
  }
}

async function linkOperationCustomers(db = pool) {
  const client = typeof db.connect === 'function' ? await db.connect() : db;
  await client.query('BEGIN');
  try {
    for (const source of operationSources) {
      await client.query(`
        ALTER TABLE ${source.table}
        ADD COLUMN IF NOT EXISTS musteri_id INTEGER REFERENCES musteriler(id) ON DELETE SET NULL
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_${source.table}_musteri_id
        ON ${source.table} (musteri_id)
      `);
      await linkSourceCustomers(client, source);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    if (client !== db && typeof client.release === 'function') client.release();
  }
}

if (require.main === module) {
  linkOperationCustomers()
    .then(() => pool.end())
    .catch(async (error) => {
      console.error('Operasyon müşteri bağlantısı migration hatası:', error);
      await pool.end().catch(() => {});
      process.exit(1);
    });
}

module.exports = linkOperationCustomers;
