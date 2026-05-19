import { requireAdmin } from '@/lib/auth';
import DoctorForm from '../DoctorForm';

export default async function NewDoctorPage() {
  await requireAdmin('doctors');
  return (
    <>
      <h1 className="admin-h1">Add doctor</h1>
      <DoctorForm />
    </>
  );
}
