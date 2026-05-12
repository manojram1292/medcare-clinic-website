import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getDoctorBySlug } from '@/lib/data';
import { createAnonClient } from '@/lib/supabase/anon';
import { WEEKDAYS_FOR_TABLE, type Doctor } from '@/lib/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const revalidate = 60;

export async function generateStaticParams() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes('YOUR-')) return [];
  const supabase = createAnonClient();
  const { data } = await supabase.from('doctors').select('slug').not('slug', 'is', null);
  return ((data ?? []) as Pick<Doctor, 'slug'>[])
    .filter((d) => d.slug)
    .map((d) => ({ slug: d.slug! }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const d = await getDoctorBySlug(params.slug);
  if (!d) return { title: 'Doctor not found' };
  return {
    title: d.name,
    description: `${d.specialty}. ${d.bio.slice(0, 160)}`,
    openGraph: {
      title: d.name, description: d.specialty, type: 'profile',
      images: d.photo_url ? [d.photo_url] : undefined,
    },
  };
}

export default async function DoctorDetailPage({ params }: { params: { slug: string } }) {
  const d = await getDoctorBySlug(params.slug);
  if (!d) notFound();

  const physicianLd = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: d.name,
    medicalSpecialty: d.specialty,
    image: d.photo_url ?? undefined,
    description: d.bio,
    knowsLanguage: d.languages,
    url: `${SITE_URL}/doctors/${d.slug}`,
  };

  return (
    <div className="doctor-page">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(physicianLd).replace(/</g, '\\u003c') }} />

      <section className="doc-hero">
        <div className="doc-hero-inner">
          <Link href="/doctors" className="doc-back">← All physicians</Link>
          <div className="doc-hero-grid">
            <div className="doc-hero-photo">
              {d.photo_url
                ? <Image src={d.photo_url} alt={d.name} fill sizes="(max-width:760px) 80vw, 360px"
                    style={{ objectFit: 'cover' }} priority />
                : <span className="doc-hero-initials">{d.initials}</span>}
            </div>
            <div className="doc-hero-text">
              <div className="doc-spec" style={{ color: 'var(--teal-light)' }}>{d.specialty}</div>
              <h1>{d.name}</h1>
              <p className="doc-hero-bio">{d.bio}</p>
              <div className="doc-meta-chips">
                {d.years_experience != null && (
                  <span className="meta-chip">⭐ {d.years_experience}+ years experience</span>
                )}
                <span className={`meta-chip status-${d.status}`}>
                  {d.status === 'available' ? 'Accepting patients' :
                    d.status === 'limited' ? 'Limited availability' : 'Currently unavailable'}
                </span>
                {d.languages.length > 0 && (
                  <span className="meta-chip">🗣 {d.languages.join(' · ')}</span>
                )}
              </div>
              <div className="doc-hero-actions">
                <Link href="/contact" className="btn-hero-primary">Contact the clinic</Link>
                <Link href="/doctors" className="btn-hero-ghost">See all doctors</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: 'var(--white)' }}>
        <div className="sec-inner">
          <div className="doctor-grid">
            <div>
              {d.education && (
                <div className="doc-detail-block">
                  <h3>Education &amp; training</h3>
                  <p>{d.education}</p>
                </div>
              )}
              {d.conditions.length > 0 && (
                <div className="doc-detail-block">
                  <h3>Conditions &amp; areas of focus</h3>
                  <div className="cond-tags">
                    {d.conditions.map((c) => <span key={c} className="cond-tag">{c}</span>)}
                  </div>
                </div>
              )}
              {d.languages.length > 0 && (
                <div className="doc-detail-block">
                  <h3>Languages spoken</h3>
                  <p>{d.languages.join(', ')}</p>
                </div>
              )}
            </div>
            <aside className="doc-side">
              <div className="doc-side-card">
                <div className="sec-label" style={{ marginBottom: 8 }}>In-clinic this week</div>
                <ul className="doc-schedule-list">
                  {WEEKDAYS_FOR_TABLE.map((day) => (
                    <li key={day} className={d.schedule?.[day] ? '' : 'off'}>
                      <span>{day}</span>
                      <strong>{d.schedule?.[day] ?? '—'}</strong>
                    </li>
                  ))}
                </ul>
                <Link href="/contact" className="btn btn-navy" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }}>
                  Get in touch
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
