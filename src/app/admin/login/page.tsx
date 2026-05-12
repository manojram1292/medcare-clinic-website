import Link from 'next/link';
import { loginAction } from './actions';

export const metadata = { title: 'Sign in', robots: { index: false, follow: false } };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; email?: string };
}) {
  const err = searchParams?.error;
  const email = searchParams?.email ?? '';
  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>Staff sign in</h1>
        <p>Use the email and password set up in your Supabase admin user.</p>
        {err && (
          <div className="admin-flash err" role="alert">
            {err === 'not-configured'
              ? 'Supabase is not connected yet. Follow DEPLOYMENT.md steps 1–2 (create Supabase project, run schema.sql + seed.sql, paste env vars into app/.env.local, restart npm run dev).'
              : err === 'not-admin'
              ? 'Signed in, but this account is not an admin. In Supabase SQL editor run: insert into admins (id) values (\'<your-user-uuid>\');'
              : err === 'missing'
              ? 'Email and password required.'
              : `Sign-in failed: ${err}`}
          </div>
        )}
        <form action={loginAction}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              name="email"
              type="email"
              required
              autoFocus={!email}
              autoComplete="email"
              defaultValue={email}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              name="password"
              type="password"
              required
              autoFocus={!!email}
              autoComplete="current-password"
            />
          </div>
          <button className="btn btn-navy btn-lg" type="submit" style={{ width: '100%' }}>
            Sign in
          </button>
        </form>
        <div style={{ marginTop: 18, fontSize: 13, textAlign: 'center' }}>
          <Link href="/" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>← Back to website</Link>
        </div>
      </div>
    </div>
  );
}
