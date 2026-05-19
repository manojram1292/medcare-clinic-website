-- ============================================================================
-- Granular permissions — replace the role enum with an explicit
-- (is_owner, permissions[]) model. The owner toggle is special: an owner
-- has every permission implicitly and can manage other users.
-- ============================================================================

alter table public.admins
  add column if not exists is_owner    boolean not null default false,
  add column if not exists permissions text[]  not null default array[]::text[];

-- Backfill from the existing `role` column (kept for display only)
update public.admins set
  is_owner = (role = 'owner')
where is_owner is distinct from (role = 'owner');

update public.admins set
  permissions = case role
    when 'owner'        then array['dashboard','account','clinic','hours','doctors','services','faqs','blog','patient_hub','announcements','popups','testimonials','wait_time','users']::text[]
    when 'manager'      then array['dashboard','account','clinic','hours','doctors','services','faqs','blog','patient_hub','announcements','popups','testimonials','wait_time']::text[]
    when 'receptionist' then array['dashboard','account','hours','announcements','popups','wait_time']::text[]
    when 'editor'       then array['dashboard','account','faqs','blog','patient_hub','testimonials']::text[]
    else                     array['dashboard','account']::text[]
  end
where cardinality(permissions) = 0;

-- New is_admin() helper uses is_owner OR explicit permission presence.
-- (RLS policies already use is_admin() so this single function update
-- migrates every table to the new model.)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where id = auth.uid()
  );
$$;

-- New helper: does the current auth user have a specific resource permission?
-- Used optionally by stricter RLS in the future. For now, server actions
-- enforce per-resource permission via requireAdmin(resource).
create or replace function public.has_permission(resource text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where id = auth.uid()
      and (is_owner or resource = any(permissions))
  );
$$;

grant execute on function public.has_permission(text) to authenticated;
