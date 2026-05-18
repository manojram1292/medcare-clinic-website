import Link from 'next/link';
import Image from 'next/image';
import { Flash } from '@/components/admin/Flash';
import DeleteButton from '@/components/admin/DeleteButton';
import { getDoctors } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { deleteDoctor } from './actions';

export default async function DoctorsAdmin({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  await requireAdmin('doctors');
  const doctors = await getDoctors();
  return (
    <>
      <h1 className="admin-h1">Doctors</h1>
      <p className="admin-sub">Add, edit, and reorder physicians. Photos go in the Supabase &ldquo;media&rdquo; bucket automatically.</p>
      <Flash ok={searchParams.ok ? 'Saved.' : null} err={searchParams.err ?? null} />

      <div className="admin-toolbar">
        <Link href="/admin/doctors/new" className="btn btn-teal">+ Add doctor</Link>
        <span className="spacer" />
        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{doctors.length} total</span>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        {doctors.map((d) => (
          <div key={d.id} className="admin-list-item">
            <div className="admin-thumb">
              {d.photo_url
                ? <Image src={d.photo_url} alt={d.name} width={48} height={48} style={{ objectFit: 'cover' }} />
                : <span>{d.initials}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{d.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
                {d.specialty} · {d.status} · sort {d.sort}
              </div>
            </div>
            <Link href={`/admin/doctors/${d.id}`} className="btn btn-outline">Edit</Link>
            <DeleteButton action={deleteDoctor} id={d.id} confirm={`Delete ${d.name}?`} />
          </div>
        ))}
        {doctors.length === 0 && (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-3)' }}>No doctors yet.</div>
        )}
      </div>
    </>
  );
}
