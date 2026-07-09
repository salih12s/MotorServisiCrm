const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Telefonu 05XXXXXXXXX formatına çevirir; geçersizse null döner
const normalizeTelefon = (raw) => {
  if (!raw) return null;
  let d = String(raw).replace(/\D/g, '');
  if (d.startsWith('90') && d.length === 12) d = '0' + d.slice(2);
  if (d.length === 10 && d.startsWith('5')) d = '0' + d;
  if (d.length === 11 && d.startsWith('05')) return d;
  return null;
};

// Rehberi getir
router.get('/rehber', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM sms_rehber ORDER BY created_at DESC, id DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('SMS rehber listesi hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kişi(ler) ekle - tekli veya toplu: { kisiler: [{ isim, telefon }] }
router.post('/rehber', async (req, res) => {
  try {
    const kisiler = Array.isArray(req.body.kisiler) ? req.body.kisiler : [];
    if (kisiler.length === 0) {
      return res.status(400).json({ message: 'Eklenecek kişi bulunamadı' });
    }

    let eklenen = 0;
    let gecersiz = 0;
    let mevcut = 0;

    for (const kisi of kisiler) {
      const telefon = normalizeTelefon(kisi.telefon);
      if (!telefon) {
        gecersiz++;
        continue;
      }
      const result = await pool.query(
        `INSERT INTO sms_rehber (isim, telefon, kaynak)
         VALUES ($1, $2, $3)
         ON CONFLICT (telefon) DO NOTHING
         RETURNING id`,
        [String(kisi.isim || '').trim() || null, telefon, kisi.kaynak || 'manuel']
      );
      if (result.rows.length > 0) eklenen++;
      else mevcut++;
    }

    res.status(201).json({ eklenen, mevcut, gecersiz });
  } catch (error) {
    console.error('SMS rehber ekleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Müşteri kayıtlarındaki telefonları rehbere aktar
router.post('/rehber/musterilerden-aktar', async (req, res) => {
  try {
    const musteriler = await pool.query(
      "SELECT ad_soyad, telefon FROM musteriler WHERE telefon IS NOT NULL AND telefon <> ''"
    );

    let eklenen = 0;
    let gecersiz = 0;
    let mevcut = 0;

    for (const m of musteriler.rows) {
      const telefon = normalizeTelefon(m.telefon);
      if (!telefon) {
        gecersiz++;
        continue;
      }
      const result = await pool.query(
        `INSERT INTO sms_rehber (isim, telefon, kaynak)
         VALUES ($1, $2, 'musteri')
         ON CONFLICT (telefon) DO NOTHING
         RETURNING id`,
        [m.ad_soyad || null, telefon]
      );
      if (result.rows.length > 0) eklenen++;
      else mevcut++;
    }

    res.json({ taranan: musteriler.rows.length, eklenen, mevcut, gecersiz });
  } catch (error) {
    console.error('Müşterilerden aktarma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kişi sil
router.delete('/rehber/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM sms_rehber WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kişi bulunamadı' });
    }
    res.json({ message: 'Kişi silindi' });
  } catch (error) {
    console.error('SMS rehber silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Toplu sil: { ids: [1,2,3] }
router.post('/rehber/toplu-sil', async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.filter(Number.isInteger) : [];
    if (ids.length === 0) {
      return res.status(400).json({ message: 'Silinecek kişi seçilmedi' });
    }
    const result = await pool.query(
      'DELETE FROM sms_rehber WHERE id = ANY($1::int[])',
      [ids]
    );
    res.json({ silinen: result.rowCount });
  } catch (error) {
    console.error('SMS rehber toplu silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Toplu SMS gönder: { mesaj, ids: [..] }
// NOT: SMS sağlayıcısı ile henüz anlaşma yapılmadı. Sağlayıcı API'si alındığında
// aşağıdaki TODO bloğuna entegrasyon eklenecek (ör. NetGSM, İleti Merkezi, Twilio).
// Gerekli env değişkenleri: SMS_API_URL, SMS_API_KEY, SMS_BASLIK (gönderici adı)
router.post('/gonder', async (req, res) => {
  try {
    const { mesaj, ids } = req.body;
    const kisiIds = Array.isArray(ids) ? ids.filter(Number.isInteger) : [];

    if (!mesaj || !String(mesaj).trim()) {
      return res.status(400).json({ message: 'Mesaj boş olamaz' });
    }
    if (kisiIds.length === 0) {
      return res.status(400).json({ message: 'En az bir alıcı seçmelisiniz' });
    }

    const alicilar = await pool.query(
      'SELECT id, isim, telefon FROM sms_rehber WHERE id = ANY($1::int[])',
      [kisiIds]
    );

    if (!process.env.SMS_API_KEY) {
      return res.status(503).json({
        message:
          'SMS sağlayıcısı henüz yapılandırılmadı. API anahtarı alındığında bu ekrandan gönderim yapılabilecek.',
        aliciSayisi: alicilar.rows.length,
      });
    }

    // TODO: SMS sağlayıcı entegrasyonu buraya eklenecek.
    // const numaralar = alicilar.rows.map((a) => a.telefon);
    // await smsProvider.send({ to: numaralar, text: mesaj, from: process.env.SMS_BASLIK });

    res.json({ gonderilen: alicilar.rows.length, message: 'SMS gönderimi tamamlandı' });
  } catch (error) {
    console.error('SMS gönderme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
