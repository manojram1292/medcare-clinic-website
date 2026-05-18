import { Flash } from '@/components/admin/Flash';
import { requireAdmin } from '@/lib/auth';
import { ROLE_LABEL } from '@/lib/permissions';
import { changePassword } from './actions';

export default async function AccountPage({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  const user = await requireAdmin('account');
  return (
    <>
      <h1 className="admin-h1">My account</h1>
      <p className="admin-sub">Signed in as <strong>{user.email}</strong>. Your role is{' '}
        <span className={`role-badge role-${user.role}`}>{ROLE_LABEL[user.role]}</span>.
      </p>
      <Flash ok={searchParams.ok ? 'Password updated.' : null} err={searchParams.err ?? null} />

      <div className="admin-card">
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginBottom: 6, color: 'var(--navy)' }}>
          Change password
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14 }}>
          Choose a new password (at least 10 characters). Use a password manager
          and don&apos;t reuse it elsewhere.
        </p>
        <form action={changePassword}>
          <div className="form-group">
            <label className="form-label">New password</label>
            <input className="form-input" name="password" type="password" required
              autoComplete="new-password" minLength={10} maxLength={120} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm new password</label>
            <input className="form-input" name="confirm" type="password" required
              autoComplete="new-password" minLength={10} maxLength={120} />
          </div>
          <button className="btn btn-navy btn-lg" type="submit">Update password</button>
        </form>
      </div>

      <div className="admin-card">
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, marginBottom: 6, color: 'var(--navy)' }}>
          Why this matters
        </h3>
        <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.7 }}>
          The admin password protects every editable field on the public site. If
          you ever suspect it&apos;s been seen by someone else (shared screen, screenshot
          in chat, post-it on a desk), rotate it here. Sign-in attempts are
          rate-limited by Supabase.
        </p>
      </div>
    </>
  );
}
