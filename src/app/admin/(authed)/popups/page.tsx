import { Flash } from '@/components/admin/Flash';
import { getPopup } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { savePopup } from './actions';

export default async function PopupsAdmin({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  await requireAdmin('popups');
  const p = await getPopup();
  return (
    <>
      <h1 className="admin-h1">Popup alert</h1>
      <p className="admin-sub">
        A modal that visitors must dismiss before browsing. Once they dismiss it, they won&apos;t see it again
        unless you tick &ldquo;force re-show&rdquo; below.
      </p>
      <Flash ok={searchParams.ok ? 'Saved.' : null} err={searchParams.err ?? null} />
      <form action={savePopup} className="admin-card">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" name="title" defaultValue={p.title} maxLength={120} />
        </div>
        <div className="form-group">
          <label className="form-label">Body</label>
          <textarea className="form-input form-textarea" name="body"
            defaultValue={p.body} maxLength={1200} style={{ minHeight: 140 }} />
        </div>
        <div className="admin-row">
          <div className="form-group">
            <label className="form-label">Optional button label</label>
            <input className="form-input" name="cta_label" defaultValue={p.cta_label ?? ''} maxLength={60} />
          </div>
          <div className="form-group">
            <label className="form-label">Optional button URL</label>
            <input className="form-input" name="cta_url" defaultValue={p.cta_url ?? ''} maxLength={300}
              placeholder="https://…" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input type="checkbox" name="active" defaultChecked={p.active} />
            Active (show to visitors)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input type="checkbox" name="urgent" defaultChecked={p.urgent} />
            Urgent styling
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input type="checkbox" name="bump_version" />
            Force re-show to visitors who already dismissed
          </label>
        </div>
        <div style={{ marginTop: 18 }}>
          <button className="btn btn-navy btn-lg">Save</button>
        </div>
      </form>
    </>
  );
}
