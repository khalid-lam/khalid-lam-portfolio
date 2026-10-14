/* ==========================================================
   Apparition au scroll
   ========================================================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: "0px 0px 10% 0px" });   // déclenché juste avant l'entrée à l'écran

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* Navigation bar background on scroll */
const nav = document.querySelector(".nav");

function updateNav() {
  nav.classList.toggle("is-scrolled", window.scrollY > 10);
}

window.addEventListener("scroll", updateNav, { passive: true });
updateNav();

/* ==========================================================
   Menu mobile
   ========================================================== */
const navToggle = document.querySelector(".nav__toggle");
const navMenu = document.getElementById("nav-menu");

function closeMenu() {
  navMenu.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
}

navToggle.addEventListener("click", () => {
  const open = navMenu.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
});

navMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

/* ==========================================================
   Lien actif selon la section visible
   ========================================================== */
const navLinks = document.querySelectorAll('.nav__link[href^="#"]');   // liens d'ancre seulement (pas Contact)
const sections = [...navLinks].map((a) => document.querySelector(a.getAttribute("href")));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
    });
  });
}, { rootMargin: "-45% 0px -50% 0px" });

sections.forEach((s) => s && sectionObserver.observe(s));
