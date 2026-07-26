# Niza Shop

**Sri Lankan fashion resale e-commerce** for Girls & Boys.  
Products sourced from **Pettah wholesale market (Colombo)** and sold island-wide via **WhatsApp orders**.

**Live target:** [niza-shop.vercel.app](https://niza-shop.vercel.app)

---

## Features

### Customer storefront
- Sticky navbar with cart badge
- Three.js animated hero (floating bags, stars, sparkles)
- Gender tabs: **Girls | Boys | All**
- Flash sale countdown banner (admin-controlled)
- Optional promo / offer strip
- Horizontal category chips
- Responsive product grid (2 cols mobile / 4 cols desktop)
- Product badges: New, Hot, Sale, Trending, Premium + Sold Out
- Product detail page with color/size selectors and 360-degree Three.js viewer
- Slide-in cart drawer with quantity controls
- One-tap **Order via WhatsApp** with a formatted order message

### Admin panel (`/admin`)
- Password / Supabase Auth protected
- Add, edit, delete products (name, prices, emoji, stock, colors, sizes, badge, description)
- Toggle **Active / Sold Out**, **Flash Sale**, **Featured**
- Image upload via Supabase Storage (when configured)
- **Offers & Flash** tab — banner text, countdown end time, promo strip, delivery fee
- Orders list + status updates
- Revenue summary
- All catalog/offer changes update the **live customer shop immediately**

---

## Tech stack

| Layer | Technology |
|--------|------------|
| UI | React 18, TypeScript, Vite |
| 3D | Three.js via `@react-three/fiber` + `@react-three/drei` |
| Styling | Tailwind CSS |
| State | Zustand (cart + shared catalog/offers) |
| Backend | Supabase (PostgreSQL, Auth, Storage) — optional for local demo |
| Routing | React Router v6 |
| Deploy | Vercel |

---

## Quick start

**Requirements:** Node.js 18+ and npm.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start development server
npm run dev
```

Open **http://localhost:5173**

Without Supabase credentials, the app runs fully with **built-in seed products** and persists admin edits in the browser (local catalog).

---

## Environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_WHATSAPP_NUMBER=94XXXXXXXXX
```

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_WHATSAPP_NUMBER` | Business WhatsApp number in international format (no `+` or spaces), e.g. `94771234567` |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Project structure

```text
src/
├── components/
│   ├── Admin/Dashboard.tsx      # Products, offers, orders, revenue
│   ├── Cart/                    # Cart drawer + WhatsApp order builder
│   ├── Categories/              # Gender tabs + category chips
│   ├── FlashSale/               # Live countdown banner
│   ├── Hero/                    # Hero + Three.js canvas
│   ├── Navbar/
│   └── Products/                # Grid, card, detail, 360° viewer
├── data/seed.ts                 # Default categories & products
├── hooks/                       # useProducts, useCategories
├── lib/supabase.ts              # Supabase client (optional)
├── pages/                       # Home, ProductDetail, Admin
├── store/
│   ├── cartStore.ts             # Cart state
│   └── catalogStore.ts          # Shared products + offers (powers admin <-> shop)
├── types/
└── App.tsx
supabase/
└── schema.sql                   # Tables, RLS, seed SQL
```

---

## Categories

**Girls:** Handbags, Purses / Wallets, Ladies Slippers, Ladies Watches, Hair Accessories, Jewellery / Bangles  

**Boys:** Phone Back Covers, Men's Wallets, Men's Watches, Belts, Caps / Accessories  

---


| Mode | How to sign in 
## WhatsApp order flow

1. Customer adds items to cart  
2. Enters their name  
3. Taps **Order via WhatsApp**  
4. App opens:

```text
https://wa.me/{VITE_WHATSAPP_NUMBER}?text={encoded message}
```

Example message shape:

```text
🛍️ *Niza Shop — New Order!*

👤 *Customer:* Amina

📦 *Order Items:*
1. 👜 Rose Pink Handbag (x1) — Rs. 1,800
2. 📱 iPhone Cover (x2) — Rs. 900

💰 *Subtotal:* Rs. 2,700
🚚 *Delivery:* Rs. 450
💳 *Grand Total:* Rs. 3,150

Please confirm my order! ✅
```

Delivery fee defaults to **Rs. 450** and is editable in **Admin → Offers & Flash**.

---

## Supabase setup (production)

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run [`supabase/schema.sql`](./supabase/schema.sql)
3. Create a **public** Storage bucket named `product-images`
4. Create an Auth user for the admin panel
5. Copy Project URL + anon key into `.env` (and Vercel)

### Database tables

- `categories` — name, gender, icon, slug  
- `products` — pricing, images, stock, badges, flash flags  
- `orders` — customer name, items (JSON), totals, status  

---

## Deploy on Vercel

1. Push this repo to GitHub  
2. Import the project in [Vercel](https://vercel.com)  
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_WHATSAPP_NUMBER`
4. Deploy  

SPA routing is handled by [`vercel.json`](./vercel.json).

```bash
npm run build
```

---

## Design system

| Token | Value |
|-------|--------|
| Primary pink | `#e91e8c` |
| Dark background | `#0f0f1a` |
| Purple accent | `#7c3aed` |
| Gold | `#f59e0b` |
| Font | Inter (Google Fonts) |
| Cards | `16px` radius |

Mobile-first layout with smooth card hover states and a right-side cart drawer.

---

## License

Private project — all rights reserved for Niza Shop.
