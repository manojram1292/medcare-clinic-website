import { Flash } from '@/components/admin/Flash';
import DeleteButton from '@/components/admin/DeleteButton';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { ROLE_DESCRIPTION, ROLE_LABEL, ROLES, type Role } from '@/lib/permissions';
import { deleteAdmin, inviteAdmin, updateAdminRole } from './actions';

type AdminRow = { id: string; role: Role; email: string; created_at: string };

export const dynamic = 'force-dynamic';

export default async function UsersAdmin({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  const me = await requireAdmin('users');

  // Get admins table
  const supabase = createClient();
  const { data: adminsRows } = await supabase
    .from('admins')
    .select('id, role, created_at');

  // Get matching auth.users emails via service role
  const adminClient = createAdminClient();
  const { data: usersList } = await adminClient.auth.admin.listUsers();
  const emailById = new Map<string, string>(
    (usersList?.users ?? []).map((u) => [u.id, u.email ?? '(no email)'] as [string, string]),
  );

  const admins: AdminRow[] = (adminsRows ?? []).map((r) => ({
    id: r.id as string,
    role: (r.role ?? 'owner') as Role,
    email: emailById.get(r.id as string) ?? '(unknown email)',
    created_at: (r.created_at ?? '') as string,
  }));

  return (
    <>
      <h1 className="admin-h1">Users &amp; roles</h1>
      <p className="admin-sub">
        Invite staff with the right level of access. Receptionists can manage hours &amp; banners;
        editors can write content; managers can do everything except managing users.
      </p>
      <Flash
        ok={searchParams.ok === 'invited' ? 'Invitation sent. They\'ll receive an email to set their password.'
          : searchParams.ok === 'updated' ? 'Role updated.'
          : searchParams.ok === 'removed' ? 'User removed.'
          : null}
        err={searchParams.err ?? null}
      />

      <div className="admin-card">
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginBottom: 6, color: 'var(--navy)' }}>
          Invite a new staff member
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14 }}>
          They&apos;ll get an email with a link to set their password, then they can sign in at <code>/admin/login</code>.
        </p>
        <form action={inviteAdmin}>
          <div className="admin-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" name="email" required maxLength={180}
                placeholder="receptionist@medcareclinic.ca" autoComplete="off" />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input form-select" name="role" defaultValue="receptionist">
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-navy" type="submit">Send invite</button>
        </form>
      </div>

      <div className="admin-card">
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginBottom: 14, color: 'var(--navy)' }}>
          Current staff
        </h3>
        <div className="admin-list" style={{ marginBottom: 0 }}>
          {admins.map((a) => (
            <div key={a.id} className="admin-list-item">
              <div className="admin-thumb"><span>{(a.email[0] || '?').toUpperCase()}</span></div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 600, color: 'var(--navy)' }}>
                  {a.email}{a.id === me.id && <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--teal)' }}>· you</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  <span className={`role-badge role-${a.role}`}>{ROLE_LABEL[a.role]}</span>
                </div>
              </div>
              <form action={updateAdminRole} style={{ display: 'flex', gap: 6 }}>
                <input type="hidden" name="id" value={a.id} />
                <select name="role" defaultValue={a.role} className="form-input form-select"
                  style={{ width: 160 }}>
                  {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                </select>
                <button className="btn btn-outline" type="submit">Change</button>
              </form>
              <DeleteButton action={deleteAdmin} id={a.id}
                confirm={`Remove ${a.email} from admins?`} />
            </div>
          ))}
          {admins.length === 0 && (
            <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-3)' }}>No users yet.</div>
          )}
        </div>
      </div>

      <div className="admin-card">
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, marginBottom: 10, color: 'var(--navy)' }}>
          What each role can do
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {ROLES.map((r) => (
            <li key={r} style={{ marginBottom: 12 }}>
              <span className={`role-badge role-${r}`} style={{ marginRight: 10 }}>{ROLE_LABEL[r]}</span>
              <span style={{ fontSize: 13.5, color: 'var(--text-2)' }}>{ROLE_DESCRIPTION[r]}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
