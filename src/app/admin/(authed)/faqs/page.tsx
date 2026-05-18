import { Flash } from '@/components/admin/Flash';
import DeleteButton from '@/components/admin/DeleteButton';
import { getFaqs } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { deleteFaq, upsertFaq } from './actions';
import type { Faq } from '@/lib/types';

export default async function FaqsAdmin({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  await requireAdmin('faqs');
  const items = await getFaqs();
  return (
    <>
      <h1 className="admin-h1">Frequently Asked Questions</h1>
      <p className="admin-sub">
        Patients see these on the home page (top 6) and the contact page (all). Group with categories
        like <em>Visiting</em>, <em>Billing</em>, <em>Care</em>, <em>Emergency</em>.
      </p>
      <Flash ok={searchParams.ok ? 'Saved.' : null} err={searchParams.err ?? null} />

      <div className="admin-card">
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginBottom: 12, color: 'var(--navy)' }}>
          Add new FAQ
        </h3>
        <FaqForm />
      </div>

      {items.map((f) => (
        <details key={f.id} className="admin-card">
          <summary style={{ cursor: 'pointer' }}>
            <strong style={{ color: 'var(--navy)' }}>{f.question}</strong>
            <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-3)' }}>
              {f.category} · sort {f.sort}{f.active ? '' : ' · inactive'}
            </span>
          </summary>
          <div style={{ marginTop: 14 }}>
            <FaqForm item={f} />
            <div style={{ marginTop: 10 }}>
              <DeleteButton action={deleteFaq} id={f.id}
                confirm={`Delete FAQ "${f.question}"?`} />
            </div>
          </div>
        </details>
      ))}
      {items.length === 0 && (
        <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-3)' }}>No FAQs yet.</div>
      )}
    </>
  );
}

function FaqForm({ item }: { item?: Faq }) {
  return (
    <form action={upsertFaq}>
      {item && <input type="hidden" name="id" value={item.id} />}
      <div className="form-group">
        <label className="form-label">Question</label>
        <input className="form-input" name="question" defaultValue={item?.question} required maxLength={300} />
      </div>
      <div className="form-group">
        <label className="form-label">Answer</label>
        <textarea className="form-input form-textarea" name="answer"
          defaultValue={item?.answer} maxLength={1500} required style={{ minHeight: 110 }} />
      </div>
      <div className="admin-row">
        <div className="form-group">
          <label className="form-label">Category</label>
          <input className="form-input" name="category" defaultValue={item?.category ?? 'General'} list="faq-cats" />
          <datalist id="faq-cats">
            <option value="Visiting" />
            <option value="Billing" />
            <option value="Care" />
            <option value="Emergency" />
            <option value="General" />
          </datalist>
        </div>
        <div className="form-group">
          <label className="form-label">Sort order (lower first)</label>
          <input className="form-input" name="sort" type="number" defaultValue={String(item?.sort ?? 0)} />
        </div>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, marginBottom: 14 }}>
        <input type="checkbox" name="active" defaultChecked={item?.active ?? true} /> Visible to patients
      </label>
      <button className="btn btn-navy" type="submit">{item ? 'Save changes' : 'Add FAQ'}</button>
    </form>
  );
}
