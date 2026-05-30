import Link from 'next/link';
import Image from 'next/image';
import type { Clinic, Service } from '@/lib/types';
import { CrossIcon } from './Icons';

export default function Footer({ clinic, services }: { clinic: Clinic; services: Service[] }) {
  return (
    <footer className="site-footer">
      <div className="ft-inner">
        <div className="ft-top">
          <div className="ft-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              {clinic.logo_url
                ? <span className="nav-mark nav-mark-img"><Image src={clinic.logo_url} alt={`${clinic.name} logo`} width={40} height={40} style={{ objectFit: 'contain' }} /></span>
                : <div className="nav-mark"><CrossIcon/></div>}
              <div style={{ ['--brand-scale' as string]: String(clinic.brand_scale ?? 1) } as React.CSSProperties}>
                <div className="ft-brand-name">
                  {clinic.name}
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--teal-light)',
                  letterSpacing: '.08em', textTransform: 'uppercase' }}>{clinic.tagline}</div>
              </div>
            </div>
            <p className="ft-tagline">Trusted family healthcare for our community.</p>
          </div>
          <div className="ft-col">
            <h4>Navigate</h4>
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/doctors">Doctors</Link>
            <Link href="/services">Services</Link>
            <Link href="/patient-hub">Patient Hub</Link>
            <Link href="/blog">Health Blog</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="ft-col">
            <h4>Services</h4>
            {services.slice(0, 6).map((s) => (
              <Link key={s.id} href="/services">{s.name}</Link>
            ))}
            {services.length === 0 && <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 13 }}>—</span>}
          </div>
          <div className="ft-col">
            <h4>Contact</h4>
            <p>{clinic.phone}</p>
            <p>{clinic.email}</p>
            <p style={{ lineHeight: 1.6 }}>{clinic.address}</p>
          </div>
        </div>
        <div className="ft-bottom">
          <span>© {new Date().getFullYear()} {clinic.name}. All rights reserved.</span>
          <Link href="/admin/login"
            style={{ color: 'rgba(255,255,255,.3)', fontSize: 12, textDecoration: 'none' }}>
            Staff Portal →
          </Link>
        </div>
      </div>
    </footer>
  );
}
