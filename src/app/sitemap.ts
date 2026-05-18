import type { MetadataRoute } from 'next';
import { getPatientHubArticles, getPosts } from '@/lib/data';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, hub] = await Promise.all([
    getPosts({ onlyPublished: true }),
    getPatientHubArticles({ onlyPublished: true }),
  ]);
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE}/`,             lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE}/about`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/doctors`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE}/services`,     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/patient-hub`,  lastModified: now, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${SITE}/blog`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE}/contact`,      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ];
  const blog = posts.map((p) => ({
    url: `${SITE}/blog/${p.slug}`,
    lastModified: new Date(p.published_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
  const hubEntries = hub.map((a) => ({
    url: `${SITE}/patient-hub/${a.slug}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  return [...staticEntries, ...blog, ...hubEntries];
}
