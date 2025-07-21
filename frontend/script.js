const jumlahBukuSelect = document.getElementById("jumlahBuku");
const daftarBukuDiv = document.getElementById("daftarBuku");
const form = document.getElementById("donasiForm");
const statusDiv = document.getElementById("status");

// Buat form dinamis berdasarkan jumlah buku
jumlahBukuSelect.addEventListener("change", () => {
  daftarBukuDiv.innerHTML = ""; // reset
  const jumlah = parseInt(jumlahBukuSelect.value);

  for (let i = 0; i < jumlah; i++) {
    const div = document.createElement("div");
    div.innerHTML = `
      <h4>Buku ${i + 1}</h4>
      <label>Judul:</label>
      <input type="text" name="judul_${i}" required />

      <label>Kategori:</label>
      <select name="kategori_${i}" required>
        <option value="">--Pilih--</option>
        <option value="Fiksi">Fiksi</option>
        <option value="Non-Fiksi">Non-Fiksi</option>
        <option value="Pendidikan">Pendidikan</option>
        <option value="Agama">Agama</option>
        <option value="Anak-anak">Anak-anak</option>
      </select>

      <label>Foto Buku:</label>
      <input type="file" name="foto_${i}" accept="image/*" required />
      <hr/>
    `;
    daftarBukuDiv.appendChild(div);
  }
});

// Handle form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData();

  const jumlah = parseInt(jumlahBukuSelect.value);
  formData.append("jumlah_buku", jumlah);

  const bukuList = [];

  for (let i = 0; i < jumlah; i++) {
    const judul = form[`judul_${i}`].value;
    const kategori = form[`kategori_${i}`].value;
    const file = form[`foto_${i}`].files[0];

    if (!judul || !kategori || !file) {
      statusDiv.innerHTML = `<p style="color:red;">❌ Semua data buku wajib diisi lengkap.</p>`;
      return;
    }

    bukuList.push({ judul_buku: judul, kategori });
    formData.append(`foto_${i}`, file);
  }

  formData.append("buku", JSON.stringify(bukuList));
  formData.append("nama", form["nama"].value);
  formData.append("telepon", form["telepon"].value);
  formData.append("alamat", form["alamat"].value);

  try {
    const response = await fetch("http://localhost:3000/lapor-donasi", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      statusDiv.innerHTML = `<p style="color:green;">✅ ${result.message}</p>`;
      form.reset();
      daftarBukuDiv.innerHTML = "";
    } else {
      statusDiv.innerHTML = `<p style="color:red;">❌ ${result.error}</p>`;
    }
  } catch (err) {
    console.error(err);
    statusDiv.innerHTML = `<p style="color:red;">❌ Gagal mengirim: ${err.message}</p>`;
  }
});
