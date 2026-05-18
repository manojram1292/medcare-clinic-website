import Link from 'next/link';
import { Flash } from '@/components/admin/Flash';
import DeleteButton from '@/components/admin/DeleteButton';
import { getAuthors, getPosts } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { deletePost, upsertAuthor } from './actions';

export default async function BlogAdmin({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  await requireAdmin('blog');
  const [posts, authors] = await Promise.all([getPosts(), getAuthors()]);
  return (
    <>
      <h1 className="admin-h1">Blog</h1>
      <p className="admin-sub">Write and publish articles. Posts are written in Markdown — keep it simple.</p>
      <Flash ok={searchParams.ok ? 'Saved.' : null} err={searchParams.err ?? null} />

      <div className="admin-toolbar">
        <Link href="/admin/blog/new" className="btn btn-teal">+ New post</Link>
        <span className="spacer" />
        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
          {posts.filter((p) => p.published).length} published / {posts.length} total
        </span>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        {posts.map((p) => (
          <div key={p.id} className="admin-list-item">
            <div className="admin-thumb"
              style={{ background: p.cover_url ? '#000' : undefined }}>
              {p.cover_url
                /* eslint-disable-next-line @next/next/no-img-element */
                ? <img src={p.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 18 }}>📄</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--navy)' }}>
                {p.title}{' '}
                {p.featured && <span style={{ color: 'var(--teal)', fontSize: 11, fontWeight: 700 }}>★ Featured</span>}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
                {p.category} · {p.published ? 'Published' : 'Draft'} · /{p.slug}
              </div>
            </div>
            {p.published && (
              <Link href={`/blog/${p.slug}`} target="_blank" className="btn btn-outline">View</Link>
            )}
            <Link href={`/admin/blog/${p.id}`} className="btn btn-outline">Edit</Link>
            <DeleteButton action={deletePost} id={p.id} confirm={`Delete "${p.title}"?`} />
          </div>
        ))}
        {posts.length === 0 && (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-3)' }}>No posts yet.</div>
        )}
      </div>

      <div className="admin-card" style={{ marginTop: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginBottom: 6, color: 'var(--navy)' }}>
          Authors
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14 }}>
          Authors are reusable across posts. Assign one to a post when writing it.
        </p>
        <ul style={{ listStyle: 'none', padding: 0, marginBottom: 16 }}>
          {authors.map((a) => (
            <li key={a.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
              <strong>{a.initials}</strong> — {a.name}{' '}
              <span style={{ color: 'var(--text-3)' }}>({a.role || '—'})</span>
            </li>
          ))}
        </ul>
        <form action={upsertAuthor} className="admin-row">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" name="name" required />
          </div>
          <div className="form-group">
            <label className="form-label">Initials</label>
            <input className="form-input" name="initials" maxLength={4} required />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <input className="form-input" name="role" />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-navy">Add author</button>
          </div>
        </form>
      </div>
    </>
  );
}
