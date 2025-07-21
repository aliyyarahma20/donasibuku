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

// Multer config (local folder sementara)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST endpoint: submit donasi buku
app.post('/lapor-donasi', upload.any(), async (req, res) => {
  try {
    const {
      nama,
      email,
      no_telepon,
      alamat,
      buku
    } = req.body;

    const bukuList = JSON.parse(buku); // array berisi {judul_buku, kategori}

    // 1. Simpan data donatur ke RDS
    db.query(
      'INSERT INTO donors (nama, email, no_telepon, alamat) VALUES (?, ?, ?, ?)',
      [nama, email, no_telepon, alamat],
      (err, result) => {
        if (err) return res.status(500).json({ error: 'Gagal simpan donor: ' + err.message });

        const donorId = result.insertId;

        // 2. Upload foto ke S3 dan simpan data buku
        const uploaded = [];

        for (let i = 0; i < bukuList.length; i++) {
          const file = req.files.find(f => f.fieldname === `foto_${i}`);
          const fileExt = path.extname(file.originalname);
          const fileKey = `books/${Date.now()}_${file.originalname}`;

          const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
          };

          s3.upload(params, (err, data) => {
            if (err) return res.status(500).json({ error: 'Upload S3 gagal: ' + err.message });

            // 3. Simpan buku ke RDS
            const { judul_buku, kategori } = bukuList[i];

            db.query(
              'INSERT INTO books (donor_id, judul_buku, kategori, foto_url) VALUES (?, ?, ?, ?)',
              [donorId, judul_buku, kategori, data.Location],
              (err2) => {
                if (err2) return res.status(500).json({ error: 'Gagal simpan buku: ' + err2.message });

                uploaded.push(judul_buku);

                // Kirim response kalau semua sudah masuk
                if (uploaded.length === bukuList.length) {
                  res.json({ message: 'Donasi berhasil disimpan!', buku: uploaded });
                }
              }
            );
          });
        }
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Kesalahan server: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});