# Portofolio + Admin Panel — Supabase + Vercel

Versi ini memakai **Supabase** (Postgres + Storage, gratis & persisten) sebagai database,
dan siap di-deploy ke **Vercel** (gratis) sebagai serverless function + static hosting.

## Struktur Project

```
portfolio-vercel/
├── api/
│   └── index.js         <- entry point untuk Vercel (serverless function)
├── app.js                 <- Express app, semua route /api/*
├── server.js               <- entry point untuk development lokal (npm start)
├── lib/
│   ├── supabaseClient.js  <- koneksi ke Supabase
│   ├── database.js         <- semua query ke Supabase
│   └── defaultData.js       <- data seed / untuk fitur "Reset ke Default"
├── public/                  <- semua yang dibuka lewat browser (statis)
│   ├── index.html
│   ├── admin.html
│   ├── tampilan.css
│   ├── fungsi.js
│   └── logo/                 <- taruh foto profil, screenshot project, sertifikat di sini
├── supabase/
│   └── schema.sql            <- jalankan sekali di Supabase SQL Editor
├── package.json
├── .env.example
└── .gitignore
```

## Langkah 1 — Bikin Project Supabase (gratis)

1. Daftar/masuk ke https://supabase.com
2. Klik **New Project**, isi nama & password database (simpan passwordnya baik-baik)
3. Tunggu sampai project selesai dibuat (~1-2 menit)
4. Buka menu **SQL Editor** di sidebar kiri
5. Buka file `supabase/schema.sql` di project ini, **copy semua isinya**, paste ke SQL Editor, lalu klik **Run**
   - Ini otomatis membuat semua tabel, mengisi data awal (sama seperti portofolio kamu sekarang), dan membuat bucket penyimpanan gambar bernama `uploads`
6. Buka menu **Project Settings -> API**, catat dua nilai ini:
   - **Project URL** (contoh: ``)
   - **service_role key** (di bagian "Project API keys" — **BUKAN** `anon` `public` key, pastikan ambil yang `service_role` '', karena ini yang dipakai server untuk baca/tulis data)

⚠️ **service_role key ini setara kunci master** — jangan pernah taruh di kode yang dikirim ke browser atau di-commit ke GitHub publik. Di project ini dia hanya dipakai di `lib/supabaseClient.js` lewat environment variable, aman.

## Langkah 2 — Coba Jalankan di Lokal Dulu (opsional tapi disarankan)

1. Salin `.env.example` jadi `.env`, isi `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` dengan nilai dari Langkah 1
2. Pindahkan folder `logo/` dari portofolio lamamu ke `public/logo/` di project ini
3. Install dependency:
   ```
   npm install
   npm start
   ```
4. Buka:
   - Portofolio: http://localhost:3000/index.html
   - Admin panel: http://localhost:3000/admin.html (password default: `admin123`, segera ganti lewat menu Pengaturan)

## Langkah 3 — Upload ke GitHub

```
git init
git add .
git commit -m "Portofolio dengan Supabase"
git branch -M main
git remote add origin https://github.com/username-kamu/nama-repo.git
git push -u origin main
```

(File `.env` **tidak akan ikut ter-upload** karena sudah ada di `.gitignore` — memang harus begitu.)

## Langkah 4 — Deploy ke Vercel

1. Buka https://vercel.com, login pakai akun GitHub kamu
2. Klik **Add New -> Project**, pilih repo GitHub yang barusan kamu push
3. Sebelum klik Deploy, buka bagian **Environment Variables**, tambahkan:
   - `SUPABASE_URL` = URL project Supabase kamu
   - `SUPABASE_SERVICE_ROLE_KEY` = service role key kamu
4. Klik **Deploy**, tunggu sampai selesai
5. Setelah selesai, Vercel kasih URL publik (contoh: `https://nama-project.vercel.app`)
   - Portofolio: `https://nama-project.vercel.app/index.html`
   - Admin panel: `https://nama-project.vercel.app/admin.html`

Setiap kali kamu `git push` lagi ke `main`, Vercel otomatis deploy ulang versi terbaru.

## Cara Kerja Singkat

- `public/**` disajikan otomatis oleh Vercel sebagai file statis (tidak butuh server aktif)
- Semua request ke `/api/**` dijalankan sebagai **serverless function** dari `api/index.js`, yang membungkus seluruh Express app di `app.js`
- Setiap request itu **stateless** — tidak ada proses yang "nyala terus" — makanya semua data (bukan cuma sekadar file lokal) disimpan di Supabase, yang memang didesain untuk diakses dari mana saja lewat jaringan
- Upload gambar lewat admin panel langsung disimpan ke **Supabase Storage** (bucket `uploads`), bukan ke disk server — jadi aman meski servernya "sekali pakai" tiap request

## Kalau Ingin Ganti Password Admin Default

Setelah login pertama kali (password `admin123`), langsung ke menu **Pengaturan** di admin panel dan ganti password. Ini satu-satunya cara resmi menggantinya (tidak perlu edit database manual).

## Troubleshooting

- **"SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diatur"** di log → environment variable belum diisi (cek `.env` lokal, atau Environment Variables di Vercel)
- **Data tidak muncul sama sekali** → pastikan `supabase/schema.sql` sudah dijalankan di SQL Editor Supabase
- **Gambar tidak tampil** → pastikan bucket `uploads` di Supabase Storage sudah dibuat (otomatis lewat schema.sql) dan statusnya **Public**
- **Error 401 terus-terusan di admin panel** → sesi login tersimpan di tabel `sessions` Supabase; coba logout lalu login lagi
