import type { User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isConfigured } from '@/lib/data';
import { canAccess, type Resource, type Role } from '@/lib/permissions';

export type AdminUser = User & { role: Role };

/**
 * Require an authenticated admin. Optionally enforce that the admin's role
 * has access to a specific resource. If no resource is passed, any admin
 * role is accepted (dashboard / account level access).
 */
export async function requireAdmin(resource?: Resource): Promise<AdminUser> {
  if (!isConfigured()) redirect('/admin/login?error=not-configured');
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');
  const { data } = await supabase
    .from('admins')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle();
  if (!data) redirect('/admin/login?error=not-admin');

  const role = (data.role ?? 'owner') as Role;
  if (resource && !canAccess(role, resource)) {
    redirect('/admin?error=forbidden');
  }
  return { ...user, role };
}

/**
 * Get the current admin's role, or null if not signed in / not an admin.
 * Use this when you need to make UI decisions (filter nav, hide buttons)
 * without redirecting.
 */
export async function getMyRole(): Promise<Role | null> {
  if (!isConfigured()) return null;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('admins')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  return (data?.role ?? null) as Role | null;
}
