import type { Metadata } from 'next';
import Link from 'next/link';
import { getServices } from '@/lib/data';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Services', description: 'Our clinical services in detail.' };

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <div style={{ animation: 'fadeUp .35s ease' }}>
      <div className="about-hero-sec">
        <div className="sec-label" style={{ color: 'var(--teal-light)' }}>Clinical Services</div>
        <h1>Comprehensive Healthcare</h1>
        <p>Everything your family needs — from routine medicine to advanced physiotherapy — in one trusted clinic.</p>
      </div>
      <section className="sec" style={{ background: 'var(--cream)' }}>
        <div className="sec-inner">
          <div className="svc-full-grid">
            {services.map((s) => (
              <div key={s.id} className="svc-full">
                <div className={`svc-full-icon ${s.color}`}>{s.icon}</div>
                <div className="svc-full-body">
                  <h3>{s.name}</h3>
                  <p>{s.description}</p>
                  <div>{s.tags.map((t) => <span key={t} className="svc-tag">{t}</span>)}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 48,
            background: 'linear-gradient(150deg,var(--navy),var(--navy-soft))',
            borderRadius: 'var(--r-xl)',
            padding: 44,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 24,
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em',
                textTransform: 'uppercase', color: 'var(--teal-light)', marginBottom: 10 }}>
                Have a question?
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30,
                fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                Get in Touch With Our Team
              </div>
              <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14 }}>
                Walk-ins welcome · Call or visit us during clinic hours.
              </p>
            </div>
            <Link className="btn-hero-primary" href="/contact">Contact Us →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
