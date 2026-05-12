import type { Clinic } from '@/lib/types';

const FRESH_WINDOW_MS = 90 * 60 * 1000; // 90 min

export default function WaitTimeIndicator({ clinic }: { clinic: Clinic }) {
  if (clinic.current_wait_minutes == null || !clinic.wait_updated_at) return null;
  const updated = new Date(clinic.wait_updated_at).getTime();
  const ageMs = Date.now() - updated;
  if (ageMs > FRESH_WINDOW_MS) return null; // stale — hide rather than mislead

  const mins = clinic.current_wait_minutes;
  const tone = mins <= 10 ? 'low' : mins <= 30 ? 'mid' : 'high';
  const label = mins <= 5 ? 'Walk right in' : `~${mins} min wait`;
  const ageMin = Math.round(ageMs / 60000);

  return (
    <div className={`wait-pill wait-${tone}`} role="status" aria-live="polite">
      <span className="wait-dot" />
      <strong>{label}</strong>
      <span className="wait-age">updated {ageMin === 0 ? 'just now' : `${ageMin} min ago`}</span>
    </div>
  );
}
