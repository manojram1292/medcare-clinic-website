import AdminNav from '@/components/admin/AdminNav';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminAuthedLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="admin-shell">
      <AdminNav />
      <div className="admin-main">{children}</div>
    </div>
  );
}
