/* ==========================================================
   FITUR TAMBAHAN — Portofolio
   File ini HANYA menambah fitur di sekitar konten.
   Ia tidak mengubah isi/teks/data apapun: semua kartu yang
   difilter, dicari, dan ditampilkan di lightbox berasal dari
   DOM yang sudah dirender fungsi.js dari database.
========================================================== */
(function () {
    "use strict";

    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- Toast ---------- */
    var toastStack = $("#toastStack");
    function toast(msg, icon) {
        if (!toastStack) return;
        var el = document.createElement("div");
        el.className = "toast";
        el.innerHTML = '<i class="fas ' + (icon || "fa-circle-check") + '"></i><span></span>';
        el.querySelector("span").textContent = msg;
        toastStack.appendChild(el);
        requestAnimationFrame(function () { el.classList.add("show"); });
        setTimeout(function () {
            el.classList.remove("show");
            setTimeout(function () { el.remove(); }, 350);
        }, 3400);
    }
    window.__portfolioToast = toast;

    function copyText(text, okMsg) {
        function done() { toast(okMsg || "Berhasil disalin."); }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(function () { fallback(); });
        } else { fallback(); }
        function fallback() {
            var ta = document.createElement("textarea");
            ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
            document.body.appendChild(ta); ta.select();
            try { document.execCommand("copy"); done(); } catch (e) { toast("Gagal menyalin, salin manual ya.", "fa-triangle-exclamation"); }
            ta.remove();
        }
    }

    /* ---------- Tema: hormati preferensi sistem saat kunjungan pertama ---------- */
    var metaTheme = $("#metaThemeColor");
    function syncThemeMeta() {
        var dark = document.body.classList.contains("dark");
        if (metaTheme) metaTheme.setAttribute("content", dark ? "#0B1120" : "#EEF1F4");
        var btn = $("#darkBtn");
        if (btn) btn.setAttribute("aria-pressed", dark ? "true" : "false");
    }
    try {
        if (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.body.classList.add("dark");
            var icon = $("#themeIcon");
            if (icon) icon.src = "logo/sun.png";
        }
    } catch (e) { /* localStorage tidak tersedia */ }
    syncThemeMeta();
    new MutationObserver(syncThemeMeta).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    /* Sinkronkan juga langsung saat klik (listener fungsi.js terdaftar
       lebih dulu, jadi class sudah berubah saat handler ini jalan) */
    var darkBtnEl = $("#darkBtn");
    if (darkBtnEl) darkBtnEl.addEventListener("click", syncThemeMeta);

    /* ---------- Scroll progress bar ---------- */
    var bar = $("#scrollProgressBar");
    function updateProgress() {
        if (!bar) return;
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        var pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
        bar.style.width = pct + "%";
    }
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();

    /* ---------- Menu HP: aria, Esc, klik di luar ---------- */
    var menuToggle = $("#menuToggle");
    var navMenu = $("#navMenu");
    function syncMenuAria() {
        if (menuToggle && navMenu) menuToggle.setAttribute("aria-expanded", navMenu.classList.contains("active") ? "true" : "false");
    }
    if (menuToggle && navMenu) {
        new MutationObserver(syncMenuAria).observe(navMenu, { attributes: true, attributeFilter: ["class"] });
        menuToggle.addEventListener("click", syncMenuAria);
        document.addEventListener("click", function (e) {
            if (navMenu.classList.contains("active") && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove("active");
            }
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && navMenu.classList.contains("active")) {
                navMenu.classList.remove("active");
                menuToggle.focus();
            }
        });
        syncMenuAria();
    }

    /* ---------- Bagikan & Simpan PDF ---------- */
    var shareBtn = $("#shareBtn");
    if (shareBtn) {
        shareBtn.addEventListener("click", function () {
            var data = { title: document.title, text: document.title, url: window.location.href };
            if (navigator.share) {
                navigator.share(data).catch(function () { /* dibatalkan pengguna */ });
            } else {
                copyText(window.location.href, "Link portofolio disalin — tinggal bagikan.");
            }
        });
    }
    var printBtn = $("#printBtn");
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });

    /* ---------- Lightbox foto project & sertifikat ---------- */
    var lightbox = $("#lightbox"), lbImg = $("#lightboxImg"), lbCap = $("#lightboxCaption"), lbClose = $("#lightboxClose");
    var lastFocus = null;
    function openLightbox(src, caption, alt) {
        if (!lightbox) return;
        lastFocus = document.activeElement;
        lbImg.src = src; lbImg.alt = alt || caption || "";
        lbCap.textContent = caption || "";
        lightbox.hidden = false;
        document.body.classList.add("lightbox-open");
        if (lbClose) lbClose.focus();
    }
    function closeLightbox() {
        if (!lightbox) return;
        lightbox.hidden = true;
        lbImg.src = "";
        document.body.classList.remove("lightbox-open");
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    if (lightbox) {
        lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
        if (lbClose) lbClose.addEventListener("click", closeLightbox);
        document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !lightbox.hidden) closeLightbox(); });
    }
    document.addEventListener("click", function (e) {
        var thumb = e.target.closest ? e.target.closest(".project-thumb img") : null;
        if (thumb) {
            var card = thumb.closest(".project-card");
            var title = card ? (card.querySelector("h3") || {}).textContent : "";
            openLightbox(thumb.currentSrc || thumb.src, title || thumb.alt, thumb.alt);
            return;
        }
        var certImg = e.target.closest ? e.target.closest(".gambar-sertif") : null;
        if (certImg) {
            e.preventDefault();
            var cCard = certImg.closest(".project-card");
            var cTitle = cCard ? (cCard.querySelector("h3") || {}).textContent : "";
            openLightbox(certImg.currentSrc || certImg.src, cTitle || "Sertifikat", certImg.alt);
        }
    });

    /* ---------- Filter + pencarian (kartu dari database) ---------- */
    function setupFilter(cfg) {
        var search = $(cfg.search), chipsBox = $(cfg.chips), empty = $(cfg.empty);
        var cards = $$(cfg.cards);
        if (!search || !chipsBox || !cards.length) return;
        var activeChip = "Semua";

        function rebuildChips() {
            cards = $$(cfg.cards);
            var cats = [];
            cards.forEach(function (c) {
                var cat = cfg.category(c);
                if (cat && cats.indexOf(cat) === -1) cats.push(cat);
            });
            chipsBox.innerHTML = "";
            ["Semua"].concat(cats).forEach(function (cat) {
                var b = document.createElement("button");
                b.type = "button";
                b.className = "chip" + (cat === activeChip ? " active" : "");
                b.textContent = cat;
                b.setAttribute("aria-pressed", cat === activeChip ? "true" : "false");
                b.addEventListener("click", function () { activeChip = cat; rebuildChips(); apply(); });
                chipsBox.appendChild(b);
            });
        }
        function apply() {
            var q = (search.value || "").trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (c) {
                var matchCat = activeChip === "Semua" || cfg.category(c) === activeChip;
                var matchQ = !q || c.textContent.toLowerCase().indexOf(q) !== -1;
                var show = matchCat && matchQ;
                c.style.display = show ? "" : "none";
                if (show) { visible++; c.classList.add("active"); }
            });
            if (empty) empty.hidden = visible !== 0;
        }
        search.addEventListener("input", apply);
        rebuildChips();
        /* Kartu dirender ulang dari database sesaat setelah halaman dibuka */
        var container = $(cfg.container);
        if (container && window.MutationObserver) {
            var t;
            new MutationObserver(function () { clearTimeout(t); t = setTimeout(function () { rebuildChips(); apply(); }, 60); })
                .observe(container, { childList: true });
        }
    }
    setupFilter({
        search: "#skillSearch", chips: "#skillChips", empty: "#skillEmpty",
        container: ".skills", cards: ".skills .box",
        category: function (c) { var b = c.querySelector(".skill-badge"); return b ? b.textContent.trim() : ""; }
    });
    setupFilter({
        search: "#projectSearch", chips: "#projectChips", empty: "#projectEmpty",
        container: "#project .projects", cards: "#project .projects .project-card",
        category: function (c) { var t = c.querySelector(".project-tag"); return t ? t.textContent.trim() : ""; }
    });

    /* ---------- Salin email 1-klik (klik ikon pada kartu email tidak mengganggu link) ---------- */
    document.addEventListener("dblclick", function (e) {
        var item = e.target.closest ? e.target.closest('.contact-item[href^="mailto:"]') : null;
        if (item) copyText(item.getAttribute("href").replace("mailto:", ""), "Alamat email disalin.");
    });

    /* ---------- Form kontak cepat -> aplikasi email ---------- */
    var form = $("#contactForm");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var mailItem = $('.contact-item[href^="mailto:"]');
            var to = mailItem ? mailItem.getAttribute("href").replace("mailto:", "") : "";
            var name = ($("#cfName") || {}).value || "";
            var email = ($("#cfEmail") || {}).value || "";
            var msg = ($("#cfMessage") || {}).value || "";
            if (!to) { toast("Alamat email tujuan tidak ditemukan.", "fa-triangle-exclamation"); return; }
            var subject = encodeURIComponent("Pesan dari portofolio — " + name);
            var body = encodeURIComponent(msg + "\n\n— " + name + " (" + email + ")");
            window.location.href = "mailto:" + to + "?subject=" + subject + "&body=" + body;
            toast("Membuka aplikasi email kamu...");
        });
    }

    /* ---------- Indikator offline / online ---------- */
    var banner = $("#offlineBanner");
    function syncOnline() {
        if (banner) banner.hidden = navigator.onLine;
        if (!navigator.onLine) toast("Kamu sedang offline.", "fa-wifi");
    }
    window.addEventListener("offline", syncOnline);
    window.addEventListener("online", function () { syncOnline(); toast("Kembali online."); });
    syncOnline();

    /* ---------- PWA: service worker ---------- */
    if ("serviceWorker" in navigator && (window.location.protocol === "https:" || window.location.hostname === "localhost")) {
        window.addEventListener("load", function () {
            navigator.serviceWorker.register("sw.js").catch(function () { /* abaikan bila gagal */ });
        });
    }

    /* ---------- Hormati reduced-motion untuk animasi tambahan ---------- */
    if (reduceMotion) document.documentElement.classList.add("reduce-motion");
})();
