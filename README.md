# Portofolio + Admin Panel (Express + Supabase)

Backend Node.js + Express dengan database **Supabase** (PostgreSQL),
dijalankan sebagai serverless function di **Vercel** lewat `api/index.js`.

## Struktur

```
├── app.js             <- Express app + semua route API (dipakai Vercel & lokal)
├── api/
│   └── index.js       <- entry point Vercel (serverless)
├── lib/
│   ├── database.js    <- query & pemetaan data Supabase
│   ├── supabaseClient.js <- koneksi Supabase (server-side)
│   └── defaultData.js <- data awal (seed) & untuk fitur "Reset ke Default"
├── supabase/
│   └── schema.sql     <- skema tabel database
├── public/            <- semua yang dibuka lewat browser
│   ├── index.html
│   ├── admin.html
│   ├── tampilan.css
│   ├── fungsi.js
│   ├── fitur.js
│   └── logo/          <- taruh semua gambar (foto profil, project, sertifikat) di sini
└── vercel.json        <- rewrite /api + header keamanan & cache
```

## Cara Menjalankan (Lokal)

1. Pastikan **Node.js versi 22.5 atau lebih baru** terpasang. Cek dengan: `node -v`

2. Masuk ke folder project, lalu install dependency:
   ```
   npm install
   ```

3. Buat file `.env` di folder project berisi kredensial Supabase kamu:
   ```
   SUPABASE_URL=https://<project-ref>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   ```

4. Jalankan server:
   ```
   npm start
   ```
   (atau `npm run dev` untuk mode watch yang auto-restart saat file berubah.)

5. Buka di browser:
   - Portofolio: http://localhost:3000/index.html
   - Admin Panel: http://localhost:3000/admin.html (password default: `admin123`)

Server ini sekaligus jadi web server untuk file statis DAN API—jadi tidak perlu Live Server lagi,
cukup jalankan `npm start`.

## Cara Kerja Data

- Semua data (profil, skill, project, sertifikat, pengalaman, kontak) tersimpan di **database Supabase**
  (PostgreSQL) — skema tabelnya ada di `supabase/schema.sql`.
- Admin panel bicara ke server lewat REST API (`/api/...`) memakai `fetch()`, dengan token login
  yang perlu disertakan di header `Authorization: Bearer <token>` untuk operasi tulis (tambah/ubah/hapus).
- Password admin disimpan **ter-hash** (bcrypt) di database, bukan teks polos.
- Upload gambar lewat admin panel (Profil/Project/Sertifikat) tersimpan di **Supabase Storage**
  (bucket `uploads`), dan URL publiknya otomatis diisikan ke field path gambar.

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

Cadangkan data secara berkala dengan cara:
- Pakai fitur "Unduh Data (JSON)" di menu Pengaturan pada admin panel, **atau**
- Export tabel dari Supabase Dashboard (Table Editor / SQL Editor).

## Deploy

Deploy utama di **Vercel**: setiap push ke branch `main` di GitHub otomatis memicu redeploy.
Vercel menjalankan `api/index.js` sebagai serverless function dan menyajikan folder `public/`
sebagai file statis. Pastikan environment variable `SUPABASE_URL` dan
`SUPABASE_SERVICE_ROLE_KEY` sudah diatur di dashboard Vercel (Settings → Environment Variables).

## Fitur Tambahan Frontend (2026)

Lapisan fitur di `public/fitur.js` + tambahan gaya di akhir `public/tampilan.css`.
Fitur ini **tidak mengubah isi/konten** — semua data tetap berasal dari database
(`/api/portfolio`) seperti sebelumnya:

- **Scroll progress bar** di bagian atas halaman.
- **Lightbox**: klik foto project / gambar sertifikat untuk melihat versi besar (Esc / klik luar untuk menutup).
- **Filter + pencarian** project (berdasarkan tag) dan skill (berdasarkan kategori) — chip dibuat otomatis dari data yang ada.
- **Bagikan**: tombol share (Web Share API, fallback salin link) dan **Salin email** dengan klik ganda pada kartu email.
- **Simpan PDF / Cetak CV**: tombol di hero + `@media print` yang merapikan halaman menjadi CV bersih saat dicetak / disimpan sebagai PDF.
- **Form Kirim Pesan Cepat** di Kontak: membuka aplikasi email dengan subjek & isi yang sudah terisi otomatis (tanpa backend baru).
- **PWA**: `manifest.webmanifest` + service worker (`sw.js`) — situs bisa di-install dan aset statis tetap bisa dibuka saat offline; API selalu network-first agar data tidak basi. Ada juga indikator offline.
- **SEO & berbagi**: meta description, Open Graph / Twitter Card, JSON-LD, `robots.txt`, favicon, dan `theme-color` yang mengikuti mode gelap/terang.
- **Aksesibilitas**: skip-link, `aria-expanded`/`aria-pressed` pada tombol menu & tema, menu HP bisa ditutup dengan Esc / klik di luar, dan tema awal menghormati `prefers-color-scheme`.
- **Responsif**: batas lebar konten untuk layar ultra-wide, perapian mode landscape, dan target sentuh minimum 44px untuk kontrol baru.
- **Performa & keamanan**: gambar project/sertifikat `loading="lazy"`, header keamanan + cache di `vercel.json` dan Express, serta endpoint `GET /api/health`.
