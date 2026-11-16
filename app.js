/* ==========================================================
   EXPRESS APP -- semua route API
   Dipakai oleh:
   - api/index.js (untuk Vercel, serverless)
   - dijalankan langsung (npm start / node app.js) untuk development lokal
========================================================== */

require("dotenv").config();

const path = require("path");
const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");

const supabase = require("./lib/supabaseClient");
const {
    getFullData,
    updateProfile,
    updateContact,
    updateSettings,
    insertRow,
    updateRow,
    deleteRow,
    getAdminRow,
    updateAdminPasswordHash,
    createSession,
    findSession,
    deleteSession,
    deleteOtherSessions,
    seedAll,
    DEFAULT_DATA,
    rowToSkill,
    rowToProject,
    rowToCert,
    rowToExp
} = require("./lib/database");

const inbox = require("./lib/inbox");

const app = express();

/* Respons 500: catat error asli ke log server,
   tapi kirim pesan umum ke klien (jangan bocorkan
   detail internal seperti nama tabel/kolom). */
function serverFail(res, err, message){
    console.error("[server]", err);
    res.status(500).json({ error: message });
}


/* Header keamanan dasar untuk semua respons (tidak mengubah data/logika) */
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    /* Paksa HTTPS (browser mengabaikan header ini di HTTP). */
    if(req.secure){
        res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
});

/* Parser body JSON dipasang paling awal agar semua route
   (termasuk /api/messages) menerima req.body yang sudah diparse. */
app.use(express.json());

/* Middleware untuk mencatat kunjungan halaman portfolio (di-index.html & /api/portfolio). */
app.use((req, res, next) => {
    if(req.path === "/api/portfolio"){
        const ip = getClientIp(req);
        inbox.recordVisit(ip, true); // raw page view (hit per load)
    }
    next();
});

/* Middleware untuk mencatat kunjungan harian unik (per IP per hari). */
app.use("/api/messages", async (req, res, next) => {
    const ip = getClientIp(req);
    await inbox.recordVisit(ip, false); // unique daily visitor
    next();
});

/* ==========================
   API ENDPOINTS BARU
========================== */

app.post("/api/messages", async (req, res)=>{

    try{

        const ip = getClientIp(req);
        const msg = await inbox.saveMessage({ ...req.body, ip });

        inbox.logAdmin("CONTACT_MESSAGE", {
            id: msg.id, name: msg.name, email: msg.email, created_at: msg.created_at
        }, ip);

        res.json({ ok: true, id: msg.id });

    }catch(err){
        console.error("[api/messages]", err);
        res.status(400).json({ error: err.message || "Gagal menyimpan pesan." });
    }

});

app.get("/api/stats", requireAuth, async (req, res)=>{

    try{

        const stats = await inbox.getStats();
        res.json(stats);

    }catch(err){
        console.error("[api/stats]", err);
        res.status(500).json({ error: "Gagal memuat statistik." });
    }

});

app.get("/api/messages", requireAuth, async (req, res)=>{

    try{

        const list = await inbox.listMessages();
        res.json(list);

    }catch(err){
        console.error("[api/messages]", err);
        res.status(500).json({ error: "Gagal memuat pesan." });
    }

});

app.put("/api/messages/:id/read", requireAuth, async (req, res)=>{

    try{

        await inbox.markRead(parseInt(req.params.id));
        inbox.logAdmin("MESSAGE_READ", { id: req.params.id }, req.headers.authorization?.slice(7));

        res.json({ ok: true });

    }catch(err){
        console.error("[api/messages/:id/read]", err);
        res.status(500).json({ error: "Gagal menandai pesan." });
    }

});

app.delete("/api/messages/:id", requireAuth, async (req, res)=>{

    try{

        inbox.logAdmin("MESSAGE_DELETE", { id: req.params.id }, req.headers.authorization?.slice(7));
        await inbox.deleteMessage(parseInt(req.params.id));

        res.json({ ok: true });

    }catch(err){
        console.error("[api/messages/:id]", err);
        res.status(500).json({ error: "Gagal menghapus pesan." });
    }

});

app.get("/api/admin-log", requireAuth, async (req, res)=>{

    try{

        const logs = await inbox.listAdminLog();
        res.json(logs);

    }catch(err){
        console.error("[api/admin-log]", err);
        res.status(500).json({ error: "Gagal memuat log admin." });
    }

});

/* Cek kesehatan layanan (dipakai uptime monitor / pengecekan deploy) */
app.get("/api/health", (req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
});

/* Di Vercel, file statis (public/**) sudah otomatis disajikan
   oleh platform-nya sendiri. express.static() di sini hanya
   dipakai saat menjalankan server lokal lewat server.js. */
app.use(express.static(path.join(__dirname, "public")));

/* ==========================
   AUTH
========================== */

function generateToken(){
    return crypto.randomBytes(32).toString("hex");
}

async function requireAuth(req, res, next){

    try{

        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

        if(!token){
            return res.status(401).json({ error: "Unauthorized" });
        }

        const session = await findSession(token);

        if(!session){
            return res.status(401).json({ error: "Unauthorized" });
        }

        next();

    }catch(err){

        res.status(500).json({ error: "Terjadi kesalahan autentikasi." });

    }

}

/* ==========================
   RATE LIMITING (brute-force protection)
   In-memory per IP. Cukup untuk mencegah percobaan
   masuk berulang dari satu IP; di Vercel serverless
   tiap instance punya memori sendiri, tetap mengurangi
   laju serangan.
========================== */

const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 menit
const LOGIN_MAX_ATTEMPTS = 5;
const loginAttempts = new Map(); // ip -> { count, firstAt, lockedUntil }

function getClientIp(req){
    return (
        (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
        req.socket.remoteAddress ||
        "unknown"
    );
}

function isLoginBlocked(ip){
    const rec = loginAttempts.get(ip);
    if(!rec) return false;
    const now = Date.now();
    if(rec.lockedUntil && now < rec.lockedUntil) return true;
    if(now - rec.firstAt > LOGIN_WINDOW_MS){
        loginAttempts.delete(ip);
        return false;
    }
    return false;
}

function recordLoginFailure(ip){
    const now = Date.now();
    let rec = loginAttempts.get(ip);
    if(!rec || now - rec.firstAt > LOGIN_WINDOW_MS){
        rec = { count: 0, firstAt: now, lockedUntil: 0 };
        loginAttempts.set(ip, rec);
    }
    rec.count++;
    if(rec.count >= LOGIN_MAX_ATTEMPTS){
        rec.lockedUntil = now + LOGIN_WINDOW_MS;
    }
}

function clearLoginFailures(ip){
    loginAttempts.delete(ip);
}

/* Bersihkan record basi agar memori tidak membengkak */
const loginCleaner = setInterval(()=>{
    const now = Date.now();
    for(const [ip, rec] of loginAttempts){
        if(now - rec.firstAt > LOGIN_WINDOW_MS * 2 && (!rec.lockedUntil || now > rec.lockedUntil)){
            loginAttempts.delete(ip);
        }
    }
}, 10 * 60 * 1000);
if(loginCleaner && typeof loginCleaner.unref === "function") loginCleaner.unref();

/* Hash bcrypt valid (dibuat di cold-start) yang dipakai
   sebagai dummy saat akun admin tidak ditemukan, agar
   bcrypt.compareSync selalu berjalan dengan hash valid
   -> waktu respons konsisten (anti timing attack). */
const DUMMY_HASH = bcrypt.hashSync("dummy-timing-attack-mitigation", 10);

app.post("/api/login", async (req, res)=>{

    try{

        const ip = getClientIp(req);

        if(isLoginBlocked(ip)){
            return res.status(429).json({ error: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit." });
        }

        const { password } = req.body || {};
        const admin = await getAdminRow();

        /* Hash selalu dijalankan agar waktu respons konsisten
           (mencegah penyerang menebak ada-tidaknya akun). */
        const hash = admin && admin.password_hash
            ? admin.password_hash
            : DUMMY_HASH;

        const ok = admin && bcrypt.compareSync(password || "", hash);

        if(!ok){
            recordLoginFailure(ip);
            return res.status(401).json({ error: "Password salah." });
        }

        clearLoginFailures(ip);

        const token = generateToken();
        await createSession(token);

        res.json({ token });

    }catch(err){
        console.error("[login]", err);
        res.status(500).json({ error: "Gagal login." });

    }

});

app.post("/api/logout", requireAuth, async (req, res)=>{

    try{
        const token = req.headers.authorization.slice(7);
        await deleteSession(token);
        res.json({ ok: true });
    }catch(err){
        serverFail(res, err, "Gagal logout.");
    }

});

app.post("/api/change-password", requireAuth, async (req, res)=>{

    try{

        const { oldPassword, newPassword } = req.body || {};
        const admin = await getAdminRow();

        if(!bcrypt.compareSync(oldPassword || "", admin.password_hash)){
            return res.status(400).json({ error: "Password lama salah." });
        }

        if(!newPassword || newPassword.length < 8){
            return res.status(400).json({ error: "Password baru minimal 8 karakter." });
        }

        const hash = bcrypt.hashSync(newPassword, 10);
        await updateAdminPasswordHash(hash);

        /* Invalidate semua sesi lain agar token lama yang bocor mati;
           sesi saat ini tetap dipertahankan agar tidak ter-logout. */
        const currentToken = req.headers.authorization ? req.headers.authorization.slice(7) : "";
        await deleteOtherSessions(currentToken);

        res.json({ ok: true });

    }catch(err){

        serverFail(res, err, "Gagal mengubah password.");

    }

});

/* ==========================
   READ PUBLIK
========================== */

app.get("/api/portfolio", async (req, res)=>{

    try{
        /* Data publik: boleh di-cache singkat di browser/CDN agar halaman
           terasa lebih cepat, tetap segar lewat stale-while-revalidate. */
        res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
        res.json(await getFullData());
    }catch(err){
        serverFail(res, err, "Gagal memuat data.");
    }

});

/* ==========================
   PROFIL / KONTAK / SETTINGS
========================== */

app.put("/api/profile", requireAuth, async (req, res)=>{

    try{
        await updateProfile(req.body || {});
        res.json((await getFullData()).profile);
    }catch(err){
        serverFail(res, err, "Gagal menyimpan profil.");
    }

});

app.put("/api/contact", requireAuth, async (req, res)=>{

    try{
        await updateContact(req.body || {});
        res.json((await getFullData()).contact);
    }catch(err){
        serverFail(res, err, "Gagal menyimpan kontak.");
    }

});

app.put("/api/settings", requireAuth, async (req, res)=>{

    try{
        await updateSettings(req.body || {});
        res.json((await getFullData()).settings);
    }catch(err){
        serverFail(res, err, "Gagal menyimpan pengaturan.");
    }

});

/* ==========================
   CRUD GENERIK
========================== */

function setupCrud(name, table, columns, rowMapper){

    app.post(`/api/${name}`, requireAuth, async (req, res)=>{

        try{

            const body = req.body || {};
            const values = {};
            columns.forEach(c=> values[c.col] = body[c.key]);

            const row = await insertRow(table, values);
            res.json(rowMapper(row));

        }catch(err){

            serverFail(res, err, "Gagal menyimpan data.");

        }

    });

    app.put(`/api/${name}/:id`, requireAuth, async (req, res)=>{

        try{

            const body = req.body || {};
            const values = {};
            columns.forEach(c=> values[c.col] = body[c.key]);

            const row = await updateRow(table, req.params.id, values);
            res.json(rowMapper(row));

        }catch(err){

            serverFail(res, err, "Gagal memperbarui data.");

        }

    });

    app.delete(`/api/${name}/:id`, requireAuth, async (req, res)=>{

        try{

            await deleteRow(table, req.params.id);
            res.json({ ok: true });

        }catch(err){

            serverFail(res, err, "Gagal menghapus data.");

        }

    });

}

setupCrud("skills", "skills", [
    { col: "icon", key: "icon" },
    { col: "name", key: "name" },
    { col: "badge", key: "badge" },
    { col: "description", key: "desc" },
    { col: "percent", key: "percent" }
], rowToSkill);

setupCrud("projects", "projects", [
    { col: "img", key: "img" },
    { col: "title", key: "title" },
    { col: "description", key: "desc" },
    { col: "github", key: "github" },
    { col: "view", key: "view" },
    { col: "tag", key: "tag" }
], rowToProject);

setupCrud("certificates", "certificates", [
    { col: "img", key: "img" },
    { col: "title", key: "title" },
    { col: "description", key: "desc" },
    { col: "link", key: "link" }
], rowToCert);

setupCrud("experience", "experience", [
    { col: "icon", key: "icon" },
    { col: "year", key: "year" },
    { col: "title", key: "title" },
    { col: "org", key: "org" },
    { col: "description", key: "desc" }
], rowToExp);

/* ==========================
   EXPORT / IMPORT / RESET
========================== */

app.get("/api/export", requireAuth, async (req, res)=>{

    try{
        res.json(await getFullData());
    }catch(err){
        serverFail(res, err, "Gagal mengekspor data.");
    }

});

app.post("/api/import", requireAuth, async (req, res)=>{

    try{
        await seedAll(req.body);
        res.json(await getFullData());
    }catch(err){
        res.status(400).json({ error: err.message || "Data tidak valid." });
    }

});

app.post("/api/reset", requireAuth, async (req, res)=>{

    try{
        await seedAll(DEFAULT_DATA);
        res.json(await getFullData());
    }catch(err){
        serverFail(res, err, "Gagal mereset data.");
    }

});

/* ==========================
   UPLOAD GAMBAR (ke Supabase Storage)
========================== */

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb)=>{
        /* Pemeriksaan awal saja; validasi sebenarnya ada di
           detectImageType() yang membaca magic bytes file. */
        if(!file.mimetype.startsWith("image/")){
            return cb(new Error("File harus berupa gambar."));
        }
        cb(null, true);
    }
});

/* Deteksi jenis gambar dari magic bytes (bukan dari nama/mimetype
   yang bisa dipalsukan klien). Mengembalikan null bila bukan gambar
   yang didukung, sehingga file HTML/SVG berbahaya ditolak. */
const IMAGE_TYPES = {
    png:  "image/png",
    jpg:  "image/jpeg",
    gif:  "image/gif",
    webp: "image/webp",
    avif: "image/avif"
};

function detectImageType(buf){
    if(!buf || buf.length < 12) return null;
    if(buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return "png";
    if(buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return "jpg";
    if(buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return "gif";
    if(buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
    if(buf.toString("ascii", 4, 8) === "ftyp"){
        const brand = buf.toString("ascii", 8, 12);
        if(brand === "avif" || brand === "avis") return "avif";
    }
    return null;
}

app.post("/api/upload", requireAuth, (req, res)=>{

    upload.single("image")(req, res, async (err)=>{

        if(err){
            return res.status(400).json({ error: err.message });
        }

        if(!req.file){
            return res.status(400).json({ error: "Tidak ada file yang diunggah." });
        }

        try{

            /* Ekstensi & contentType diturunkan dari isi file,
               bukan dari nama file / mimetype yang diberikan klien. */
            const type = detectImageType(req.file.buffer);
            if(!type){
                return res.status(400).json({ error: "File bukan gambar yang valid (didukung: JPG, PNG, GIF, WEBP, AVIF)." });
            }

            const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${type}`;

            const { error: uploadError } = await supabase.storage
                .from("uploads")
                .upload(filename, req.file.buffer, { contentType: IMAGE_TYPES[type], upsert: false });

            if(uploadError){
                throw new Error(uploadError.message);
            }

            const { data } = supabase.storage.from("uploads").getPublicUrl(filename);

            res.json({ url: data.publicUrl });

        }catch(e){
            console.error("[upload]", e);
            res.status(500).json({ error: "Upload gagal." });

        }

    });

});

/* Server lokal hanya jalan bila file ini dieksekusi langsung
   (npm start / node app.js). Di Vercel, app dipakai lewat api/index.js. */
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server lokal jalan di http://localhost:${PORT}`));
}

module.exports = app;
