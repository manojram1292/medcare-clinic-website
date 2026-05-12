import { Flash } from '@/components/admin/Flash';
import { getAnnouncement } from '@/lib/data';
import { saveAnnouncement } from './actions';

export default async function AnnouncementsAdmin({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  const a = await getAnnouncement();
  return (
    <>
      <h1 className="admin-h1">Announcement banner</h1>
      <p className="admin-sub">Thin coloured strip at the top of every page. Use it for short, time-sensitive info.</p>
      <Flash ok={searchParams.ok ? 'Saved.' : null} err={searchParams.err ?? null} />
      <form action={saveAnnouncement} className="admin-card">
        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea className="form-input form-textarea" name="message"
            defaultValue={a.message} maxLength={300} />
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input type="checkbox" name="active" defaultChecked={a.active} />
            Show banner
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input type="checkbox" name="urgent" defaultChecked={a.urgent} />
            Urgent (red)
          </label>
        </div>
        <div style={{ marginTop: 18 }}>
          <button className="btn btn-navy btn-lg">Save</button>
        </div>
      </form>
    </>
  );
}
