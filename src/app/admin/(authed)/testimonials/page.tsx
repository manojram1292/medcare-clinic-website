import { Flash } from '@/components/admin/Flash';
import DeleteButton from '@/components/admin/DeleteButton';
import { getTestimonials } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { deleteTestimonial, upsertTestimonial } from './actions';
import type { Testimonial } from '@/lib/types';

export default async function TestimonialsAdmin({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  await requireAdmin('testimonials');
  const items = await getTestimonials();
  return (
    <>
      <h1 className="admin-h1">Testimonials</h1>
      <p className="admin-sub">Quotes appear on the home page.</p>
      <Flash ok={searchParams.ok ? 'Saved.' : null} err={searchParams.err ?? null} />

      <div className="admin-card">
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginBottom: 12, color: 'var(--navy)' }}>
          Add new testimonial
        </h3>
        <TestimonialForm />
      </div>

      {items.map((t) => (
        <details key={t.id} className="admin-card">
          <summary style={{ cursor: 'pointer' }}>
            <strong style={{ color: 'var(--navy)' }}>{t.name}</strong> — {t.tag}
          </summary>
          <div style={{ marginTop: 14 }}>
            <TestimonialForm item={t} />
            <div style={{ marginTop: 10 }}>
              <DeleteButton action={deleteTestimonial} id={t.id}
                confirm={`Delete testimonial from ${t.name}?`} />
            </div>
          </div>
        </details>
      ))}
    </>
  );
}

function TestimonialForm({ item }: { item?: Testimonial }) {
  return (
    <form action={upsertTestimonial}>
      {item && <input type="hidden" name="id" value={item.id} />}
      <div className="form-group">
        <label className="form-label">Quote</label>
        <textarea className="form-input form-textarea" name="text" defaultValue={item?.text} maxLength={600} />
      </div>
      <div className="admin-row">
        <div className="form-group">
          <label className="form-label">Name</label>
          <input className="form-input" name="name" defaultValue={item?.name} />
        </div>
        <div className="form-group">
          <label className="form-label">Initials</label>
          <input className="form-input" name="initials" defaultValue={item?.initials} maxLength={4} />
        </div>
      </div>
      <div className="admin-row">
        <div className="form-group">
          <label className="form-label">Tag (e.g. &ldquo;Patient, 8 years&rdquo;)</label>
          <input className="form-input" name="tag" defaultValue={item?.tag} />
        </div>
        <div className="form-group">
          <label className="form-label">Rating (1–5)</label>
          <input className="form-input" name="rating" type="number" min={1} max={5}
            defaultValue={String(item?.rating ?? 5)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Sort order</label>
        <input className="form-input" name="sort" type="number" defaultValue={String(item?.sort ?? 0)} />
      </div>
      <button className="btn btn-navy" type="submit">{item ? 'Save changes' : 'Add testimonial'}</button>
    </form>
  );
}
