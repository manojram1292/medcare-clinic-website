import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getAuthors, getPostBySlug } from '@/lib/data';
import { createAnonClient } from '@/lib/supabase/anon';
import { renderMarkdown } from '@/lib/markdown';
import { ArticleJsonLd } from '@/components/public/JsonLd';

export const revalidate = 60;

export async function generateStaticParams() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes('YOUR-')) return [];
  const supabase = createAnonClient();
  const { data } = await supabase.from('blog_posts').select('slug').eq('published', true);
  return ((data ?? []) as { slug: string }[]).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post || !post.published) return { title: 'Article not found' };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      images: post.cover_url ? [post.cover_url] : undefined,
      publishedTime: post.published_at,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const [post, authors] = await Promise.all([getPostBySlug(params.slug), getAuthors()]);
  if (!post || !post.published) notFound();
  const author = authors.find((a) => a.id === post.author_id);
  const html = renderMarkdown(post.body);

  return (
    <article className="article-wrap">
      <ArticleJsonLd post={post} authorName={author?.name ?? 'Anonymous'} />
      <Link href="/blog" style={{ color: 'var(--teal)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
        ← Back to all articles
      </Link>
      <div style={{ height: 18 }} />
      <span className="blog-tag">{post.category}</span>
      <h1 className="article-h1" style={{ marginTop: 14 }}>{post.title}</h1>
      <div className="article-meta">
        <div className="blog-meta-av">{author?.initials ?? '·'}</div>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{author?.name ?? 'Anonymous'}</div>
          <div style={{ fontSize: 12, marginTop: 1 }}>
            {new Date(post.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}{post.read_minutes} min read
          </div>
        </div>
      </div>
      {(post.cover_url || post.cover_gradient) && (
        <div className={`article-cover ${post.cover_url ? '' : post.cover_gradient}`}>
          {post.cover_url
            && <Image src={post.cover_url} alt={post.title} fill sizes="(max-width:760px) 100vw, 760px"
                 priority style={{ objectFit: 'cover' }} />}
        </div>
      )}
      <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
