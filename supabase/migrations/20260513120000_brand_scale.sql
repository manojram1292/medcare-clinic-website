-- ============================================================================
-- Curated appearance control: brand-name size in the header + footer.
-- Stored as a numeric multiplier, constrained so it can never break the
-- layout. 1.0 = current default; admin picks from named options that map
-- to 1.0 / 1.15 / 1.3 / 1.5.
-- ============================================================================

alter table public.clinic
  add column if not exists brand_scale numeric not null default 1.0
    check (brand_scale >= 1.0 and brand_scale <= 1.6);
