/* ==========================================================
   MIGRASI: Kotak Masuk Pengunjung, Kunjungan, & Jejak Audit
   Jalankan di Supabase Dashboard -> SQL Editor -> Run.
   (Aman dijalankan berulang: semua perintah idempoten.)
========================================================== */

-- ============ TABEL PESAN MASUK (kotak pesan pengunjung) ============

create table if not exists messages (
    id bigint generated always as identity primary key,
    name text not null,
    email text not null,
    message text not null,
    ip_hash text,                -- sidik jari IP yang di-hash (tidak menyimpan IP mentah)
    created_at timestamptz not null default now(),
    is_read boolean not null default false
);

create index if not exists messages_created_at_idx on messages (created_at desc);

-- ============ TABEL KUNJUNGAN SITUS ============

create table if not exists site_visits (
    day           date primary key default current_date,
    hits          int not null default 0,
    visit_key     text,              -- sidik jari IP+day untuk hit unik per pengunjung
    updated_at timestamptz not null default now(),
    raw_count     int not null default 0   -- total penampakan halaman (dihitung lewat app.js)
);

-- ============ TABEL JEAK AKTIVITAS ADMIN (audit log) ============

create table if not exists admin_log (
    id bigint generated always as identity primary key,
    action text not null,
    detail text,
    ip_hash text,
    created_at timestamptz not null default now()
);

-- ============ ROW LEVEL SECURITY ============
-- Sama seperti tabel lain: server memakai SERVICE ROLE KEY
-- (melewati RLS), sehingga akses anonim langsung ke tabel ini
-- lewat key publik otomatis DITOLAK.

alter table messages enable row level security;
alter table site_visits enable row level security;
alter table admin_log enable row level security;
