-- ============================================================================
-- MedCare Clinic — full schema
-- Run once in the Supabase SQL editor on a fresh project.
-- ============================================================================

-- 1) Tables ------------------------------------------------------------------

create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.clinic (
  id int primary key default 1,
  name text not null default 'MedCare Family Clinic',
  tagline text not null default 'Family Medicine & Physiotherapy',
  phone text not null default '+1 (902) 555-0192',
  email text not null default 'care@medcareclinic.ca',
  address text not null default '42 Wellness Avenue, Suite 101, Mineville, NS B2Z 1K9',
  emergency_text text not null default
    'For life-threatening emergencies, please call 911 or visit your nearest hospital emergency department immediately.',
  hero_eyebrow text not null default 'Family Medicine · Mineville, Nova Scotia',
  hero_title_1 text not null default 'Your Family''s Health,',
  hero_title_2 text not null default 'In Caring Hands',
  hero_body text not null default
    'We are a team of dedicated family physicians and physiotherapists committed to building lasting relationships with our patients. Because the best care begins with truly knowing the people we serve.',
  about_mission text not null default
    'Great medicine begins with a relationship. At MedCare, our physicians invest in knowing each patient — their history, their lifestyle, their goals. We build the kind of trust that makes medicine truly personal.',
  about_quote text not null default
    'Our goal is not just to treat illness, but to partner with our patients in building lifelong health.',
  google_maps_embed text default null,
  updated_at timestamptz default now(),
  constraint clinic_singleton check (id = 1)
);

create table if not exists public.hours (
  day_index int primary key check (day_index between 0 and 6), -- 0 = Monday, 6 = Sunday
  day_name text not null,
  open_time text,
  close_time text,
  closed boolean not null default false,
  override_note text default null
);

create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  initials text not null,
  specialty text not null,
  bio text not null default '',
  status text not null default 'available' check (status in ('available','limited','off')),
  photo_url text default null,
  schedule jsonb not null default '{}'::jsonb,  -- { Monday: "9:00 AM – 5:00 PM" | null }
  sort int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  icon text not null default '🏥',
  color text not null default 'ic-teal' check (color in ('ic-teal','ic-navy','ic-green','ic-amber')),
  tags text[] not null default '{}',
  sort int not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  name text not null,
  tag text not null default '',
  initials text not null,
  rating int not null default 5 check (rating between 1 and 5),
  sort int not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  initials text not null,
  role text not null default ''
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null default 'General',
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  cover_url text default null,
  cover_gradient text not null default 'bcim-1',
  author_id uuid references public.authors(id) on delete set null,
  read_minutes int not null default 5,
  published boolean not null default false,
  published_at timestamptz default now(),
  featured boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.announcement (
  id int primary key default 1,
  message text not null default
    'Walk-ins welcome — we''ll do our best to see you the same day.',
  active boolean not null default true,
  urgent boolean not null default false,
  updated_at timestamptz default now(),
  constraint announcement_singleton check (id = 1)
);

create table if not exists public.popup_alert (
  id int primary key default 1,
  active boolean not null default false,
  urgent boolean not null default false,
  title text not null default 'Important notice',
  body text not null default '',
  cta_label text default null,
  cta_url text default null,
  -- A version bump forces the popup to show again to dismissers
  version int not null default 1,
  updated_at timestamptz default now(),
  constraint popup_singleton check (id = 1)
);

create index if not exists idx_doctors_sort on public.doctors(sort);
create index if not exists idx_services_sort on public.services(sort);
create index if not exists idx_testimonials_sort on public.testimonials(sort);
create index if not exists idx_blog_published on public.blog_posts(published, published_at desc);

-- 2) updated_at triggers -----------------------------------------------------

create or replace function public.set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_clinic_updated on public.clinic;
create trigger trg_clinic_updated before update on public.clinic
  for each row execute function public.set_updated_at();

drop trigger if exists trg_doctors_updated on public.doctors;
create trigger trg_doctors_updated before update on public.doctors
  for each row execute function public.set_updated_at();

drop trigger if exists trg_blog_updated on public.blog_posts;
create trigger trg_blog_updated before update on public.blog_posts
  for each row execute function public.set_updated_at();

drop trigger if exists trg_announcement_updated on public.announcement;
create trigger trg_announcement_updated before update on public.announcement
  for each row execute function public.set_updated_at();

drop trigger if exists trg_popup_updated on public.popup_alert;
create trigger trg_popup_updated before update on public.popup_alert
  for each row execute function public.set_updated_at();

-- 3) Row-level security ------------------------------------------------------

alter table public.clinic         enable row level security;
alter table public.hours          enable row level security;
alter table public.doctors        enable row level security;
alter table public.services       enable row level security;
alter table public.testimonials   enable row level security;
alter table public.authors        enable row level security;
alter table public.blog_posts     enable row level security;
alter table public.announcement   enable row level security;
alter table public.popup_alert    enable row level security;
alter table public.admins         enable row level security;

-- helper: is the current user an admin?
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admins where id = auth.uid());
$$;

-- public read policies (everyone, including unauthenticated, can read)
do $$
declare t text;
begin
  for t in
    select unnest(array['clinic','hours','doctors','services','testimonials',
                        'authors','blog_posts','announcement','popup_alert'])
  loop
    execute format('drop policy if exists "public_read" on public.%I', t);
    execute format('create policy "public_read" on public.%I for select using (true)', t);
  end loop;
end $$;

-- admin-only write policies
do $$
declare t text;
begin
  for t in
    select unnest(array['clinic','hours','doctors','services','testimonials',
                        'authors','blog_posts','announcement','popup_alert'])
  loop
    execute format('drop policy if exists "admin_write" on public.%I', t);
    execute format('create policy "admin_write" on public.%I for all
                    using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- admins table — readable only to admins, writable only by service role
drop policy if exists "admin_self_read" on public.admins;
create policy "admin_self_read" on public.admins for select
  using (public.is_admin());
