import type { Clinic, Hours, BlogPost } from '@/lib/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Embedding JSON inside <script> requires escaping any literal "</" so a
// "</script>" in user-controlled content can't break out of the tag.
function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function ClinicJsonLd({ clinic, hours }: { clinic: Clinic; hours: Hours[] }) {
  const openingHours = hours
    .filter((h) => !h.closed && h.open_time && h.close_time)
    .map((h) => `${h.day_name.slice(0, 2)} ${to24(h.open_time!)}-${to24(h.close_time!)}`);

  const data = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: clinic.name,
    description: clinic.tagline,
    telephone: clinic.phone,
    email: clinic.email,
    address: { '@type': 'PostalAddress', streetAddress: clinic.address },
    url: SITE_URL,
    openingHours,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(data) }} />;
}

export function ArticleJsonLd({ post, authorName }: { post: BlogPost; authorName: string }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    author: { '@type': 'Person', name: authorName },
    image: post.cover_url ? [post.cover_url] : undefined,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(data) }} />;
}

function to24(s: string): string {
  // "8:00 AM" → "08:00", "6:00 PM" → "18:00"
  const m = s.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return '00:00';
  let h = parseInt(m[1], 10);
  const min = m[2];
  const isPM = m[3].toUpperCase() === 'PM';
  if (h === 12) h = 0;
  if (isPM) h += 12;
  return `${String(h).padStart(2, '0')}:${min}`;
}
