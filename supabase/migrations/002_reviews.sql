-- Customer reviews table
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  brand text not null check (brand in ('organics', 'trends')),
  reviewer_name text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text not null default '',
  created_at timestamptz default now()
);

-- Anyone can read reviews
alter table reviews enable row level security;
create policy "Anyone can read reviews" on reviews for select using (true);
-- Anyone can insert reviews (public form)
create policy "Anyone can insert reviews" on reviews for insert with check (true);
-- Only authenticated users can delete reviews
create policy "Authenticated users can delete reviews" on reviews for delete using (auth.role() = 'authenticated');
