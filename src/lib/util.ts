import { DAY_NAMES, type Hours } from './types';

export function todayDayIndex(): number {
  // JS getDay(): 0=Sun..6=Sat. Our schema: 0=Mon..6=Sun.
  const js = new Date().getDay();
  return js === 0 ? 6 : js - 1;
}

export function todayHours(hours: Hours[]): Hours | null {
  const idx = todayDayIndex();
  return hours.find((h) => h.day_index === idx) ?? null;
}

export function isOpenNow(hours: Hours[]): boolean {
  const t = todayHours(hours);
  if (!t || t.closed || !t.open_time || !t.close_time) return false;
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const o = parseTimeToMinutes(t.open_time);
  const c = parseTimeToMinutes(t.close_time);
  if (o == null || c == null) return false;
  return minutes >= o && minutes <= c;
}

export function parseTimeToMinutes(s: string): number | null {
  // "8:00 AM" / "6:00 PM"
  const m = s.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const isPM = m[3].toUpperCase() === 'PM';
  if (h === 12) h = 0;
  if (isPM) h += 12;
  return h * 60 + min;
}

export function formatHourLabel(h: Hours): string {
  if (h.closed) return 'Closed';
  if (!h.open_time || !h.close_time) return 'Closed';
  return `${h.open_time} – ${h.close_time}`;
}

export function dayShort(name: string) { return name.slice(0, 3); }
export function ALL_WEEKDAYS() { return DAY_NAMES.slice(0, 6); }
