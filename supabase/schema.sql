/* ==========================================================
   SKEMA + SEED DATA UNTUK SUPABASE
   Cara pakai: buka Supabase Dashboard -> SQL Editor -> paste
   seluruh isi file ini -> Run.
========================================================== */

-- ============ TABEL ============

create table if not exists profile (
    id int primary key default 1,
    name text,
    role text,
    bio text,
    photo text,
    school text,
    major text,
    address text
);

create table if not exists skills (
    id bigint generated always as identity primary key,
    icon text,
    name text,
    badge text,
    description text,
    percent int,
    sort_order int
);

create table if not exists projects (
    id bigint generated always as identity primary key,
    img text,
    title text,
    description text,
    github text,
    view text,
    sort_order int
);

create table if not exists certificates (
    id bigint generated always as identity primary key,
    img text,
    title text,
    description text,
    link text,
    sort_order int
);

create table if not exists experience (
    id bigint generated always as identity primary key,
    icon text,
    year text,
    title text,
    org text,
    description text,
    sort_order int
);

create table if not exists contact (
    id int primary key default 1,
    email text,
    instagram text,
    instagram_url text,
    github text,
    github_url text
);

create table if not exists settings (
    id int primary key default 1,
    cursor_fx_default boolean default false
);

create table if not exists admin (
    id int primary key default 1,
    password_hash text
);

create table if not exists sessions (
    token text primary key,
    created_at timestamptz default now()
);

-- ============ ROW LEVEL SECURITY ============
-- Diaktifkan untuk semua tabel. Server kita mengakses lewat
-- SERVICE ROLE KEY yang otomatis melewati RLS, jadi tidak perlu
-- membuat policy apa pun -- artinya akses publik langsung ke
-- tabel (lewat anon key) otomatis DITOLAK. Aman.

alter table profile enable row level security;
alter table skills enable row level security;
alter table projects enable row level security;
alter table certificates enable row level security;
alter table experience enable row level security;
alter table contact enable row level security;
alter table settings enable row level security;
alter table admin enable row level security;
alter table sessions enable row level security;

-- ============ STORAGE BUCKET UNTUK GAMBAR ============
-- Bucket publik supaya foto/gambar bisa tampil langsung di
-- portofolio tanpa perlu autentikasi untuk membacanya.

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- ============ SEED DATA DEFAULT ============

insert into profile (id, name, role, bio, photo, school, major, address)
values (
    1,
    'Moch. Hafid Putra R.',
    'Pelajar Rekayasa Perangkat Lunak',
    'Saya adalah seorang pelajar yang memiliki minat pada dunia pemrograman, website, IoT, dan desain UI/UX.',
    'logo/WhatsApp Image 2026-07-27 at 07.09.20.jpeg',
    'SMK Krian 1 Sidoarjo',
    'Rekayasa Perangkat Lunak',
    'Wonoayu, Sidoarjo, Jawa Timur'
)
on conflict (id) do nothing;

insert into skills (icon, name, badge, description, percent, sort_order) values
('fab fa-html5', 'HTML', 'Frontend', 'Struktur dan markup halaman web', 85, 0),
('fab fa-css3-alt', 'CSS', 'Frontend', 'Styling, layout, dan animasi web', 70, 1),
('fab fa-js', 'JavaScript', 'Frontend', 'Logika dan interaktivitas website', 15, 2)
on conflict do nothing;

insert into projects (img, title, description, github, view, sort_order) values
('logo/Screenshot (2).png', 'Website Warung', 'Website penjualan makanan dan minuman menggunakan HTML, CSS, dan JavaScript.', 'https://github.com/Hafidcuy/warungmami', 'https://warungmami.vercel.app/index.html', 0),
('logo/Screenshot (4).png', 'Website Perpustakaan', 'Website katalog buku dan manga dengan fitur pencarian.', 'https://github.com/Hafidcuy/SkaFarm-UI', 'https://cowoksoftspoken.github.io/SkaFarm-UI/', 1),
('logo/Screenshot (3).png', 'SkaFarm', 'Website pertanian modern yang berfokus pada UI/UX.', 'https://github.com/Hafidcuy/warungmami', 'https://warungmami.vercel.app/perpus.html', 2)
on conflict do nothing;

insert into certificates (img, title, description, link, sort_order) values
('/logo/{E1E605C0-48E6-4593-9A92-E8D8DD39EC19}.png', 'Fitcom', 'Lomba Pemrograman Web', '', 0)
on conflict do nothing;

insert into experience (icon, year, title, org, description, sort_order) values
('fas fa-briefcase', '2025', 'Praktik Kerja Lapangan (PKL)', 'UPTD RPH & Pasar Hewan Krian', 'Membantu proses digitalisasi dengan membuat website profil, melakukan dokumentasi kegiatan, instalasi aplikasi, scanning dokumen, dan administrasi.', 0),
('fas fa-code', '2025 - Sekarang', 'Web Developer', 'Project Pribadi', 'Mengembangkan berbagai website menggunakan HTML, CSS, JavaScript, PHP, dan MySQL seperti Website Warung, Website Perpustakaan, serta SkaFarm.', 1),
('fas fa-microchip', '2024-2025', 'Pengalaman Lapangan', 'Osis Skarisa', 'Aktif Selama Satu Tahun Sebagai Anggota Osis Skarisa', 2)
on conflict do nothing;

insert into contact (id, email, instagram, instagram_url, github, github_url)
values (
    1,
    'tulrama67@gmail.com',
    '@ramatul_1357',
    'https://www.instagram.com/ramatul_1357/',
    'github.com/Hafidcuy',
    'https://github.com/Hafidcuy'
)
on conflict (id) do nothing;

insert into settings (id, cursor_fx_default)
values (1, false)
on conflict (id) do nothing;

-- Password default: admin123 (SEGERA GANTI lewat menu Pengaturan setelah login pertama kali)
insert into admin (id, password_hash)
values (1, '$2b$10$bAzWqNDDSN00IFFI7pFnGeeh7dvdVPPWjm3SOyREjDxFt.llA5S4e')
on conflict (id) do nothing;
