import type { User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isConfigured } from '@/lib/data';
import {
  canAccess,
  makeAdminProfile,
  type AdminProfile,
  type Resource,
} from '@/lib/permissions';

export type AdminUser = User & AdminProfile;

/**
 * Require an authenticated admin. Optionally enforce that the admin has
 * access to a specific resource. With no resource, any admin (signed-in
 * row in `admins`) is accepted — `dashboard` / `account` level access.
 */
export async function requireAdmin(resource?: Resource): Promise<AdminUser> {
  if (!isConfigured()) redirect('/admin/login?error=not-configured');
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');
  const { data } = await supabase
    .from('admins')
    .select('id, is_owner, permissions')
    .eq('id', user.id)
    .maybeSingle();
  if (!data) redirect('/admin/login?error=not-admin');

  const profile = makeAdminProfile(data as {
    id: string; is_owner?: boolean | null; permissions?: string[] | null;
  });

  if (resource && !canAccess(profile, resource)) {
    redirect('/admin?error=forbidden');
  }
  return Object.assign(user, profile) as AdminUser;
}

/**
 * Return the current admin's profile, or null if not signed in / not an admin.
 * Use this to make UI decisions (filter nav, hide buttons) without redirecting.
 */
export async function getMyAdminProfile(): Promise<AdminProfile | null> {
  if (!isConfigured()) return null;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('admins')
    .select('id, is_owner, permissions')
    .eq('id', user.id)
    .maybeSingle();
  if (!data) return null;
  return makeAdminProfile(data as {
    id: string; is_owner?: boolean | null; permissions?: string[] | null;
  });
}
