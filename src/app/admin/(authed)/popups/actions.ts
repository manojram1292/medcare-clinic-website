'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

export async function savePopup(formData: FormData) {
  await requireAdmin('popups');
  const supabase = createClient();
  const title = String(formData.get('title') || '').trim();
  const body = String(formData.get('body') || '').trim();
  const cta_label = String(formData.get('cta_label') || '').trim() || null;
  const cta_url = String(formData.get('cta_url') || '').trim() || null;
  const active = formData.get('active') === 'on';
  const urgent = formData.get('urgent') === 'on';
  const bumpVersion = formData.get('bump_version') === 'on';

  // Only require title + body when the popup is actually active. An inactive
  // popup is allowed to be blank (so you can "clear" it without writing dummy
  // text). Active popups must have both — otherwise visitors would see an
  // empty modal blocking the page.
  if (active && (!title || !body)) {
    redirect('/admin/popups?err=Title+and+body+required+when+the+popup+is+Active.+Untick+Active+to+save+a+blank+popup.');
  }

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

export async function clearPopup() {
  await requireAdmin('popups');
  const supabase = createClient();
  const { error } = await supabase.from('popup_alert').upsert({
    id: 1,
    active: false,
    urgent: false,
    title: '',
    body: '',
    cta_label: null,
    cta_url: null,
  });
  if (error) redirect(`/admin/popups?err=${encodeURIComponent(error.message)}`);
  revalidatePath('/', 'layout');
  redirect('/admin/popups?ok=1');
}
