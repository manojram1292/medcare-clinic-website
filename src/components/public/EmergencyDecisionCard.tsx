export default function EmergencyDecisionCard() {
  const rows: Array<{ kind: 'er' | 'urgent' | 'us'; label: string; examples: string; cta: string }> = [
    {
      kind: 'er',
      label: 'Call 911 or go to the ER',
      examples: 'Chest pain, severe difficulty breathing, sudden weakness or confusion, heavy bleeding, suspected stroke or heart attack, severe head injury, severe allergic reaction.',
      cta: 'Life-threatening',
    },
    {
      kind: 'urgent',
      label: 'Go to an emergency department',
      examples: 'Broken bones, deep cuts, high fever in infants, severe dehydration, anything urgent after our hours.',
      cta: 'Urgent, after-hours',
    },
    {
      kind: 'us',
      label: 'Come see us during clinic hours',
      examples: 'Cold and flu, infections, prescription renewals, follow-ups, routine check-ups, mild aches and pains, mental wellness check-ins.',
      cta: 'Routine & ongoing care',
    },
  ];
  return (
    <section className="sec edc-sec" aria-labelledby="edc-title">
      <div className="sec-inner">
        <div className="sec-header">
          <div className="sec-label" style={{ color: '#DC2626' }}>Emergency or clinic?</div>
          <div className="sec-title" id="edc-title">Where to Go When It Matters</div>
          <p className="sec-sub">
            A quick guide so you never have to guess. If in doubt, err on the side of the emergency department.
          </p>
        </div>
        <div className="edc-grid">
          {rows.map((r) => (
            <article key={r.kind} className={`edc-card edc-${r.kind}`}>
              <div className="edc-tag">{r.cta}</div>
              <h3>{r.label}</h3>
              <p>{r.examples}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
