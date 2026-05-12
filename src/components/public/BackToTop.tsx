'use client';
import { useEffect, useState } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window === 'undefined') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <button
      className={`back-to-top${visible ? ' visible' : ''}`}
      type="button"
      aria-label="Back to top"
      onClick={scrollToTop}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.4" strokeLinecap="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}
