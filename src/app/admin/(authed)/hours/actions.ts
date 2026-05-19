'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

const TIME_RE = /^(0?[1-9]|1[0-2]):[0-5]\d\s*(AM|PM)$/i;
const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function normaliseTime(s: string | null): string | null {
  if (!s) return null;
  const trimmed = s.trim().toUpperCase().replace(/\s+/g, ' ');
  if (!TIME_RE.test(trimmed)) return null;
  return trimmed;
}

export async function saveHours(formData: FormData) {
  await requireAdmin('hours');
  const supabase = createClient();
  const updates: Array<{ day_index: number; closed: boolean; open_time: string | null;
    close_time: string | null; override_note: string | null }> = [];
  const errors: string[] = [];

  for (let i = 0; i < 7; i++) {
    const closed = formData.get(`closed_${i}`) === 'on';
    const openRaw = String(formData.get(`open_${i}`) || '').trim() || null;
    const closeRaw = String(formData.get(`close_${i}`) || '').trim() || null;
    const override_note = String(formData.get(`note_${i}`) || '').trim() || null;

    let open_time: string | null = null;
    let close_time: string | null = null;
    if (!closed) {
      open_time = normaliseTime(openRaw);
      close_time = normaliseTime(closeRaw);
      if (openRaw && !open_time) errors.push(`${DAY_NAMES[i]} open time invalid (use "8:00 AM")`);
      if (closeRaw && !close_time) errors.push(`${DAY_NAMES[i]} close time invalid (use "6:00 PM")`);
      if (open_time && close_time) {
        // open should be earlier than close
        const a = parseTimeToMinutes(open_time);
        const b = parseTimeToMinutes(close_time);
        if (a !== null && b !== null && a >= b) errors.push(`${DAY_NAMES[i]} close time must be after open time`);
      }
    }
    updates.push({ day_index: i, closed, open_time, close_time, override_note });
  }

  if (errors.length) {
    redirect(`/admin/hours?err=${encodeURIComponent(errors.join(' · '))}`);
  }

  for (const u of updates) {
    const { error } = await supabase.from('hours').update({
      closed: u.closed, open_time: u.open_time, close_time: u.close_time,
      override_note: u.override_note,
    }).eq('day_index', u.day_index);
    if (error) redirect(`/admin/hours?err=${encodeURIComponent(error.message)}`);
  }
  revalidatePath('/', 'layout');
  redirect('/admin/hours?ok=1');
}

function parseTimeToMinutes(s: string): number | null {
  const m = s.toUpperCase().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (m[3] === 'PM' && h !== 12) h += 12;
  if (m[3] === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}
