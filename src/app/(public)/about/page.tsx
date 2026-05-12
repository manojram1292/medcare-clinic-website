import type { Metadata } from 'next';
import { getClinic } from '@/lib/data';

export const revalidate = 60;
export const metadata: Metadata = { title: 'About', description: 'Our story, mission and approach to care.' };

export default async function AboutPage() {
  const clinic = await getClinic();
  return (
    <div style={{ animation: 'fadeUp .35s ease' }}>
      <div className="about-hero-sec">
        <div className="sec-label" style={{ color: 'var(--teal-light)' }}>Our Story</div>
        <h1>A Clinic Built on Trust</h1>
        <p>
          {clinic.name} has been a cornerstone of healthcare in our community —
          where compassion meets clinical excellence.
        </p>
      </div>
      <section className="sec" style={{ background: 'var(--white)' }}>
        <div className="sec-inner">
          <div className="about-grid">
            <div className="about-img">
              <div style={{ textAlign: 'center', color: 'var(--text-3)' }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5" style={{ opacity: .35 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M12 8v8M8 12h8"/>
                </svg>
                <div style={{ fontSize: 13, marginTop: 10 }}>Clinic photography</div>
              </div>
            </div>
            <div>
              <div className="sec-label">Our Mission</div>
              <div className="sec-title" style={{ fontSize: 38 }}>Patient First, Always</div>
              <p style={{ color: 'var(--text-3)', lineHeight: 1.8, marginBottom: 24, fontWeight: 300 }}>
                {clinic.about_mission}
              </p>
              <div className="highlight-quote">
                <p>&ldquo;{clinic.about_quote}&rdquo;</p>
              </div>
              {[
                ['01', 'Compassionate Care', 'Every appointment is unhurried. We listen first, because understanding you fully leads to better outcomes.'],
                ['02', 'Continuity', 'Your physician knows your history. That continuity means safer care, fewer gaps, and better decisions over time.'],
                ['03', 'Evidence-Based Practice', 'Every clinical decision is grounded in current medical guidelines and best practice.'],
              ].map(([num, title, desc]) => (
                <div key={num} className="value-row">
                  <div className="val-num">{num}</div>
                  <div className="val-body"><h4>{title}</h4><p>{desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
