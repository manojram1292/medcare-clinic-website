import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAuthors, getPosts } from '@/lib/data';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Health Blog', description: 'Insights and articles from our doctors.' };

export default async function BlogPage() {
  const [posts, authors] = await Promise.all([getPosts({ onlyPublished: true }), getAuthors()]);
  const authorMap = new Map(authors.map((a) => [a.id, a]));
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p.id !== featured?.id);

  return (
    <div style={{ animation: 'fadeUp .35s ease' }}>
      <div className="about-hero-sec">
        <div className="sec-label" style={{ color: 'var(--teal-light)' }}>Health Blog</div>
        <h1>Insights from Your Doctors</h1>
        <p>Practical, evidence-based articles written by our physicians — to help you and your family live healthier lives.</p>
      </div>
      <section className="sec" style={{ background: 'var(--cream)' }}>
        <div className="sec-inner">
          {featured && (
            <Link href={`/blog/${featured.slug}`} className="blog-feature" style={{ display: 'grid', textDecoration: 'none' }}>
              <div className="blog-feature-img">
                {featured.cover_url
                  ? <Image src={featured.cover_url} alt="" fill sizes="(max-width:900px) 100vw, 60vw" style={{ objectFit: 'cover' }} />
                  : <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M12 2v6M12 22v-6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M22 12h-6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"/>
                    </svg>}
              </div>
              <div className="blog-feature-body">
                <span className="blog-tag">Featured · {featured.category}</span>
                <h2 className="blog-feature-title">{featured.title}</h2>
                <p className="blog-feature-excerpt">{featured.excerpt}</p>
                <div className="blog-meta">
                  <div className="blog-meta-av">
                    {featured.author_id ? authorMap.get(featured.author_id)?.initials ?? '·' : '·'}
                  </div>
                  <div>
                    <div className="blog-meta-name">
                      {featured.author_id ? authorMap.get(featured.author_id)?.name ?? 'Anonymous' : 'Anonymous'}
                    </div>
                    <div style={{ fontSize: 12, marginTop: 1 }}>
                      {new Date(featured.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      {' · '}{featured.read_minutes} min read
                    </div>
                  </div>
                </div>
                <span className="btn btn-teal" style={{ alignSelf: 'flex-start' }}>Read Full Article →</span>
              </div>
            </Link>
          )}

          {rest.length > 0 && (
            <>
              <div className="sec-header" style={{ marginBottom: 32 }}>
                <div className="sec-label">Latest Articles</div>
                <div className="sec-title" style={{ fontSize: 32 }}>Recent Posts</div>
              </div>
              <div className="blog-grid">
                {rest.map((p) => (
                  <Link key={p.id} href={`/blog/${p.slug}`} className="blog-card">
                    <div className={`blog-card-img ${p.cover_url ? '' : p.cover_gradient}`}>
                      {p.cover_url
                        ? <Image src={p.cover_url} alt="" fill sizes="(max-width:900px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                        : <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".5">
                            <rect x="4" y="3" width="16" height="18" rx="2"/>
                            <line x1="8" y1="8" x2="16" y2="8"/>
                            <line x1="8" y1="12" x2="16" y2="12"/>
                            <line x1="8" y1="16" x2="13" y2="16"/>
                          </svg>}
                    </div>
                    <div className="blog-card-body">
                      <span className="blog-tag" style={{ padding: '3px 10px', fontSize: 10.5, marginBottom: 10 }}>
                        {p.category}
                      </span>
                      <h3 className="blog-card-title">{p.title}</h3>
                      <p className="blog-card-excerpt">{p.excerpt}</p>
                      <div className="blog-card-meta">
                        <div className="blog-meta-av" style={{ width: 26, height: 26, fontSize: 11 }}>
                          {p.author_id ? authorMap.get(p.author_id)?.initials ?? '·' : '·'}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>
                          {p.author_id ? authorMap.get(p.author_id)?.name ?? 'Anonymous' : 'Anonymous'}
                        </span>
                        <span className="blog-meta-dot">·</span>
                        <span>
                          {new Date(p.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {posts.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: 40 }}>
              No published posts yet. Add some from the admin panel.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
