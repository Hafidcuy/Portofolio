# Portofolio + Admin Panel (Database Asli: SQLite)

Backend Node.js + Express dengan database SQLite sungguhan (`portfolio.db`),
menggantikan versi sebelumnya yang memakai `localStorage` browser.

## Struktur

```
portfolio-server/
├── server.js          <- server Express + semua route API
├── db/
│   ├── database.js    <- koneksi & skema SQLite
│   └── defaultData.js <- data awal (seed) & untuk fitur "Reset ke Default"
├── public/             <- semua yang dibuka lewat browser
│   ├── index.html
│   ├── admin.html
│   ├── tampilan.css
│   ├── fungsi.js
│   └── logo/            <- taruh semua gambar (foto profil, project, sertifikat) di sini
├── uploads/             <- gambar yang diunggah lewat admin panel disimpan di sini otomatis
└── portfolio.db          <- file database (dibuat otomatis saat pertama dijalankan)
```

## Cara Menjalankan

1. Pastikan **Node.js versi 22.5 atau lebih baru** terpasang (database pakai modul bawaan `node:sqlite`).
   Cek dengan: `node -v`

2. Masuk ke folder project, lalu install dependency:
   ```
   npm install
   ```

3. **Pindahkan folder `logo/` dari portofolio lama kamu** (berisi foto profil, screenshot project, sertifikat)
   ke dalam `public/logo/` di project ini, supaya path gambar tetap cocok.

4. Jalankan server:
   ```
   npm start
   ```

5. Buka di browser:
   - Portofolio: http://localhost:3000/index.html
   - Admin Panel: http://localhost:3000/admin.html (password default: `admin123`)

Server ini sekaligus jadi web server untuk file statis DAN API—jadi tidak perlu Live Server lagi,
cukup jalankan `npm start`.

## Cara Kerja Data

- Semua data (profil, skill, project, sertifikat, pengalaman, kontak) tersimpan di **file `portfolio.db`**
  di folder project—database SQLite sungguhan, bukan di browser.
- Admin panel bicara ke server lewat REST API (`/api/...`) memakai `fetch()`, dengan token login
  yang perlu disertakan di header `Authorization: Bearer <token>` untuk operasi tulis (tambah/ubah/hapus).
- Password admin disimpan **ter-hash** (bcrypt) di database, bukan teks polos.
- Upload gambar lewat admin panel (Profil/Project/Sertifikat) langsung tersimpan sebagai file asli
  di folder `uploads/` di server, dan otomatis diisikan ke field path gambar.

## Endpoint API (ringkas)

| Method | Endpoint                  | Auth | Keterangan                        |
|--------|----------------------------|------|------------------------------------|
| GET    | /api/portfolio             | -    | Ambil semua data (dipakai index.html) |
| POST   | /api/login                 | -    | { password } -> { token }         |
| POST   | /api/logout                | ✔    | Hapus sesi                        |
| POST   | /api/change-password       | ✔    | { oldPassword, newPassword }      |
| PUT    | /api/profile               | ✔    | Update profil                     |
| PUT    | /api/contact               | ✔    | Update kontak                     |
| PUT    | /api/settings              | ✔    | Update pengaturan                 |
| POST/PUT/DELETE | /api/skills, /api/projects, /api/certificates, /api/experience | ✔ | CRUD masing-masing |
| POST   | /api/upload                | ✔    | Upload gambar (multipart, field "image") |
| GET    | /api/export                | ✔    | Unduh seluruh data sebagai JSON   |
| POST   | /api/import                | ✔    | Timpa seluruh data dari JSON      |
| POST   | /api/reset                 | ✔    | Kembalikan ke data default        |

## Backup Database

Karena datanya sekarang di file `portfolio.db`, cadangkan secara berkala dengan cara:
- Salin file `portfolio.db` ke tempat lain, **atau**
- Pakai fitur "Unduh Data (JSON)" di menu Pengaturan pada admin panel.

## Deploy ke Hosting

Untuk online-kan (misal ke Railway, Render, atau VPS), pastikan platform tersebut mendukung
proses Node.js yang berjalan terus-menerus (bukan hosting statis seperti GitHub Pages/Vercel static,
karena butuh server yang aktif untuk API dan penyimpanan file `portfolio.db` & `uploads/`).
