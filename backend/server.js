const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const db = require('./db');
const s3 = require('./s3');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Multer config (pakai memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST endpoint: submit donasi buku
app.post('/lapor-donasi', upload.any(), async (req, res) => {
  try {
    const { nama, email, no_telepon, alamat, buku } = req.body;
    const bukuList = JSON.parse(buku); // array berisi {judul_buku, kategori}

    // 1. Simpan data donatur ke RDS
    const donorId = await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO donors (nama, email, no_telepon, alamat) VALUES (?, ?, ?, ?)',
        [nama, email, no_telepon, alamat],
        (err, result) => {
          if (err) reject(err);
          else resolve(result.insertId);
        }
      );
    });

    // 2. Upload foto dan simpan data buku satu per satu
    const uploaded = [];

    for (let i = 0; i < bukuList.length; i++) {
      const file = req.files.find(f => f.fieldname === `foto_${i}`);
      if (!file) throw new Error(`File foto_${i} tidak ditemukan`);

      const fileKey = `books/${Date.now()}_${file.originalname}`;
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      // Upload ke S3
      const s3data = await new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      const { judul_buku, kategori } = bukuList[i];

      // Simpan buku ke RDS
      await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO books (donor_id, judul_buku, kategori, foto_url) VALUES (?, ?, ?, ?)',
          [donorId, judul_buku, kategori, s3data.Location],
          (err) => {
            if (err) reject(err);
            else {
              uploaded.push(judul_buku);
              resolve();
            }
          }
        );
      });
    }

    // 3. Berhasil semua
    res.json({ message: 'Donasi berhasil disimpan!', buku: uploaded });

  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ error: 'Kesalahan server: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});