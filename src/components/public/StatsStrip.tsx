'use client';
import { useEffect, useRef, useState } from 'react';
import type { ClinicStat } from '@/lib/types';

export default function StatsStrip({ stats }: { stats: ClinicStat[] }) {
  const ref = useRef<HTMLElement | null>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAnimate(true); return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { setAnimate(true); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  if (!stats || stats.length === 0) return null;

  return (
    <section ref={ref} className="stats-strip" aria-label="Clinic at a glance">
      <div className="stats-strip-inner">
        {stats.map((s, i) => (
          <div key={`${s.label}-${i}`} className="stat-cell" style={{ animationDelay: `${i * 80}ms` }}>
            <Counter target={s.value} suffix={s.suffix} animate={animate} />
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Counter({ target, suffix, animate }: { target: string; suffix: string; animate: boolean }) {
  // Try to extract a numeric portion; if none (or non-integer), just display
  // the literal value (e.g. "4.9", "5,000", "★").
  const num = Number(target.replace(/,/g, ''));
  const hasNumber = Number.isFinite(num) && !Number.isNaN(num);
  const [shown, setShown] = useState<string>(hasNumber ? '0' : target);

  useEffect(() => {
    if (!animate) return;
    if (!hasNumber) { setShown(target); return; }
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const fmt = (n: number) => {
      if (Number.isInteger(num)) return Math.round(n).toLocaleString();
      // Preserve original decimal precision (e.g. "4.9" stays one-decimal)
      const decimals = (target.split('.')[1] || '').length;
      return n.toFixed(decimals);
    };
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3); // easeOutCubic
      setShown(fmt(num * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, hasNumber, num, target]);

  return (
    <div className="stat-num">
      <span className="stat-num-value">{shown}</span>
      {suffix && <span className="stat-num-suffix">{suffix}</span>}
    </div>
  );
}
