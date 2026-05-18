import Link from 'next/link';
import Image from 'next/image';
import { Flash } from '@/components/admin/Flash';
import DeleteButton from '@/components/admin/DeleteButton';
import { getPatientHubArticles } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { deletePatientHubArticle } from './actions';

export default async function PatientHubAdmin({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  await requireAdmin('patient_hub');
  const articles = await getPatientHubArticles();

  return (
    <>
      <h1 className="admin-h1">Patient Hub</h1>
      <p className="admin-sub">
        Doctor-curated health information for patients. Searchable from the
        public site. Add trusted external links to back up each article.
      </p>
      <Flash ok={searchParams.ok ? 'Saved.' : null} err={searchParams.err ?? null} />

      <div className="admin-toolbar">
        <Link href="/admin/patient-hub/new" className="btn btn-teal">+ New article</Link>
        <span className="spacer" />
        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
          {articles.filter((a) => a.published).length} published / {articles.length} total
        </span>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        {articles.map((a) => (
          <div key={a.id} className="admin-list-item">
            <div className="admin-thumb" style={{ background: a.cover_url ? '#000' : undefined }}>
              {a.cover_url
                ? <Image src={a.cover_url} alt="" width={48} height={48} style={{ objectFit: 'cover' }} />
                : <span style={{ fontSize: 18 }}>📚</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--navy)' }}>
                {a.title}{' '}
                {a.featured && <span style={{ color: 'var(--teal)', fontSize: 11, fontWeight: 700 }}>★ Featured</span>}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
                {a.category} · {a.published ? 'Published' : 'Draft'} · /{a.slug} · {a.read_minutes} min
              </div>
            </div>
            {a.published && (
              <Link href={`/patient-hub/${a.slug}`} target="_blank" className="btn btn-outline">View</Link>
            )}
            <Link href={`/admin/patient-hub/${a.id}`} className="btn btn-outline">Edit</Link>
            <DeleteButton action={deletePatientHubArticle} id={a.id} confirm={`Delete "${a.title}"?`} />
          </div>
        ))}
        {articles.length === 0 && (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-3)' }}>
            No articles yet. Click <strong>+ New article</strong> to add the first one.
          </div>
        )}
      </div>
    </>
  );
}
