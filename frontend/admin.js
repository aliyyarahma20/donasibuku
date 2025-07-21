        fetch("http://13.54.84.123:3000/data-donasi")
          .then(res => res.json())
          .then(data => {
            const tbody = document.getElementById("dataDonasi");

            if (data.length === 0) {
              tbody.innerHTML = `
                <tr class="empty-state">
                  <td colspan="7">
                    <i class="fas fa-inbox"></i>
                    <div>Belum ada data donasi</div>
                  </td>
                </tr>
              `;
            } else {
              data.forEach((item, index) => {
                const row = document.createElement("tr");
                // Add animation delay for each row
                row.style.animationDelay = `${index * 0.1}s`;
                row.className = 'table-row-animate';

                row.innerHTML = `
                  <td>${item.nama}</td>
                  <td>${item.email}</td>
                  <td>${item.no_telepon}</td>
                  <td>${item.alamat}</td>
                  <td>${item.judul_buku}</td>
                  <td>
                    <span class="category-badge ${getCategoryClass(item.kategori)}">
                      ${item.kategori}
                    </span>
                  </td>
                  <td>
                    <a href="${item.foto_url}" target="_blank" class="view-link">
                      <i class="fas fa-external-link-alt"></i> Lihat
                    </a>
                  </td>
                `;
                tbody.appendChild(row);
              });

              // Update stats
              updateStats(data);
            }
          })
          .catch(err => {
            console.error("Gagal fetch data donasi:", err);
            document.getElementById("dataDonasi").innerHTML = `
              <tr class="error-state">
                <td colspan="7">
                  <i class="fas fa-exclamation-triangle"></i>
                  <div>Gagal mengambil data donasi</div>
                </td>
              </tr>
            `;
          });

        // Helper functions for styling
        function getCategoryClass(kategori) {
          const categoryMap = {
            'fiksi': 'category-fiksi',
            'non-fiksi': 'category-non-fiksi',
            'pendidikan': 'category-pendidikan',
            'teknologi': 'category-teknologi',
            'sejarah': 'category-pendidikan',
            'biografi': 'category-non-fiksi',
            'sains': 'category-teknologi'
          };
          return categoryMap[kategori.toLowerCase()] || 'category-fiksi';
        }

        function updateStats(data) {
          // Animate counter
          animateCounter('totalDonatur', data.length);
          animateCounter('totalBuku', data.length);

          const uniqueCategories = [...new Set(data.map(item => item.kategori.toLowerCase()))];
          animateCounter('totalKategori', uniqueCategories.length);
        }

        function animateCounter(elementId, targetValue) {
          const element = document.getElementById(elementId);
          let currentValue = 0;
          const increment = targetValue / 30;

          const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
              element.textContent = targetValue;
              clearInterval(timer);
            } else {
              element.textContent = Math.floor(currentValue);
            }
          }, 50);
        }

        // Misal ada div loading
const loadingDiv = document.getElementById("loadingDiv");
const tableContainer = document.getElementById("tableContainer");

// Show loading
if (loadingDiv) loadingDiv.style.display = "block";
if (tableContainer) tableContainer.style.display = "none";

fetch("http://13.54.84.123:3000/data-donasi")
  .then(res => res.json())
  .then(data => {
    // Hide loading, show table
    if (loadingDiv) loadingDiv.style.display = "none";
    if (tableContainer) tableContainer.style.display = "block";

    // rest of your code...
  })
