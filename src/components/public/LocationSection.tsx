import type { Clinic, Hours } from '@/lib/types';
import { IconClock, IconMail, IconMap, IconPhone } from './Icons';
import { todayHours, formatHourLabel } from '@/lib/util';
import { mapsEmbedSrc } from '@/lib/safe-url';

export default function LocationSection({ clinic, hours }: { clinic: Clinic; hours: Hours[] }) {
  const today = todayHours(hours);
  const embedUrl = mapsEmbedSrc({ embed: clinic.google_maps_embed, address: clinic.address });
  return (
    <section className="sec" style={{ background: 'var(--white)' }}>
      <div className="sec-inner">
        <div className="sec-header">
          <div className="sec-label">Find Us</div>
          <div className="sec-title">Location &amp; Contact</div>
        </div>
        <div className="loc-layout">
          <div className="map-ph">
            {embedUrl ? (
              <iframe src={embedUrl} loading="lazy" allowFullScreen
                referrerPolicy="no-referrer-when-downgrade" title="Clinic location" />
            ) : (
              <>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                    {clinic.address}
                  </div>
                  <div style={{ fontSize: 13 }}>Add a Google Maps embed from the admin panel</div>
                </div>
              </>
            )}
          </div>
          <div className="cta-cards">
            {[
              { icon: <IconPhone />, label: 'Call Us', val: clinic.phone },
              { icon: <IconMail />, label: 'Email', val: clinic.email },
              { icon: <IconMap />, label: 'Address', val: clinic.address },
              { icon: <IconClock />, label: "Today's Hours",
                val: today ? `${today.day_name}: ${formatHourLabel(today)}` : 'Hours unavailable' },
            ].map((c) => (
              <div key={c.label} className="cta-card">
                <div className="cta-icon">{c.icon}</div>
                <div>
                  <div className="cta-label">{c.label}</div>
                  <div className="cta-val">{c.val}</div>
                </div>
              </div>
            ))}
            <div className="emergency-box">
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.08em',
                textTransform: 'uppercase', color: '#DC2626', marginBottom: 6 }}>Emergency</div>
              <p style={{ fontSize: 13, color: '#7F1D1D', lineHeight: 1.65 }}>
                {clinic.emergency_text}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
