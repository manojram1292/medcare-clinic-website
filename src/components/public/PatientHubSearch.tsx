'use client';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function PatientHubSearch({ initialQuery = '' }: { initialQuery?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    router.push(trimmed ? `/patient-hub?q=${encodeURIComponent(trimmed)}` : '/patient-hub');
  }

  return (
    <form onSubmit={onSubmit} className="ph-search" role="search" aria-label="Search Patient Hub">
      <svg className="ph-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        name="q"
        autoComplete="off"
        placeholder="Search e.g. blood pressure, vaccines, blood test…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search patient information"
      />
      {q && (
        <button
          type="button"
          className="ph-search-clear"
          onClick={() => { setQ(''); router.push('/patient-hub'); }}
          aria-label="Clear search"
        >×</button>
      )}
      <button type="submit" className="ph-search-submit">Search</button>
    </form>
  );
}
