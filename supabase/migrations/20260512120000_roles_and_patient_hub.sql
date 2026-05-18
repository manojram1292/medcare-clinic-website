-- ============================================================================
-- Roles for admins + Patient Hub feature (with full-text search)
-- ============================================================================

-- ─── ROLES ────────────────────────────────────────────────────────────────
alter table public.admins
  add column if not exists role text not null default 'owner'
    check (role in ('owner','manager','receptionist','editor'));

-- ─── PATIENT HUB ──────────────────────────────────────────────────────────
create table if not exists public.patient_hub (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  excerpt       text default '' not null,
  body          text default '' not null,
  category      text default 'General' not null,
  cover_url     text,
  cover_gradient text default 'bcim-1' not null,
  related_links jsonb default '[]'::jsonb not null,
  tags          text[] default array[]::text[] not null,
  read_minutes  int default 4 not null,
  published     boolean default false not null,
  featured      boolean default false not null,
  sort          int default 0 not null,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- tsvector column is maintained by a trigger (not a generated column) because
-- to_tsvector(regconfig,text) is STABLE not IMMUTABLE, and Postgres requires
-- immutable expressions in GENERATED columns.
alter table public.patient_hub
  add column if not exists search_vector tsvector;

create or replace function public.patient_hub_search_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title,'')),    'A') ||
    setweight(to_tsvector('english', coalesce(new.excerpt,'')),  'B') ||
    setweight(to_tsvector('english', coalesce(new.category,'')), 'B') ||
    setweight(to_tsvector('english', array_to_string(new.tags,' ')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.body,'')),     'C');
  return new;
end $$;

drop trigger if exists patient_hub_search_trg on public.patient_hub;
create trigger patient_hub_search_trg
  before insert or update of title, excerpt, category, tags, body
  on public.patient_hub
  for each row execute function public.patient_hub_search_update();

-- Backfill any existing rows
update public.patient_hub set title = title;

create index if not exists patient_hub_search_idx
  on public.patient_hub using gin(search_vector);

create index if not exists patient_hub_published_idx
  on public.patient_hub (published, sort) where published = true;

-- Update trigger for updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists patient_hub_touch on public.patient_hub;
create trigger patient_hub_touch
  before update on public.patient_hub
  for each row execute function public.touch_updated_at();

-- ─── RLS ──────────────────────────────────────────────────────────────────
alter table public.patient_hub enable row level security;

drop policy if exists "public_read" on public.patient_hub;
create policy "public_read" on public.patient_hub
  for select using (true);

drop policy if exists "admin_write" on public.patient_hub;
create policy "admin_write" on public.patient_hub
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── RPC: full-text search ────────────────────────────────────────────────
create or replace function public.search_patient_hub(q text)
returns setof public.patient_hub
language sql stable as $$
  select *
  from public.patient_hub
  where published = true
    and (
      search_vector @@ websearch_to_tsquery('english', q)
      or title   ilike '%' || q || '%'
      or excerpt ilike '%' || q || '%'
    )
  order by
    ts_rank(coalesce(search_vector, ''::tsvector), websearch_to_tsquery('english', q)) desc,
    sort asc,
    created_at desc;
$$;

grant execute on function public.search_patient_hub(text) to anon, authenticated;
