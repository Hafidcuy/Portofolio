(async function(){
/* ==========================
   MUAT DATA DARI SERVER/DATABASE
   (GET /api/portfolio)
========================== */

async function loadPortfolioData(){

    try{

        const res = await fetch("/api/portfolio");

        if(!res.ok) throw new Error("Gagal memuat data dari server");

        return await res.json();

    }catch(e){

        console.warn("Tidak bisa memuat data dari server, memakai konten default di HTML.", e);

        return null;

    }

}

function renderProfile(data){

    const p = data.profile;

    const nameEl = document.querySelector(".left h1");
    const roleEl = document.querySelector(".left h2");
    const bioEl = document.querySelector(".left p");
    const heroImg = document.querySelector(".profile-card img");
    const aboutSub = document.querySelector("#about .sub-title");
    const infoCards = document.querySelectorAll("#about .info .card p");

    if(nameEl) nameEl.textContent = p.name;
    if(roleEl) roleEl.textContent = p.role;
    if(bioEl) bioEl.textContent = p.bio;
    if(heroImg) heroImg.src = p.photo;
    if(aboutSub) aboutSub.textContent = p.bio;

    if(infoCards[0]) infoCards[0].textContent = p.school;
    if(infoCards[1]) infoCards[1].textContent = p.major;
    if(infoCards[2]) infoCards[2].textContent = p.address;

}

function renderSkills(data){

    const container = document.querySelector(".skills");

    if(!container) return;

    container.innerHTML = "";

    data.skills.forEach(skill=>{

        const box = document.createElement("div");
        box.className = "box";

        box.innerHTML = `
            <div class="box-header">
                <div class="box-title">
                    <i class="${skill.icon}"></i>
                    <h3>${skill.name}</h3>
                </div>
                <span class="skill-badge">${skill.badge}</span>
            </div>
            <p class="box-desc">${skill.desc}</p>
            <div class="proficiency">
                <span>Penguasaan</span>
                <span class="percent">${skill.percent}%</span>
            </div>
            <div class="progress-track">
                <div class="progress-fill" style="width:${skill.percent}%;"></div>
            </div>
        `;

        container.appendChild(box);

    });

}

function renderProjects(data){

    const container = document.querySelector("#project .projects");

    if(!container) return;

    container.innerHTML = "";

    data.projects.forEach(proj=>{

        const card = document.createElement("div");
        card.className = "project-card";

        card.innerHTML = `
            <img src="${proj.img}" alt="">
            <h3>${proj.title}</h3>
            <p>${proj.desc}</p>
            <p class="button-github">
                <a href="${proj.github}" target="_blank">Project</a>
                <a href="${proj.view}" target="_blank">view</a>
            </p>
        `;

        container.appendChild(card);

    });

}

function renderCertificates(data){

    const container = document.querySelector("#certificate .projects");

    if(!container) return;

    container.innerHTML = "";

    data.certificates.forEach(cert=>{

        const a = document.createElement("a");
        a.href = cert.link || "#";
        a.target = "_blank";
        a.className = "project-card";

        a.innerHTML = `
            <img class="gambar-sertif" src="${cert.img}" alt="">
            <h3>${cert.title}</h3>
            <p>${cert.desc}</p>
        `;

        container.appendChild(a);

    });

}

function renderExperience(data){

    const container = document.querySelector(".timeline");

    if(!container) return;

    container.innerHTML = "";

    data.experience.forEach(exp=>{

        const item = document.createElement("div");
        item.className = "timeline-item";

        item.innerHTML = `
            <div class="timeline-icon"><i class="${exp.icon}"></i></div>
            <div class="timeline-content">
                <span class="year">${exp.year}</span>
                <h3>${exp.title}</h3>
                <h4>${exp.org}</h4>
                <p>${exp.desc}</p>
            </div>
        `;

        container.appendChild(item);

    });

}

function renderContact(data){

    const c = data.contact;
    const contactCard = document.querySelector(".contact-card");

    if(!contactCard) return;

    contactCard.innerHTML = `
        <p><i class="fas fa-envelope"></i> Email : <a href="mailto:${c.email}">${c.email}</a></p>
        <p><i class="fab fa-instagram"></i> Instagram : <a href="${c.instagramUrl}" target="_blank">${c.instagram}</a></p>
        <p><i class="fab fa-github"></i> GitHub : <a href="${c.githubUrl}" target="_blank">${c.github}</a></p>
    `;

}

const portfolioData = await loadPortfolioData();

if(portfolioData){

    renderProfile(portfolioData);
    renderSkills(portfolioData);
    renderProjects(portfolioData);
    renderCertificates(portfolioData);
    renderExperience(portfolioData);
    renderContact(portfolioData);

    if(localStorage.getItem("cursorFx") === null && portfolioData.settings && portfolioData.settings.cursorFxDefault){

        localStorage.setItem("cursorFx", "on");

    }

}


/* ==========================
   AMBIL ELEMENT
========================== */

const darkBtn = document.getElementById("darkBtn");
const themeIcon = document.getElementById("themeIcon");

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");


/* ==========================
   CEK TEMA SAAT HALAMAN DIBUKA
========================== */

if(localStorage.getItem("theme") === "dark"){

    document.body.classList.add("dark");

    themeIcon.src = "logo/sun.png";

}else{

    themeIcon.src = "logo/moon.png";

}


/* ==========================
   DARK MODE
========================== */

darkBtn.addEventListener("click", ()=>{

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        themeIcon.src="logo/sun.png";

        localStorage.setItem("theme","dark");

    }else{

        themeIcon.src="logo/moon.png";

        localStorage.setItem("theme","light");

    }

});


/* ==========================
   MENU RESPONSIVE
========================== */

menuToggle.addEventListener("click",()=>{

    navMenu.classList.toggle("active");

});


/* ==========================
   TUTUP MENU SAAT LINK DIKLIK
========================== */

const menuLink = document.querySelectorAll("#navMenu a");

menuLink.forEach(link=>{

    link.addEventListener("click",()=>{

        navMenu.classList.remove("active");

    });

});


/* ==========================
   TUTUP MENU SAAT LAYAR BESAR
========================== */

window.addEventListener("resize",()=>{

    if(window.innerWidth > 768){

        navMenu.classList.remove("active");

    }

});



/* ==========================
   SCROLL REVEAL
========================== */

const revealTargets = document.querySelectorAll(
    ".card, .box, .project-card, .timeline-item, .contact-card p"
);

revealTargets.forEach((el, i)=>{

    el.classList.add("reveal");

    el.style.transitionDelay = `${(i % 6) * 80}ms`;

});

const revealObserver = new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.classList.add("active");

            revealObserver.unobserve(entry.target);

        }

    });

},{ threshold:0.15 });

revealTargets.forEach(el=>revealObserver.observe(el));


/* ==========================
   ANIMASI SKILL BAR
========================== */

const progressFills = document.querySelectorAll(".progress-fill");

progressFills.forEach(fill=>{

    fill.dataset.target = fill.style.width;

    fill.style.width = "0%";

});

const skillObserver = new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.style.width = entry.target.dataset.target;

            skillObserver.unobserve(entry.target);

        }

    });

},{ threshold:0.4 });

progressFills.forEach(fill=>skillObserver.observe(fill));


/* ==========================
   NAVBAR SAAT SCROLL
========================== */

const navbar = document.querySelector("nav");

window.addEventListener("scroll", ()=>{

    navbar.classList.toggle("scrolled", window.scrollY > 40);

});


/* ==========================
   SCROLLSPY MENU AKTIF
========================== */

const spySections = document.querySelectorAll("section[id], h1[id]");
const navLinks = document.querySelectorAll("#navMenu a");

function updateActiveNav(){

    const scrollPos = window.scrollY + 140;

    let currentId = "home";

    spySections.forEach(sec=>{

        if(sec.offsetTop <= scrollPos){

            currentId = sec.getAttribute("id");

        }

    });

    navLinks.forEach(link=>{

        link.classList.toggle(
            "active-link",
            link.getAttribute("href") === `#${currentId}`
        );

    });

}

window.addEventListener("scroll", updateActiveNav);
window.addEventListener("load", updateActiveNav);
updateActiveNav();


/* ==========================
   CROSSHAIR CURSOR (TOGGLE)
========================== */

if(!window.matchMedia("(pointer:coarse)").matches){

    const cursor = document.createElement("div");
    cursor.className = "hero-cursor";
    document.body.appendChild(cursor);

    const cursorToggle = document.createElement("button");
    cursorToggle.className = "cursor-toggle";
    cursorToggle.title = "Aktifkan/matikan crosshair cursor";
    cursorToggle.innerHTML = '<i class="fas fa-crosshairs"></i>';
    document.body.appendChild(cursorToggle);

    function getZoomFactor(){

        const z = parseFloat(getComputedStyle(document.documentElement).zoom);

        return z && !isNaN(z) ? z : 1;

    }

    function enableCursorFx(){

        document.body.classList.add("cursor-fx");
        cursorToggle.classList.add("active");
        localStorage.setItem("cursorFx", "on");

    }

    function disableCursorFx(){

        document.body.classList.remove("cursor-fx");
        cursorToggle.classList.remove("active");
        cursor.classList.remove("show");
        localStorage.setItem("cursorFx", "off");

    }

    if(localStorage.getItem("cursorFx") === "on"){

        enableCursorFx();

    }

    cursorToggle.addEventListener("click", ()=>{

        if(document.body.classList.contains("cursor-fx")){

            disableCursorFx();

        }else{

            enableCursorFx();

        }

    });

    document.addEventListener("mousemove", (e)=>{

        if(!document.body.classList.contains("cursor-fx")) return;

        const zoom = getZoomFactor();

        cursor.style.left = `${e.clientX / zoom}px`;
        cursor.style.top = `${e.clientY / zoom}px`;
        cursor.classList.add("show");

    });

    document.addEventListener("mouseleave", ()=>{

        cursor.classList.remove("show");

    });

}


/* ==========================
   TOMBOL MAGNETIK
========================== */

const magneticEls = document.querySelectorAll(".btn, .btn-outline");

magneticEls.forEach(btn=>{

    btn.addEventListener("mousemove", (e)=>{

        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;

    });

    btn.addEventListener("mouseleave", ()=>{

        btn.style.transform = "translate(0,0)";

    });

});


/* ==========================
   TOMBOL BACK TO TOP
========================== */

const backToTop = document.createElement("button");
backToTop.className = "back-to-top";
backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
document.body.appendChild(backToTop);

window.addEventListener("scroll", ()=>{

    backToTop.classList.toggle("show", window.scrollY > 500);

});

backToTop.addEventListener("click", ()=>{

    window.scrollTo({ top:0, behavior:"smooth" });

});

})();
