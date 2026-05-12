'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import slugify from 'slugify';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { uploadImage } from '@/lib/upload';
import { DAY_NAMES } from '@/lib/types';

const Schema = z.object({
  name: z.string().min(1).max(120),
  initials: z.string().min(1).max(6),
  specialty: z.string().min(1).max(160),
  bio: z.string().max(2000).default(''),
  status: z.enum(['available','limited','off']),
  sort: z.coerce.number().int().min(0).max(9999).default(0),
  slug: z.string().max(160).optional(),
  education: z.string().max(500).optional().or(z.literal('')),
  years_experience: z.string().optional(),
});

export async function upsertDoctor(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') || '').trim();
  const obj = {
    name: String(formData.get('name') || ''),
    initials: String(formData.get('initials') || '').toUpperCase(),
    specialty: String(formData.get('specialty') || ''),
    bio: String(formData.get('bio') || ''),
    status: String(formData.get('status') || 'available'),
    sort: String(formData.get('sort') || '0'),
    slug: String(formData.get('slug') || '').trim(),
    education: String(formData.get('education') || ''),
    years_experience: String(formData.get('years_experience') || ''),
  };
  const parsed = Schema.safeParse(obj);
  if (!parsed.success) {
    redirect(`/admin/doctors?err=${encodeURIComponent(parsed.error.message.slice(0, 200))}`);
  }
  const supabase = createClient();

  const schedule: Record<string, string | null> = {};
  for (const day of DAY_NAMES) {
    const v = String(formData.get(`schedule_${day}`) || '').trim();
    schedule[day] = v ? v : null;
  }

  const languages = String(formData.get('languages') || '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  const conditions = String(formData.get('conditions') || '')
    .split(',').map((s) => s.trim()).filter(Boolean);

  // Image
  let photo_url: string | null | undefined = undefined;
  const file = formData.get('photo') as File | null;
  if (file && file instanceof File && file.size > 0) {
    try {
      photo_url = await uploadImage(file, 'doctors');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Upload error';
      redirect(`/admin/doctors?err=${encodeURIComponent(msg)}`);
    }
  }
  if (formData.get('clear_photo') === 'on') photo_url = null;

  const slug = (parsed.data.slug || '').trim()
    ? slugify(parsed.data.slug!, { lower: true, strict: true })
    : slugify(parsed.data.name, { lower: true, strict: true });

  const yrs = parsed.data.years_experience && parsed.data.years_experience !== ''
    ? parseInt(parsed.data.years_experience, 10)
    : null;

  const payload: Record<string, unknown> = {
    name: parsed.data.name,
    initials: parsed.data.initials,
    specialty: parsed.data.specialty,
    bio: parsed.data.bio,
    status: parsed.data.status,
    sort: parsed.data.sort,
    schedule,
    slug,
    languages,
    conditions,
    education: parsed.data.education || null,
    years_experience: Number.isFinite(yrs) ? yrs : null,
  };
  if (photo_url !== undefined) payload.photo_url = photo_url;

  if (id) {
    const { error } = await supabase.from('doctors').update(payload).eq('id', id);
    if (error) redirect(`/admin/doctors?err=${encodeURIComponent(error.message)}`);
  } else {
    const { error } = await supabase.from('doctors').insert(payload);
    if (error) redirect(`/admin/doctors?err=${encodeURIComponent(error.message)}`);
  }
  revalidatePath('/', 'layout');
  redirect('/admin/doctors?ok=1');
}

export async function deleteDoctor(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') || '').trim();
  if (!id) redirect('/admin/doctors?err=Missing+id');
  const supabase = createClient();
  const { error } = await supabase.from('doctors').delete().eq('id', id);
  if (error) redirect(`/admin/doctors?err=${encodeURIComponent(error.message)}`);
  revalidatePath('/', 'layout');
  redirect('/admin/doctors?ok=1');
}
