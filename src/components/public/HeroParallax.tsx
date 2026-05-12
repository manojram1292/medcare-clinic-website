'use client';
import { useEffect } from 'react';

// Subtle mouse-driven parallax on the hero floating cards.
// Max ~6px translate — felt, not seen. Disabled when prefers-reduced-motion
// or on touch devices (where there's no cursor).
export default function HeroParallax() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) return;
    if (window.matchMedia('(hover: none)').matches) return;

    const visual = document.querySelector<HTMLElement>('.hero-visual');
    if (!visual) return;
    const cards = Array.from(visual.querySelectorAll<HTMLElement>('.float-card'));
    if (cards.length === 0) return;

    const depths = [6, 9, 4]; // per-card translation (px)
    let raf = 0;
    let tx = 0, ty = 0, x = 0, y = 0;

    const onMove = (e: MouseEvent) => {
      const rect = visual.getBoundingClientRect();
      // -1..+1 from card center
      x = (e.clientX - rect.left) / rect.width - 0.5;
      y = (e.clientY - rect.top) / rect.height - 0.5;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      raf = 0;
      // ease toward target
      tx += (x - tx) * 0.15;
      ty += (y - ty) * 0.15;
      cards.forEach((c, i) => {
        const d = depths[i] ?? 5;
        c.style.transform = `translate3d(${(-tx * d).toFixed(2)}px, ${(-ty * d).toFixed(2)}px, 0)`;
      });
      if (Math.abs(x - tx) > 0.001 || Math.abs(y - ty) > 0.001) {
        raf = requestAnimationFrame(tick);
      }
    };
    const onLeave = () => {
      x = 0; y = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    visual.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      visual.removeEventListener('mouseleave', onLeave);
      cards.forEach((c) => { c.style.transform = ''; });
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
