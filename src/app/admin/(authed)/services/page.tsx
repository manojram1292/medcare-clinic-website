import { Flash } from '@/components/admin/Flash';
import DeleteButton from '@/components/admin/DeleteButton';
import { getServices } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { deleteService, upsertService } from './actions';

export default async function ServicesAdmin({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  await requireAdmin('services');
  const services = await getServices();
  return (
    <>
      <h1 className="admin-h1">Services</h1>
      <p className="admin-sub">Edit existing services or add a new one. Tags are comma-separated.</p>
      <Flash ok={searchParams.ok ? 'Saved.' : null} err={searchParams.err ?? null} />

      <div className="admin-card">
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginBottom: 12, color: 'var(--navy)' }}>
          Add new service
        </h3>
        <ServiceForm />
      </div>

      {services.map((s) => (
        <details key={s.id} className="admin-card">
          <summary style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <strong style={{ flex: 1, color: 'var(--navy)' }}>{s.name}</strong>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>sort {s.sort}</span>
          </summary>
          <div style={{ marginTop: 14 }}>
            <ServiceForm service={s} />
            <div style={{ marginTop: 10 }}>
              <DeleteButton action={deleteService} id={s.id} confirm={`Delete service "${s.name}"?`} />
            </div>
          </div>
        </details>
      ))}
      {services.length === 0 && (
        <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-3)' }}>No services yet.</div>
      )}
    </>
  );
}

type ServiceLike = {
  id: string; name: string; description: string; icon: string;
  color: string; tags: string[]; sort: number;
};

function ServiceForm({ service }: { service?: ServiceLike }) {
  return (
    <form action={upsertService}>
      {service && <input type="hidden" name="id" value={service.id} />}
      <div className="admin-row">
        <div className="form-group">
          <label className="form-label">Name</label>
          <input className="form-input" name="name" defaultValue={service?.name} required />
        </div>
        <div className="form-group">
          <label className="form-label">Icon (emoji)</label>
          <input className="form-input" name="icon" defaultValue={service?.icon ?? '🏥'} maxLength={4} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-input form-textarea" name="description"
          defaultValue={service?.description} maxLength={400} />
      </div>
      <div className="admin-row">
        <div className="form-group">
          <label className="form-label">Colour</label>
          <select className="form-input form-select" name="color" defaultValue={service?.color ?? 'ic-teal'}>
            <option value="ic-teal">Amber (ic-teal)</option>
            <option value="ic-navy">Cool blue (ic-navy)</option>
            <option value="ic-green">Sage (ic-green)</option>
            <option value="ic-amber">Pale amber (ic-amber)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Sort order</label>
          <input className="form-input" name="sort" type="number" defaultValue={String(service?.sort ?? 0)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Tags (comma-separated)</label>
        <input className="form-input" name="tags" defaultValue={service?.tags?.join(', ') ?? ''} />
      </div>
      <button className="btn btn-navy" type="submit">{service ? 'Save changes' : 'Add service'}</button>
    </form>
  );
}
