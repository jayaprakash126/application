// ─── PRODUCT DATA ──────────────────────────────────────────────
const PRODUCTS = [
  {
    id: 1,
    name: "Cashmere Wrap Coat",
    category: "women",
    sub: "Outerwear",
    price: 38500,
    originalPrice: null,
    badge: "New",
    badgeStyle: "",
    color: "linear-gradient(160deg, #2C2420 0%, #4A3525 60%, #6B4B35 100%)",
    desc: "Oversized silhouette in 100% Mongolian cashmere. Unlined for drape. Horn buttons.",
    sizes: ["XS","S","M","L","XL"],
  },
  {
    id: 2,
    name: "Silk Bias Slip Dress",
    category: "women",
    sub: "Dresses",
    price: 18900,
    originalPrice: 24000,
    badge: "Sale",
    badgeStyle: "badge-gold",
    color: "linear-gradient(160deg, #3A2C20 0%, #6B5040 100%)",
    desc: "Bias-cut in washed silk charmeuse. Adjustable spaghetti straps. Ivory or champagne.",
    sizes: ["XS","S","M","L"],
  },
  {
    id: 3,
    name: "Tailored Linen Blazer",
    category: "men",
    sub: "Tailoring",
    price: 24000,
    originalPrice: null,
    badge: "New",
    badgeStyle: "",
    color: "linear-gradient(160deg, #1C2128 0%, #2C3540 60%, #3C4A5A 100%)",
    desc: "Single-breasted, two button, half-lined. Patch pockets. Italian linen by Solbiati.",
    sizes: ["36","38","40","42","44","46"],
  },
  {
    id: 4,
    name: "Leather Shoulder Bag",
    category: "accessories",
    sub: "Bags",
    price: 29500,
    originalPrice: null,
    badge: null,
    badgeStyle: "",
    color: "linear-gradient(160deg, #1E1C18 0%, #3A3020 100%)",
    desc: "Vegetable-tanned Italian leather. Single compartment, card slot interior. Adjustable strap.",
    sizes: ["One Size"],
  },
  {
    id: 5,
    name: "Merino Roll-Neck",
    category: "women",
    sub: "Knitwear",
    price: 12500,
    originalPrice: null,
    badge: "Best Seller",
    badgeStyle: "badge-gold",
    color: "linear-gradient(160deg, #2A1A10 0%, #5A3020 100%)",
    desc: "Extra-fine merino in our 18-gauge rib. Machine washable. 12 colourways.",
    sizes: ["XS","S","M","L","XL"],
  },
  {
    id: 6,
    name: "Wool Pleated Trousers",
    category: "men",
    sub: "Trousers",
    price: 16800,
    originalPrice: null,
    badge: null,
    badgeStyle: "",
    color: "linear-gradient(160deg, #252520 0%, #404038 100%)",
    desc: "Single-pleat, wide leg. 100% Super 110s wool. Side adjusters. Unfinished hem.",
    sizes: ["28","30","32","34","36"],
  },
  {
    id: 7,
    name: "Suede Chelsea Boots",
    category: "accessories",
    sub: "Footwear",
    price: 21000,
    originalPrice: 27000,
    badge: "Sale",
    badgeStyle: "badge-gold",
    color: "linear-gradient(160deg, #2A2018 0%, #5A4535 100%)",
    desc: "Calf suede upper, leather sole. Elasticated gore. Goodyear welted. Tan or black.",
    sizes: ["38","39","40","41","42","43","44","45"],
  },
  {
    id: 8,
    name: "Silk Scarf",
    category: "accessories",
    sub: "Scarves",
    price: 8900,
    originalPrice: null,
    badge: "New",
    badgeStyle: "",
    color: "linear-gradient(160deg, #3A2A10 0%, #C4A35A 100%)",
    desc: "90×90cm. 100% silk twill. Hand-rolled edges. Printed in Como, Italy.",
    sizes: ["One Size"],
  },
];

// Cart state
let cart = JSON.parse(localStorage.getItem('luxe_cart') || '[]');

function saveCart() {
  localStorage.setItem('luxe_cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const el = document.getElementById('cartCount');
  if (el) el.textContent = cart.reduce((s, i) => s + i.qty, 0);
}

function addToCart(productId, size) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(i => i.id === productId && i.size === size);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: productId, name: product.name, price: product.price, size, qty: 1, color: product.color });
  }
  saveCart();
  showToast(`${product.name} added to cart`);
}

function removeFromCart(productId, size) {
  cart = cart.filter(i => !(i.id === productId && i.size === size));
  saveCart();
}

function formatPrice(n) {
  return '₹' + n.toLocaleString('en-IN');
}

function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function renderProductCard(product) {
  return `
    <div class="product-card" onclick="window.location='${isSubPage() ? '' : ''}pages/product.html?id=${product.id}'">
      <div class="product-img-wrap">
        <div class="product-img" style="background: ${product.color};"></div>
        ${product.badge ? `<div class="product-badge ${product.badgeStyle}">${product.badge}</div>` : ''}
        <div class="product-quick-add" onclick="event.stopPropagation(); addToCart(${product.id},'${product.sizes[0]}')">Quick Add</div>
      </div>
      <p class="product-name">${product.name}</p>
      <p class="product-sub">${product.sub}</p>
      <div class="product-price-row">
        <span class="product-price">${formatPrice(product.price)}</span>
        ${product.originalPrice ? `<span class="product-price-original">${formatPrice(product.originalPrice)}</span>` : ''}
      </div>
    </div>
  `;
}

function isSubPage() {
  return window.location.pathname.includes('/pages/');
}

updateCartCount();
