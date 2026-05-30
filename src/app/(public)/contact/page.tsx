import type { Metadata } from 'next';
import { getClinic, getFaqs, getHours } from '@/lib/data';
import { IconClock, IconMail, IconMap, IconPhone } from '@/components/public/Icons';
import { formatHourLabel } from '@/lib/util';
import FirstVisitGuide from '@/components/public/FirstVisitGuide';
import EmergencyDecisionCard from '@/components/public/EmergencyDecisionCard';
import FaqSection from '@/components/public/FaqSection';
import LanguagesBar from '@/components/public/LanguagesBar';
import WaitTimeIndicator from '@/components/public/WaitTimeIndicator';
import { mapsEmbedSrc } from '@/lib/safe-url';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Contact', description: 'Reach the clinic — phone, email, address, hours.' };

export default async function ContactPage() {
  const [clinic, hours, faqs] = await Promise.all([
    getClinic(), getHours(), getFaqs({ onlyActive: true }),
  ]);

  return (
    <div style={{ animation: 'fadeUp .35s ease' }}>
      <div className="about-hero-sec">
        <div className="sec-label" style={{ color: 'var(--teal-light)' }}>Get in Touch</div>
        <h1>We&apos;re Here for You</h1>
        <p>Call, email, or simply walk in during clinic hours. Our reception team is always happy to help.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
          <WaitTimeIndicator clinic={clinic} />
          <LanguagesBar clinic={clinic} />
        </div>
      </div>
      <section className="sec" style={{ background: 'var(--cream)' }}>
        <div className="sec-inner">
          <div className="contact-cards-grid">
            {[
              { icon: <IconPhone />, label: 'Call Us', val: clinic.phone, sub: 'During clinic hours.', href: `tel:${clinic.phone.replace(/[^+\d]/g, '')}` },
              { icon: <IconMail />, label: 'Email Us', val: clinic.email, sub: 'We respond within a few business hours.', href: `mailto:${clinic.email}` },
              { icon: <IconMap />, label: 'Visit Us', val: clinic.address, sub: 'Free parking available on site.',
                href: `https://maps.google.com/?q=${encodeURIComponent(clinic.address)}` },
              { icon: <IconClock />, label: 'Walk-ins Welcome', val: 'No appointment needed', sub: 'Come in during clinic hours — we\'ll see you.' },
            ].map((c) => {
              const inner = (
                <>
                  <div className="cta-icon">{c.icon}</div>
                  <div>
                    <div className="cta-label">{c.label}</div>
                    <div className="cta-val">{c.val}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.5 }}>{c.sub}</div>
                  </div>
                </>
              );
              return c.href ? (
                <a key={c.label} className="cta-card cta-card-link" href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  style={{ alignItems: 'flex-start', textDecoration: 'none' }}>
                  {inner}
                </a>
              ) : (
                <div key={c.label} className="cta-card" style={{ alignItems: 'flex-start' }}>{inner}</div>
              );
            })}
          </div>
          <div className="contact-bottom-grid">
            <div className="map-ph" style={{ height: 360 }}>
              {mapsEmbedSrc({ embed: clinic.google_maps_embed, address: clinic.address }) ? (
                <iframe src={mapsEmbedSrc({ embed: clinic.google_maps_embed, address: clinic.address })!}
                  loading="lazy" allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade" title="Clinic location" />
              ) : (
                <>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{clinic.address}</div>
                    <div style={{ fontSize: 13 }}>Add a Google Maps embed from the admin panel</div>
                  </div>
                </>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                background: 'var(--white)',
                borderRadius: 'var(--r-lg)',
                padding: 24,
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-light)',
              }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.08em',
                  textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14 }}>
                  Clinic Hours
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {hours.map((h) => (
                      <tr key={h.day_index}>
                        <td style={{ padding: '8px 0', fontSize: 13.5, color: 'var(--text-3)',
                          borderBottom: '1px solid var(--border-light)' }}>{h.day_name}</td>
                        <td style={{ padding: '8px 0', fontSize: 13.5, color: 'var(--navy)',
                          fontWeight: 500, textAlign: 'right',
                          borderBottom: '1px solid var(--border-light)' }}>
                          {h.closed ? <span style={{ color: '#DC2626' }}>Closed</span> : formatHourLabel(h)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="emergency-box">
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.08em',
                  textTransform: 'uppercase', color: '#DC2626', marginBottom: 8 }}>Emergency?</div>
                <p style={{ fontSize: 13, color: '#7F1D1D', lineHeight: 1.65 }}>
                  {clinic.emergency_text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <FirstVisitGuide clinic={clinic} />
      <EmergencyDecisionCard />
      <FaqSection faqs={faqs} />
    </div>
  );
}
