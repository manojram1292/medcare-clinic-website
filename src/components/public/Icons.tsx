import * as React from 'react';

export const ChevronRight = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" {...p}>
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

export const Check = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" {...p}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export const IconPhone = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor"
    strokeWidth="2" fill="none" strokeLinecap="round" {...p}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .07h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

export const IconMail = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor"
    strokeWidth="2" fill="none" strokeLinecap="round" {...p}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

export const IconMap = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor"
    strokeWidth="2" fill="none" strokeLinecap="round" {...p}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

export const IconClock = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor"
    strokeWidth="2" fill="none" strokeLinecap="round" {...p}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

export const IconInfo = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor"
    strokeWidth="2" fill="none" strokeLinecap="round" {...p}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

export const CrossIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="#fff"
    strokeWidth="2.2" fill="none" strokeLinecap="round" {...p}>
    <path d="M12 4v16M4 12h16"/>
  </svg>
);
