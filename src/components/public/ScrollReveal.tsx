'use client';
import { useEffect } from 'react';

// Activates `.reveal` elements as they scroll into view.
// Honours `prefers-reduced-motion` (no-op).
export default function ScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const els = document.querySelectorAll('.reveal');
    if (els.length === 0) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
