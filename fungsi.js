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

