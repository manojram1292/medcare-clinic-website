'use client';
import { useEffect, useState } from 'react';

// Thin teal line at the top edge that fills as the user scrolls down the page.
// Disabled when prefers-reduced-motion is on.
export default function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setPct(total > 0 ? Math.min(1, Math.max(0, h.scrollTop / total)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden>
      <div className="scroll-progress-bar" style={{ transform: `scaleX(${pct})` }} />
    </div>
  );
}
