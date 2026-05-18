'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { ROLES } from '@/lib/permissions';

const InviteSchema = z.object({
  email: z.string().email().max(180),
  role: z.enum(ROLES),
});

const UpdateSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(ROLES),
});

const DeleteSchema = z.object({
  id: z.string().uuid(),
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function inviteAdmin(formData: FormData) {
  const me = await requireAdmin('users');
  const parsed = InviteSchema.safeParse({
    email: String(formData.get('email') || '').trim(),
    role: String(formData.get('role') || 'editor'),
  });
  if (!parsed.success) {
    redirect(`/admin/users?err=${encodeURIComponent(parsed.error.message.slice(0, 200))}`);
  }
  const { email, role } = parsed.data;

  if (role === 'owner' && me.role !== 'owner') {
    redirect('/admin/users?err=Only+an+owner+can+grant+owner+role');
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${SITE_URL}/admin/login`,
  });
  if (error) redirect(`/admin/users?err=${encodeURIComponent(error.message)}`);
  if (!data?.user?.id) redirect('/admin/users?err=invite+failed');

  // Add to admins table with their role
  const supabase = createClient();
  const { error: insertErr } = await supabase
    .from('admins')
    .upsert({ id: data.user.id, role }, { onConflict: 'id' });
  if (insertErr) redirect(`/admin/users?err=${encodeURIComponent(insertErr.message)}`);

  redirect('/admin/users?ok=invited');
}

export async function updateAdminRole(formData: FormData) {
  const me = await requireAdmin('users');
  const parsed = UpdateSchema.safeParse({
    id: String(formData.get('id') || ''),
    role: String(formData.get('role') || ''),
  });
  if (!parsed.success) {
    redirect(`/admin/users?err=${encodeURIComponent(parsed.error.message.slice(0, 200))}`);
  }
  const { id, role } = parsed.data;

  // Safety: can't demote yourself if you're the only owner
  if (id === me.id && role !== 'owner') {
    const supabase = createClient();
    const { count } = await supabase.from('admins').select('id', { count: 'exact', head: true }).eq('role', 'owner');
    if ((count ?? 0) <= 1) redirect('/admin/users?err=Cannot+demote+the+only+owner');
  }

  const supabase = createClient();
  const { error } = await supabase.from('admins').update({ role }).eq('id', id);
  if (error) redirect(`/admin/users?err=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin/users');
  redirect('/admin/users?ok=updated');
}

export async function deleteAdmin(formData: FormData) {
  const me = await requireAdmin('users');
  const parsed = DeleteSchema.safeParse({ id: String(formData.get('id') || '') });
  if (!parsed.success) redirect('/admin/users?err=invalid+id');
  const { id } = parsed.data;

  if (id === me.id) {
    redirect('/admin/users?err=Cannot+remove+yourself.+Have+another+owner+do+it.');
  }
  // Don't allow removing the last owner
  const supabase = createClient();
  const { data: target } = await supabase.from('admins').select('role').eq('id', id).maybeSingle();
  if (target?.role === 'owner') {
    const { count } = await supabase.from('admins').select('id', { count: 'exact', head: true }).eq('role', 'owner');
    if ((count ?? 0) <= 1) redirect('/admin/users?err=Cannot+remove+the+only+owner');
  }

  const { error } = await supabase.from('admins').delete().eq('id', id);
  if (error) redirect(`/admin/users?err=${encodeURIComponent(error.message)}`);

  // Also delete the Supabase auth user (so they can't log in again)
  try {
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(id);
  } catch {
    // non-fatal — admins row is gone, user can no longer access
  }
  revalidatePath('/admin/users');
  redirect('/admin/users?ok=removed');
}
