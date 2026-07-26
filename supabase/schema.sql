-- Niza Shop Supabase schema
-- Run in Supabase SQL Editor

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gender text not null check (gender in ('girls', 'boys', 'unisex')),
  icon text not null default '🛍️',
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  price int not null check (price >= 0),
  original_price int not null check (original_price >= 0),
  images text[] not null default '{}',
  emoji text not null default '🛍️',
  description text not null default '',
  colors text[] not null default '{}',
  stock_qty int not null default 0,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_flash_sale boolean not null default false,
  badge text check (badge is null or badge in ('New', 'Hot', 'Sale', 'Trending', 'Premium')),
  created_at timestamptz not null default now()
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null default '',
  items jsonb not null default '[]'::jsonb,
  subtotal int not null,
  delivery_fee int not null default 450,
  grand_total int not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'dispatched', 'delivered')),
  whatsapp_sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Public read for catalog
create policy "Public read categories"
  on public.categories for select
  using (true);

create policy "Public read active products"
  on public.products for select
  using (true);

-- Anyone can insert orders (checkout)
create policy "Public insert orders"
  on public.orders for insert
  with check (true);

-- Authenticated admins manage everything
create policy "Auth manage categories"
  on public.categories for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Auth manage products"
  on public.products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Auth read/update orders"
  on public.orders for select
  using (auth.role() = 'authenticated');

create policy "Auth update orders"
  on public.orders for update
  using (auth.role() = 'authenticated');

-- Storage bucket for product images (create via dashboard or):
-- insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);

-- Seed categories
insert into public.categories (id, name, gender, icon, slug) values
  ('a1000001-0001-4000-8000-000000000001', 'Handbags', 'girls', '👜', 'handbags'),
  ('a1000001-0001-4000-8000-000000000002', 'Purses / Wallets', 'girls', '👛', 'purses-wallets'),
  ('a1000001-0001-4000-8000-000000000003', 'Ladies Slippers', 'girls', '🩴', 'ladies-slippers'),
  ('a1000001-0001-4000-8000-000000000004', 'Ladies Watches', 'girls', '⌚', 'ladies-watches'),
  ('a1000001-0001-4000-8000-000000000005', 'Hair Accessories', 'girls', '🎀', 'hair-accessories'),
  ('a1000001-0001-4000-8000-000000000006', 'Jewellery / Bangles', 'girls', '💍', 'jewellery-bangles'),
  ('a1000001-0001-4000-8000-000000000007', 'Phone Back Covers', 'boys', '📱', 'phone-back-covers'),
  ('a1000001-0001-4000-8000-000000000008', 'Men''s Wallets', 'boys', '💵', 'mens-wallets'),
  ('a1000001-0001-4000-8000-000000000009', 'Men''s Watches', 'boys', '⏱️', 'mens-watches'),
  ('a1000001-0001-4000-8000-00000000000a', 'Belts', 'boys', '👔', 'belts'),
  ('a1000001-0001-4000-8000-00000000000b', 'Caps / Accessories', 'boys', '🧢', 'caps-accessories')
on conflict (slug) do nothing;

-- Seed products
insert into public.products (
  name, category_id, price, original_price, emoji, description, colors,
  stock_qty, is_active, is_featured, is_flash_sale, badge
) values
  ('Rose Pink Handbag', 'a1000001-0001-4000-8000-000000000001', 1800, 2400, '👜',
   'Elegant rose pink handbag sourced from Pettah wholesale market.',
   array['#e91e8c','#f9a8d4','#000000'], 12, true, true, true, 'New'),
  ('Ladies Purse Wallet', 'a1000001-0001-4000-8000-000000000002', 650, 900, '👛',
   'Compact ladies purse wallet with card slots and secure zip.',
   array['#be185d','#7c3aed','#1f2937'], 20, true, true, false, 'Hot'),
  ('Fashion Slippers', 'a1000001-0001-4000-8000-000000000003', 850, 1200, '🩴',
   'Comfortable fashion slippers for ladies.',
   array['#f59e0b','#e91e8c','#ffffff'], 15, true, false, true, 'Sale'),
  ('Ladies Gold Watch', 'a1000001-0001-4000-8000-000000000004', 2200, 3000, '⌚',
   'Premium gold-tone ladies watch with a refined dial.',
   array['#f59e0b','#d4d4d8','#e91e8c'], 8, true, true, false, 'Premium'),
  ('Crossbody Mini Bag', 'a1000001-0001-4000-8000-000000000001', 1400, 1800, '🛍️',
   'Trendy crossbody mini bag with adjustable strap.',
   array['#0f0f1a','#e91e8c','#7c3aed'], 10, true, true, false, 'Trending'),
  ('iPhone 15 Back Cover', 'a1000001-0001-4000-8000-000000000007', 450, 700, '📱',
   'Durable iPhone 15 back cover with precise cutouts.',
   array['#000000','#3b82f6','#ef4444'], 25, true, true, true, 'Hot'),
  ('Samsung A55 Cover', 'a1000001-0001-4000-8000-000000000007', 400, 600, '📱',
   'Perfect-fit Samsung A55 cover with grip texture.',
   array['#111827','#22c55e','#f59e0b'], 18, true, false, false, 'New'),
  ('Men''s Leather Wallet', 'a1000001-0001-4000-8000-000000000008', 1200, 1600, '💵',
   'Genuine-feel leather wallet for men.',
   array['#78350f','#000000','#374151'], 14, true, true, false, 'Premium'),
  ('Sports Watch', 'a1000001-0001-4000-8000-000000000009', 1800, 2500, '⏱️',
   'Rugged sports watch with chronograph look.',
   array['#000000','#1e40af','#dc2626'], 9, true, true, true, 'Sale'),
  ('Redmi Note 13 Cover', 'a1000001-0001-4000-8000-000000000007', 380, 550, '📱',
   'Affordable Redmi Note 13 cover with matte finish.',
   array['#0f172a','#e91e8c','#7c3aed'], 22, true, false, false, 'Hot');
