'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

export async function upsertService(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') || '').trim();
  const name = String(formData.get('name') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const icon = String(formData.get('icon') || '🏥').trim();
  const color = String(formData.get('color') || 'ic-teal');
  const tags = String(formData.get('tags') || '').split(',').map((s) => s.trim()).filter(Boolean);
  const sort = parseInt(String(formData.get('sort') || '0'), 10) || 0;

  if (!name) redirect('/admin/services?err=Name+required');

  const supabase = createClient();
  const payload = { name, description, icon, color, tags, sort };
  const { error } = id
    ? await supabase.from('services').update(payload).eq('id', id)
    : await supabase.from('services').insert(payload);
  if (error) redirect(`/admin/services?err=${encodeURIComponent(error.message)}`);
  revalidatePath('/', 'layout');
  redirect('/admin/services?ok=1');
}

export async function deleteService(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') || '').trim();
  if (!id) redirect('/admin/services?err=Missing+id');
  const supabase = createClient();
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) redirect(`/admin/services?err=${encodeURIComponent(error.message)}`);
  revalidatePath('/', 'layout');
  redirect('/admin/services?ok=1');
}
