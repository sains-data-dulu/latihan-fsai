# Latihan Soal Mandiri — Pekan 3 (Clustering, PCA & MCA)

Website latihan satu halaman (`index.html`) yang di-hosting di GitHub Pages.
Nama, skor akhir, dan peringkat peserta dikelola lewat Google Sheets + Google Apps Script (`Code.gs`).

```
Peserta (browser)  ──kirim nama & skor──▶  Google Apps Script  ──simpan──▶  Google Sheets "Rekap Skor"
        ◀──── peringkat anonim (hanya angka skor, tanpa nama) ────┘
```

---

## Bagian A — Siapkan rekap di Google Sheets (±5 menit)

1. Buka <https://sheets.google.com> dan login dengan akun Google trainer.
2. Buat spreadsheet kosong, lalu beri nama, misalnya **Rekap Latihan Pekan 3**.
3. Klik menu **Extensions → Apps Script**. Tab baru akan terbuka.
4. Hapus seluruh isi editor, tempel **seluruh isi `Code.gs`**, lalu klik ikon **Save** (💾).
5. Klik tombol biru **Deploy → New deployment**.
6. Klik ikon roda gigi di samping "Select type", lalu pilih **Web app**. Isi:
   - **Description:** Rekap Latihan (bebas)
   - **Execute as:** **Me** (email Anda)
   - **Who has access:** **Anyone**
7. Klik **Deploy**, lalu **Authorize access**, dan pilih akun Anda.
   Jika muncul "Google hasn't verified this app", klik **Advanced → Go to … (unsafe)** → **Allow**. Ini normal karena script buatan Anda sendiri.
8. Salin **Web app URL** (bentuknya `https://script.google.com/macros/s/……/exec`).
9. Cek: buka URL itu di tab baru. Jika muncul `{"ok":true,"status":"Rekap skor aktif"}`, berarti sudah aktif.

## Bagian B — Hubungkan `index.html` ke rekap

1. Buka `index.html` dengan editor teks (Notepad, VS Code, dll.).
2. Tekan Ctrl+F dan cari: `var SHEET_URL = "";`
3. Tempel URL dari langkah A-8 di antara tanda kutip:
   ```js
   var SHEET_URL = "https://script.google.com/macros/s/XXXXXXXX/exec";
   ```
4. Simpan file.

## Bagian C — Hosting di GitHub Pages (±5 menit)

1. Login ke <https://github.com>. Buat akun gratis jika belum punya.
2. Klik **+** (kanan atas) → **New repository**.
   - **Repository name:** misalnya `latihan-pekan3`
   - Pilih **Public** (GitHub Pages gratis hanya untuk repository publik)
   - Klik **Create repository**
3. Di halaman repository, klik **uploading an existing file** (atau **Add file → Upload files**).
4. Seret **`index.html` saja** ke halaman itu, lalu klik **Commit changes**.
5. Buka **Settings → Pages** (menu kiri).
6. Pada **Build and deployment → Source**, pilih **Deploy from a branch**. Pada **Branch**, pilih `main` dan `/ (root)`, lalu klik **Save**.
7. Tunggu 1–2 menit, lalu muat ulang halaman Settings → Pages. Link website akan muncul:
   `https://<username>.github.io/latihan-pekan3/`
8. Bagikan link itu ke peserta.

**Memperbarui website:** buka repository → klik `index.html` → ikon pensil (Edit), atau upload ulang file dengan nama yang sama → **Commit changes**. Perubahan tayang dalam 1–2 menit.

> Jangan upload `Code.gs` dan `README.md` ke repository publik. `index.html` sudah cukup.

---

## Di mana hasil rekap tersimpan?

Di **Google Drive akun trainer**, pada spreadsheet yang dibuat di Bagian A (misalnya "Rekap Latihan Pekan 3"), sheet **Rekap Skor**. Sheet ini dibuat otomatis saat ada kiriman pertama.

| Kolom | Isi |
|---|---|
| Waktu Kirim | tanggal & jam peserta mengumpulkan |
| Nama, Unit Kerja | dari kotak Data Peserta |
| Latihan | Latihan 1 / Latihan 2 |
| Skor, Benar, Salah, Kosong, Total Soal | hasil penilaian |
| Durasi | lama pengerjaan |
| Jawaban | jawaban per nomor, mis. `1:B, 2:C, …` |
| ID Kiriman | kode unik (mencegah data ganda) |

Tips: gunakan **Data → Create a filter** untuk menyaring per latihan, atau **Insert → Pivot table** untuk rekap per peserta. Hanya orang yang Anda beri akses ke spreadsheet yang bisa melihat nama peserta.

## Peringkat peserta

Setelah mengumpulkan, peserta melihat:

- posisinya (mis. **#3 dari 25 peserta**) dan persentase peserta yang diungguli,
- rata-rata kelas dan skor tertinggi,
- papan skor anonim: peserta lain hanya tampil sebagai "Peserta" beserta skornya, sedangkan baris miliknya ditandai "Anda".

Nama peserta lain **tidak pernah dikirim ke browser**; script hanya mengembalikan angka skor. Peringkat memakai skor terbaik tiap peserta (berdasarkan nama) per latihan. Tombol **↻ Perbarui** mengambil peringkat terbaru jika peserta lain baru selesai.

## Password pembahasan

Latihan 1 dan Latihan 2 memakai password berbeda, dibagikan trainer kepada peserta. Password sengaja tidak dicantumkan di sini. Isi pembahasan tersimpan dalam bentuk teracak di `index.html`, sehingga tidak bisa diintip lewat View Source.

## Catatan

- **Mengubah `Code.gs` setelah deploy:** pilih **Deploy → Manage deployments** → ikon pensil → **Version: New version** → **Deploy**. Dengan cara ini URL tetap sama. Jika memilih New deployment, URL berubah dan `SHEET_URL` harus diganti.
- **Menghapus data uji coba:** hapus barisnya langsung di sheet Rekap Skor, tetapi jangan hapus baris judul.
- **Jika `SHEET_URL` kosong atau internet peserta terputus:** skor tetap tersimpan di browser peserta, dan peserta bisa mengklik **Kirim Ulang ke Rekap** tanpa membuat baris ganda.
- **Keamanan penilaian:** skor dihitung di browser. Ini cukup untuk latihan mandiri, tetapi bukan sistem ujian yang tahan manipulasi.
