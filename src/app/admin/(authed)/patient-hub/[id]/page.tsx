import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import type { PatientHubArticle } from '@/lib/types';
import PatientHubForm from '../PatientHubForm';

export default async function EditPatientHubArticle({ params }: { params: { id: string } }) {
  await requireAdmin('patient_hub');
  const supabase = createClient();
  const { data } = await supabase.from('patient_hub').select('*').eq('id', params.id).maybeSingle();
  if (!data) notFound();
  const article = data as PatientHubArticle;
  return (
    <>
      <h1 className="admin-h1">Edit article</h1>
      <p className="admin-sub">{article.title}</p>
      <PatientHubForm article={article} />
    </>
  );
}
