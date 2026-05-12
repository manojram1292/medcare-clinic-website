'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

export async function savePopup(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();
  const title = String(formData.get('title') || '').trim();
  const body = String(formData.get('body') || '').trim();
  const cta_label = String(formData.get('cta_label') || '').trim() || null;
  const cta_url = String(formData.get('cta_url') || '').trim() || null;
  const active = formData.get('active') === 'on';
  const urgent = formData.get('urgent') === 'on';
  const bumpVersion = formData.get('bump_version') === 'on';

  if (!title || !body) redirect('/admin/popups?err=Title+and+body+required');

  const update: Record<string, unknown> = { id: 1, title, body, cta_label, cta_url, active, urgent };
  if (bumpVersion) {
    const { data } = await supabase.from('popup_alert').select('version').eq('id', 1).maybeSingle();
    update.version = (data?.version ?? 1) + 1;
  }

  const { error } = await supabase.from('popup_alert').upsert(update);
  if (error) redirect(`/admin/popups?err=${encodeURIComponent(error.message)}`);
  revalidatePath('/', 'layout');
  redirect('/admin/popups?ok=1');
}
