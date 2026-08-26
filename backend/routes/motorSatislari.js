const express = require('express');
const pool = require('../config/db');
const { sourcePaymentJoin, sourcePaymentColumns } = require('../domain/sourcePaymentSummary');

const router = express.Router();

const parsePayment = (value) => {
  const amount = Number(value || 0);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
};

const validatePayments = (total, values) => {
  const parsed = values.map(parsePayment);
  if (parsed.includes(null)) return { error: 'Ödeme tutarları negatif veya geçersiz olamaz.' };
  const paid = parsed.reduce((sum, value) => sum + value, 0);
  if (paid > Number(total || 0) + 0.005) return { error: 'Girilen ödemeler satış tutarını aşamaz.' };
  return { values: parsed };
};

const ensureCustomer = async (name, phone, address) => {
  const normalized = String(phone || '').replace(/[^0-9]/g, '');
  if (!normalized) return;
  const existing = await pool.query("SELECT id FROM musteriler WHERE REGEXP_REPLACE(COALESCE(telefon, ''), '[^0-9]', '', 'g') = $1 ORDER BY id LIMIT 1", [normalized]);
  if (!existing.rowCount) await pool.query('INSERT INTO musteriler (ad_soyad, telefon, adres, aktif) VALUES ($1, $2, $3, TRUE)', [name || 'Motosiklet Müşterisi', phone, address || null]);
};

// ==================== MOTOR MODELLERİ ====================

// Tüm motor modellerini getir
router.get('/modeller', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM motor_modelleri ORDER BY model_adi ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Motor modelleri getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni motor modeli ekle
router.post('/modeller', async (req, res) => {
  try {
    const { model_adi, cc, otv_orani } = req.body;
    
    if (!model_adi) {
      return res.status(400).json({ message: 'Model adı gerekli' });
    }
    
    const result = await pool.query(
      `INSERT INTO motor_modelleri (model_adi, cc, otv_orani) 
       VALUES ($1, $2, $3) RETURNING *`,
      [model_adi, cc || null, otv_orani || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Motor modeli ekleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Motor modeli güncelle
router.put('/modeller/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { model_adi, cc, otv_orani } = req.body;
    
    const result = await pool.query(
      `UPDATE motor_modelleri 
       SET model_adi = $1, cc = $2, otv_orani = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [model_adi, cc, otv_orani, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Motor modeli bulunamadı' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Motor modeli güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Motor modeli sil
router.delete('/modeller/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM motor_modelleri WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Motor modeli bulunamadı' });
    }
    
    res.json({ message: 'Motor modeli silindi' });
  } catch (error) {
    console.error('Motor modeli silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// ==================== MOTOR SATIŞLARI ====================

// Tüm motor satışlarını getir
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ms.*, 
       TO_CHAR(ms.tarih, 'YYYY-MM-DD') as tarih,
       mm.model_adi, mm.cc, mm.otv_orani,
       k.ad_soyad as olusturan_ad_soyad, k.kullanici_adi as olusturan_kullanici_adi,
       ${sourcePaymentColumns('ms', 'COALESCE(ms.satis_fiyati, ms.fatura_fiyati, 0)')}
       FROM motor_satislari ms
       LEFT JOIN motor_modelleri mm ON ms.motor_modeli_id = mm.id
       LEFT JOIN kullanicilar k ON ms.olusturan_kullanici_id = k.id
       ${sourcePaymentJoin('MOTOR_SATISI', 'ms')}
       ORDER BY ms.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Motor satışları getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Tek motor satışı getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT ms.*, mm.model_adi, mm.cc, mm.otv_orani,
       k.ad_soyad as olusturan_ad_soyad, k.kullanici_adi as olusturan_kullanici_adi,
       ${sourcePaymentColumns('ms', 'COALESCE(ms.satis_fiyati, ms.fatura_fiyati, 0)')}
       FROM motor_satislari ms
       LEFT JOIN motor_modelleri mm ON ms.motor_modeli_id = mm.id
       LEFT JOIN kullanicilar k ON ms.olusturan_kullanici_id = k.id
       ${sourcePaymentJoin('MOTOR_SATISI', 'ms')}
       WHERE ms.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Motor satışı bulunamadı' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Motor satışı getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni motor satışı ekle
router.post('/', async (req, res) => {
  try {
    const { 
      tarih, 
      sase_no, 
      motor_modeli_id, 
      iskonto, 
      alis_fiyati, 
      satis_fiyati,
      fatura_fiyati,
      odeme_sekli,
      nakit_tutar,
      kart_tutar,
      havale_tutar,
      musteri_adi,
      musteri_telefon,
      tc_kimlik_no,
      adres,
      aciklama,
      durum,
      olusturan_kisi,
      // Hesaplanan değerler
      iskonto_tutari,
      iskontolu_alis_fiyati,
      matrah_satis,
      kdv_tutari,
      kdvsiz_tutar,
      otv_tutari,
      damga_vergisi,
      vergiler_toplami,
      kar
    } = req.body;
    const olusturan_kullanici_id = req.user?.id || null;
    
    if (!sase_no || !motor_modeli_id) {
      return res.status(400).json({ message: 'Şase no ve motor modeli gerekli' });
    }
    const payment = validatePayments(satis_fiyati, [nakit_tutar, kart_tutar, havale_tutar]);
    if (payment.error) return res.status(400).json({ message: payment.error });
    await ensureCustomer(musteri_adi, musteri_telefon, adres);
    
    const result = await pool.query(
      `INSERT INTO motor_satislari 
        (tarih, sase_no, motor_modeli_id, iskonto, alis_fiyati, satis_fiyati, fatura_fiyati,
         odeme_sekli, nakit_tutar, kart_tutar, havale_tutar, odeme_bilgisi_girildi, musteri_adi, musteri_telefon, tc_kimlik_no, adres, aciklama, durum,
         iskonto_tutari, iskontolu_alis_fiyati, matrah_satis, kdv_tutari, kdvsiz_tutar,
         otv_tutari, damga_vergisi, vergiler_toplami, kar, olusturan_kullanici_id, olusturan_kisi)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
       RETURNING *`,
      [
        tarih || new Date().toISOString().split('T')[0], 
        sase_no, 
        motor_modeli_id, 
        iskonto || 0, 
        alis_fiyati || 0, 
        satis_fiyati || 0,
        fatura_fiyati || 0,
        odeme_sekli || 'nakit',
        payment.values[0],
        payment.values[1],
        payment.values[2],
        musteri_adi || null,
        musteri_telefon || null,
        tc_kimlik_no || null,
        adres || null,
        aciklama || null,
        durum || 'beklemede',
        iskonto_tutari || 0,
        iskontolu_alis_fiyati || 0,
        matrah_satis || 0,
        kdv_tutari || 0,
        kdvsiz_tutar || 0,
        otv_tutari || 0,
        damga_vergisi || 791,
        vergiler_toplami || 0,
        kar || 0,
        olusturan_kullanici_id,
        olusturan_kisi || null
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Motor satışı ekleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Motor satışı güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      tarih, 
      sase_no, 
      motor_modeli_id, 
      iskonto, 
      alis_fiyati, 
      satis_fiyati,
      fatura_fiyati,
      odeme_sekli,
      nakit_tutar,
      kart_tutar,
      havale_tutar,
      musteri_adi,
      musteri_telefon,
      tc_kimlik_no,
      adres,
      aciklama,
      durum,
      // Hesaplanan değerler
      iskonto_tutari,
      iskontolu_alis_fiyati,
      matrah_satis,
      kdv_tutari,
      kdvsiz_tutar,
      otv_tutari,
      damga_vergisi,
      vergiler_toplami,
      kar
    } = req.body;
    const payment = validatePayments(satis_fiyati, [nakit_tutar, kart_tutar, havale_tutar]);
    if (payment.error) return res.status(400).json({ message: payment.error });
    await ensureCustomer(musteri_adi, musteri_telefon, adres);
    
    const result = await pool.query(
      `UPDATE motor_satislari 
       SET tarih = $1, sase_no = $2, motor_modeli_id = $3, iskonto = $4, 
           alis_fiyati = $5, satis_fiyati = $6, fatura_fiyati = $7, odeme_sekli = $8,
           nakit_tutar = $9, kart_tutar = $10, havale_tutar = $11, odeme_bilgisi_girildi = TRUE,
           musteri_adi = $12, musteri_telefon = $13, tc_kimlik_no = $14, adres = $15, aciklama = $16, durum = $17,
           iskonto_tutari = $18, iskontolu_alis_fiyati = $19, matrah_satis = $20,
           kdv_tutari = $21, kdvsiz_tutar = $22, otv_tutari = $23, damga_vergisi = $24,
           vergiler_toplami = $25, kar = $26, olusturan_kisi = COALESCE($27, olusturan_kisi),
           olusturan_kullanici_id = COALESCE(olusturan_kullanici_id, $28),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $29 RETURNING *`,
      [tarih, sase_no, motor_modeli_id, iskonto, alis_fiyati, satis_fiyati, fatura_fiyati, odeme_sekli, 
       payment.values[0], payment.values[1], payment.values[2],
       musteri_adi, musteri_telefon, tc_kimlik_no, adres, aciklama, durum || 'beklemede',
       iskonto_tutari || 0, iskontolu_alis_fiyati || 0, matrah_satis || 0,
       kdv_tutari || 0, kdvsiz_tutar || 0, otv_tutari || 0, damga_vergisi || 791,
       vergiler_toplami || 0, kar || 0, req.body.olusturan_kisi || null, req.user?.id || null, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Motor satışı bulunamadı' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Motor satışı güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

router.patch('/bulk/complete', async (req, res) => {
  if (req.user?.rol !== 'admin') return res.status(403).json({ message: 'Bu işlem için yönetici yetkisi gereklidir.' });
  const ids = [...new Set((Array.isArray(req.body.ids) ? req.body.ids : []).map(Number))];
  if (!ids.length || ids.length > 500 || ids.some((id) => !Number.isSafeInteger(id) || id <= 0)) {
    return res.status(400).json({ message: '1-500 geçerli motosiklet satışı seçilmelidir.' });
  }
  try {
    const result = await pool.query(`
      UPDATE motor_satislari
      SET durum = 'tamamlandi', updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($1::int[]) AND LOWER(COALESCE(durum, '')) NOT IN ('tamamlandi', 'iptal', 'iptal_edildi')
      RETURNING id
    `, [ids]);
    res.json({ message: `${result.rowCount} motosiklet satışı tamamlandı.`, count: result.rowCount, ids: result.rows.map((row) => row.id) });
  } catch (error) {
    console.error('Toplu motosiklet satışı tamamlama hatası:', error);
    res.status(500).json({ message: 'Motosiklet satışları tamamlanamadı.' });
  }
});

// Motor satışı sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM motor_satislari WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Motor satışı bulunamadı' });
    }
    
    res.json({ message: 'Motor satışı silindi' });
  } catch (error) {
    console.error('Motor satışı silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// İstatistikler
router.get('/stats/ozet', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await pool.query(`
      SELECT 
        COUNT(*) as toplam_satis,
        COALESCE(SUM(satis_fiyati), 0) as toplam_ciro,
        COALESCE(SUM(kar), 0) as toplam_kar,
        COUNT(CASE WHEN DATE(tarih) = $1 THEN 1 END) as bugunki_satis,
        COUNT(CASE WHEN durum = 'beklemede' THEN 1 END) as beklemede,
        COUNT(CASE WHEN durum = 'tamamlandi' THEN 1 END) as tamamlandi,
        COUNT(CASE WHEN durum = 'iptal' THEN 1 END) as iptal
      FROM motor_satislari
    `, [today]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Motor satış istatistik hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
