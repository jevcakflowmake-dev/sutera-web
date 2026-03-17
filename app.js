'use strict';

// ====== NAVBAR ======
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ====== HAMBURGER + OVERLAY MENU ======
const hamburger   = document.getElementById('hamburger');
const navOverlay  = document.getElementById('navOverlay');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navOverlay.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

function closeNav() {
  hamburger.classList.remove('open');
  navOverlay.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

// Close overlay on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeNav();
});

// ====== HERO SLIDER ======
const heroSlides   = document.querySelectorAll('.hero-slide');
const slideNumEl   = document.getElementById('slideNum');
const slidePrevBtn = document.getElementById('slidePrev');
const slideNextBtn = document.getElementById('slideNext');
let currentSlide   = 0;
let sliderInterval;

function goToSlide(idx) {
  heroSlides[currentSlide].classList.remove('active');
  currentSlide = ((idx % heroSlides.length) + heroSlides.length) % heroSlides.length;
  heroSlides[currentSlide].classList.add('active');
  if (slideNumEl) {
    slideNumEl.textContent = String(currentSlide + 1).padStart(2, '0');
  }
}

function startSlider() {
  sliderInterval = setInterval(() => goToSlide(currentSlide + 1), 5500);
}

if (slidePrevBtn) {
  slidePrevBtn.addEventListener('click', () => {
    clearInterval(sliderInterval);
    goToSlide(currentSlide - 1);
    startSlider();
  });
}

if (slideNextBtn) {
  slideNextBtn.addEventListener('click', () => {
    clearInterval(sliderInterval);
    goToSlide(currentSlide + 1);
    startSlider();
  });
}

startSlider();

// ====== PRODUCT FILTER ======
const catTabs     = document.querySelectorAll('.cat-tab');
const productCards = document.querySelectorAll('.product-card, .polok-banner');

catTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    catTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const cat = tab.dataset.cat;
    productCards.forEach(card => {
      if (cat === 'all') {
        card.classList.remove('hidden');
      } else {
        const cardCats = card.dataset.cat || '';
        card.classList.toggle('hidden', !cardCats.includes(cat));
      }
    });
  });
});

// ====== CART ======
const cart = {};

function addToCart(name, price) {
  if (cart[name]) {
    cart[name].qty += 1;
  } else {
    cart[name] = { price, qty: 1 };
  }
  renderCart();
  showCartFab();

  // Tactile button feedback
  const btn = event.currentTarget;
  const originalHtml = btn.innerHTML;
  btn.innerHTML = `
    <span>Přidáno</span>
    <span class="btn-add-icon" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
    </span>
  `;
  btn.style.background = '#2a7a4f';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = originalHtml;
    btn.style.background = '';
    btn.disabled = false;
  }, 1400);
}

function changeQty(name, delta) {
  if (!cart[name]) return;
  cart[name].qty += delta;
  if (cart[name].qty <= 0) delete cart[name];
  renderCart();
  showCartFab();
}

function removeFromCart(name) {
  delete cart[name];
  renderCart();
  showCartFab();
}

function renderCart() {
  const container  = document.getElementById('cartItems');
  const emptyEl    = document.getElementById('cartEmpty');
  const totalEl    = document.getElementById('cartTotal');
  const totalPrice = document.getElementById('totalPrice');
  const fabCount   = document.getElementById('cartFabCount');

  const items = Object.entries(cart);

  // Remove old rendered items
  container.querySelectorAll('.cart-item').forEach(el => el.remove());

  if (items.length === 0) {
    emptyEl.style.display  = 'flex';
    totalEl.style.display  = 'none';
    fabCount.textContent   = '0';
    return;
  }

  emptyEl.style.display = 'none';
  totalEl.style.display = 'flex';

  let total    = 0;
  let totalQty = 0;

  items.forEach(([name, { price, qty }]) => {
    total    += price * qty;
    totalQty += qty;

    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <span class="cart-item-name">${name}</span>
      <div class="cart-item-right">
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${name}', -1)" aria-label="Ubrat kus">−</button>
          <span class="qty-num">${qty}</span>
          <button class="qty-btn" onclick="changeQty('${name}', 1)" aria-label="Přidat kus">+</button>
        </div>
        <span class="cart-item-price">${(price * qty).toLocaleString('cs-CZ')} Kč</span>
        <button class="cart-remove" onclick="removeFromCart('${name}')" aria-label="Odebrat ${name}">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `;
    container.appendChild(el);
  });

  totalPrice.textContent = `${total.toLocaleString('cs-CZ')} Kč`;
  fabCount.textContent   = totalQty;
}

function showCartFab() {
  const fab   = document.getElementById('cartFab');
  const items = Object.keys(cart).length;
  fab.style.display = items > 0 ? 'flex' : 'none';
}

function scrollToOrder() {
  document.getElementById('objednat').scrollIntoView({ behavior: 'smooth' });
}

// ====== SET MIN DATE FOR PICKUP ======
const pickupDate = document.getElementById('pickupDate');
if (pickupDate) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  pickupDate.min = tomorrow.toISOString().split('T')[0];
}

// ====== ORDER FORM SUBMIT ======
function submitOrder(e) {
  e.preventDefault();
  if (Object.keys(cart).length === 0) {
    // Inline error — no alert()
    const cartBox = document.querySelector('.cart-box');
    const err = document.createElement('p');
    err.style.cssText = 'color:#E84A39;font-size:0.85rem;margin-top:12px;font-weight:600;';
    err.textContent = 'Přidejte alespoň jeden produkt do košíku.';
    cartBox.appendChild(err);
    setTimeout(() => err.remove(), 3500);
    return;
  }
  document.getElementById('modalOverlay').classList.add('active');
  Object.keys(cart).forEach(k => delete cart[k]);
  renderCart();
  showCartFab();
  e.target.reset();
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

// Close modal on backdrop click
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ====== CONTACT SUBMIT ======
function submitContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const orig = btn.textContent;
  btn.textContent = 'Zpráva odeslána';
  btn.style.background = '#2a7a4f';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.background = '';
    btn.disabled = false;
    e.target.reset();
  }, 3000);
}

// ====== SCROLL REVEAL (IntersectionObserver) ======
// Never use window.addEventListener('scroll') for animations — causes continuous reflows
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ====== ACTIVE NAV LINK ON SCROLL ======
const sections   = document.querySelectorAll('section[id], .section-dark[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));
