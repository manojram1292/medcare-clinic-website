-- "Why choose us" stats strip — admin-editable.
-- Stored as a jsonb array on clinic so it can flex from 1–6 items
-- without table migrations later.

alter table public.clinic add column if not exists stats jsonb not null default '[]'::jsonb;
