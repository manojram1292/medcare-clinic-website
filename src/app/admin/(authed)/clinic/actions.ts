'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

const Schema = z.object({
  name: z.string().min(1).max(120),
  tagline: z.string().min(1).max(160),
  phone: z.string().min(1).max(60),
  email: z.string().email().max(160),
  address: z.string().min(1).max(300),
  emergency_text: z.string().min(1).max(500),
  hero_eyebrow: z.string().max(160),
  hero_title_1: z.string().min(1).max(160),
  hero_title_2: z.string().min(1).max(160),
  hero_body: z.string().max(800),
  about_mission: z.string().max(1200),
  about_quote: z.string().max(500),
  google_maps_embed: z.string().max(1000).optional().or(z.literal('')),
  parking_info: z.string().max(800).optional().or(z.literal('')),
  insurance_info: z.string().max(800).optional().or(z.literal('')),
  what_to_bring: z.string().max(800).optional().or(z.literal('')),
  walk_in_policy: z.string().max(800).optional().or(z.literal('')),
  languages_supported: z.string().max(400).optional().or(z.literal('')),
});

export async function saveClinic(formData: FormData) {
  await requireAdmin('clinic');
  const obj: Record<string, string> = {};
  for (const k of Object.keys(Schema.shape)) obj[k] = String(formData.get(k) ?? '');
  const parsed = Schema.safeParse(obj);
  if (!parsed.success) {
    redirect(`/admin/clinic?err=${encodeURIComponent(parsed.error.message.slice(0, 200))}`);
  }
  const supabase = createClient();
  const langs = (parsed.data.languages_supported || '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  const payload = {
    ...parsed.data,
    google_maps_embed: parsed.data.google_maps_embed || null,
    parking_info: parsed.data.parking_info || null,
    insurance_info: parsed.data.insurance_info || null,
    what_to_bring: parsed.data.what_to_bring || null,
    walk_in_policy: parsed.data.walk_in_policy || null,
    languages_supported: langs,
  };
  const { error } = await supabase.from('clinic').upsert({ id: 1, ...payload });
  if (error) redirect(`/admin/clinic?err=${encodeURIComponent(error.message)}`);
  revalidatePath('/', 'layout');
  redirect('/admin/clinic?ok=1');
}

export async function saveStats(formData: FormData) {
  await requireAdmin('clinic');
  const supabase = createClient();
  const stats: { value: string; suffix: string; label: string }[] = [];
  for (let i = 0; i < 6; i++) {
    const value = String(formData.get(`stat_value_${i}`) || '').trim().slice(0, 20);
    const suffix = String(formData.get(`stat_suffix_${i}`) || '').trim().slice(0, 4);
    const label = String(formData.get(`stat_label_${i}`) || '').trim().slice(0, 80);
    // Skip empty rows
    if (!value && !label) continue;
    if (value && label) stats.push({ value, suffix, label });
  }
  const { error } = await supabase.from('clinic').update({ stats }).eq('id', 1);
  if (error) redirect(`/admin/clinic?err=${encodeURIComponent(error.message)}`);
  revalidatePath('/', 'layout');
  redirect('/admin/clinic?ok=1');
}

export async function setWaitTime(formData: FormData) {
  await requireAdmin('wait_time');
  const minsRaw = String(formData.get('current_wait_minutes') || '').trim();
  const supabase = createClient();
  if (minsRaw === '' || minsRaw === 'clear') {
    const { error } = await supabase.from('clinic')
      .update({ current_wait_minutes: null, wait_updated_at: null }).eq('id', 1);
    if (error) redirect(`/admin/clinic?err=${encodeURIComponent(error.message)}`);
  } else {
    const mins = Math.max(0, Math.min(240, parseInt(minsRaw, 10) || 0));
    const { error } = await supabase.from('clinic').update({
      current_wait_minutes: mins, wait_updated_at: new Date().toISOString(),
    }).eq('id', 1);
    if (error) redirect(`/admin/clinic?err=${encodeURIComponent(error.message)}`);
  }
  revalidatePath('/', 'layout');
  redirect('/admin/clinic?ok=1');
}
