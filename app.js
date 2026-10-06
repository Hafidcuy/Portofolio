/* ==========================================================
   EXPRESS APP -- semua route API
   Dipakai oleh:
   - api/index.js (untuk Vercel, serverless)
   - server.js (untuk development lokal, node server.js)
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
    seedAll,
    DEFAULT_DATA,
    rowToSkill,
    rowToProject,
    rowToCert,
    rowToExp
} = require("./lib/database");

const app = express();

app.use(express.json());

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

app.post("/api/login", async (req, res)=>{

    try{

        const { password } = req.body || {};
        const admin = await getAdminRow();

        if(!admin || !bcrypt.compareSync(password || "", admin.password_hash)){
            return res.status(401).json({ error: "Password salah." });
        }

        const token = generateToken();
        await createSession(token);

        res.json({ token });

    }catch(err){

        res.status(500).json({ error: err.message || "Gagal login." });

    }

});

app.post("/api/logout", requireAuth, async (req, res)=>{

    try{
        const token = req.headers.authorization.slice(7);
        await deleteSession(token);
        res.json({ ok: true });
    }catch(err){
        res.status(500).json({ error: err.message || "Gagal logout." });
    }

});

app.post("/api/change-password", requireAuth, async (req, res)=>{

    try{

        const { oldPassword, newPassword } = req.body || {};
        const admin = await getAdminRow();

        if(!bcrypt.compareSync(oldPassword || "", admin.password_hash)){
            return res.status(400).json({ error: "Password lama salah." });
        }

        if(!newPassword || newPassword.length < 4){
            return res.status(400).json({ error: "Password baru minimal 4 karakter." });
        }

        const hash = bcrypt.hashSync(newPassword, 10);
        await updateAdminPasswordHash(hash);

        res.json({ ok: true });

    }catch(err){

        res.status(500).json({ error: err.message || "Gagal mengubah password." });

    }

});

/* ==========================
   READ PUBLIK
========================== */

app.get("/api/portfolio", async (req, res)=>{

    try{
        res.json(await getFullData());
    }catch(err){
        res.status(500).json({ error: err.message || "Gagal memuat data." });
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
        res.status(500).json({ error: err.message || "Gagal menyimpan profil." });
    }

});

app.put("/api/contact", requireAuth, async (req, res)=>{

    try{
        await updateContact(req.body || {});
        res.json((await getFullData()).contact);
    }catch(err){
        res.status(500).json({ error: err.message || "Gagal menyimpan kontak." });
    }

});

app.put("/api/settings", requireAuth, async (req, res)=>{

    try{
        await updateSettings(req.body || {});
        res.json((await getFullData()).settings);
    }catch(err){
        res.status(500).json({ error: err.message || "Gagal menyimpan pengaturan." });
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

            res.status(500).json({ error: err.message || "Gagal menyimpan data." });

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

            res.status(500).json({ error: err.message || "Gagal memperbarui data." });

        }

    });

    app.delete(`/api/${name}/:id`, requireAuth, async (req, res)=>{

        try{

            await deleteRow(table, req.params.id);
            res.json({ ok: true });

        }catch(err){

            res.status(500).json({ error: err.message || "Gagal menghapus data." });

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
    { col: "view", key: "view" }
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
        res.status(500).json({ error: err.message || "Gagal mengekspor data." });
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
        res.status(500).json({ error: err.message || "Gagal mereset data." });
    }

});

/* ==========================
   UPLOAD GAMBAR (ke Supabase Storage)
========================== */

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb)=>{
        if(!file.mimetype.startsWith("image/")){
            return cb(new Error("File harus berupa gambar."));
        }
        cb(null, true);
    }
});

app.post("/api/upload", requireAuth, (req, res)=>{

    upload.single("image")(req, res, async (err)=>{

        if(err){
            return res.status(400).json({ error: err.message });
        }

        if(!req.file){
            return res.status(400).json({ error: "Tidak ada file yang diunggah." });
        }

        try{

            const ext = (req.file.originalname.split(".").pop() || "jpg").toLowerCase();
            const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from("uploads")
                .upload(filename, req.file.buffer, { contentType: req.file.mimetype, upsert: false });

            if(uploadError){
                throw new Error(uploadError.message);
            }

            const { data } = supabase.storage.from("uploads").getPublicUrl(filename);

            res.json({ url: data.publicUrl });

        }catch(e){

            res.status(500).json({ error: e.message || "Upload gagal." });

        }

    });

});

module.exports = app;
