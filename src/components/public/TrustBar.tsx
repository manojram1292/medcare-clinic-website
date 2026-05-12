export default function TrustBar() {
  const items = [
    'Board-Certified Family Physicians', 'Physiotherapy On-Site', 'Walk-ins Always Welcome',
    'Trusted Community Clinic', 'Compassionate Patient-First Care', 'Family Medicine for All Ages',
    'Chronic Disease Management', 'Preventive Health & Wellness', 'Same Family, Same Doctor',
  ];
  const doubled = [...items, ...items];
  return (
    <div className="trust-bar" aria-hidden>
      <div className="trust-track">
        {doubled.map((t, i) => (
          <div key={i} className="trust-item-m">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal-light)" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <strong>{t}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
