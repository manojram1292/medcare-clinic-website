'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/admin/login/actions';
import { CrossIcon } from '@/components/public/Icons';
import type { Resource } from '@/lib/permissions';

type Item = { href: string; label: string; icon: string; resource: Resource };

const ALL_ITEMS: Item[] = [
  { href: '/admin',                 label: 'Dashboard',     icon: '📊', resource: 'dashboard' },
  { href: '/admin/clinic',          label: 'Clinic Info',   icon: '🏥', resource: 'clinic' },
  { href: '/admin/hours',           label: 'Hours',         icon: '🕒', resource: 'hours' },
  { href: '/admin/doctors',         label: 'Doctors',       icon: '👩‍⚕️', resource: 'doctors' },
  { href: '/admin/services',        label: 'Services',      icon: '🩺', resource: 'services' },
  { href: '/admin/faqs',            label: 'FAQs',          icon: '❓', resource: 'faqs' },
  { href: '/admin/patient-hub',     label: 'Patient Hub',   icon: '📚', resource: 'patient_hub' },
  { href: '/admin/blog',            label: 'Blog',          icon: '✍️', resource: 'blog' },
  { href: '/admin/announcements',   label: 'Banner',        icon: '📣', resource: 'announcements' },
  { href: '/admin/popups',          label: 'Popup Alert',   icon: '⚠️', resource: 'popups' },
  { href: '/admin/testimonials',    label: 'Testimonials',  icon: '💬', resource: 'testimonials' },
  { href: '/admin/users',           label: 'Users',         icon: '👥', resource: 'users' },
  { href: '/admin/account',         label: 'My account',    icon: '🔐', resource: 'account' },
];

export default function AdminNav({
  roleLabel, email, allowed,
}: {
  roleLabel: string;
  email: string | null;
  allowed: Resource[];
}) {
  const path = usePathname();
  const items = ALL_ITEMS.filter((it) => allowed.includes(it.resource));
  return (
    <aside className="admin-side">
      <div className="admin-brand">
        <div className="admin-brand-mark"><CrossIcon /></div>
        <div>
          <div className="admin-brand-name">Admin</div>
          <div className="admin-brand-sub">{roleLabel}</div>
        </div>
      </div>
      <nav className="admin-nav">
        {items.map((it) => {
          const active = it.href === '/admin' ? path === '/admin' : path.startsWith(it.href);
          return (
            <Link key={it.href} href={it.href} className={active ? 'active' : ''}>
              <span style={{ width: 18, textAlign: 'center' }}>{it.icon}</span>{it.label}
            </Link>
          );
        })}
      </nav>
      <div style={{ marginTop: 28, padding: '0 4px' }}>
        {email && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', textAlign: 'center',
            marginBottom: 10, wordBreak: 'break-all' }}>
            {email}
          </div>
        )}
        <form action={logoutAction}>
          <button type="submit" className="btn btn-outline" style={{
            width: '100%', justifyContent: 'center',
            background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.7)',
            border: '1px solid rgba(255,255,255,.1)',
          }}>Sign out</button>
        </form>
        <Link href="/" target="_blank"
          style={{ display: 'block', textAlign: 'center', marginTop: 12,
            color: 'rgba(255,255,255,.4)', fontSize: 12, textDecoration: 'none' }}>
          View public site ↗
        </Link>
      </div>
    </aside>
  );
}
