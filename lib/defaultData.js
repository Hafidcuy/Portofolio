/* ==========================================================
   DATA DEFAULT (SEED) - PROJECTS UPDATED OCTOBER 2026
========================================================== */

module.exports = {
    profile: {
        name: "Moch. Hafid Putra R.", role: "Pelajar Rekayasa Perangkat Lunak",
        bio: "Saya adalah seorang pelajar yang memiliki minat pada dunia pemrograman, website, IoT, dan desain UI/UX.",
        photo: "logo/WhatsApp Image 2026-07-27 at 07.09.20.jpeg", school: "SMK Krian 1 Sidoarjo",
        major: "Rekayasa Perangkat Lunak", address: "Wonoayu, Sidoarjo, Jawa Timur"
    },
    skills: [
        { icon: "fab fa-html5", name: "HTML", badge: "Frontend", desc: "Struktur dan markup halaman web", percent: 85 },
        { icon: "fab fa-css3-alt", name: "CSS", badge: "Frontend", desc: "Styling, layout, dan animasi web", percent: 70 },
        { icon: "fab fa-js", name: "JavaScript", badge: "Frontend", desc: "Logika dan interaktivitas website", percent: 75 }
    ],
    projects: [
        { img: "logo/Screenshot (2).png", title: "Moniroting", desc: "Dashboard monitoring website untuk memantau uptime, latensi, SSL, dan status 15 project secara real-time.", github: "https://github.com/Hafidcuy/website-monitoring", view: "https://moniroting.vercel.app", tag: "Dashboard" },
        { img: "logo/Screenshot (2).png", title: "Warungmami", desc: "Website toko makanan dengan halaman katalog, keranjang, login, admin panel, dan endpoint API.", github: "https://github.com/Hafidcuy/warungmami", view: "https://warungmami.vercel.app", tag: "E-Commerce" },
        { img: "logo/Screenshot (3).png", title: "ML-3D", desc: "Eksperimen visual 3D interaktif yang menggabungkan desain antarmuka modern dan animasi web.", github: "https://github.com/Hafidcuy/ML-3D", view: "https://ml3d-tau.vercel.app", tag: "Eksperimen" },
        { img: "logo/Screenshot (4).png", title: "Portofolio Personal", desc: "Website portofolio dinamis dengan admin panel, Supabase, filter project, PWA, dan mode gelap.", github: "https://github.com/Hafidcuy/Portofolio", view: "https://portofoliowebhafid.vercel.app", tag: "Portfolio" },
        { img: "logo/Screenshot (4).png", title: "UPTDRPH", desc: "Website profil dan informasi layanan UPTD RPH & Pasar Hewan Krian.", github: "https://github.com/Hafidcuy/UPTDRPH", view: "https://uptdrph.vercel.app", tag: "Website" },
        { img: "logo/Screenshot (4).png", title: "SkaFarm UI", desc: "Eksplorasi desain UI bertema pertanian modern dengan layout informatif dan responsive.", github: "https://github.com/Hafidcuy/SkaFarm-UI", view: "https://hafidcuy.github.io/SkaFarm-UI/", tag: "UI/UX" }
    ],
    certificates: [{ img: "/logo/{E1E605C0-48E6-4593-9A92-E8D8DD39EC19}.png", title: "Fitcom", desc: "Lomba Pemrograman Web", link: "" }],
    experience: [
        { icon: "fas fa-briefcase", year: "2025", title: "Praktik Kerja Lapangan (PKL)", org: "UPTD RPH & Pasar Hewan Krian", desc: "Membantu proses digitalisasi dengan membuat website profil, dokumentasi, instalasi aplikasi, scanning dokumen, dan administrasi." },
        { icon: "fas fa-code", year: "2025 - Sekarang", title: "Web Developer", org: "Project Pribadi", desc: "Mengembangkan berbagai website menggunakan HTML, CSS, JavaScript, PHP, dan MySQL." },
        { icon: "fas fa-microchip", year: "2024-2025", title: "Pengalaman Lapangan", org: "Osis Skarisa", desc: "Aktif selama satu tahun sebagai anggota Osis Skarisa." }
    ],
    contact: { email: "tulrama67@gmail.com", instagram: "@ramatul_1357", instagramUrl: "https://www.instagram.com/ramatul_1357/", github: "github.com/Hafidcuy", githubUrl: "https://github.com/Hafidcuy" },
    settings: { cursorFxDefault: false }
};
