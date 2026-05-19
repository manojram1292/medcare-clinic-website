'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

export async function upsertFaq(formData: FormData) {
  await requireAdmin('faqs');
  const id = String(formData.get('id') || '').trim();
  const question = String(formData.get('question') || '').trim();
  const answer = String(formData.get('answer') || '').trim();
  const category = String(formData.get('category') || 'General').trim();
  const sort = parseInt(String(formData.get('sort') || '0'), 10) || 0;
  const active = formData.get('active') === 'on';
  if (!question || !answer) redirect('/admin/faqs?err=Question+and+answer+required');

  const supabase = createClient();
  const payload = { question, answer, category, sort, active };
  const { error } = id
    ? await supabase.from('faqs').update(payload).eq('id', id)
    : await supabase.from('faqs').insert(payload);
  if (error) redirect(`/admin/faqs?err=${encodeURIComponent(error.message)}`);
  revalidatePath('/', 'layout');
  redirect('/admin/faqs?ok=1');
}

export async function deleteFaq(formData: FormData) {
  await requireAdmin('faqs');
  const id = String(formData.get('id') || '').trim();
  if (!id) redirect('/admin/faqs?err=Missing+id');
  const supabase = createClient();
  const { error } = await supabase.from('faqs').delete().eq('id', id);
  if (error) redirect(`/admin/faqs?err=${encodeURIComponent(error.message)}`);
  revalidatePath('/', 'layout');
  redirect('/admin/faqs?ok=1');
}
