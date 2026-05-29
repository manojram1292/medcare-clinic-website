-- ============================================================================
-- Dynamic clinic logo — uploaded from the admin panel, shown in the
-- public navbar + footer in place of the default gradient cross mark.
-- ============================================================================

alter table public.clinic
  add column if not exists logo_url text;
