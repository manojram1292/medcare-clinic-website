-- Patient-facing enhancements:
-- - extra clinic info fields (parking, insurance, what-to-bring, walk-in policy, languages)
-- - live wait-time indicator (admin sets, page shows freshness)
-- - per-doctor profile fields (slug, languages, education, conditions, years)
-- - FAQs table

alter table public.clinic add column if not exists parking_info       text;
alter table public.clinic add column if not exists insurance_info     text;
alter table public.clinic add column if not exists what_to_bring      text;
alter table public.clinic add column if not exists walk_in_policy     text;
alter table public.clinic add column if not exists languages_supported text[] not null default '{}';
alter table public.clinic add column if not exists current_wait_minutes int;
alter table public.clinic add column if not exists wait_updated_at    timestamptz;

alter table public.doctors add column if not exists slug              text unique;
alter table public.doctors add column if not exists languages         text[] not null default '{}';
alter table public.doctors add column if not exists education         text;
alter table public.doctors add column if not exists conditions        text[] not null default '{}';
alter table public.doctors add column if not exists years_experience  int;

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null default '',
  category text not null default 'General',
  sort int not null default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);

create index if not exists idx_faqs_sort on public.faqs(sort);

alter table public.faqs enable row level security;

drop policy if exists "public_read" on public.faqs;
create policy "public_read" on public.faqs for select using (true);

drop policy if exists "admin_write" on public.faqs;
create policy "admin_write" on public.faqs for all
  using (public.is_admin()) with check (public.is_admin());

-- Backfill slug for existing doctors based on name (idempotent).
update public.doctors
   set slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9 -]', '', 'g'), '\s+', '-', 'g'))
 where slug is null;
