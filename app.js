'use strict';

// ====== NAVBAR ======
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ====== HAMBURGER ======
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  const isOpen = navLinks.classList.contains('open');
  spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
  spans[1].style.opacity = isOpen ? '0' : '';
  spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// ====== HERO SLIDER ======
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;
let sliderInterval;

function goToSlide(idx) {
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = (idx + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function startSlider() {
  sliderInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
}

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    clearInterval(sliderInterval);
    goToSlide(parseInt(dot.dataset.index));
    startSlider();
  });
});

startSlider();

// ====== PRODUCT FILTER ======
const catTabs = document.querySelectorAll('.cat-tab');
const productCards = document.querySelectorAll('.product-card');

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
  // Small feedback on button
  event.target.textContent = '✓ Přidáno';
  event.target.style.background = '#2ecc71';
  setTimeout(() => {
    event.target.textContent = '+ Přidat';
    event.target.style.background = '';
  }, 1200);
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
  const container = document.getElementById('cartItems');
  const empty = document.getElementById('cartEmpty');
  const totalEl = document.getElementById('cartTotal');
  const totalPrice = document.getElementById('totalPrice');
  const fabCount = document.getElementById('cartFabCount');

  const items = Object.entries(cart);

  // Remove old items except empty placeholder
  container.querySelectorAll('.cart-item').forEach(el => el.remove());

  if (items.length === 0) {
    empty.style.display = 'block';
    totalEl.style.display = 'none';
    fabCount.textContent = '0';
    return;
  }

  empty.style.display = 'none';
  totalEl.style.display = 'flex';

  let total = 0;
  let totalQty = 0;

  items.forEach(([name, { price, qty }]) => {
    total += price * qty;
    totalQty += qty;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <span class="cart-item-name">${name}</span>
      <div class="cart-item-right">
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${name}', -1)">−</button>
          <span class="qty-num">${qty}</span>
          <button class="qty-btn" onclick="changeQty('${name}', 1)">+</button>
        </div>
        <span class="cart-item-price">${(price * qty).toLocaleString('cs-CZ')} Kč</span>
        <button class="cart-remove" onclick="removeFromCart('${name}')">✕</button>
      </div>
    `;
    container.appendChild(el);
  });

  totalPrice.textContent = `${total.toLocaleString('cs-CZ')} Kč`;
  fabCount.textContent = totalQty;
}

function showCartFab() {
  const fab = document.getElementById('cartFab');
  const items = Object.keys(cart).length;
  fab.style.display = items > 0 ? 'flex' : 'none';
}

function scrollToOrder() {
  document.getElementById('objednat').scrollIntoView({ behavior: 'smooth' });
}

// ====== SET MIN DATE ======
const pickupDate = document.getElementById('pickupDate');
if (pickupDate) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  pickupDate.min = tomorrow.toISOString().split('T')[0];
}

// ====== ORDER SUBMIT ======
function submitOrder(e) {
  e.preventDefault();
  const items = Object.entries(cart);
  if (items.length === 0) {
    alert('Přidejte prosím alespoň jeden produkt do košíku.');
    return;
  }
  // In production this would POST to a backend
  document.getElementById('modalOverlay').classList.add('active');
  // Clear cart
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

// ====== CONTACT SUBMIT ======
function submitContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = '✓ Zpráva odeslána!';
  btn.style.background = '#2ecc71';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Odeslat zprávu';
    btn.style.background = '';
    btn.disabled = false;
    e.target.reset();
  }, 3000);
}

// ====== SCROLL ANIMATIONS ======
const fadeEls = document.querySelectorAll('.product-card, .store-card, .step, .stat-item, .about-badge');
fadeEls.forEach(el => el.classList.add('fade-in'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => observer.observe(el));
