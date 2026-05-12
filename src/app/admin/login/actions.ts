'use server';
import { createClient } from '@/lib/supabase/server';
import { isConfigured } from '@/lib/data';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  if (!isConfigured()) redirect('/admin/login?error=not-configured');
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  // Preserve email on error so user doesn't have to retype it.
  const emailQuery = `&email=${encodeURIComponent(email)}`;
  if (!email || !password) {
    redirect(`/admin/login?error=missing${emailQuery}`);
  }
  const supabase = createClient();
  const { error, data } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    redirect(`/admin/login?error=${encodeURIComponent(error?.message ?? 'login_failed')}${emailQuery}`);
  }
  // Verify admin row
  const { data: adminRow } = await supabase.from('admins').select('id').eq('id', data.user.id).maybeSingle();
  if (!adminRow) {
    await supabase.auth.signOut();
    redirect(`/admin/login?error=not-admin${emailQuery}`);
  }
  redirect('/admin');
}

export async function logoutAction() {
  if (!isConfigured()) redirect('/admin/login');
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
