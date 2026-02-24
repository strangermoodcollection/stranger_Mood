/* ============================= */
/*         STRANGER MOOD JS       */
/*  Panier + recherche + tri      */
/*  Drawer + toast + menu mobile  */
/* ============================= */

const PRODUCTS = [
  {
    id: "tank-vibes",
    name: 'Débardeur "Vibes Street"',
    desc: "Noir / détails contrastés — logo signature.",
    price: 12900,
    tag: "Best seller",
  },
  {
    id: "tank-ash",
    name: 'Débardeur "Ash Mood"',
    desc: "Gris — minimal premium — coupe regular.",
    price: 11900,
    tag: "Nouveau",
  },
  {
    id: "hoodie-night",
    name: 'Hoodie "Night Pulse"',
    desc: "Oversize — doux — vibe nocturne.",
    price: 24900,
    tag: "Drop",
  },
  {
    id: "tee-core",
    name: 'T-shirt "Core"',
    desc: "Essentiel — logo discret — confort.",
    price: 9900,
    tag: "Essentiel",
  },
  {
    id: "cap-sign",
    name: 'Casquette "Sign"',
    desc: "Fit clean — broderie signature.",
    price: 7900,
    tag: "Accessoire",
  },
  {
    id: "short-run",
    name: 'Short "Run"',
    desc: "Sport/street — léger — coupe active.",
    price: 13900,
    tag: "Sport",
  },
];

const $ = (q) => document.querySelector(q);

const productGrid = $("#productGrid");
const cartBtn = $("#cartBtn");
const drawer = $("#drawer");
const cartItemsEl = $("#cartItems");
const cartCountEl = $("#cartCount");
const cartTotalEl = $("#cartTotal");
const toastEl = $("#toast");

const searchEl = $("#search");
const sortEl = $("#sort");

const menuBtn = $("#menuBtn");
const navEl = $("#nav");

const themeBtn = $("#themeBtn");
const notifyBtn = $("#notifyBtn");

const copyBtn = $("#copyBtn");
const yearEl = $("#year");
const checkoutBtn = $("#checkoutBtn");

const IG_HANDLE = "@stranger_mood_collection";

/* ========= Helpers ========= */

const money = (n) => new Intl.NumberFormat("fr-FR").format(Number(n || 0)) + " XOF";

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove("show"), 1600);
}

/* ========= Cart state ========= */

let cart = new Map(); // id -> qty

function computeCart() {
  let count = 0;
  let total = 0;

  for (const [id, qty] of cart.entries()) {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) continue;
    count += qty;
    total += p.price * qty;
  }

  if (cartCountEl) cartCountEl.textContent = String(count);
  if (cartTotalEl) cartTotalEl.textContent = money(total);
}

function renderCart() {
  if (!cartItemsEl) return;

  if (cart.size === 0) {
    cartItemsEl.innerHTML = `<p class="muted">Ton panier est vide.</p>`;
    computeCart();
    return;
  }

  cartItemsEl.innerHTML = "";

  for (const [id, qty] of cart.entries()) {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) continue;

    const row = document.createElement("div");
    row.className = "cartitem";
    row.innerHTML = `
      <div class="cartitem__img" aria-hidden="true"></div>
      <div>
        <div class="cartitem__name">${escapeHtml(p.name)}</div>
        <div class="cartitem__meta">${money(p.price)} • ${escapeHtml(p.tag)}</div>
      </div>
      <div class="qty" aria-label="Quantité">
        <button type="button" data-qty="dec" data-id="${p.id}" aria-label="Diminuer">−</button>
        <span aria-label="Quantité">${qty}</span>
        <button type="button" data-qty="inc" data-id="${p.id}" aria-label="Augmenter">+</button>
      </div>
    `;

    cartItemsEl.appendChild(row);
  }

  computeCart();
}

function addToCart(id, qty = 1) {
  const current = cart.get(id) || 0;
  cart.set(id, current + qty);
  showToast("Ajouté au panier ✅");
  renderCart();
}

function setDrawer(open) {
  if (!drawer) return;
  drawer.classList.toggle("open", open);
  drawer.setAttribute("aria-hidden", String(!open));
}

/* ========= Products ========= */

function renderProducts(list) {
  if (!productGrid) return;
  productGrid.innerHTML = "";

  for (const p of list) {
    const card = document.createElement("article");
    card.className = "card glass";
    card.innerHTML = `
      <div class="card__img" aria-hidden="true"></div>

      <div class="card__meta">
        <div>
          <h3>${escapeHtml(p.name)}</h3>
          <p>${escapeHtml(p.desc)}</p>
        </div>
        <span class="tag">${escapeHtml(p.tag)}</span>
      </div>

      <div class="card__actions">
        <div class="k">
          <span class="muted tiny">Prix</span>
          <strong>${money(p.price)}</strong>
        </div>
        <button class="btn small primary" data-add="${p.id}">Ajouter</button>
      </div>
    `;
    productGrid.appendChild(card);
  }
}

function applyFilters() {
  const q = (searchEl?.value || "").trim().toLowerCase();
  const sort = sortEl?.value || "featured";

  let list = PRODUCTS.filter((p) =>
    (p.name + " " + p.desc + " " + p.tag).toLowerCase().includes(q)
  );

  if (sort === "priceAsc") list.sort((a, b) => a.price - b.price);
  if (sort === "priceDesc") list.sort((a, b) => b.price - a.price);
  if (sort === "nameAsc") list.sort((a, b) => a.name.localeCompare(b.name, "fr"));

  renderProducts(list);
}

/* ========= Theme (optional) ========= */

function toggleTheme() {
  // Ton site est dark par défaut.
  // Si tu veux un vrai light mode plus tard, on ajoutera les variables.
  // Pour l’instant, on fait juste un petit feedback.
  showToast("Mode sombre ✦ (par défaut)");
}

/* ========= Events ========= */

function setupEvents() {
  // Event delegation (Add + qty + close drawer)
  document.body.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      addToCart(addBtn.getAttribute("data-add"));
      return;
    }

    const close = e.target.closest("[data-close='drawer']");
    if (close) {
      setDrawer(false);
      return;
    }

    const qtyBtn = e.target.closest("[data-qty]");
    if (qtyBtn) {
      const id = qtyBtn.getAttribute("data-id");
      const type = qtyBtn.getAttribute("data-qty");
      const current = cart.get(id) || 0;
      const next = type === "inc" ? current + 1 : current - 1;

      if (next <= 0) cart.delete(id);
      else cart.set(id, next);

      renderCart();
      return;
    }
  });

  // Open drawer
  cartBtn?.addEventListener("click", () => setDrawer(true));

  // Mobile menu
  menuBtn?.addEventListener("click", () => {
    const open = !navEl?.classList.contains("open");
    navEl?.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  });

  // Close menu on link click (mobile)
  navEl?.addEventListener("click", (e) => {
    if (e.target.tagName === "A" && navEl.classList.contains("open")) {
      navEl.classList.remove("open");
      menuBtn?.setAttribute("aria-expanded", "false");
    }
  });

  // Search + sort
  searchEl?.addEventListener("input", applyFilters);
  sortEl?.addEventListener("change", applyFilters);

  // Theme button
  themeBtn?.addEventListener("click", toggleTheme);

  // Notify button
  notifyBtn?.addEventListener("click", () => {
    showToast("OK ✅ On te notifiera pour les prochains drops (démo)");
  });

  // Copy IG
  copyBtn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(IG_HANDLE);
      showToast("Instagram copié ✅");
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = IG_HANDLE;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("Instagram copié ✅");
    }
  });

  // Contact form (demo)
  $("#contactForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Message envoyé ✅ (démo)");
    e.target.reset();
  });

  // Checkout (demo)
  checkoutBtn?.addEventListener("click", () => {
    if (cart.size === 0) {
      showToast("Panier vide 🙂");
      return;
    }
    showToast("Commande prête ✅ (démo)");
    // Exemple : redirection WhatsApp plus tard
    // window.open(`https://wa.me/225XXXXXXXX?text=${encodeURIComponent("Je veux commander...")}`, "_blank");
  });
}

/* ========= Init ========= */

function init() {
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  applyFilters();   // render products first
  renderCart();     // render empty cart
  setupEvents();
}

document.addEventListener("DOMContentLoaded", init);
