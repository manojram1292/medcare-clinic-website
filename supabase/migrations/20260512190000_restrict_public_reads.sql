-- ============================================================================
-- Restrict anon read access so unpublished drafts / inactive items aren't
-- leaked through the public Supabase anon key. Admins still see everything
-- because the policy also returns true when public.is_admin() is true.
-- ============================================================================

drop policy if exists "public_read" on public.blog_posts;
create policy "public_read" on public.blog_posts
  for select using (published = true or public.is_admin());

drop policy if exists "public_read" on public.patient_hub;
create policy "public_read" on public.patient_hub
  for select using (published = true or public.is_admin());

drop policy if exists "public_read" on public.faqs;
create policy "public_read" on public.faqs
  for select using (active = true or public.is_admin());

drop policy if exists "public_read" on public.announcement;
create policy "public_read" on public.announcement
  for select using (active = true or public.is_admin());

drop policy if exists "public_read" on public.popup_alert;
create policy "public_read" on public.popup_alert
  for select using (active = true or public.is_admin());
