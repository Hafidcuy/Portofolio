/* ==========================================================
   SERVER PORTOFOLIO
   Express + SQLite (database asli, file portfolio.db)
========================================================== */

const path = require("path");
const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");

const {
    db,
    getFullData,
    seedAll,
    DEFAULT_DATA,
    rowToSkill,
    rowToProject,
    rowToCert,
    rowToExp
} = require("./db/database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/* ==========================
   AUTH
========================== */

function generateToken(){
    return crypto.randomBytes(32).toString("hex");
}

function requireAuth(req, res, next){

    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if(!token){
        return res.status(401).json({ error: "Unauthorized" });
    }

    const session = db.prepare("SELECT * FROM sessions WHERE token = ?").get(token);

    if(!session){
        return res.status(401).json({ error: "Unauthorized" });
    }

    next();

}

app.post("/api/login", (req, res)=>{

    const { password } = req.body || {};
    const admin = db.prepare("SELECT * FROM admin WHERE id = 1").get();

    if(!admin || !bcrypt.compareSync(password || "", admin.passwordHash)){
        return res.status(401).json({ error: "Password salah." });
    }

    const token = generateToken();
    db.prepare("INSERT INTO sessions (token, createdAt) VALUES (?, ?)").run(token, new Date().toISOString());

    res.json({ token });

});

app.post("/api/logout", requireAuth, (req, res)=>{

    const token = req.headers.authorization.slice(7);
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    res.json({ ok: true });

});

app.post("/api/change-password", requireAuth, (req, res)=>{

    const { oldPassword, newPassword } = req.body || {};
    const admin = db.prepare("SELECT * FROM admin WHERE id = 1").get();

    if(!bcrypt.compareSync(oldPassword || "", admin.passwordHash)){
        return res.status(400).json({ error: "Password lama salah." });
    }

    if(!newPassword || newPassword.length < 4){
        return res.status(400).json({ error: "Password baru minimal 4 karakter." });
    }

    const hash = bcrypt.hashSync(newPassword, 10);
    db.prepare("UPDATE admin SET passwordHash = ? WHERE id = 1").run(hash);

    res.json({ ok: true });

});

/* ==========================
   READ PUBLIK (dipakai index.html)
========================== */

app.get("/api/portfolio", (req, res)=>{
    res.json(getFullData());
});

/* ==========================
   PROFIL / KONTAK / SETTINGS
========================== */

app.put("/api/profile", requireAuth, (req, res)=>{

    const p = req.body || {};

    db.prepare(`UPDATE profile SET name=?,role=?,bio=?,photo=?,school=?,major=?,address=? WHERE id=1`)
        .run(p.name, p.role, p.bio, p.photo, p.school, p.major, p.address);

    res.json(getFullData().profile);

});

app.put("/api/contact", requireAuth, (req, res)=>{

    const c = req.body || {};

    db.prepare(`UPDATE contact SET email=?,instagram=?,instagramUrl=?,github=?,githubUrl=? WHERE id=1`)
        .run(c.email, c.instagram, c.instagramUrl, c.github, c.githubUrl);

    res.json(getFullData().contact);

});

app.put("/api/settings", requireAuth, (req, res)=>{

    const s = req.body || {};

    db.prepare("UPDATE settings SET cursorFxDefault = ? WHERE id = 1").run(s.cursorFxDefault ? 1 : 0);

    res.json(getFullData().settings);

});

/* ==========================
   CRUD GENERIK: skills, projects, certificates, experience
========================== */

function setupCrud(name, table, columns, rowMapper){

    app.post(`/api/${name}`, requireAuth, (req, res)=>{

        const body = req.body || {};
        const maxRow = db.prepare(`SELECT MAX(sort_order) as m FROM ${table}`).get();
        const nextOrder = (maxRow.m === null ? -1 : maxRow.m) + 1;

        const cols = columns.map(c=>c.col);
        const placeholders = cols.map(()=>"?").join(",");
        const stmt = db.prepare(`INSERT INTO ${table} (${cols.join(",")}, sort_order) VALUES (${placeholders}, ?)`);
        const values = columns.map(c=> body[c.key]);

        const info = stmt.run(...values, nextOrder);
        const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(info.lastInsertRowid);

        res.json(rowMapper(row));

    });

    app.put(`/api/${name}/:id`, requireAuth, (req, res)=>{

        const body = req.body || {};
        const setClause = columns.map(c=>`${c.col} = ?`).join(",");
        const values = columns.map(c=> body[c.key]);

        db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`).run(...values, req.params.id);
        const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);

        if(!row){
            return res.status(404).json({ error: "Data tidak ditemukan." });
        }

        res.json(rowMapper(row));

    });

    app.delete(`/api/${name}/:id`, requireAuth, (req, res)=>{

        db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
        res.json({ ok: true });

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

app.get("/api/export", requireAuth, (req, res)=>{
    res.json(getFullData());
});

app.post("/api/import", requireAuth, (req, res)=>{

    try{
        seedAll(req.body);
        res.json(getFullData());
    }catch(e){
        res.status(400).json({ error: "Data tidak valid." });
    }

});

app.post("/api/reset", requireAuth, (req, res)=>{
    seedAll(DEFAULT_DATA);
    res.json(getFullData());
});

/* ==========================
   UPLOAD GAMBAR
========================== */

const storage = multer.diskStorage({
    destination: (req, file, cb)=> cb(null, path.join(__dirname, "uploads")),
    filename: (req, file, cb)=>{
        const ext = path.extname(file.originalname);
        const safeName = Date.now() + "-" + Math.round(Math.random() * 1e6) + ext;
        cb(null, safeName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb)=>{
        if(!file.mimetype.startsWith("image/")){
            return cb(new Error("File harus berupa gambar."));
        }
        cb(null, true);
    }
});

app.post("/api/upload", requireAuth, (req, res)=>{

    upload.single("image")(req, res, (err)=>{

        if(err){
            return res.status(400).json({ error: err.message });
        }

        if(!req.file){
            return res.status(400).json({ error: "Tidak ada file yang diunggah." });
        }

        res.json({ url: `/uploads/${req.file.filename}` });

    });

});

/* ==========================
   STATIC FILES
========================== */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

/* ==========================
   START SERVER
========================== */

app.listen(PORT, ()=>{
    console.log(`Server portofolio jalan di http://localhost:${PORT}`);
});
