# AuraCart — Luxury Shopping Reimagined

A full-stack AI-powered e-commerce platform with a cinematic, premium luxury UI.

![AuraCart](https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express + TypeScript |
| Database | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM |
| Auth | JWT (stateless) |
| State | Zustand + React Query |
| AI | OpenAI GPT-4o-mini |

---

## Features

- **Authentication** — Register, login, JWT-secured routes, role-based access (Admin/User)
- **Product Catalog** — Grid view with search, filters, sort, pagination
- **Product Detail** — Image gallery, add to cart, wishlist toggle, reviews
- **Smart Search** — Live product suggestions powered by the API
- **Shopping Cart** — Persistent cart with quantity controls, slide-in drawer
- **Wishlist** — Save and manage favourite products
- **Checkout** — Multi-step checkout with shipping address form
- **Order Tracking** — Visual progress tracker with status updates
- **Admin Dashboard** — Stats, product CRUD, order management
- **AI Chatbot (AuraBot)** — Product recommendations, smart search, shopping assistant powered by GPT-4o-mini
- **Cinematic UI** — Dark violet gradient, cream glassmorphism cards, floating sidebar, Framer Motion animations

---

## Project Structure

```
auracart/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── db/              # Drizzle schema + connection
│   │   ├── middleware/       # Auth, error handler
│   │   ├── routes/          # Express routers
│   │   └── index.ts         # Entry point
│   ├── drizzle.config.ts
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ai/          # AuraBot chatbot
    │   │   ├── layout/      # Navbar, Sidebar, CartDrawer
    │   │   └── ui/          # ProductCard, SearchModal
    │   ├── hooks/           # React Query hooks
    │   ├── lib/             # Axios instance
    │   ├── pages/           # All page components
    │   │   ├── admin/       # Admin dashboard, products, orders
    │   │   └── auth/        # Login, Register
    │   ├── store/           # Zustand stores
    │   └── types/           # TypeScript types
    └── package.json
```

---

## Quick Start

### 1. Clone and set up

```bash
git clone <your-repo>
cd auracart
```

### 2. Backend

```bash
cd backend
npm install

# Set up environment
cp .env.example .env
# Edit .env with your Neon DB URL and OpenAI key

# Push schema to database
npm run db:push

# Seed demo data
npx tsx src/db/seed.ts

# Start dev server
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install

# Start dev server
npm run dev
```

The frontend runs on **http://localhost:5173** and proxies API requests to **http://localhost:5000**.

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry (default: `7d`) |
| `PORT` | Backend port (default: `5000`) |
| `FRONTEND_URL` | Frontend URL for CORS |
| `OPENAI_API_KEY` | OpenAI API key for AuraBot |

---

## API Endpoints

### Auth
| Method | Path | Auth |
|---|---|---|
| POST | `/api/auth/register` | — |
| POST | `/api/auth/login` | — |
| GET | `/api/auth/me` | ✅ |
| PUT | `/api/auth/profile` | ✅ |
| PUT | `/api/auth/change-password` | ✅ |

### Products
| Method | Path | Auth |
|---|---|---|
| GET | `/api/products` | — |
| GET | `/api/products/featured` | — |
| GET | `/api/products/categories` | — |
| GET | `/api/products/:slug` | — |
| POST | `/api/products` | Admin |
| PUT | `/api/products/:id` | Admin |
| DELETE | `/api/products/:id` | Admin |

### Cart
| Method | Path | Auth |
|---|---|---|
| GET | `/api/cart` | ✅ |
| POST | `/api/cart` | ✅ |
| PUT | `/api/cart/:itemId` | ✅ |
| DELETE | `/api/cart/:itemId` | ✅ |
| DELETE | `/api/cart/clear` | ✅ |

### Wishlist
| Method | Path | Auth |
|---|---|---|
| GET | `/api/wishlist` | ✅ |
| POST | `/api/wishlist/toggle` | ✅ |
| DELETE | `/api/wishlist/:productId` | ✅ |

### Orders
| Method | Path | Auth |
|---|---|---|
| POST | `/api/orders` | ✅ |
| GET | `/api/orders/my-orders` | ✅ |
| GET | `/api/orders/:id` | ✅ |
| GET | `/api/orders/admin/all` | Admin |
| GET | `/api/orders/admin/stats` | Admin |
| PUT | `/api/orders/admin/:id/status` | Admin |

### AI
| Method | Path | Auth |
|---|---|---|
| GET | `/api/ai/suggestions?query=` | — |
| POST | `/api/ai/chat` | ✅ |

---

## Demo Credentials

After seeding:

- **Admin**: `admin@auracart.com` / `admin123`
- **User**: `user@auracart.com` / `user123`

---

## Deployment

### Backend (Railway / Render)
1. Set environment variables
2. `npm run build && npm start`

### Frontend (Vercel / Netlify)
1. Set `VITE_API_URL` if not using the proxy
2. `npm run build` → deploy `dist/`

---

## License

MIT
