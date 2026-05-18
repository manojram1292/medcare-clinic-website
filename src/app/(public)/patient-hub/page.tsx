import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPatientHubArticles, searchPatientHub } from '@/lib/data';
import type { PatientHubArticle } from '@/lib/types';
import PatientHubSearch from '@/components/public/PatientHubSearch';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Patient Hub',
  description:
    'Trusted, evidence-based health information curated by our physicians. ' +
    'Search for a topic or browse categories on blood tests, vitals, vaccines, ' +
    'mental wellness, and more.',
};

type SearchParams = { q?: string };

export default async function PatientHubIndex({ searchParams }: { searchParams: SearchParams }) {
  const q = (searchParams.q ?? '').trim();

  const [results, all] = await Promise.all([
    q ? searchPatientHub(q) : Promise.resolve<PatientHubArticle[]>([]),
    getPatientHubArticles({ onlyPublished: true }),
  ]);

  const articles = q ? results : all;
  const featured = !q ? all.find((a) => a.featured) : null;
  const rest = featured ? articles.filter((a) => a.id !== featured.id) : articles;

  // Group by category for browsing
  const categories = Array.from(new Set(all.map((a) => a.category)));

  return (
    <div className="page-transition">
      <section className="about-hero-sec">
        <div className="sec-label" style={{ color: 'var(--teal-light)' }}>For Patients</div>
        <h1>Patient Hub</h1>
        <p>
          Trusted, doctor-curated information on tests, vitals, vaccines, lifestyle,
          mental wellness, and external Canadian resources you can rely on.
        </p>
        <div style={{ maxWidth: 560, margin: '28px auto 0' }}>
          <PatientHubSearch initialQuery={q} />
        </div>
      </section>

      <section className="sec" style={{ background: 'var(--cream)' }}>
        <div className="sec-inner">
          {q ? (
            <SearchResults query={q} articles={articles} />
          ) : (
            <Browse featured={featured} rest={rest} categories={categories} />
          )}
        </div>
      </section>
    </div>
  );
}

function SearchResults({ query, articles }: { query: string; articles: PatientHubArticle[] }) {
  return (
    <>
      <div className="sec-header" style={{ marginBottom: 28 }}>
        <div className="sec-label">Search results</div>
        <div className="sec-title" style={{ fontSize: 30 }}>
          {articles.length} result{articles.length === 1 ? '' : 's'} for &ldquo;{query}&rdquo;
        </div>
        {articles.length === 0 && (
          <p className="sec-sub" style={{ marginTop: 8 }}>
            No articles match that yet. Try a different keyword, or{' '}
            <Link href="/patient-hub" style={{ color: 'var(--teal)' }}>browse all articles</Link>.
          </p>
        )}
      </div>
      {articles.length > 0 && <ArticleGrid articles={articles} />}
    </>
  );
}

function Browse({
  featured, rest, categories,
}: {
  featured: PatientHubArticle | null | undefined;
  rest: PatientHubArticle[];
  categories: string[];
}) {
  if (rest.length === 0 && !featured) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
        No articles published yet. Check back soon.
      </div>
    );
  }
  return (
    <>
      {featured && <FeaturedCard article={featured} />}

      {categories.length > 1 && (
        <div className="ph-cat-pills" style={{ margin: '32px 0 24px' }}>
          <Link className="ph-cat-pill ph-cat-pill-active" href="/patient-hub">All</Link>
          {categories.map((cat) => (
            <Link key={cat} href={`/patient-hub?q=${encodeURIComponent(cat)}`} className="ph-cat-pill">
              {cat}
            </Link>
          ))}
        </div>
      )}

      <ArticleGrid articles={rest} />
    </>
  );
}

function FeaturedCard({ article }: { article: PatientHubArticle }) {
  return (
    <Link href={`/patient-hub/${article.slug}`} className="blog-feature" style={{ textDecoration: 'none' }}>
      <div className={`blog-feature-img ${article.cover_gradient}`}>
        {article.cover_url
          ? <Image src={article.cover_url} alt="" fill sizes="(max-width:900px) 100vw, 60vw"
              style={{ objectFit: 'cover' }} priority />
          : (
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5"/>
              <path d="M12 5v17M9 8h6M9 12h6M9 16h4"/>
            </svg>
          )}
      </div>
      <div className="blog-feature-body">
        <span className="blog-tag">Featured · {article.category}</span>
        <h2 className="blog-feature-title">{article.title}</h2>
        <p className="blog-feature-excerpt">{article.excerpt}</p>
        <div className="blog-meta">
          <span>{article.read_minutes} min read</span>
          {article.tags.slice(0, 3).map((t) => (
            <span key={t} className="ph-tag-inline">#{t}</span>
          ))}
        </div>
        <span className="btn btn-teal" style={{ alignSelf: 'flex-start' }}>Read article →</span>
      </div>
    </Link>
  );
}

function ArticleGrid({ articles }: { articles: PatientHubArticle[] }) {
  return (
    <div className="blog-grid">
      {articles.map((a) => (
        <Link key={a.id} href={`/patient-hub/${a.slug}`} className="blog-card">
          <div className={`blog-card-img ${a.cover_gradient}`}>
            {a.cover_url
              ? <Image src={a.cover_url} alt="" fill sizes="(max-width:900px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }} />
              : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.4" opacity=".5">
                  <rect x="4" y="3" width="16" height="18" rx="2" />
                  <line x1="8" y1="8" x2="16" y2="8" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                  <line x1="8" y1="16" x2="13" y2="16" />
                </svg>
              )}
          </div>
          <div className="blog-card-body">
            <span className="blog-tag" style={{ padding: '3px 10px', fontSize: 10.5, marginBottom: 10 }}>
              {a.category}
            </span>
            <h3 className="blog-card-title">{a.title}</h3>
            <p className="blog-card-excerpt">{a.excerpt}</p>
            <div className="blog-card-meta">
              <span>{a.read_minutes} min read</span>
              {a.tags.length > 0 && <><span className="blog-meta-dot">·</span><span>#{a.tags[0]}</span></>}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
