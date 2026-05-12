import Link from 'next/link';
import Image from 'next/image';
import type { Author, BlogPost } from '@/lib/types';
import { upsertPost } from './actions';

const GRADIENTS = ['bcim-1','bcim-2','bcim-3','bcim-4','bcim-5','bcim-6'] as const;

export default function BlogForm({ authors, post }: { authors: Author[]; post?: BlogPost }) {
  return (
    <form action={upsertPost} className="admin-card" encType="multipart/form-data">
      {post && <input type="hidden" name="id" value={post.id} />}
      <div className="admin-row">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" name="title" defaultValue={post?.title} required maxLength={200} />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <input className="form-input" name="category" defaultValue={post?.category ?? 'General'} maxLength={80} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Slug (URL) — leave blank to auto-generate from title</label>
        <input className="form-input" name="slug" defaultValue={post?.slug ?? ''} maxLength={160} />
      </div>
      <div className="form-group">
        <label className="form-label">Excerpt (one sentence)</label>
        <textarea className="form-input form-textarea" name="excerpt"
          defaultValue={post?.excerpt} maxLength={500} style={{ minHeight: 70 }} />
      </div>
      <div className="form-group">
        <label className="form-label">Body (Markdown)</label>
        <textarea className="form-input form-textarea" name="body"
          defaultValue={post?.body} maxLength={50000} style={{ minHeight: 320, fontFamily: 'monospace' }} />
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
          Supports # / ## / ### headings, **bold**, *italic*, lists, &gt; blockquotes, [links](https://...), `code`.
        </div>
      </div>

      <div className="admin-row">
        <div className="form-group">
          <label className="form-label">Author</label>
          <select className="form-input form-select" name="author_id" defaultValue={post?.author_id ?? ''}>
            <option value="">— Select author —</option>
            {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Read time (minutes)</label>
          <input className="form-input" name="read_minutes" type="number" min={1} max={120}
            defaultValue={String(post?.read_minutes ?? 5)} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Cover image (optional)</label>
        {post?.cover_url && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Image src={post.cover_url} alt="" width={80} height={50}
              style={{ objectFit: 'cover', borderRadius: 8 }} />
            <label style={{ fontSize: 13 }}>
              <input type="checkbox" name="clear_cover" /> Remove cover
            </label>
          </div>
        )}
        <input type="file" name="cover" accept="image/*" />
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
          If no image is uploaded, a coloured gradient is shown.
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Fallback gradient (used if no cover image)</label>
        <select className="form-input form-select" name="cover_gradient" defaultValue={post?.cover_gradient ?? 'bcim-1'}>
          {GRADIENTS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          <input type="checkbox" name="published" defaultChecked={post?.published ?? false} />
          Published
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          <input type="checkbox" name="featured" defaultChecked={post?.featured ?? false} />
          Feature on blog index
        </label>
      </div>

      <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
        <button className="btn btn-navy btn-lg" type="submit">Save</button>
        <Link href="/admin/blog" className="btn btn-outline btn-lg">Cancel</Link>
      </div>
    </form>
  );
}
