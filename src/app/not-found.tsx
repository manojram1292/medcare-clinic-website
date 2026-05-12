import Link from 'next/link';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="nf-wrap">
      <div className="nf-bg" aria-hidden>
        <div className="nf-orb nf-orb-1" />
        <div className="nf-orb nf-orb-2" />
        <div className="nf-grid" />
      </div>
      <div className="nf-card">
        <svg width="92" height="92" viewBox="0 0 120 120" fill="none" aria-hidden>
          <circle cx="60" cy="60" r="56" stroke="rgba(255,255,255,.15)" strokeWidth="2" strokeDasharray="4 6" />
          <path d="M30 70 L50 70 L40 50 L60 30 L80 50 L70 70 L90 70" stroke="#D49255" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="60" cy="60" r="3" fill="#D49255" />
        </svg>
        <div className="nf-eyebrow">Error 404</div>
        <h1>This corner of the clinic isn&apos;t open today.</h1>
        <p>
          The page you tried to reach doesn&apos;t exist or was moved. Let&apos;s get you back to
          something useful.
        </p>
        <div className="nf-actions">
          <Link className="btn-hero-primary" href="/">Back to home</Link>
          <Link className="btn-hero-ghost" href="/contact">Contact us</Link>
        </div>
      </div>
    </div>
  );
}
