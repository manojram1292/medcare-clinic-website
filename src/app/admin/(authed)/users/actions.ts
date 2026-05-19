'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { ALWAYS_ALLOWED, PRESETS, RESOURCES, type Preset } from '@/lib/permissions';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const InviteSchema = z.object({
  email: z.string().email().max(180),
  preset: z.string().max(20),
});

const SaveSchema = z.object({
  id: z.string().uuid(),
});

function readPermissionsFromForm(formData: FormData): { is_owner: boolean; permissions: string[] } {
  const is_owner = formData.get('is_owner') === 'on';
  const permissions = new Set<string>(ALWAYS_ALLOWED);
  for (const r of RESOURCES) {
    if (r === 'users') continue; // only owners get this
    if (formData.get(`perm:${r}`) === 'on') permissions.add(r);
  }
  return { is_owner, permissions: Array.from(permissions) };
}

export async function inviteAdmin(formData: FormData) {
  await requireAdmin('users');

  const parsed = InviteSchema.safeParse({
    email: String(formData.get('email') || '').trim(),
    preset: String(formData.get('preset') || 'editor'),
  });
  if (!parsed.success) {
    redirect(`/admin/users?err=${encodeURIComponent(parsed.error.message.slice(0, 200))}`);
  }
  const { email, preset } = parsed.data;

  const presetKey = (preset in PRESETS ? preset : 'editor') as Preset;
  const def = PRESETS[presetKey];

  // Send the Supabase invite email — they set their own password.
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${SITE_URL}/admin/login`,
  });
  if (error) redirect(`/admin/users?err=${encodeURIComponent(error.message)}`);
  if (!data?.user?.id) redirect('/admin/users?err=invite+failed');

  const supabase = createClient();
  const { error: insertErr } = await supabase
    .from('admins')
    .upsert(
      {
        id: data.user.id,
        is_owner: def.is_owner,
        permissions: def.permissions,
        role: presetKey, // legacy column kept for display
      },
      { onConflict: 'id' },
    );
  if (insertErr) redirect(`/admin/users?err=${encodeURIComponent(insertErr.message)}`);

  redirect('/admin/users?ok=invited');
}

export async function saveAdminPermissions(formData: FormData) {
  const me = await requireAdmin('users');
  const parsed = SaveSchema.safeParse({ id: String(formData.get('id') || '') });
  if (!parsed.success) redirect('/admin/users?err=invalid+id');
  const { id } = parsed.data;

  const { is_owner, permissions } = readPermissionsFromForm(formData);

  // Safety: can't demote yourself if you're the only owner.
  if (id === me.id && me.is_owner && !is_owner) {
    const supabase = createClient();
    const { count } = await supabase
      .from('admins')
      .select('id', { count: 'exact', head: true })
      .eq('is_owner', true);
    if ((count ?? 0) <= 1) {
      redirect('/admin/users?err=Cannot+demote+the+only+owner');
    }
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('admins')
    .update({ is_owner, permissions })
    .eq('id', id);
  if (error) redirect(`/admin/users?err=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin/users');
  redirect('/admin/users?ok=updated');
}

export async function deleteAdmin(formData: FormData) {
  const me = await requireAdmin('users');
  const id = String(formData.get('id') || '').trim();
  if (!id) redirect('/admin/users?err=invalid+id');

  if (id === me.id) {
    redirect('/admin/users?err=Cannot+remove+yourself.+Have+another+owner+do+it.');
  }

  const supabase = createClient();
  const { data: target } = await supabase
    .from('admins')
    .select('is_owner')
    .eq('id', id)
    .maybeSingle();
  if (target?.is_owner) {
    const { count } = await supabase
      .from('admins')
      .select('id', { count: 'exact', head: true })
      .eq('is_owner', true);
    if ((count ?? 0) <= 1) redirect('/admin/users?err=Cannot+remove+the+only+owner');
  }

  const { error } = await supabase.from('admins').delete().eq('id', id);
  if (error) redirect(`/admin/users?err=${encodeURIComponent(error.message)}`);

  // Also delete the Supabase auth user so they can never sign in again.
  try {
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(id);
  } catch {
    // non-fatal — admins row is already gone
  }
  revalidatePath('/admin/users');
  redirect('/admin/users?ok=removed');
}
