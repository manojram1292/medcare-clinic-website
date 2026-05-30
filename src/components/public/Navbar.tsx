'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CrossIcon } from './Icons';

const links = [
  { label: 'Home',         href: '/' },
  { label: 'About',        href: '/about' },
  { label: 'Doctors',      href: '/doctors' },
  { label: 'Services',     href: '/services' },
  { label: 'Patient Hub',  href: '/patient-hub' },
  { label: 'Blog',         href: '/blog' },
  { label: 'Contact',      href: '/contact' },
];

export default function Navbar({ clinicName, tagline, logoUrl, brandScale = 1 }: { clinicName: string; tagline: string; logoUrl?: string | null; brandScale?: number }) {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mob, setMob] = useState(false);
  const prevPath = useRef(path);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the mobile drawer is open + close on Esc.
  useEffect(() => {
    if (!mob) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMob(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [mob]);

  // Auto-close drawer when route changes (clicking a link inside)
  useEffect(() => {
    if (prevPath.current !== path) { setMob(false); prevPath.current = path; }
  }, [path]);

  const isActive = (href: string) =>
    href === '/' ? path === '/' : path === href || path.startsWith(href + '/');

  return (
    <nav className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <Link className="nav-logo" href="/" style={{ ['--brand-scale' as string]: String(brandScale) } as React.CSSProperties}>
          {logoUrl
            ? <span className="nav-mark nav-mark-img"><Image src={logoUrl} alt={`${clinicName} logo`} width={40} height={40} style={{ objectFit: 'contain' }} priority /></span>
            : <div className="nav-mark"><CrossIcon/></div>}
          <div>
            <span className="nav-name">{clinicName}</span>
            <span className="nav-sub">{tagline}</span>
          </div>
        </Link>
        <div className="nav-links">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`nav-a ${isActive(l.href) ? 'active' : ''}`}>
              {l.label}
            </Link>
          ))}
          <Link href="/contact" className="nav-a nav-cta">Contact Us</Link>
        </div>
        <button className="nav-mob" onClick={() => setMob((m) => !m)} aria-label="Toggle menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mob ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </>
            )}
          </svg>
        </button>
      </div>
      <div className={`mob-menu ${mob ? 'open' : ''}`}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setMob(false)}>{l.label}</Link>
        ))}
        <Link href="/contact" onClick={() => setMob(false)}
          style={{ color: 'var(--teal)', fontWeight: 700, borderBottom: 'none' }}>
          Contact Us →
        </Link>
      </div>
    </nav>
  );
}
