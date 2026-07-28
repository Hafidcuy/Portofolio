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
   CROSSHAIR CURSOR
========================== */

if(!window.matchMedia("(pointer:coarse)").matches){

    const cursor = document.createElement("div");
    cursor.className = "hero-cursor";
    document.body.appendChild(cursor);

    function getZoomFactor(){

        const z = parseFloat(getComputedStyle(document.documentElement).zoom);

        return z && !isNaN(z) ? z : 1;

    }

    document.addEventListener("mousemove", (e)=>{

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
