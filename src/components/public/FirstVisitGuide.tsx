import type { Clinic } from '@/lib/types';

export default function FirstVisitGuide({ clinic }: { clinic: Clinic }) {
  const items = [
    clinic.what_to_bring && { title: 'What to bring', body: clinic.what_to_bring, icon: '🪪' },
    clinic.walk_in_policy && { title: 'Walk-in policy', body: clinic.walk_in_policy, icon: '🚶' },
    clinic.parking_info && { title: 'Parking', body: clinic.parking_info, icon: '🅿️' },
    clinic.insurance_info && { title: 'Insurance & billing', body: clinic.insurance_info, icon: '💳' },
  ].filter(Boolean) as { title: string; body: string; icon: string }[];

  if (items.length === 0) return null;

  return (
    <section className="sec first-visit-sec" style={{ background: 'var(--white)' }}
      aria-labelledby="fv-title">
      <div className="sec-inner">
        <div className="sec-header">
          <div className="sec-label">Visiting Us</div>
          <div className="sec-title" id="fv-title">Your First Visit, Made Simple</div>
          <p className="sec-sub">
            Everything you need to know before walking in. No surprises, no friction.
          </p>
        </div>
        <div className="fv-grid">
          {items.map((it) => (
            <article key={it.title} className="fv-card">
              <div className="fv-ic" aria-hidden>{it.icon}</div>
              <h3>{it.title}</h3>
              <p>{it.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
