'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/admin/login/actions';
import { CrossIcon } from '@/components/public/Icons';

const items = [
  { href: '/admin',                 label: 'Dashboard',     icon: '📊' },
  { href: '/admin/clinic',          label: 'Clinic Info',   icon: '🏥' },
  { href: '/admin/hours',           label: 'Hours',         icon: '🕒' },
  { href: '/admin/doctors',         label: 'Doctors',       icon: '👩‍⚕️' },
  { href: '/admin/services',        label: 'Services',      icon: '🩺' },
  { href: '/admin/faqs',            label: 'FAQs',          icon: '❓' },
  { href: '/admin/blog',            label: 'Blog',          icon: '✍️' },
  { href: '/admin/announcements',   label: 'Banner',        icon: '📣' },
  { href: '/admin/popups',          label: 'Popup Alert',   icon: '⚠️' },
  { href: '/admin/testimonials',    label: 'Testimonials',  icon: '💬' },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <aside className="admin-side">
      <div className="admin-brand">
        <div className="admin-brand-mark"><CrossIcon /></div>
        <div>
          <div className="admin-brand-name">Admin</div>
          <div className="admin-brand-sub">Control panel</div>
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
