/* ==========================================================
   LAPISAN DATABASE (SQLite asli, file portfolio.db)
   Menggunakan modul bawaan node:sqlite (Node.js >= 22.5)
========================================================== */

const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const bcrypt = require("bcryptjs");
const DEFAULT_DATA = require("./defaultData");

const DB_PATH = path.join(__dirname, "..", "portfolio.db");
const db = new DatabaseSync(DB_PATH);

db.exec(`
CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT, role TEXT, bio TEXT, photo TEXT,
    school TEXT, major TEXT, address TEXT
);

CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    icon TEXT, name TEXT, badge TEXT, description TEXT,
    percent INTEGER, sort_order INTEGER
);

CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    img TEXT, title TEXT, description TEXT,
    github TEXT, view TEXT, sort_order INTEGER
);

CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    img TEXT, title TEXT, description TEXT,
    link TEXT, sort_order INTEGER
);

CREATE TABLE IF NOT EXISTS experience (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    icon TEXT, year TEXT, title TEXT, org TEXT,
    description TEXT, sort_order INTEGER
);

CREATE TABLE IF NOT EXISTS contact (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    email TEXT, instagram TEXT, instagramUrl TEXT,
    github TEXT, githubUrl TEXT
);

CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    cursorFxDefault INTEGER
);

CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    passwordHash TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    createdAt TEXT
);
`);

/* ==========================
   MAPPER ROW -> OBJECT JSON
========================== */

function rowToSkill(r){ return { id:r.id, icon:r.icon, name:r.name, badge:r.badge, desc:r.description, percent:r.percent }; }
function rowToProject(r){ return { id:r.id, img:r.img, title:r.title, desc:r.description, github:r.github, view:r.view }; }
function rowToCert(r){ return { id:r.id, img:r.img, title:r.title, desc:r.description, link:r.link }; }
function rowToExp(r){ return { id:r.id, icon:r.icon, year:r.year, title:r.title, org:r.org, desc:r.description }; }

/* ==========================
   SEED / RESET
========================== */

function seedAll(data){

    const p = data.profile;
    db.prepare(`INSERT OR REPLACE INTO profile (id,name,role,bio,photo,school,major,address) VALUES (1,?,?,?,?,?,?,?)`)
        .run(p.name, p.role, p.bio, p.photo, p.school, p.major, p.address);

    db.exec("DELETE FROM skills");
    const skillStmt = db.prepare(`INSERT INTO skills (icon,name,badge,description,percent,sort_order) VALUES (?,?,?,?,?,?)`);
    data.skills.forEach((s,i)=> skillStmt.run(s.icon, s.name, s.badge, s.desc, s.percent, i));

    db.exec("DELETE FROM projects");
    const projStmt = db.prepare(`INSERT INTO projects (img,title,description,github,view,sort_order) VALUES (?,?,?,?,?,?)`);
    data.projects.forEach((pr,i)=> projStmt.run(pr.img, pr.title, pr.desc, pr.github, pr.view, i));

    db.exec("DELETE FROM certificates");
    const certStmt = db.prepare(`INSERT INTO certificates (img,title,description,link,sort_order) VALUES (?,?,?,?,?)`);
    data.certificates.forEach((c,i)=> certStmt.run(c.img, c.title, c.desc, c.link || "", i));

    db.exec("DELETE FROM experience");
    const expStmt = db.prepare(`INSERT INTO experience (icon,year,title,org,description,sort_order) VALUES (?,?,?,?,?,?)`);
    data.experience.forEach((x,i)=> expStmt.run(x.icon, x.year, x.title, x.org, x.desc, i));

    const c = data.contact;
    db.prepare(`INSERT OR REPLACE INTO contact (id,email,instagram,instagramUrl,github,githubUrl) VALUES (1,?,?,?,?,?)`)
        .run(c.email, c.instagram, c.instagramUrl, c.github, c.githubUrl);

    db.prepare(`INSERT OR REPLACE INTO settings (id,cursorFxDefault) VALUES (1,?)`)
        .run(data.settings && data.settings.cursorFxDefault ? 1 : 0);

}

function seedIfEmpty(){

    const profileRow = db.prepare("SELECT * FROM profile WHERE id = 1").get();
    if(!profileRow){
        seedAll(DEFAULT_DATA);
    }

    const adminRow = db.prepare("SELECT * FROM admin WHERE id = 1").get();
    if(!adminRow){
        const hash = bcrypt.hashSync("admin123", 10);
        db.prepare("INSERT INTO admin (id, passwordHash) VALUES (1, ?)").run(hash);
    }

    const settingsRow = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    if(!settingsRow){
        db.prepare("INSERT INTO settings (id, cursorFxDefault) VALUES (1, 0)").run();
    }

}

seedIfEmpty();

/* ==========================
   READ AGGREGATOR
========================== */

function getFullData(){

    const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get();
    const skills = db.prepare("SELECT * FROM skills ORDER BY sort_order").all().map(rowToSkill);
    const projects = db.prepare("SELECT * FROM projects ORDER BY sort_order").all().map(rowToProject);
    const certificates = db.prepare("SELECT * FROM certificates ORDER BY sort_order").all().map(rowToCert);
    const experience = db.prepare("SELECT * FROM experience ORDER BY sort_order").all().map(rowToExp);
    const contact = db.prepare("SELECT * FROM contact WHERE id = 1").get();
    const settingsRow = db.prepare("SELECT * FROM settings WHERE id = 1").get();

    return {
        profile: profile ? {
            name: profile.name, role: profile.role, bio: profile.bio, photo: profile.photo,
            school: profile.school, major: profile.major, address: profile.address
        } : {},
        skills, projects, certificates, experience,
        contact: contact ? {
            email: contact.email, instagram: contact.instagram, instagramUrl: contact.instagramUrl,
            github: contact.github, githubUrl: contact.githubUrl
        } : {},
        settings: { cursorFxDefault: !!(settingsRow && settingsRow.cursorFxDefault) }
    };

}

module.exports = {
    db,
    getFullData,
    seedAll,
    DEFAULT_DATA,
    rowToSkill,
    rowToProject,
    rowToCert,
    rowToExp
};
