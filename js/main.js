// ─── HOMEPAGE JS ──────────────────────────────────────────────

function handleNewsletter(e) {
  e.preventDefault();
  showToast('Welcome to The Inner Circle.');
  e.target.reset();
}

// Render featured products (first 4)
const featuredEl = document.getElementById('featuredProducts');
if (featuredEl) {
  const featured = PRODUCTS.filter(p => p.badge === 'New').slice(0, 4);
  featuredEl.innerHTML = featured.map(renderProductCard).join('');
}

// Render bestsellers
const bestsellerEl = document.getElementById('bestsellerProducts');
if (bestsellerEl) {
  const best = PRODUCTS.filter(p => p.badge === 'Best Seller' || p.badge === 'Sale').slice(0, 4);
  bestsellerEl.innerHTML = best.map(renderProductCard).join('');
}

// Nav scroll effect
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.style.background = 'rgba(13,12,11,0.98)';
    } else {
      nav.style.background = 'rgba(13,12,11,0.92)';
    }
  });
}

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.product-card, .trust-item, .cat-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});
