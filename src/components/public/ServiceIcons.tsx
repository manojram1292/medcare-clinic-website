// Curated SVG icons for clinical services. Falls back to the emoji
// stored in the DB if we don't have a match for the service name.
// Keep set deliberately small — the emoji fallback handles edge cases.

import type { ReactElement } from 'react';

const baseProps = {
  width: 26, height: 26, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', strokeWidth: 1.7,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
};

const ICONS: Record<string, ReactElement> = {
  'family medicine': (
    <svg {...baseProps}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>
      <path d="M12 12v3M10.5 13.5h3"/>
    </svg>
  ),
  'general consultation': (
    <svg {...baseProps}>
      <circle cx="12" cy="6" r="2.5"/>
      <path d="M5 21v-1a4 4 0 0 1 4-4h2"/>
      <path d="M16 14a4 4 0 0 0 0 8"/>
      <circle cx="16" cy="18" r="1"/>
      <path d="M16 14v-2a3 3 0 0 0-3-3"/>
    </svg>
  ),
  'physiotherapy': (
    <svg {...baseProps}>
      <path d="M6 4l4 4-2 2 4 4-2 2 4 4"/>
      <circle cx="6" cy="4" r="1.6"/>
      <circle cx="18" cy="20" r="1.6"/>
    </svg>
  ),
  'preventive care': (
    <svg {...baseProps}>
      <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  'follow-up care': (
    <svg {...baseProps}>
      <rect x="4" y="4" width="16" height="18" rx="2"/>
      <path d="M9 2v4M15 2v4M4 10h16"/>
      <path d="M8 14l2 2 4-4"/>
    </svg>
  ),
  'health assessments': (
    <svg {...baseProps}>
      <path d="M3 18l4-6 3 4 4-8 4 6 3-4"/>
      <path d="M3 21h18"/>
    </svg>
  ),
  'annual health assessments': (
    <svg {...baseProps}>
      <path d="M3 18l4-6 3 4 4-8 4 6 3-4"/>
      <path d="M3 21h18"/>
    </svg>
  ),
};

export function ServiceIcon({ name, fallbackEmoji }: { name: string; fallbackEmoji: string }) {
  const key = name.trim().toLowerCase();
  const svg = ICONS[key];
  if (svg) return <span className="svc-icon-svg">{svg}</span>;
  return <span className="svc-icon-emoji" aria-hidden>{fallbackEmoji}</span>;
}
