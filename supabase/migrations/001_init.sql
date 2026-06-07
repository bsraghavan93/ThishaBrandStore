create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  brand text not null check (brand in ('organics','trends')),
  category text not null,
  price numeric(10,2) not null,
  description text,
  images text[] default '{}',
  in_stock boolean default true,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  customer_name text,
  customer_phone text,
  customer_email text,
  address text,
  city text,
  notes text,
  items jsonb,
  total numeric(10,2),
  status text default 'pending',
  created_at timestamptz default now()
);

alter table products enable row level security;
alter table orders enable row level security;

create policy "Public can read products" on products for select using (true);
create policy "Authenticated users manage products" on products for all using (auth.role() = 'authenticated');
create policy "Anyone can insert orders" on orders for insert with check (true);
create policy "Authenticated users read orders" on orders for select using (auth.role() = 'authenticated');
