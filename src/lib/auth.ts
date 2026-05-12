import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { isConfigured } from '@/lib/data';

export async function requireAdmin() {
  if (!isConfigured()) redirect('/admin/login?error=not-configured');
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');
  const { data } = await supabase.from('admins').select('id').eq('id', user.id).maybeSingle();
  if (!data) redirect('/admin/login?error=not-admin');
  return user;
}
