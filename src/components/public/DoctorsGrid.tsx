import Link from 'next/link';
import type { Doctor } from '@/lib/types';
import { WEEKDAYS_FOR_TABLE } from '@/lib/types';
import { DoctorAvatar } from './DoctorAvatar';

export default function DoctorsGrid({
  doctors, showFullSchedule = false, ctaHref, ctaLabel = 'View Full Profile →',
}: {
  doctors: Doctor[];
  showFullSchedule?: boolean;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="doctors-grid">
      {doctors.map((doc) => (
        <article key={doc.id} className="doc-card tilt-card">
          <div className="doc-card-top">
            <DoctorAvatar doctor={doc} className="doc-avatar" />
            <div className={`doc-status-badge ${
              doc.status === 'available' ? 'dsb-on'
                : doc.status === 'limited' ? 'dsb-lim' : 'dsb-off'
            }`}>
              <span style={{ width: 6, height: 6, borderRadius: '50%',
                background: 'currentColor', display: 'inline-block' }} />
              {doc.status === 'available' ? 'Available This Week'
                : doc.status === 'limited' ? 'Limited Availability' : 'Unavailable'}
            </div>
          </div>
          <div className="doc-body">
            <div className="doc-spec">{doc.specialty}</div>
            <div className="doc-name">{doc.name}</div>
            <div className="doc-bio">{doc.bio}</div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.07em',
                textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>
                {showFullSchedule ? 'Weekly Schedule' : 'Clinic Days'}
              </div>
              <div className="doc-days">
                {WEEKDAYS_FOR_TABLE.map((d) => (
                  <span key={d} className={`day-chip ${doc.schedule?.[d] ? '' : 'off'}`}
                    title={doc.schedule?.[d] || 'Not available'}>
                    {d.slice(0, 3)}
                  </span>
                ))}
              </div>
              {showFullSchedule && (
                <div style={{ marginTop: 10 }}>
                  {Object.entries(doc.schedule || {})
                    .filter(([, v]) => Boolean(v))
                    .map(([day, time]) => (
                      <div key={day} style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                        <strong style={{ color: 'var(--text-2)' }}>{day.slice(0, 3)}:</strong> {time}
                      </div>
                    ))}
                </div>
              )}
            </div>
            <Link className="doc-cta"
              href={ctaHref ?? (doc.slug ? `/doctors/${doc.slug}` : '/doctors')}>
              {ctaLabel}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
