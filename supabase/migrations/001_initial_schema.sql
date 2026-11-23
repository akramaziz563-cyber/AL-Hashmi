-- Supabase / PostgreSQL Schema for Al Hashmi Real Estate Agency Sahiwal
-- Run this migration in your Supabase SQL Editor when deploying to PostgreSQL + Next.js.

create extension if not exists "pgcrypto";

create type property_purpose as enum ('sale', 'rent');
create type property_type as enum (
  'house', 'plot', 'apartment', 'shop', 'office', 'agricultural_land', 'commercial_building'
);
create type property_status as enum ('for_sale', 'for_rent', 'sold', 'rented');
create type area_unit as enum ('marla', 'kanal', 'sq_ft', 'acre');
create type furnishing_status as enum ('unfurnished', 'semi_furnished', 'furnished');
create type gallery_category as enum ('Houses', 'Plots', 'Commercial', 'Projects');
create type inquiry_status as enum ('new', 'contacted', 'closed');
create type staff_role as enum ('admin', 'editor');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null,
  role staff_role not null default 'editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  purpose property_purpose not null,
  type property_type not null,
  price_pkr numeric(14, 0) not null check (price_pkr >= 0),
  area_value numeric(10, 2) not null check (area_value > 0),
  area_unit area_unit not null default 'marla',
  bedrooms integer not null default 0,
  bathrooms integer not null default 0,
  parking integer not null default 0,
  furnished furnishing_status not null default 'unfurnished',
  year_built integer,
  address text not null,
  area_name text not null,
  lat double precision,
  lng double precision,
  amenities text[] not null default '{}',
  status property_status not null default 'for_sale',
  featured boolean not null default false,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_properties_slug on public.properties(slug);
create index if not exists idx_properties_status on public.properties(status);
create index if not exists idx_properties_purpose on public.properties(purpose);
create index if not exists idx_properties_type on public.properties(type);
create index if not exists idx_properties_price on public.properties(price_pkr);

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  url text not null,
  alt_text text not null default '',
  is_cover boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  caption text not null,
  category gallery_category not null,
  property_id uuid references public.properties(id) on delete set null,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text not null,
  property_id uuid references public.properties(id) on delete set null,
  property_title text,
  source_page text not null,
  status inquiry_status not null default 'new',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id text primary key default 'default',
  agency_name text not null default 'Al Hashmi Real Estate Agency Sahiwal',
  phone text not null default '0300 8620646',
  whatsapp_number text not null default '923008620646',
  address text not null default 'M7PQ+XM6 Tehsil, 1.5 Hardosohal Road, Ahdian Road, Bashir Town, Rana Town, Ferozewala, 54950, Pakistan',
  email text,
  working_hours text default 'Monday to Saturday, 9:00 AM – 7:00 PM',
  facebook_url text,
  instagram_url text,
  google_maps_url text not null default 'https://maps.app.goo.gl/sk6HBnaCcjvm8L1h6',
  google_rating numeric(2, 1) not null default 4.7,
  review_count integer not null default 31,
  hero_headline text not null default 'Trusted real estate guidance in Sahiwal and Ferozewala',
  hero_subheadline text not null default 'Verified residential homes, plots, and commercial properties handled with plain dealing and clear documentation.',
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.gallery_images enable row level security;
alter table public.inquiries enable row level security;
alter table public.site_settings enable row level security;

create or replace function public.is_staff()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- RLS Policies
create policy "Public read properties" on public.properties for select using (true);
create policy "Staff write properties" on public.properties for all using (public.is_staff()) with check (public.is_staff());

create policy "Public read property images" on public.property_images for select using (true);
create policy "Staff write property images" on public.property_images for all using (public.is_staff()) with check (public.is_staff());

create policy "Public read gallery" on public.gallery_images for select using (true);
create policy "Staff write gallery" on public.gallery_images for all using (public.is_staff()) with check (public.is_staff());

create policy "Public insert inquiry" on public.inquiries for insert with check (status = 'new');
create policy "Staff read/update/delete inquiries" on public.inquiries for select using (public.is_staff());
create policy "Staff modify inquiries" on public.inquiries for update using (public.is_staff()) with check (public.is_staff());
create policy "Staff delete inquiries" on public.inquiries for delete using (public.is_staff());

create policy "Public read settings" on public.site_settings for select using (true);
create policy "Admin update settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

create policy "Own or admin read profiles" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "Admin manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
