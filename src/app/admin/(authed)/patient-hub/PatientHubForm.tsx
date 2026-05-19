import Link from 'next/link';
import ImageUploadField from '@/components/admin/ImageUploadField';
import type { PatientHubArticle } from '@/lib/types';
import { upsertPatientHubArticle } from './actions';

const GRADIENTS = ['bcim-1', 'bcim-2', 'bcim-3', 'bcim-4', 'bcim-5', 'bcim-6'] as const;
const CATEGORIES = [
  'Tests & Procedures',
  'Vitals & Self-Monitoring',
  'Preventive Care',
  'Lifestyle & Wellness',
  'Mental Wellness',
  'Chronic Care',
  'Children\'s Health',
  'Senior Health',
  'External Resources',
  'General',
];

export default function PatientHubForm({ article }: { article?: PatientHubArticle }) {
  const linksAsText = (article?.related_links ?? [])
    .map((l) => `${l.label} | ${l.url}`)
    .join('\n');

  return (
    <form action={upsertPatientHubArticle} className="admin-card" encType="multipart/form-data">
      {article && <input type="hidden" name="id" value={article.id} />}

      <div className="admin-row">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" name="title" defaultValue={article?.title} required maxLength={200} />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <input className="form-input" name="category" defaultValue={article?.category ?? 'General'}
            list="ph-categories" maxLength={80} />
          <datalist id="ph-categories">
            {CATEGORIES.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Slug (URL) — leave blank to auto-generate from title</label>
        <input className="form-input" name="slug" defaultValue={article?.slug ?? ''} maxLength={160} />
      </div>

      <div className="form-group">
        <label className="form-label">Excerpt (one short sentence shown in lists + search results)</label>
        <textarea className="form-input form-textarea" name="excerpt"
          defaultValue={article?.excerpt} maxLength={500} style={{ minHeight: 70 }} />
      </div>

      <div className="form-group">
        <label className="form-label">Body (Markdown)</label>
        <textarea className="form-input form-textarea" name="body"
          defaultValue={article?.body} maxLength={50000} style={{ minHeight: 380, fontFamily: 'monospace' }} />
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
          Supports # / ## / ### headings, **bold**, *italic*, ordered &amp; unordered lists,
          &gt; blockquotes, [links](https://...), `inline code`, and Markdown tables.
        </div>
      </div>

      <div className="admin-row">
        <div className="form-group">
          <label className="form-label">Tags (comma-separated — these power search)</label>
          <input className="form-input" name="tags" defaultValue={article?.tags.join(', ') ?? ''}
            placeholder="blood test, fasting, lab work" />
        </div>
        <div className="form-group">
          <label className="form-label">Read time (minutes)</label>
          <input className="form-input" name="read_minutes" type="number" min={1} max={120}
            defaultValue={String(article?.read_minutes ?? 4)} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Cover image (optional)</label>
        <ImageUploadField
          name="cover"
          currentUrl={article?.cover_url ?? null}
          clearName="clear_cover"
          recommended="1600×900 jpg, under 500 KB (16:9 widescreen)"
          helpText="If no image is uploaded, a coloured gradient is shown. Image is auto-resized to 1920px wide before upload."
        />
      </div>

      <div className="form-group">
        <label className="form-label">Fallback gradient (used if no cover image)</label>
        <select className="form-input form-select" name="cover_gradient"
          defaultValue={article?.cover_gradient ?? 'bcim-1'}>
          {GRADIENTS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Trusted external links (one per line — &ldquo;Label | https://url&rdquo;)</label>
        <textarea className="form-input form-textarea" name="related_links_raw"
          defaultValue={linksAsText} maxLength={10000} style={{ minHeight: 120, fontFamily: 'monospace' }}
          placeholder="Health Canada | https://www.canada.ca/en/health-canada.html&#10;Nova Scotia Health | https://www.nshealth.ca/" />
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
          These appear in a &ldquo;Trusted external resources&rdquo; box at the bottom
          of the article. Only http/https URLs are allowed (validated server-side).
        </div>
      </div>

      <div className="admin-row">
        <div className="form-group">
          <label className="form-label">Sort order (lower first)</label>
          <input className="form-input" name="sort" type="number"
            defaultValue={String(article?.sort ?? 0)} />
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', paddingTop: 28 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input type="checkbox" name="published" defaultChecked={article?.published ?? false} /> Published
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input type="checkbox" name="featured" defaultChecked={article?.featured ?? false} /> Feature on Patient Hub
          </label>
        </div>
      </div>

      <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
        <button className="btn btn-navy btn-lg" type="submit">{article ? 'Save changes' : 'Create article'}</button>
        <Link href="/admin/patient-hub" className="btn btn-outline btn-lg">Cancel</Link>
      </div>
    </form>
  );
}
