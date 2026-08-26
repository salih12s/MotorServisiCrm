const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('../config/db');
const addCustomerAccountsSchema = require('../migrations/addCustomerAccounts');

test('soft delete preserves operations and ledger uses exact/idempotent balances', async () => {
  await addCustomerAccountsSchema(pool);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const customer = await client.query(`
      INSERT INTO musteriler (ad_soyad, telefon, aktif) VALUES ('TEST CARI', 'TEST-UNIQUE', TRUE) RETURNING id
    `);
    const customerId = customer.rows[0].id;
    await client.query('SAVEPOINT hard_delete_guard');
    await assert.rejects(
      client.query('DELETE FROM musteriler WHERE id = $1', [customerId]),
      (error) => error.code === '23000'
    );
    await client.query('ROLLBACK TO SAVEPOINT hard_delete_guard');

    await client.query(`
      INSERT INTO is_emirleri (musteri_id, gercek_toplam_ucret, toplam_maliyet, kar, durum)
      VALUES ($1, 300000.00, 250000.00, 50000.00, 'tamamlandi')
    `, [customerId]);
    await client.query(`
      INSERT INTO musteri_cari_hareketleri
        (musteri_id, hareket_tipi, tutar, islem_tarihi, referans_tipi, referans_id)
      VALUES ($1, 'BORC', 100000.10, CURRENT_DATE, 'TEST_SATIS', '1'),
             ($1, 'TAHSILAT', 30000.05, CURRENT_DATE, NULL, NULL),
             ($1, 'TAHSILAT', 20000.05, CURRENT_DATE, NULL, NULL)
    `, [customerId]);

    const before = await client.query('SELECT gercek_toplam_ucret, toplam_maliyet, kar FROM is_emirleri WHERE musteri_id = $1', [customerId]);
    await client.query('UPDATE musteriler SET aktif = FALSE, pasife_alinma_tarihi = CURRENT_TIMESTAMP WHERE id = $1', [customerId]);
    const archived = await client.query('SELECT aktif FROM musteriler WHERE id = $1', [customerId]);
    const after = await client.query('SELECT gercek_toplam_ucret, toplam_maliyet, kar FROM is_emirleri WHERE musteri_id = $1', [customerId]);
    assert.equal(archived.rows[0].aktif, false);
    assert.deepEqual(after.rows[0], before.rows[0]);

    const balance = await client.query(`
      SELECT SUM(CASE WHEN hareket_tipi = 'BORC' THEN tutar ELSE -tutar END)::NUMERIC(14,2) AS bakiye
      FROM musteri_cari_hareketleri WHERE musteri_id = $1
    `, [customerId]);
    assert.equal(balance.rows[0].bakiye, '50000.00');

    await client.query('SAVEPOINT duplicate_reference');
    await assert.rejects(
      client.query(`INSERT INTO musteri_cari_hareketleri
        (musteri_id, hareket_tipi, tutar, islem_tarihi, referans_tipi, referans_id)
        VALUES ($1, 'BORC', 1, CURRENT_DATE, 'TEST_SATIS', '1')`, [customerId]),
      (error) => error.code === '23505'
    );
    await client.query('ROLLBACK TO SAVEPOINT duplicate_reference');

    const receivable = await client.query(`
      SELECT SUM(CASE WHEN hareket_tipi = 'BORC' THEN tutar ELSE -tutar END)::NUMERIC(14,2) AS toplam
      FROM musteri_cari_hareketleri WHERE musteri_id = $1
    `, [customerId]);
    assert.equal(receivable.rows[0].toplam, '50000.00');
  } finally {
    await client.query('ROLLBACK').catch(() => {});
    client.release();
  }
});

test.after(async () => {
  await pool.end();
});
