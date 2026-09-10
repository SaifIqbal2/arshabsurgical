create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);
create table if not exists categories (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  description text, image_url text, seo_title text, seo_description text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists products (
  id uuid primary key default gen_random_uuid(), category_id uuid references categories(id) on delete restrict,
  name text not null, slug text not null unique, sku text not null unique, short_description text,
  description text, features jsonb not null default '[]', specifications jsonb not null default '{}',
  main_image_url text, seo_title text, seo_description text, seo_keywords text,
  is_published boolean not null default false, is_featured boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists hero_slides (
  id uuid primary key default gen_random_uuid(),
  eyebrow text not null default 'ARSHAB SURGICAL / EST. IN SIALKOT',
  title text not null,
  accent text not null,
  description text not null,
  image_url text not null,
  cta_label text not null default 'Explore products',
  cta_url text not null default '/products',
  caption text not null default 'Trusted by professionals',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references products(id) on delete cascade,
  image_url text not null, sort_order integer not null default 0, created_at timestamptz not null default now()
);
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(), name text not null, email text not null, phone text,
  company text, product_id uuid references products(id) on delete set null, subject text, message text not null,
  status text not null default 'unread' check (status in ('unread','read','archived')),
  created_at timestamptz not null default now()
);
create index if not exists products_category_idx on products(category_id);
create index if not exists products_published_idx on products(is_published);
create index if not exists inquiries_status_idx on inquiries(status);

alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table hero_slides enable row level security;
alter table product_images enable row level security;
alter table inquiries enable row level security;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;
create policy "published categories are public" on categories for select using (true);
create policy "published products are public" on products for select using (is_published or public.is_admin());
create policy "active hero slides are public" on hero_slides for select using (is_active or public.is_admin());
create policy "published images are public" on product_images for select using (exists (select 1 from products where products.id = product_id and (is_published or public.is_admin())));
create policy "anyone can submit inquiries" on inquiries for insert with check (true);
create policy "admins manage categories" on categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage products" on products for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage hero slides" on hero_slides for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage images" on product_images for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage inquiries" on inquiries for all using (public.is_admin()) with check (public.is_admin());

-- Create/configure the public image bucket before applying its policies.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('image', 'image', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "public can view image bucket" on storage.objects;
drop policy if exists "admins can upload image bucket" on storage.objects;
drop policy if exists "admins can update image bucket" on storage.objects;
drop policy if exists "admins can delete image bucket" on storage.objects;

create policy "public can view image bucket" on storage.objects for select using (bucket_id = 'image');
create policy "admins can upload image bucket" on storage.objects for insert with check (bucket_id = 'image' and public.is_admin());
create policy "admins can update image bucket" on storage.objects for update using (bucket_id = 'image' and public.is_admin()) with check (bucket_id = 'image' and public.is_admin());
create policy "admins can delete image bucket" on storage.objects for delete using (bucket_id = 'image' and public.is_admin());
