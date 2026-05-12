'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

export async function saveAnnouncement(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();
  const message = String(formData.get('message') || '').trim();
  const active = formData.get('active') === 'on';
  const urgent = formData.get('urgent') === 'on';
  if (!message) redirect('/admin/announcements?err=Message+required');
  const { error } = await supabase.from('announcement').upsert({ id: 1, message, active, urgent });
  if (error) redirect(`/admin/announcements?err=${encodeURIComponent(error.message)}`);
  revalidatePath('/', 'layout');
  redirect('/admin/announcements?ok=1');
}
