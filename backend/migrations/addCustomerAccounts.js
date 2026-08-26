const pool = require('../config/db');

async function addCustomerAccountsSchema(db = pool) {
  const client = typeof db.connect === 'function' ? await db.connect() : db;
  await client.query('BEGIN');
  try {
    await client.query(`
      ALTER TABLE musteriler
        ADD COLUMN IF NOT EXISTS aktif BOOLEAN,
        ADD COLUMN IF NOT EXISTS pasife_alinma_tarihi TIMESTAMP,
        ADD COLUMN IF NOT EXISTS pasife_alan_kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE SET NULL
    `);
    await client.query('UPDATE musteriler SET aktif = TRUE WHERE aktif IS NULL');
    await client.query('ALTER TABLE musteriler ALTER COLUMN aktif SET DEFAULT TRUE');
    await client.query('ALTER TABLE musteriler ALTER COLUMN aktif SET NOT NULL');
    await client.query('CREATE INDEX IF NOT EXISTS idx_musteriler_aktif ON musteriler (aktif)');
    await client.query(`
      CREATE OR REPLACE FUNCTION musteriler_hard_delete_engelle()
      RETURNS TRIGGER AS $$
      BEGIN
        RAISE EXCEPTION 'Müşteri kayıtları fiziksel olarak silinemez; aktif durumu kullanılmalıdır.'
          USING ERRCODE = 'integrity_constraint_violation';
      END;
      $$ LANGUAGE plpgsql
    `);
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_musteriler_hard_delete_engelle') THEN
          CREATE TRIGGER trg_musteriler_hard_delete_engelle
          BEFORE DELETE ON musteriler
          FOR EACH ROW EXECUTE FUNCTION musteriler_hard_delete_engelle();
        END IF;
      END $$
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS musteri_cari_hareketleri (
        id BIGSERIAL PRIMARY KEY,
        musteri_id INTEGER NOT NULL REFERENCES musteriler(id),
        hareket_tipi VARCHAR(30) NOT NULL CHECK (hareket_tipi IN (
          'BORC', 'TAHSILAT', 'BORC_DUZELTME', 'ALACAK_DUZELTME', 'BORC_TERS', 'TAHSILAT_TERS'
        )),
        tutar NUMERIC(14, 2) NOT NULL CHECK (tutar > 0),
        islem_tarihi DATE NOT NULL,
        aciklama TEXT,
        odeme_yontemi VARCHAR(20) CHECK (
          odeme_yontemi IS NULL OR odeme_yontemi IN ('NAKIT', 'HAVALE_EFT', 'KART', 'DIGER')
        ),
        referans_tipi VARCHAR(50),
        referans_id VARCHAR(100),
        ters_hareket_id BIGINT REFERENCES musteri_cari_hareketleri(id),
        olusturan_kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE SET NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT cari_referans_butunlugu CHECK (
          (referans_tipi IS NULL AND referans_id IS NULL)
          OR (referans_tipi IS NOT NULL AND referans_id IS NOT NULL)
        )
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cari_musteri_tarih
      ON musteri_cari_hareketleri (musteri_id, islem_tarihi DESC, id DESC)`);
    // Aynı satış/servis için birden fazla kısmi tahsilata izin ver; otomatik borç tekil kalır.
    await client.query('DROP INDEX IF EXISTS uq_cari_kaynak_hareket');
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_cari_kaynak_borc
      ON musteri_cari_hareketleri (referans_tipi, referans_id, hareket_tipi)
      WHERE referans_tipi IS NOT NULL AND referans_id IS NOT NULL
        AND hareket_tipi = 'BORC' AND ters_hareket_id IS NULL`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_cari_tek_ters_kayit
      ON musteri_cari_hareketleri (ters_hareket_id) WHERE ters_hareket_id IS NOT NULL`);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    if (client !== db && typeof client.release === 'function') client.release();
  }
}

if (require.main === module) {
  addCustomerAccountsSchema()
    .then(() => pool.end())
    .catch(async (error) => {
      console.error('Migration hatası:', error);
      await pool.end().catch(() => {});
      process.exit(1);
    });
}

module.exports = addCustomerAccountsSchema;
