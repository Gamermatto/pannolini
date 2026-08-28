/* ============================================================
   Dirty Baby — site behaviour
   ============================================================ */
(function () {
    "use strict";

    /* ---- Mobile menu ---- */
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("siteNav");

    function closeNav() {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
    });

    nav.addEventListener("click", function (e) {
        if (e.target.tagName === "A") closeNav();
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeNav();
    });

    /* ---- Active link highlighting ---- */
    var sections = Array.prototype.slice.call(
        document.querySelectorAll("main section[id]")
    );
    var navLinks = Array.prototype.slice.call(
        document.querySelectorAll('.site-nav a[href^="#"]')
    );

    function syncActiveLink() {
        var pos = window.scrollY + 120;
        var currentId = "";

        sections.forEach(function (section) {
            if (section.offsetTop <= pos) currentId = section.id;
        });

        navLinks.forEach(function (link) {
            link.classList.toggle(
                "active",
                link.getAttribute("href") === "#" + currentId
            );
        });
    }

    var ticking = false;
    window.addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
            syncActiveLink();
            ticking = false;
        });
    });
    syncActiveLink();

    /* ---- Reveal on scroll ---- */
    var revealTargets = document.querySelectorAll(
        ".section .eyebrow, .section h2, .section-lede, .card, .tile, .split-text, .split-visual, .form, .stat"
    );

    if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );

        revealTargets.forEach(function (el, i) {
            el.classList.add("reveal");
            el.style.transitionDelay = (i % 4) * 60 + "ms";
            observer.observe(el);
        });
    }

    /* ---- Contact form validation ---- */
    var form = document.getElementById("contactForm");
    var status = document.getElementById("formStatus");
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function setError(field, message) {
        var slot = form.querySelector('[data-error-for="' + field.id + '"]');
        if (slot) slot.textContent = message;
        field.classList.toggle("invalid", Boolean(message));
        field.setAttribute("aria-invalid", message ? "true" : "false");
    }

    function validateField(field) {
        var value = field.value.trim();
        var message = "";

        if (!value) {
            message = "This field is required.";
        } else if (field.type === "email" && !emailPattern.test(value)) {
            message = "Enter a valid email address.";
        } else if (field.id === "message" && value.length < 10) {
            message = "A little more detail, please (10+ characters).";
        }

        setError(field, message);
        return !message;
    }

    var required = Array.prototype.slice.call(
        form.querySelectorAll("[required]")
    );

    required.forEach(function (field) {
        field.addEventListener("blur", function () {
            validateField(field);
        });
        field.addEventListener("input", function () {
            if (field.classList.contains("invalid")) validateField(field);
        });
    });

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        var allValid = required
            .map(validateField)
            .every(Boolean);

        if (!allValid) {
            status.textContent = "Please fix the highlighted fields.";
            status.className = "form-status bad";
            var firstBad = form.querySelector(".invalid");
            if (firstBad) firstBad.focus();
            return;
        }

        // No backend here — swap this for a real fetch() to your endpoint.
        status.textContent = "Thanks — your message is on its way. We'll reply within two working days.";
        status.className = "form-status ok";
        form.reset();
        required.forEach(function (field) {
            setError(field, "");
        });
    });

    /* ---- Footer year ---- */
    document.getElementById("year").textContent = new Date().getFullYear();
})();
