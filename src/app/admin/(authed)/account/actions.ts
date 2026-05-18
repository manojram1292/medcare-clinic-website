'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

const Schema = z.object({
  password: z.string().min(10, 'Must be at least 10 characters.').max(120),
  confirm: z.string().min(1),
}).refine((v) => v.password === v.confirm, {
  message: 'Passwords do not match.',
  path: ['confirm'],
});

export async function changePassword(formData: FormData) {
  await requireAdmin('account');
  const obj = {
    password: String(formData.get('password') || ''),
    confirm: String(formData.get('confirm') || ''),
  };
  const parsed = Schema.safeParse(obj);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e: { message: string }) => e.message).join(' · ').slice(0, 200);
    redirect(`/admin/account?err=${encodeURIComponent(msg)}`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) redirect(`/admin/account?err=${encodeURIComponent(error.message)}`);
  redirect('/admin/account?ok=1');
}
