/* ==========================================================
   KLIEN SUPABASE (dipakai server-side saja)
   Memakai SERVICE ROLE KEY -> otomatis lewati RLS.
   JANGAN PERNAH kirim key ini ke browser/klien.
========================================================== */

require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if(!supabaseUrl || !supabaseServiceKey){
    console.warn(
        "[PERINGATAN] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diatur.\n" +
        "Cek file .env (lokal) atau Environment Variables di Vercel Project Settings."
    );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
});

module.exports = supabase;
