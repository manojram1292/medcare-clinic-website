import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPatientHubBySlug } from '@/lib/data';
import { createAnonClient } from '@/lib/supabase/anon';
import { renderMarkdown } from '@/lib/markdown';
import { safeHref } from '@/lib/safe-url';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const revalidate = 60;

// Build-time params via anon client — generateStaticParams runs OUTSIDE a
// request scope, so the cookie-aware server client crashes here.
export async function generateStaticParams() {
  const supabase = createAnonClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from('patient_hub')
    .select('slug')
    .eq('published', true);
  return (data ?? []).map((a: { slug: string }) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getPatientHubBySlug(params.slug);
  if (!article) return { title: 'Not found' };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt,
      url: `${SITE_URL}/patient-hub/${article.slug}`,
      images: article.cover_url ? [article.cover_url] : undefined,
    },
  };
}

export default async function PatientHubArticlePage({ params }: { params: { slug: string } }) {
  const article = await getPatientHubBySlug(params.slug);
  if (!article || !article.published) notFound();

  const html = await renderMarkdown(article.body);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.created_at,
    dateModified: article.updated_at,
    keywords: article.tags.join(', '),
    image: article.cover_url ? [article.cover_url] : undefined,
    mainEntityOfPage: `${SITE_URL}/patient-hub/${article.slug}`,
  };

  return (
    <article className="article-wrap page-transition">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />

      <Link href="/patient-hub" className="doc-back" style={{ color: 'var(--text-3)', marginBottom: 16, display: 'inline-block' }}>
        ← Back to Patient Hub
      </Link>

      <div className={`article-cover ${article.cover_gradient}`}>
        {article.cover_url && (
          <Image src={article.cover_url} alt="" fill sizes="(max-width:760px) 100vw, 760px"
            style={{ objectFit: 'cover' }} priority />
        )}
      </div>

      <span className="blog-tag" style={{ marginBottom: 16 }}>{article.category}</span>
      <h1 className="article-h1">{article.title}</h1>
      <div className="article-meta">
        <span>{article.read_minutes} min read</span>
        {article.tags.slice(0, 4).map((t) => (
          <span key={t} className="ph-tag-inline">#{t}</span>
        ))}
      </div>

      <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />

      {article.related_links.length > 0 && (
        <aside className="ph-related" aria-label="Related external resources">
          <h3>Trusted external resources</h3>
          <ul>
            {article.related_links.map((link, i) => {
              const safe = safeHref(link.url);
              if (!safe) return null;
              return (
                <li key={`${link.url}-${i}`}>
                  <a href={safe} target="_blank" rel="noopener noreferrer">
                    {link.label}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="ph-related-note">
            We link to these sources because we trust them. They may collect their
            own analytics — please review their privacy policies.
          </p>
        </aside>
      )}

      <div className="article-cta" style={{ marginTop: 48 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--navy)', marginBottom: 6 }}>
          Have questions about this topic?
        </h3>
        <p style={{ color: 'var(--text-3)', marginBottom: 16 }}>
          We&apos;re happy to talk it through at your next visit, or you can call us anytime during clinic hours.
        </p>
        <Link href="/contact" className="btn btn-teal btn-lg">Contact the clinic</Link>
      </div>
    </article>
  );
}
