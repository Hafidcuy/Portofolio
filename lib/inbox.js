/* ==========================================================
   MODUL BACKEND BARU -- Pesan Pengunjung, Statistik Situs,
   dan Jejak Aktivitas Admin (audit log).
   Dipakai oleh app.js lewat route /api/messages, /api/stats,
   dan dipanggil otomatis saat admin menyimpan/menghapus data.
========================================================== */

const crypto = require("crypto");
const supabase = require("./supabaseClient");

function must(res){
    if(res.error) throw new Error(res.error.message);
    return res.data;
}

/* Sidik jari IP: disimpan ter-hash agar jejak kunjungan bisa
   dihitung tanpa menyimpan alamat IP mentah pengunjung. */
function hashIp(ip){
    return crypto.createHash("sha256")
        .update(String(ip || "unknown") + (process.env.IP_SALT || "portofolio-hafid"))
        .digest("hex")
        .slice(0, 24);
}

/* ==========================
   KOTAK MASUK PENGUNJUNG
========================== */

/* Menyimpan pesan yang dikirim lewat formulir kontak di halaman
   publik. Honeypot (field "website") dipakai untuk menangkap bot
   tanpa mengganggu manusia yang mengisi formulir. */
async function saveMessage({ name, email, message, ip }){

    if(!name || !email || !message){
        throw new Error("Nama, email, dan pesan wajib diisi.");
    }

    if(String(message).trim().length < 5){
        throw new Error("Pesan terlalu pendek.");
    }

    const row = {
        name: String(name).slice(0, 120),
        email: String(email).slice(0, 200),
        message: String(message).slice(0, 3000),
        ip_hash: hashIp(ip)
    };

    const res = await supabase.from("messages")
        .insert(row).select().single();

    return must(res);
}

/* Daftar pesan, terbaru di atas. */
async function listMessages(){

    const res = await supabase.from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

    return must(res) || [];
}

async function unreadCount(){

    const res = await supabase.from("messages")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false);

    if(res.error) return 0;
    return res.count || 0;
}

async function markRead(id){
    const res = await supabase.from("messages")
        .update({ is_read: true }).eq("id", id);
    must(res);
}

async function deleteMessage(id){
    const res = await supabase.from("messages").delete().eq("id", id);
    must(res);
}

/* ==========================
   STATISTIK KUNJUNGAN
========================== */

const DAY_MS = 24 * 60 * 60 * 1000;

/* Mencatat kunjungan. Dua penghitung:
   - raw_count : total penampangan halaman (dihitung di app.js via
     middleware /api/portfolio, yang dipanggil saat load index.html)
   - hits      : pengunjung unik harian (dihitung di sini via
     sidik jari IP + tanggal)
*/
async function recordVisit(ip, isRaw = false){

    const day = new Date().toISOString().slice(0, 10);
    const key = hashIp(ip).slice(0, 16) + ":" + day;

    /* Upsert baris hari ini (tidak menghapus data lama). */
    const res = await supabase.from("site_visits")
        .upsert({ day, hits: 0, raw_count: 0 }, { onConflict: "day" })
        .select()
        .single();

    if(res.error) return;

    const row = res.data;

    if(isRaw){
        await supabase.from("site_visits")
            .update({ raw_count: (row.raw_count || 0) + 1 })
            .eq("day", day);
        return;
    }

    if(row.visit_key === key) return; /* sudah dihitung unik hari ini */

    await supabase.from("site_visits")
        .update({ hits: (row.hits || 0) + 1, visit_key: key, updated_at: new Date().toISOString() })
        .eq("day", day);
}

async function getStats(){

    const res = await supabase.from("site_visits")
        .select("hits, raw_count, day")
        .order("day", { ascending: false })
        .limit(30);

    const rows = must(res) || [];
    const total = rows.reduce((sum, r)=> sum + (r.hits || 0), 0);
    const rawTotal = rows.reduce((sum, r)=> sum + (r.raw_count || 0), 0);
    const today = rows.find(r=> r.day === new Date().toISOString().slice(0, 10));

    return {
        totalVisits: total,
        todayVisits: today ? today.hits : 0,
        totalPageViews: rawTotal,
        todayPageViews: today ? today.raw_count : 0,
        daysTracked: rows.length,
        unreadMessages: await unreadCount()
    };
}

/* ==========================
   JEJAK AKTIVITAS ADMIN
========================== */

async function logAdmin(action, detail, ip){
    try{
        await supabase.from("admin_log").insert({
            action,
            detail: detail ? String(detail).slice(0, 300) : null,
            ip_hash: hashIp(ip)
        });
    }catch(e){
        /* Log audit tidak boleh menggagalkan operasi utama. */
        console.warn("[audit] gagal mencatat aktivitas:", e.message);
    }
}

async function listAdminLog(limit = 30){

    const res = await supabase.from("admin_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

    return must(res) || [];
}

module.exports = {
    hashIp,
    saveMessage,
    listMessages,
    unreadCount,
    markRead,
    deleteMessage,
    recordVisit,
    getStats,
    logAdmin,
    listAdminLog
};
