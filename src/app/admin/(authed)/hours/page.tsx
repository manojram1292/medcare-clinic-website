import { Flash } from '@/components/admin/Flash';
import { getHours } from '@/lib/data';
import { saveHours } from './actions';

export default async function HoursAdmin({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  const hours = await getHours();
  return (
    <>
      <h1 className="admin-h1">Clinic hours</h1>
      <p className="admin-sub">
        Set the open/close times for each day. Tick &ldquo;Closed&rdquo; for days you&apos;re shut.
        Use the note field to flag temporary changes (e.g. &ldquo;Closed today due to storm&rdquo;).
      </p>
      <Flash ok={searchParams.ok ? 'Saved. Public site updates within a minute.' : null}
        err={searchParams.err ?? null} />
      <form action={saveHours} className="admin-card">
        {hours.map((h) => (
          <div key={h.day_index} className="admin-day-row">
            <label style={{ width: 120 }}>{h.day_name}</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-3)' }}>
              <input type="checkbox" name={`closed_${h.day_index}`} defaultChecked={h.closed} /> Closed
            </label>
            <input className="form-input" name={`open_${h.day_index}`}
              defaultValue={h.open_time ?? ''} placeholder="8:00 AM" style={{ width: 120 }} />
            <span style={{ color: 'var(--text-3)' }}>–</span>
            <input className="form-input" name={`close_${h.day_index}`}
              defaultValue={h.close_time ?? ''} placeholder="6:00 PM" style={{ width: 120 }} />
            <input className="form-input" name={`note_${h.day_index}`}
              defaultValue={h.override_note ?? ''} placeholder="Optional note (overrides hours)"
              style={{ flex: 1 }} />
          </div>
        ))}
        <div style={{ marginTop: 16 }}>
          <button className="btn btn-navy btn-lg" type="submit">Save hours</button>
        </div>
      </form>
      <div className="admin-card">
        <strong>Tip:</strong> Use the format <code>8:00 AM</code> / <code>6:00 PM</code> exactly,
        with a space before AM/PM. The &ldquo;Open Now&rdquo; pill on the homepage is computed from these times.
      </div>
    </>
  );
}
