import { notFound } from 'next/navigation';
import { getDoctors } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import DoctorForm from '../DoctorForm';

export default async function EditDoctorPage({ params }: { params: { id: string } }) {
  await requireAdmin('doctors');
  const doctors = await getDoctors();
  const doc = doctors.find((d) => d.id === params.id);
  if (!doc) notFound();
  return (
    <>
      <h1 className="admin-h1">Edit doctor</h1>
      <DoctorForm doctor={doc} />
    </>
  );
}
