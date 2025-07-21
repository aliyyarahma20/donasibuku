const jumlahBukuSelect = document.getElementById("jumlahBuku");
        const daftarBukuDiv = document.getElementById("daftarBuku");
        const form = document.getElementById("donasiForm");
        const statusDiv = document.getElementById("status");
        const submitBtn = document.querySelector(".submit-btn");
        const btnText = document.querySelector(".btn-text");
        const loading = document.querySelector(".loading");

        // Kategori buku yang tersedia
        const kategoriBuku = [
            "Fiksi",
            "Non-Fiksi",
            "Pendidikan",
            "Agama",
            "Anak-anak",
            "Sejarah",
            "Biografi",
            "Teknologi",
            "Kesehatan",
            "Bisnis"
        ];

        // Generate form dinamis berdasarkan jumlah buku
        jumlahBukuSelect.addEventListener("change", function() {
            const jumlah = parseInt(this.value);
            daftarBukuDiv.innerHTML = "";

            if (jumlah > 0) {
                // Buat section untuk detail buku
                const section = document.createElement("div");
                section.className = "section";
                section.innerHTML = `
                    <h3 class="section-title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                        Detail Buku (${jumlah} buku)
                    </h3>
                `;

                // Generate form untuk setiap buku
                for (let i = 0; i < jumlah; i++) {
                    const bookItem = document.createElement("div");
                    bookItem.className = "book-item fade-in";
                    bookItem.style.animationDelay = `${i * 0.1}s`;

                    bookItem.innerHTML = `
                        <div class="book-number">Buku ${i + 1}</div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="judul_${i}">Judul Buku</label>
                                <input type="text" id="judul_${i}" name="judul_${i}" required
                                       placeholder="Masukkan judul buku">
                            </div>
                            <div class="form-group">
                                <label for="kategori_${i}">Kategori</label>
                                <select id="kategori_${i}" name="kategori_${i}" required>
                                    <option value="">-- Pilih Kategori --</option>
                                    ${kategoriBuku.map(kategori => `<option value="${kategori}">${kategori}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="foto_${i}">Foto Buku</label>
                            <div class="file-upload">
                                <input type="file" id="foto_${i}" name="foto_${i}" class="file-input"
                                       accept="image/*" required>
                                <label for="foto_${i}" class="file-label">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                        <circle cx="12" cy="13" r="4"></circle>
                                    </svg>
                                    <span class="file-text">Klik untuk pilih foto</span>
                                </label>
                            </div>
                        </div>
                    `;

                    section.appendChild(bookItem);

                    // Add file upload functionality
                    const fileInput = bookItem.querySelector(`#foto_${i}`);
                    const fileLabel = bookItem.querySelector('.file-label');
                    const fileText = bookItem.querySelector('.file-text');

                    fileInput.addEventListener('change', function() {
                        if (this.files.length > 0) {
                            fileLabel.classList.add('file-selected');
                            fileText.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 5px;">
                                <polyline points="20,6 9,17 4,12"></polyline>
                            </svg> ${this.files[0].name}`;
                        } else {
                            fileLabel.classList.remove('file-selected');
                            fileText.textContent = 'Klik untuk pilih foto';
                        }
                    });
                }

                daftarBukuDiv.appendChild(section);
            }
        });

        // Handle form submission
        form.addEventListener("submit", async function(e) {
            e.preventDefault();

            // Show loading state
            submitBtn.disabled = true;
            btnText.style.opacity = "0";
            loading.style.display = "block";

            try {
                const formData = new FormData();
                const jumlah = parseInt(jumlahBukuSelect.value);

                if (!jumlah) {
                    throw new Error("Pilih jumlah buku terlebih dahulu");
                }

                // Data pribadi
                formData.append("nama", document.getElementById("nama").value);
                formData.append("email", document.getElementById("email").value);
                formData.append("no_telepon", document.getElementById("no_telepon").value);
                formData.append("alamat", document.getElementById("alamat").value);
                formData.append("jumlah_buku", jumlah);

                const bukuList = [];

                // Validasi dan kumpulkan data buku
                for (let i = 0; i < jumlah; i++) {
                    const judul = document.getElementById(`judul_${i}`).value.trim();
                    const kategori = document.getElementById(`kategori_${i}`).value;
                    const fileInput = document.getElementById(`foto_${i}`);
                    const file = fileInput.files[0];

                    if (!judul || !kategori || !file) {
                        throw new Error(`Data buku ${i + 1} belum lengkap. Pastikan semua field terisi.`);
                    }

                    // Validasi ukuran file (maksimal 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        throw new Error(`Ukuran foto buku ${i + 1} terlalu besar. Maksimal 5MB.`);
                    }

                    // Validasi tipe file
                    if (!file.type.startsWith('image/')) {
                        throw new Error(`File buku ${i + 1} harus berupa gambar.`);
                    }

                    bukuList.push({
                        judul_buku: judul,
                        kategori: kategori
                    });
                    formData.append(`foto_${i}`, file);
                }

                formData.append("buku", JSON.stringify(bukuList));

                // Kirim data ke server
                const response = await fetch("http://13.54.84.123:3000/lapor-donasi", {
                    method: "POST",
                    body: formData,
                });

                const result = await response.json();

                if (response.ok) {
                    showStatus("success", `${result.message || 'Donasi berhasil dikirim! Terima kasih atas kontribusi Anda.'}`);
                    form.reset();
                    daftarBukuDiv.innerHTML = "";
                    jumlahBukuSelect.value = "";
                } else {
                    throw new Error(result.error || 'Terjadi kesalahan saat mengirim donasi');
                }

            } catch (error) {
                console.error('Error:', error);
                showStatus("error", `${error.message}`);
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                btnText.style.opacity = "1";
                loading.style.display = "none";
            }
        });

        function showStatus(type, message) {
            statusDiv.className = `status ${type}`;
            statusDiv.textContent = message;
            statusDiv.style.display = "block";

            // Auto hide after 5 seconds
            setTimeout(() => {
                statusDiv.style.display = "none";
            }, 5000);

            // Scroll to status
            statusDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Add input validation
        document.getElementById("no_telepon").addEventListener("input", function() {
            // Remove non-digits
            this.value = this.value.replace(/\D/g, '');

            // Limit to reasonable phone number length
            if (this.value.length > 15) {
                this.value = this.value.slice(0, 15);
            }
        });

        // Email validation
        document.getElementById("email").addEventListener("blur", function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailRegex.test(this.value)) {
                this.setCustomValidity("Format email tidak valid");
            } else {
                this.setCustomValidity("");
            }
        });

        // Name validation
        document.getElementById("nama").addEventListener("input", function() {
            // Remove numbers and special characters, allow letters and spaces
            this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
        });