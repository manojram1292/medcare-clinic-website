'use client';
import { useState } from 'react';
import type { Faq } from '@/lib/types';

export default function FaqSection({ faqs, title = 'Frequently Asked Questions',
  label = 'Patient FAQs', subtitle = 'The questions we hear most often — answered honestly.' }: {
  faqs: Faq[];
  title?: string;
  label?: string;
  subtitle?: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  if (faqs.length === 0) return null;

  // Group by category, preserving sort order
  const grouped = faqs.reduce<Record<string, Faq[]>>((acc, f) => {
    (acc[f.category] ||= []).push(f); return acc;
  }, {});
  const cats = Object.keys(grouped);

  return (
    <section className="sec faq-sec" aria-labelledby="faq-title">
      <div className="sec-inner">
        <div className="sec-header center">
          <div className="sec-label">{label}</div>
          <div className="sec-title" id="faq-title">{title}</div>
          <p className="sec-sub">{subtitle}</p>
        </div>
        <div className="faq-grid">
          {cats.map((cat) => (
            <div key={cat} className="faq-group">
              <h3 className="faq-cat">{cat}</h3>
              {grouped[cat].map((f) => {
                const isOpen = open === f.id;
                return (
                  <div key={f.id} className={`faq-item ${isOpen ? 'open' : ''}`}>
                    <button
                      className="faq-q"
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${f.id}`}
                      onClick={() => setOpen(isOpen ? null : f.id)}
                    >
                      <span>{f.question}</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"
                        className="faq-chev">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    <div className="faq-a-wrap" id={`faq-a-${f.id}`} role="region">
                      <p className="faq-a">{f.answer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
