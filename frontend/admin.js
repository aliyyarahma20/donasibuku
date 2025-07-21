fetch("http://13.54.84.123:3000/data-donasi")
  .then(res => res.json())
  .then(data => {
    const tbody = document.getElementById("dataDonasi");

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7">Belum ada data donasi.</td></tr>`;
    } else {
      data.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.nama}</td>
          <td>${item.email}</td>
          <td>${item.no_telepon}</td>
          <td>${item.alamat}</td>
          <td>${item.judul_buku}</td>
          <td>${item.kategori}</td>
          <td><a href="${item.foto_url}" target="_blank">Lihat</a></td>
        `;
        tbody.appendChild(row);
      });
    }
  })
  .catch(err => {
    console.error("Gagal fetch data donasi:", err);
    document.getElementById("dataDonasi").innerHTML = `
      <tr><td colspan="7" style="color:red;">Gagal mengambil data donasi</td></tr>
    `;
  });
