import { Flash } from '@/components/admin/Flash';
import DeleteButton from '@/components/admin/DeleteButton';
import UserPermissionForm from '@/components/admin/UserPermissionForm';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
  ALWAYS_ALLOWED, detectPreset, makeAdminProfile, PRESETS, PRESET_LABEL, RESOURCE_LABEL,
  type AdminProfile, type Preset,
} from '@/lib/permissions';
import { deleteAdmin, inviteAdmin } from './actions';

type UserRow = {
  profile: AdminProfile;
  email: string;
  created_at: string;
};

export const dynamic = 'force-dynamic';

export default async function UsersAdmin({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  const me = await requireAdmin('users');

  const supabase = createClient();
  const { data: rows } = await supabase
    .from('admins')
    .select('id, is_owner, permissions, created_at')
    .order('created_at', { ascending: true });

  const adminClient = createAdminClient();
  const { data: usersList } = await adminClient.auth.admin.listUsers();
  const emailById = new Map<string, string>(
    (usersList?.users ?? []).map((u) => [u.id, u.email ?? '(no email)'] as [string, string]),
  );

  const users: UserRow[] = (rows ?? []).map((r) => ({
    profile: makeAdminProfile(r as { id: string; is_owner?: boolean | null; permissions?: string[] | null }),
    email: emailById.get((r as { id: string }).id) ?? '(unknown email)',
    created_at: ((r as { created_at?: string }).created_at) ?? '',
  }));

  return (
    <>
      <h1 className="admin-h1">Users &amp; permissions</h1>
      <p className="admin-sub">
        Tick exactly what each staff member can do. Use a preset for a fast start,
        then tweak individual checkboxes. Only owners can manage other users.
      </p>
      <Flash
        ok={
          searchParams.ok === 'invited' ? 'Invitation sent. They\'ll receive an email to set their password.'
          : searchParams.ok === 'updated' ? 'Permissions saved.'
          : searchParams.ok === 'removed' ? 'User removed.'
          : null
        }
        err={searchParams.err ?? null}
      />

      <div className="admin-card">
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginBottom: 6, color: 'var(--navy)' }}>
          Invite a new staff member
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14 }}>
          They&apos;ll receive a Supabase email to set their password, then they can sign in at <code>/admin/login</code>.
          Pick a preset now — you can customise their exact permissions after they accept.
        </p>
        <form action={inviteAdmin}>
          <div className="admin-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" name="email" required maxLength={180}
                placeholder="receptionist@medcareclinic.ca" autoComplete="off" />
            </div>
            <div className="form-group">
              <label className="form-label">Starting permission set</label>
              <select className="form-input form-select" name="preset" defaultValue="receptionist">
                {(Object.keys(PRESETS) as Preset[]).map((k) => (
                  <option key={k} value={k}>{PRESET_LABEL[k]} — {PRESETS[k].description}</option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn btn-navy" type="submit">Send invite</button>
        </form>
      </div>

      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: 'var(--navy)',
        marginTop: 28, marginBottom: 14 }}>
        Current staff ({users.length})
      </h2>

      {users.map((u) => {
        const currentPreset = detectPreset(u.profile);
        const isMe = u.profile.id === me.id;
        return (
          <UserPermissionForm
            key={u.profile.id}
            id={u.profile.id}
            email={u.email}
            currentPreset={currentPreset}
            currentLabel={PRESET_LABEL[currentPreset]}
            isOwner={u.profile.is_owner}
            permissions={Array.from(u.profile.permissions)}
            isMe={isMe}
            createdAt={u.created_at}
            deleteAction={deleteAdmin}
          />
        );
      })}

      {users.length === 0 && (
        <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-3)' }}>
          No users yet. Use the invite form above to add your first staff member.
        </div>
      )}

      <details className="admin-card" style={{ marginTop: 28 }}>
        <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-serif)', fontSize: 16,
          fontWeight: 700, color: 'var(--navy)' }}>
          What each permission controls
        </summary>
        <div className="perm-help-grid" style={{ marginTop: 12 }}>
          {(Object.keys(RESOURCE_LABEL) as Array<keyof typeof RESOURCE_LABEL>).map((r) => (
            <div key={r} className="perm-help-item">
              <strong>{RESOURCE_LABEL[r]}</strong>
              <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-3)' }}>
                {(ALWAYS_ALLOWED as readonly string[]).includes(r as string)
                  ? '(always allowed)'
                  : r === 'users' ? '(owner only)' : ''}
              </span>
            </div>
          ))}
        </div>
      </details>
    </>
  );
}
