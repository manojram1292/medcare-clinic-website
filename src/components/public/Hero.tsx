import Link from 'next/link';
import type { Clinic, Doctor } from '@/lib/types';
import { ChevronRight } from './Icons';
import { DoctorAvatar } from './DoctorAvatar';

export default function Hero({ clinic, doctors }: { clinic: Clinic; doctors: Doctor[] }) {
  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="hero-grid-overlay" />
      </div>
      <div className="hero-inner">
        <div className="hero-content">
          <div className="hero-eyebrow anim-up d1">
            <span className="eb-dot" />
            <span>{clinic.hero_eyebrow}</span>
          </div>
          <h1 className="anim-up d2">
            {clinic.hero_title_1}<br />
            <em>{clinic.hero_title_2}</em>
          </h1>
          <p className="hero-body anim-up d3">{clinic.hero_body}</p>
          <div className="hero-actions anim-up d4">
            <Link className="btn-hero-primary" href="/doctors">
              Meet Our Physicians <ChevronRight />
            </Link>
            <Link className="btn-hero-ghost" href="/services">Our Services</Link>
          </div>
          <div className="hero-trust anim-up d5">
            {['Board-Certified Physicians','Walk-Ins Welcome','Physiotherapy On-Site','Trusted Family Care'].map((t) => (
              <div key={t} className="hero-trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {t}
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual anim-in d2">
          <div className="float-card fc-main">
            <div className="fc-title">Our Physicians — Available This Week</div>
            <div className="fc-docs">
              {doctors.slice(0, 3).map((d) => (
                <div key={d.id} className="fc-doc-row">
                  <DoctorAvatar doctor={d} className="fc-avatar" />
                  <div style={{ flex: 1 }}>
                    <div className="fc-doc-name">{d.name}</div>
                    <div className="fc-doc-spec">{d.specialty}</div>
                  </div>
                  <div className="fc-doc-status">
                    <span className={`fc-pill ${d.status === 'available' ? 'on' : 'lim'}`}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%',
                        background: 'currentColor', display: 'inline-block' }} />
                      {d.status === 'available' ? 'Available' : d.status === 'limited' ? 'Limited' : 'Off'}
                    </span>
                  </div>
                </div>
              ))}
              {doctors.length === 0 && (
                <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 13 }}>
                  Add doctors from the admin panel.
                </div>
              )}
            </div>
          </div>
          <div className="float-card fc-stat">
            <div className="fc-stat-num">{Math.max(15, doctors.length * 5)}+</div>
            <div className="fc-stat-label">Years Serving<br />Local Families</div>
          </div>
          <div className="float-card fc-badge">
            <div className="fc-badge-icon">🚶</div>
            <div>
              <div className="fc-badge-text">Walk-ins Welcome</div>
              <div className="fc-badge-sub">No referral needed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-wave">
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,36 C360,72 1080,0 1440,36 L1440,72 L0,72 Z" />
        </svg>
      </div>
    </section>
  );
}
