// ─────────────────────────────────────────────
//  LUXE Backend — Express + SQLite (sql.js)
//  Three-tier: Frontend → API → Database
//  Run: node server.js
//  API on: http://localhost:3000
// ─────────────────────────────────────────────

const express    = require('express');
const cors       = require('cors');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const fs         = require('fs');
const path       = require('path');
const initSqlJs  = require('sql.js');

const app      = express();
const PORT     = 3000;
const DB_FILE  = path.join(__dirname, 'luxe.db');
const JWT_SECRET = 'luxe_secret_2026_change_in_production';

app.use(cors());
app.use(express.json());

// ─── SERVE FRONTEND ───────────────────────────
app.use(express.static(path.join(__dirname, '..')));

// ─── DATABASE SETUP ───────────────────────────
let db;

async function initDB() {
  const SQL = await initSqlJs();

  // Load existing DB file or create fresh
  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
    console.log('✓ Loaded existing database');
  } else {
    db = new SQL.Database();
    console.log('✓ Created new database');
  }

  // Save helper — persists in-memory DB to file
  global.saveDB = () => {
    const data = db.export();
    fs.writeFileSync(DB_FILE, Buffer.from(data));
  };

  createTables();
  seedData();
  saveDB();
  console.log('✓ Database ready');
}

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT    NOT NULL,
      email     TEXT    UNIQUE NOT NULL,
      password  TEXT    NOT NULL,
      role      TEXT    DEFAULT 'customer',
      created_at TEXT   DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      category    TEXT    NOT NULL,
      sub         TEXT,
      price       INTEGER NOT NULL,
      original_price INTEGER,
      badge       TEXT,
      description TEXT,
      stock       INTEGER DEFAULT 50,
      color_css   TEXT,
      created_at  TEXT    DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER REFERENCES users(id),
      total       INTEGER NOT NULL,
      status      TEXT    DEFAULT 'pending',
      address     TEXT,
      created_at  TEXT    DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id   INTEGER REFERENCES orders(id),
      product_id INTEGER REFERENCES products(id),
      size       TEXT,
      qty        INTEGER NOT NULL,
      price      INTEGER NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cart (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER REFERENCES users(id),
      product_id INTEGER REFERENCES products(id),
      size       TEXT    NOT NULL,
      qty        INTEGER DEFAULT 1,
      UNIQUE(user_id, product_id, size)
    );
  `);
}

function seedData() {
  // Only seed if products table is empty
  const result = db.exec('SELECT COUNT(*) as cnt FROM products');
  const count = result[0]?.values[0][0];
  if (count > 0) return;

  const products = [
    ['Cashmere Wrap Coat', 'women', 'Outerwear', 38500, null, 'New',
     'Oversized silhouette in 100% Mongolian cashmere. Unlined for drape. Horn buttons.', 30,
     'linear-gradient(160deg,#2C2420,#6B4B35)'],
    ['Silk Bias Slip Dress', 'women', 'Dresses', 18900, 24000, 'Sale',
     'Bias-cut in washed silk charmeuse. Adjustable spaghetti straps.', 20,
     'linear-gradient(160deg,#3A2C20,#6B5040)'],
    ['Tailored Linen Blazer', 'men', 'Tailoring', 24000, null, 'New',
     'Single-breasted, two button, half-lined. Italian linen by Solbiati.', 25,
     'linear-gradient(160deg,#1C2128,#3C4A5A)'],
    ['Leather Shoulder Bag', 'accessories', 'Bags', 29500, null, null,
     'Vegetable-tanned Italian leather. Single compartment, card slot interior.', 15,
     'linear-gradient(160deg,#1E1C18,#3A3020)'],
    ['Merino Roll-Neck', 'women', 'Knitwear', 12500, null, 'Best Seller',
     'Extra-fine merino in our 18-gauge rib. Machine washable. 12 colourways.', 60,
     'linear-gradient(160deg,#2A1A10,#5A3020)'],
    ['Wool Pleated Trousers', 'men', 'Trousers', 16800, null, null,
     'Single-pleat, wide leg. 100% Super 110s wool.', 35,
     'linear-gradient(160deg,#252520,#404038)'],
    ['Suede Chelsea Boots', 'accessories', 'Footwear', 21000, 27000, 'Sale',
     'Calf suede upper, leather sole. Elasticated gore. Goodyear welted.', 22,
     'linear-gradient(160deg,#2A2018,#5A4535)'],
    ['Silk Scarf', 'accessories', 'Scarves', 8900, null, 'New',
     '90×90cm. 100% silk twill. Hand-rolled edges. Printed in Como, Italy.', 40,
     'linear-gradient(160deg,#3A2A10,#C4A35A)'],
  ];

  const stmt = db.prepare(`
    INSERT INTO products (name, category, sub, price, original_price, badge, description, stock, color_css)
    VALUES (?,?,?,?,?,?,?,?,?)
  `);
  products.forEach(p => stmt.run(p));
  stmt.free();
  console.log('✓ Seeded products');
}

// ─── HELPERS ──────────────────────────────────
function query(sql, params = []) {
  try {
    const result = db.exec(sql, params);
    if (!result.length) return [];
    const { columns, values } = result[0];
    return values.map(row =>
      Object.fromEntries(columns.map((col, i) => [col, row[i]]))
    );
  } catch (e) {
    console.error('Query error:', e.message);
    throw e;
  }
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDB();
  return db.exec('SELECT last_insert_rowid() as id')[0]?.values[0][0];
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ─── AUTH ROUTES ──────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email, and password are required' });

  const existing = query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length)
    return res.status(409).json({ error: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const id = run('INSERT INTO users (name, email, password) VALUES (?,?,?)', [name, email, hashed]);
  const token = jwt.sign({ id, name, email, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id, name, email } });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  const [user] = query('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET, { expiresIn: '7d' }
  );
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const [user] = query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// ─── PRODUCT ROUTES ───────────────────────────

// GET /api/products
app.get('/api/products', (req, res) => {
  const { category, badge, sort, search } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (badge)    { sql += ' AND badge = ?';    params.push(badge); }
  if (search)   { sql += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  if (sort === 'price-asc')  sql += ' ORDER BY price ASC';
  else if (sort === 'price-desc') sql += ' ORDER BY price DESC';
  else sql += ' ORDER BY id ASC';

  res.json(query(sql, params));
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const [product] = query('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// ─── CART ROUTES ──────────────────────────────

// GET /api/cart
app.get('/api/cart', authMiddleware, (req, res) => {
  const items = query(`
    SELECT c.id, c.size, c.qty, p.id as product_id, p.name, p.price, p.color_css, p.sub
    FROM cart c JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `, [req.user.id]);
  res.json(items);
});

// POST /api/cart
app.post('/api/cart', authMiddleware, (req, res) => {
  const { product_id, size, qty = 1 } = req.body;
  if (!product_id || !size) return res.status(400).json({ error: 'product_id and size required' });

  const [existing] = query(
    'SELECT id, qty FROM cart WHERE user_id = ? AND product_id = ? AND size = ?',
    [req.user.id, product_id, size]
  );

  if (existing) {
    run('UPDATE cart SET qty = qty + ? WHERE id = ?', [qty, existing.id]);
  } else {
    run('INSERT INTO cart (user_id, product_id, size, qty) VALUES (?,?,?,?)',
        [req.user.id, product_id, size, qty]);
  }
  res.json({ success: true });
});

// DELETE /api/cart/:id
app.delete('/api/cart/:id', authMiddleware, (req, res) => {
  run('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ success: true });
});

// DELETE /api/cart — clear all
app.delete('/api/cart', authMiddleware, (req, res) => {
  run('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
  res.json({ success: true });
});

// ─── ORDER ROUTES ─────────────────────────────

// POST /api/orders — place order from cart
app.post('/api/orders', authMiddleware, (req, res) => {
  const { address } = req.body;
  const cartItems = query(`
    SELECT c.qty, c.size, p.id as product_id, p.price, p.stock
    FROM cart c JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `, [req.user.id]);

  if (!cartItems.length) return res.status(400).json({ error: 'Cart is empty' });

  const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const orderId = run(
    'INSERT INTO orders (user_id, total, status, address) VALUES (?,?,?,?)',
    [req.user.id, total, 'confirmed', address || 'Not provided']
  );

  const stmt = db.prepare(
    'INSERT INTO order_items (order_id, product_id, size, qty, price) VALUES (?,?,?,?,?)'
  );
  cartItems.forEach(i => {
    stmt.run([orderId, i.product_id, i.size, i.qty, i.price]);
    db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [i.qty, i.product_id]);
  });
  stmt.free();

  run('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
  saveDB();

  res.status(201).json({ orderId, total, status: 'confirmed' });
});

// GET /api/orders — user's orders
app.get('/api/orders', authMiddleware, (req, res) => {
  const orders = query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json(orders);
});

// GET /api/orders/:id
app.get('/api/orders/:id', authMiddleware, (req, res) => {
  const [order] = query(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const items = query(`
    SELECT oi.*, p.name, p.color_css FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `, [req.params.id]);
  res.json({ ...order, items });
});

// ─── START ────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 LUXE Backend running at http://localhost:${PORT}`);
    console.log(`   Frontend:  http://localhost:${PORT}`);
    console.log(`   API Base:  http://localhost:${PORT}/api`);
    console.log(`\n   Endpoints:`);
    console.log(`   POST /api/auth/register`);
    console.log(`   POST /api/auth/login`);
    console.log(`   GET  /api/products`);
    console.log(`   GET  /api/products/:id`);
    console.log(`   GET  /api/cart          (auth)`);
    console.log(`   POST /api/cart          (auth)`);
    console.log(`   POST /api/orders        (auth)`);
    console.log(`   GET  /api/orders        (auth)`);
  });
});
