'use client';
import { useEffect, useRef, useState } from 'react';
import type { PopupAlert as PopupT } from '@/lib/types';
import { safeHref } from '@/lib/safe-url';

export default function PopupAlert({ popup }: { popup: PopupT }) {
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const lastFocused = useRef<Element | null>(null);

  useEffect(() => {
    if (!popup.active) return;
    const key = `mc_popup_v${popup.version}`;
    if (localStorage.getItem(key) !== '1') {
      const t = setTimeout(() => setOpen(true), 350);
      return () => clearTimeout(t);
    }
  }, [popup.active, popup.version]);

  // Body-scroll lock + focus trap + Esc to close
  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); dismiss(); return; }
      if (e.key !== 'Tab' || !cardRef.current) return;
      const focusables = cardRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    // Move focus into the dialog
    const t = setTimeout(() => {
      cardRef.current?.querySelector<HTMLElement>('button, a[href]')?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
      if (lastFocused.current instanceof HTMLElement) lastFocused.current.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!popup.active || !open) return null;

  const dismiss = () => {
    localStorage.setItem(`mc_popup_v${popup.version}`, '1');
    setOpen(false);
  };

  const safeCtaUrl = safeHref(popup.cta_url);

  return (
    <div className="popup-overlay" onClick={dismiss} role="dialog" aria-modal="true"
      aria-labelledby="popup-title">
      <div ref={cardRef} className={`popup-card ${popup.urgent ? 'urgent' : ''}`}
        onClick={(e) => e.stopPropagation()}>
        <div className="popup-icon" aria-hidden>{popup.urgent ? '⚠️' : 'ℹ️'}</div>
        <div className="popup-title" id="popup-title">{popup.title}</div>
        <div className="popup-body" style={{ whiteSpace: 'pre-wrap' }}>{popup.body}</div>
        <div className="popup-actions">
          {safeCtaUrl && popup.cta_label && (
            <a className="btn btn-teal" href={safeCtaUrl} rel="noopener noreferrer" target="_blank">
              {popup.cta_label}
            </a>
          )}
          <button className="btn btn-outline" onClick={dismiss}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}
