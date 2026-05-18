import { requireAdmin } from '@/lib/auth';
import PatientHubForm from '../PatientHubForm';

export default async function NewPatientHubArticle() {
  await requireAdmin('patient_hub');
  return (
    <>
      <h1 className="admin-h1">New Patient Hub article</h1>
      <p className="admin-sub">
        Health-information article for patients. Include 1–4 trusted external
        links so readers can dig deeper.
      </p>
      <PatientHubForm />
    </>
  );
}
