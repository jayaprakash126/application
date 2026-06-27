# LUXE — Three-Tier E-commerce Website

## Architecture

```
┌─────────────────────────────────┐
│  TIER 1 — Presentation          │
│  HTML + CSS + JS (Frontend)     │
│  index.html, pages/*.html       │
└──────────────┬──────────────────┘
               │ HTTP / Fetch API
┌──────────────▼──────────────────┐
│  TIER 2 — Application Layer     │
│  Node.js + Express (REST API)   │
│  backend/server.js              │
└──────────────┬──────────────────┘
               │ SQL Queries
┌──────────────▼──────────────────┐
│  TIER 3 — Data Layer            │
│  SQLite Database (sql.js)       │
│  backend/luxe.db (auto-created) │
└─────────────────────────────────┘
```

## Quick Start

### 1. Install backend dependencies
```bash
cd backend
npm install
```

### 2. Start the server
```bash
npm start
```

### 3. Open the site
Visit: **http://localhost:3000**

---

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT token |
| GET  | `/api/auth/me` | Get current user (auth required) |

### Products
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/products` | All products |
| GET | `/api/products?category=women` | Filter by category |
| GET | `/api/products?badge=Sale` | Filter by badge |
| GET | `/api/products?sort=price-asc` | Sort by price |
| GET | `/api/products/:id` | Single product |

### Cart (requires JWT)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart` | Add item `{ product_id, size, qty }` |
| DELETE | `/api/cart/:id` | Remove cart item |
| DELETE | `/api/cart` | Clear entire cart |

### Orders (requires JWT)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/orders` | Place order from cart |
| GET | `/api/orders` | Get user's orders |
| GET | `/api/orders/:id` | Order details with items |

---

## Authentication

Send token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Database Schema

```sql
users         — id, name, email, password, role, created_at
products      — id, name, category, sub, price, original_price, badge, description, stock, color_css
orders        — id, user_id, total, status, address, created_at
order_items   — id, order_id, product_id, size, qty, price
cart          — id, user_id, product_id, size, qty
```

Database file `luxe.db` is auto-created in the `backend/` folder on first run.
