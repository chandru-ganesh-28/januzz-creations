/* ==========================================================
   Januzz Creations — site behaviour (vanilla JS)
   ========================================================== */

/* >>> REPLACE BEFORE LAUNCH <<<
   Enter the business WhatsApp number with country code, digits only
   (example for India: "919876543210"). The value below is a placeholder. */
const WHATSAPP_NUMBER = "919361454392";

const DEFAULT_GREETING = "Hello Januzz Creations, I would like to make an enquiry.";

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- WhatsApp helpers ---------- */
  function whatsappUrl(text) {
    const number = String(WHATSAPP_NUMBER).replace(/\D/g, "");
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(text);
  }

  // Every WhatsApp link on the page gets its real address (and optional service) here.
  $$("[data-whatsapp]").forEach(function (link) {
    const service = link.dataset.service;
    const text = service
      ? "Hello Januzz Creations, I would like to enquire about " + service + "."
      : DEFAULT_GREETING;
    link.href = whatsappUrl(text);
  });

  /* ---------- Footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Image fallback ---------- */
  const fallbackIcon =
    '<svg viewBox="0 0 200 200" aria-hidden="true" focusable="false"><use href="#mandala"/></svg>';

  function handleBrokenImage(img) {
    if (img.dataset.failed) return;
    img.dataset.failed = "true";

    // Decorative hero photo: just remove it; the burgundy background remains.
    if (img.hasAttribute("data-decor")) {
      img.remove();
      return;
    }
    const holder = img.closest(".media, .gallery-item");
    if (!holder) return;
    img.hidden = true;
    const box = document.createElement("div");
    box.className = "img-fallback";
    box.innerHTML = fallbackIcon + "<span></span>";
    box.lastChild.textContent = img.alt || "Januzz Creations";
    holder.appendChild(box);
  }

  $$("img").forEach(function (img) {
    if (img.classList.contains("lb-img")) return;
    img.addEventListener("error", function () { handleBrokenImage(img); });
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) handleBrokenImage(img);
  });

  /* ---------- Header: solid on scroll, mobile menu ---------- */
  const header = $(".site-header");
  const navToggle = $(".nav-toggle");
  const nav = $("#site-nav");

  function setMenu(open) {
    header.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  navToggle.addEventListener("click", function () {
    setMenu(!header.classList.contains("is-open"));
  });
  $$("a", nav).forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && header.classList.contains("is-open")) {
      setMenu(false);
      navToggle.focus();
    }
  });
  window.matchMedia("(min-width: 900px)").addEventListener("change", function (e) {
    if (e.matches) setMenu(false);
  });

  /* ---------- Back to top + header state ---------- */
  const toTop = $(".to-top");
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("is-solid", y > 40);
    toTop.hidden = y < 700;
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  /* ---------- Smooth scrolling for in-page links ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Gallery lightbox ---------- */
  const items = $$(".gallery-item");
  const lightbox = $("#lightbox");
  const lbImg = $(".lb-img", lightbox);
  const lbCaption = $(".lb-caption", lightbox);
  const lbFallback = $(".lb-fallback", lightbox);
  const lbClose = $(".lb-close", lightbox);
  const lbPrev = $(".lb-prev", lightbox);
  const lbNext = $(".lb-next", lightbox);
  let current = 0;
  let opener = null;

  function show(index) {
    current = (index + items.length) % items.length;
    const item = items[current];
    const caption = item.dataset.caption || "";
    lbFallback.hidden = true;
    lbImg.hidden = false;
    lbImg.alt = caption;
    lbImg.src = item.dataset.full || $("img", item).src;
    lbCaption.textContent = caption + "  (" + (current + 1) + " of " + items.length + ")";
  }

  lbImg.addEventListener("error", function () {
    lbImg.hidden = true;
    lbFallback.hidden = false;
  });

  function openLightbox(index, trigger) {
    opener = trigger;
    show(index);
    lightbox.hidden = false;
    document.body.classList.add("is-locked");
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lbImg.removeAttribute("src");
    document.body.classList.remove("is-locked");
    if (opener) opener.focus();
  }

  items.forEach(function (item, i) {
    item.addEventListener("click", function () { openLightbox(i, item); });
  });
  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", function () { show(current - 1); });
  lbNext.addEventListener("click", function () { show(current + 1); });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowLeft") {
      show(current - 1);
    } else if (e.key === "ArrowRight") {
      show(current + 1);
    } else if (e.key === "Tab") {
      // Keep focus inside the dialog
      const focusable = [lbClose, lbPrev, lbNext];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Simple swipe support on touch screens
  let touchX = null;
  lightbox.addEventListener("touchstart", function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ---------- Enquiry form ---------- */
  const form = $("#enquiry-form");
  const dateInput = $("#date");

  // Block past dates
  const now = new Date();
  const pad = function (n) { return String(n).padStart(2, "0"); };
  dateInput.min = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());

  function setError(id, message) {
    const input = $("#" + id);
    const error = $("#" + id + "-error");
    error.textContent = message;
    input.closest(".field").classList.toggle("has-error", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
    return !message;
  }

  const validators = {
    name: function (v) {
      if (v.trim().length < 2) return "Please enter your name.";
      return "";
    },
    service: function (v) {
      return v ? "" : "Please choose a service.";
    },
    date: function (v) {
      if (!v) return ""; // optional
      return v < dateInput.min ? "Please choose today or a later date." : "";
    },
    message: function (v) {
      return v.trim().length < 5 ? "Please add a short message (at least 5 characters)." : "";
    }
  };

  function validateField(id) {
    return setError(id, validators[id]($("#" + id).value));
  }

  Object.keys(validators).forEach(function (id) {
    const el = $("#" + id);
    el.addEventListener("blur", function () { validateField(id); });
    el.addEventListener("input", function () {
      if (el.closest(".field").classList.contains("has-error")) validateField(id);
    });
  });

  function formatDate(value) {
    const parts = value.split("-");
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const results = Object.keys(validators).map(validateField);
    if (results.includes(false)) {
      const firstBad = $(".has-error input, .has-error select, .has-error textarea", form);
      if (firstBad) firstBad.focus();
      return;
    }

    const lines = [
      "Hello Januzz Creations,",
      "",
      "Name: " + $("#name").value.trim(),
      "Service: " + $("#service").value,
      "Preferred date: " + (dateInput.value ? formatDate(dateInput.value) : "Not decided yet"),
      "Message: " + $("#message").value.trim()
    ];

    // An anchor click is more reliable than window.open for new tabs
    const link = document.createElement("a");
    link.href = whatsappUrl(lines.join("\n"));
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
})();
