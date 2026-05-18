import AdminNav from '@/components/admin/AdminNav';
import { requireAdmin } from '@/lib/auth';
import { visibleResourcesFor } from '@/lib/permissions';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminAuthedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const allowed = visibleResourcesFor(user.role);
  return (
    <div className="admin-shell">
      <AdminNav role={user.role} email={user.email ?? null} allowed={allowed} />
      <div className="admin-main">{children}</div>
    </div>
  );
}
