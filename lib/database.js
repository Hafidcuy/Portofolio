/* ==========================================================
   LAPISAN DATA -- Supabase (Postgres) versi pengganti SQLite
========================================================== */

const supabase = require("./supabaseClient");
const DEFAULT_DATA = require("./defaultData");

function must(res){
    if(res.error) throw new Error(res.error.message);
    return res.data;
}

/* ==========================
   MAPPER ROW -> JSON (camelCase utk frontend)
========================== */

function rowToSkill(r){ return { id:r.id, icon:r.icon, name:r.name, badge:r.badge, desc:r.description, percent:r.percent }; }
function rowToProject(r){ return { id:r.id, img:r.img, title:r.title, desc:r.description, github:r.github, view:r.view }; }
function rowToCert(r){ return { id:r.id, img:r.img, title:r.title, desc:r.description, link:r.link }; }
function rowToExp(r){ return { id:r.id, icon:r.icon, year:r.year, title:r.title, org:r.org, desc:r.description }; }

/* ==========================
   BACA SEMUA DATA (untuk index.html & dashboard admin)
========================== */

async function getFullData(){

    const [profileRes, skillsRes, projectsRes, certRes, expRes, contactRes, settingsRes] = await Promise.all([
        supabase.from("profile").select("*").eq("id", 1).maybeSingle(),
        supabase.from("skills").select("*").order("sort_order"),
        supabase.from("projects").select("*").order("sort_order"),
        supabase.from("certificates").select("*").order("sort_order"),
        supabase.from("experience").select("*").order("sort_order"),
        supabase.from("contact").select("*").eq("id", 1).maybeSingle(),
        supabase.from("settings").select("*").eq("id", 1).maybeSingle()
    ]);

    const profile = must(profileRes) || {};
    const contact = must(contactRes) || {};
    const settingsRow = must(settingsRes) || {};

    return {
        profile: {
            name: profile.name, role: profile.role, bio: profile.bio, photo: profile.photo,
            school: profile.school, major: profile.major, address: profile.address
        },
        skills: (must(skillsRes) || []).map(rowToSkill),
        projects: (must(projectsRes) || []).map(rowToProject),
        certificates: (must(certRes) || []).map(rowToCert),
        experience: (must(expRes) || []).map(rowToExp),
        contact: {
            email: contact.email, instagram: contact.instagram, instagramUrl: contact.instagram_url,
            github: contact.github, githubUrl: contact.github_url
        },
        settings: { cursorFxDefault: !!settingsRow.cursor_fx_default }
    };

}

/* ==========================
   PROFIL / KONTAK / SETTINGS
========================== */

async function updateProfile(p){
    const res = await supabase.from("profile")
        .update({ name:p.name, role:p.role, bio:p.bio, photo:p.photo, school:p.school, major:p.major, address:p.address })
        .eq("id", 1);
    must(res);
}

async function updateContact(c){
    const res = await supabase.from("contact")
        .update({ email:c.email, instagram:c.instagram, instagram_url:c.instagramUrl, github:c.github, github_url:c.githubUrl })
        .eq("id", 1);
    must(res);
}

async function updateSettings(s){
    const res = await supabase.from("settings")
        .update({ cursor_fx_default: !!s.cursorFxDefault })
        .eq("id", 1);
    must(res);
}

/* ==========================
   CRUD GENERIK: skills / projects / certificates / experience
========================== */

async function nextSortOrder(table){
    const res = await supabase.from(table).select("sort_order").order("sort_order", { ascending: false }).limit(1);
    const rows = must(res);
    return rows.length ? rows[0].sort_order + 1 : 0;
}

async function insertRow(table, values){
    const order = await nextSortOrder(table);
    const res = await supabase.from(table).insert(Object.assign({}, values, { sort_order: order })).select().single();
    return must(res);
}

async function updateRow(table, id, values){
    const res = await supabase.from(table).update(values).eq("id", id).select().single();
    return must(res);
}

async function deleteRow(table, id){
    const res = await supabase.from(table).delete().eq("id", id);
    must(res);
}

/* ==========================
   AUTH: admin & sessions
========================== */

async function getAdminRow(){
    const res = await supabase.from("admin").select("*").eq("id", 1).maybeSingle();
    return must(res);
}

async function updateAdminPasswordHash(hash){
    const res = await supabase.from("admin").update({ password_hash: hash }).eq("id", 1);
    must(res);
}

async function createSession(token){
    const res = await supabase.from("sessions").insert({ token, created_at: new Date().toISOString() });
    must(res);
}

async function findSession(token){
    const res = await supabase.from("sessions").select("*").eq("token", token).maybeSingle();
    return must(res);
}

async function deleteSession(token){
    const res = await supabase.from("sessions").delete().eq("token", token);
    must(res);
}

/* ==========================
   SEED / RESET / IMPORT
========================== */

async function seedAll(data){

    const p = data.profile;
    must(await supabase.from("profile").upsert({
        id: 1, name:p.name, role:p.role, bio:p.bio, photo:p.photo, school:p.school, major:p.major, address:p.address
    }));

    must(await supabase.from("skills").delete().gte("id", 0));
    if(data.skills.length){
        const rows = data.skills.map((s,i)=> ({ icon:s.icon, name:s.name, badge:s.badge, description:s.desc, percent:s.percent, sort_order:i }));
        must(await supabase.from("skills").insert(rows));
    }

    must(await supabase.from("projects").delete().gte("id", 0));
    if(data.projects.length){
        const rows = data.projects.map((pr,i)=> ({ img:pr.img, title:pr.title, description:pr.desc, github:pr.github, view:pr.view, sort_order:i }));
        must(await supabase.from("projects").insert(rows));
    }

    must(await supabase.from("certificates").delete().gte("id", 0));
    if(data.certificates.length){
        const rows = data.certificates.map((c,i)=> ({ img:c.img, title:c.title, description:c.desc, link:c.link || "", sort_order:i }));
        must(await supabase.from("certificates").insert(rows));
    }

    must(await supabase.from("experience").delete().gte("id", 0));
    if(data.experience.length){
        const rows = data.experience.map((x,i)=> ({ icon:x.icon, year:x.year, title:x.title, org:x.org, description:x.desc, sort_order:i }));
        must(await supabase.from("experience").insert(rows));
    }

    const c = data.contact;
    must(await supabase.from("contact").upsert({
        id: 1, email:c.email, instagram:c.instagram, instagram_url:c.instagramUrl, github:c.github, github_url:c.githubUrl
    }));

    must(await supabase.from("settings").upsert({
        id: 1, cursor_fx_default: !!(data.settings && data.settings.cursorFxDefault)
    }));

}

module.exports = {
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
};
