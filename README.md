# Daftar Harga (Vue + Vite + Google Sheets)

## 1. Siapkan Google Sheets
1. Buat Google Sheet baru, **File > Import > Upload** file `daftar-harga-import-google-sheets.csv` (replace spreadsheet).
2. Kolom wajib (baris 1): `kode | nama | merek | kategori | deskripsi | harga`. Harga angka polos, mis. `1493000`.
3. **File > Bagikan > Publikasikan ke web** > pilih sheet-nya, format **Nilai dipisahkan koma (.csv)** > Publikasikan. Salin link.
4. Tempel link itu ke `src/config.js` (`SHEET_CSV_URL`).

Update harga = edit sel di Sheets (HP/laptop). Web ikut berubah otomatis (Google menyegarkan CSV tiap ±5 menit), tanpa deploy ulang.

## 2. Jalankan lokal
```
npm install
npm run dev
```

## 3. Deploy ke GitHub Pages
1. Buat repo GitHub, upload semua isi folder ini ke branch `main`.
2. Repo **Settings > Pages > Source: GitHub Actions**.
3. Setiap push ke `main`, web otomatis terbit di `https://USERNAME.github.io/NAMA-REPO/`.

Hanya ubah `src/config.js` bila link Sheets/nama toko/nomor WhatsApp berganti.
