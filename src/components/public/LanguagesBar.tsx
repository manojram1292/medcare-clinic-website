import type { Clinic } from '@/lib/types';

export default function LanguagesBar({ clinic }: { clinic: Clinic }) {
  if (!clinic.languages_supported || clinic.languages_supported.length === 0) return null;
  return (
    <div className="lang-bar" aria-label="Languages spoken at this clinic">
      <span className="lang-bar-label">We speak</span>
      <div className="lang-chips">
        {clinic.languages_supported.map((l) => <span key={l} className="lang-chip">{l}</span>)}
      </div>
    </div>
  );
}
