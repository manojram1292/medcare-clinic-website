import Link from 'next/link';
import type { Clinic, Hours } from '@/lib/types';
import { IconInfo } from './Icons';
import { isOpenNow, todayDayIndex, todayHours, formatHourLabel } from '@/lib/util';

export default function StatusSection({ clinic, hours }: { clinic: Clinic; hours: Hours[] }) {
  const open = isOpenNow(hours);
  const today = todayHours(hours);
  const idxToday = todayDayIndex();
  return (
    <section className="sec status-sec">
      <div className="sec-inner">
        <div className="status-layout">
          <div className="status-card">
            <div className="s-label">Live Clinic Status</div>
            <div className={`s-pill ${open ? 'open' : 'closed'}`}>
              <span className="s-dot" />
              {open ? 'Open Now' : 'Currently Closed'}
            </div>
            {open && today?.close_time && (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginBottom: 18 }}>
                Closes at {today.close_time} today
              </p>
            )}
            <div className="s-divider" />
            <div className="s-label">Reach Us</div>
            <p className="s-contact"><strong>{clinic.phone}</strong></p>
            <p className="s-contact">{clinic.email}</p>
            <Link href="/contact" className="s-get-directions">View Location & Directions →</Link>
          </div>
          <div className="hours-block">
            <div className="sec-label">Hours of Operation</div>
            <h3>When We&apos;re Open</h3>
            <p>Walk-ins welcome. Call ahead for faster service — we&apos;ll do our best to see you the same day.</p>
            <table className="hours-table">
              <tbody>
                {hours.map((h) => (
                  <tr key={h.day_index} className={idxToday === h.day_index ? 'today' : ''}>
                    <td>{h.day_name}</td>
                    <td>
                      {h.closed
                        ? <span style={{ color: '#DC2626', fontWeight: 600 }}>Closed</span>
                        : formatHourLabel(h)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {today?.override_note && (
              <div className="notice-pill">
                <IconInfo /> {today.override_note}
              </div>
            )}
            {!today?.override_note && (
              <div className="notice-pill">
                <IconInfo /> Hours may vary on public holidays. Check our notice banner or call ahead for confirmation.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
