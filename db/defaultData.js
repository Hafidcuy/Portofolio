/* ==========================================================
   DATA DEFAULT (SEED)
   Dipakai untuk mengisi database saat pertama kali dijalankan,
   dan untuk fitur "Reset ke Default" di admin panel.
========================================================== */

module.exports = {

    profile: {
        name: "Moch. Hafid Putra R.",
        role: "Pelajar Rekayasa Perangkat Lunak",
        bio: "Saya adalah seorang pelajar yang memiliki minat pada dunia pemrograman, website, IoT, dan desain UI/UX.",
        photo: "logo/WhatsApp Image 2026-07-27 at 07.09.20.jpeg",
        school: "SMK Krian 1 Sidoarjo",
        major: "Rekayasa Perangkat Lunak",
        address: "Wonoayu, Sidoarjo, Jawa Timur"
    },

    skills: [
        { icon: "fab fa-html5", name: "HTML", badge: "Frontend", desc: "Struktur dan markup halaman web", percent: 85 },
        { icon: "fab fa-css3-alt", name: "CSS", badge: "Frontend", desc: "Styling, layout, dan animasi web", percent: 70 },
        { icon: "fab fa-js", name: "JavaScript", badge: "Frontend", desc: "Logika dan interaktivitas website", percent: 15 }
    ],

    projects: [
        {
            img: "logo/Screenshot (2).png",
            title: "Website Warung",
            desc: "Website penjualan makanan dan minuman menggunakan HTML, CSS, dan JavaScript.",
            github: "https://github.com/Hafidcuy/warungmami",
            view: "https://warungmami.vercel.app/index.html"
        },
        {
            img: "logo/Screenshot (4).png",
            title: "Website Perpustakaan",
            desc: "Website katalog buku dan manga dengan fitur pencarian.",
            github: "https://github.com/Hafidcuy/SkaFarm-UI",
            view: "https://cowoksoftspoken.github.io/SkaFarm-UI/"
        },
        {
            img: "logo/Screenshot (3).png",
            title: "SkaFarm",
            desc: "Website pertanian modern yang berfokus pada UI/UX.",
            github: "https://github.com/Hafidcuy/warungmami",
            view: "https://warungmami.vercel.app/perpus.html"
        }
    ],

    certificates: [
        {
            img: "/logo/{E1E605C0-48E6-4593-9A92-E8D8DD39EC19}.png",
            title: "Fitcom",
            desc: "Lomba Pemrograman Web",
            link: ""
        }
    ],

    experience: [
        {
            icon: "fas fa-briefcase",
            year: "2025",
            title: "Praktik Kerja Lapangan (PKL)",
            org: "UPTD RPH & Pasar Hewan Krian",
            desc: "Membantu proses digitalisasi dengan membuat website profil, melakukan dokumentasi kegiatan, instalasi aplikasi, scanning dokumen, dan administrasi."
        },
        {
            icon: "fas fa-code",
            year: "2025 - Sekarang",
            title: "Web Developer",
            org: "Project Pribadi",
            desc: "Mengembangkan berbagai website menggunakan HTML, CSS, JavaScript, PHP, dan MySQL seperti Website Warung, Website Perpustakaan, serta SkaFarm."
        },
        {
            icon: "fas fa-microchip",
            year: "2024-2025",
            title: "Pengalaman Lapangan",
            org: "Osis Skarisa",
            desc: "Aktif Selama Satu Tahun Sebagai Anggota Osis Skarisa"
        }
    ],

    contact: {
        email: "tulrama67@gmail.com",
        instagram: "@ramatul_1357",
        instagramUrl: "https://www.instagram.com/ramatul_1357/",
        github: "github.com/Hafidcuy",
        githubUrl: "https://github.com/Hafidcuy"
    },

    settings: {
        cursorFxDefault: false
    }

};
