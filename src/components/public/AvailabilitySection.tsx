import type { Doctor } from '@/lib/types';
import { WEEKDAYS_FOR_TABLE } from '@/lib/types';
import { IconInfo } from './Icons';
import { DoctorAvatar } from './DoctorAvatar';

export default function AvailabilitySection({ doctors }: { doctors: Doctor[] }) {
  if (doctors.length === 0) return null;
  return (
    <section className="sec avail-sec">
      <div className="sec-inner">
        <div className="sec-header">
          <div className="sec-label">Doctor Schedules</div>
          <div className="sec-title">Weekly Availability</div>
          <p className="sec-sub">See which physician is in and when. Schedules are managed by our team and updated regularly.</p>
        </div>
        <div className="avail-table-wrap">
          <table className="avail-table">
            <thead>
              <tr>
                <th>Physician</th>
                {WEEKDAYS_FOR_TABLE.map((d) => <th key={d}>{d.slice(0, 3)}</th>)}
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div className="avail-doctor">
                      <DoctorAvatar doctor={doc} className="avail-av" />
                      <div>
                        <div className="avail-dname">{doc.name}</div>
                        <div className="avail-dspec">{doc.specialty}</div>
                      </div>
                    </div>
                  </td>
                  {WEEKDAYS_FOR_TABLE.map((day) => {
                    const slot = doc.schedule?.[day];
                    const isLimited = doc.status === 'limited' && !!slot;
                    return (
                      <td key={day} className="avail-cell">
                        {slot
                          ? <span className={`avail-slot ${isLimited ? 'lim' : 'yes'}`}>
                              {slot.replace(' AM', 'am').replace(' PM', 'pm')}
                            </span>
                          : <span className="avail-slot no">—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="avail-note">
          <IconInfo /> Schedules are subject to change. Contact the clinic to confirm availability before visiting.
        </p>
      </div>
    </section>
  );
}
