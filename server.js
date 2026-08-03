/* ==========================================================
   ENTRY POINT UNTUK DEVELOPMENT LOKAL
   Jalankan dengan: npm start  (atau: node server.js)
   Tidak dipakai oleh Vercel -- Vercel pakai api/index.js
========================================================== */

const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log(`Server lokal jalan di http://localhost:${PORT}`);
    console.log(`Portofolio : http://localhost:${PORT}/index.html`);
    console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
});
