'use client';
import { useEffect, useState } from 'react';
import type { Announcement } from '@/lib/types';

export default function AnnouncementBanner({ ann }: { ann: Announcement }) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!ann.active) return;
    const key = `mc_ann_dismissed:${ann.message}`;
    setHidden(sessionStorage.getItem(key) === '1');
  }, [ann.active, ann.message]);

  if (!ann.active || hidden) return null;

  return (
    <div className={`ann ${ann.urgent ? 'urgent' : ''}`} role="status">
      <span className="ann-tag">{ann.urgent ? 'Urgent' : 'Notice'}</span>
      {ann.message}
      <button className="ann-close" aria-label="Dismiss"
        onClick={() => {
          sessionStorage.setItem(`mc_ann_dismissed:${ann.message}`, '1');
          setHidden(true);
        }}>×</button>
    </div>
  );
}
