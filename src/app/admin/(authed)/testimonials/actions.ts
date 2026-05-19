'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

export async function upsertTestimonial(formData: FormData) {
  await requireAdmin('testimonials');
  const id = String(formData.get('id') || '').trim();
  const text = String(formData.get('text') || '').trim();
  const name = String(formData.get('name') || '').trim();
  const tag = String(formData.get('tag') || '').trim();
  const initials = String(formData.get('initials') || '').trim().toUpperCase();
  const rating = Math.max(1, Math.min(5, parseInt(String(formData.get('rating') || '5'), 10) || 5));
  const sort = parseInt(String(formData.get('sort') || '0'), 10) || 0;
  if (!text || !name || !initials) redirect('/admin/testimonials?err=Name,+initials,+text+required');

  const supabase = createClient();
  const payload = { text, name, tag, initials, rating, sort };
  const { error } = id
    ? await supabase.from('testimonials').update(payload).eq('id', id)
    : await supabase.from('testimonials').insert(payload);
  if (error) redirect(`/admin/testimonials?err=${encodeURIComponent(error.message)}`);
  revalidatePath('/', 'layout');
  redirect('/admin/testimonials?ok=1');
}

export async function deleteTestimonial(formData: FormData) {
  await requireAdmin('testimonials');
  const id = String(formData.get('id') || '').trim();
  if (!id) redirect('/admin/testimonials?err=Missing+id');
  const supabase = createClient();
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) redirect(`/admin/testimonials?err=${encodeURIComponent(error.message)}`);
  revalidatePath('/', 'layout');
  redirect('/admin/testimonials?ok=1');
}
