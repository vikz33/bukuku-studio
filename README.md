# 📓 Bukuku - Book Studio

**Bukuku Studio** adalah aplikasi web berbasis *client-side* untuk merancang dan mempersonalisasi desain buku catatan (notebook) secara instan. Dirancang khusus untuk kebutuhan cetak mandiri maupun standar **KDP (Kindle Direct Publishing)**.

## ✨ Fitur Unggulan

- **Live Preview:** Lihat perubahan desain Anda secara real-time.
- **KDP Ready:** Pengaturan otomatis untuk standar cetak Amazon KDP (Bleed, Gutter, dan ukuran khusus).
- **Customization Luas:** Ubah font, warna, emoji, dekorasi, hingga watermark.
- **Drag & Drop:** Geser posisi judul dan elemen dekorasi langsung pada area pratinjau.
- **Auto-Save (Local):** Proyek Anda tersimpan otomatis di browser, aman jika halaman tidak sengaja tertutup.
- **Export High-Res:** Unduh hasil desain dalam format PDF siap cetak dengan resolusi tinggi.
- **Mobile Friendly:** Dukungan gestur *pinch-to-zoom* untuk memudahkan desain melalui ponsel.

## 🚀 Cara Menjalankan Secara Lokal

Aplikasi ini dibangun menggunakan vanilla JavaScript (ES Modules), sehingga Anda memerlukan *local server* agar fitur `import/export` berjalan lancar.

1.  **Clone Repository**
    ```bash
    git clone https://github.com/username/bukuku-studio.git
    cd bukuku-studio
    ```

2.  **Jalankan Local Server**
    Jika Anda memiliki Python, jalankan:
    ```bash
    python -m http.server 8000
    ```
    Atau jika menggunakan VS Code, klik kanan pada `index.html` dan pilih **"Open with Live Server"**.

3.  **Akses Aplikasi**
    Buka browser dan kunjungi `http://localhost:8000`.

## 🛠️ Teknologi yang Digunakan

- **HTML5 & CSS3** (Custom Properties, Flexbox, Grid)
- **Vanilla JavaScript** (ES6+ Modules)
- **html2canvas** - Untuk mengubah elemen HTML menjadi gambar.
- **jsPDF** - Untuk menyusun gambar menjadi dokumen PDF siap cetak.

## 📂 Struktur File

- `index.html`: Struktur utama aplikasi.
- `style.css`: Desain antarmuka (Earth Tone Theme & Dark Mode).
- `main.js`: Logika inisialisasi dan event listener utama.
- `config.js`: Pusat pengaturan tema, font, dan preset KDP.
- `render.js`: Mesin pembuat halaman (sampul & isi).
- `export.js`: Logika pemrosesan ekspor ke PDF.
- `state.js` & `utils.js`: Manajemen data dan fungsi pembantu.

## 📝 Lisensi

Proyek ini dibuat untuk kebutuhan personal dan pengembangan bisnis Bukuku. Anda bebas menggunakan dan memodifikasi untuk penggunaan pribadi.

---
Dibuat dengan ❤️ oleh **Bukuku Studio Team**
