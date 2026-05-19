'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

// Curated set of healthcare-relevant emojis. Keyword-searchable.
const EMOJIS: Array<{ char: string; keywords: string[] }> = [
  { char: '🏥', keywords: ['hospital', 'clinic', 'building', 'medical'] },
  { char: '🩺', keywords: ['stethoscope', 'doctor', 'consult', 'exam'] },
  { char: '🦴', keywords: ['bone', 'physio', 'physiotherapy', 'orthopedic', 'rehab'] },
  { char: '💉', keywords: ['syringe', 'vaccine', 'injection', 'shot', 'immunisation'] },
  { char: '💊', keywords: ['pill', 'medication', 'prescription', 'drug'] },
  { char: '🩹', keywords: ['bandage', 'plaster', 'first aid', 'wound'] },
  { char: '🩻', keywords: ['xray', 'x-ray', 'radiology', 'imaging'] },
  { char: '🫀', keywords: ['heart', 'cardio', 'cardiology', 'cardiovascular'] },
  { char: '🫁', keywords: ['lungs', 'respiratory', 'breathing', 'asthma'] },
  { char: '🧠', keywords: ['brain', 'neurology', 'mental', 'memory'] },
  { char: '🦷', keywords: ['tooth', 'dental', 'dentist'] },
  { char: '👁️', keywords: ['eye', 'vision', 'ophthalmology', 'sight'] },
  { char: '👂', keywords: ['ear', 'hearing', 'audiology', 'ent'] },
  { char: '🦠', keywords: ['microbe', 'virus', 'bacteria', 'infection'] },
  { char: '🧬', keywords: ['dna', 'genetics', 'lab', 'genome'] },
  { char: '🧪', keywords: ['test tube', 'lab', 'bloodwork', 'sample'] },
  { char: '🧫', keywords: ['petri', 'culture', 'lab'] },
  { char: '🩸', keywords: ['blood', 'donation', 'sample', 'phlebotomy'] },
  { char: '🛡️', keywords: ['shield', 'prevent', 'preventive', 'protect', 'wellness'] },
  { char: '❤️', keywords: ['heart', 'love', 'care', 'kindness'] },
  { char: '🌿', keywords: ['herb', 'natural', 'wellness', 'health'] },
  { char: '🧘', keywords: ['yoga', 'meditation', 'wellness', 'mental', 'stress'] },
  { char: '🤰', keywords: ['pregnant', 'pregnancy', 'maternity', 'obstetrics'] },
  { char: '🧒', keywords: ['child', 'children', 'paediatrics', 'pediatrics', 'kids'] },
  { char: '👶', keywords: ['baby', 'infant', 'newborn', 'paediatrics'] },
  { char: '👵', keywords: ['elderly', 'senior', 'geriatrics', 'aging'] },
  { char: '👨‍⚕️', keywords: ['doctor', 'physician', 'male doctor'] },
  { char: '👩‍⚕️', keywords: ['doctor', 'physician', 'female doctor', 'nurse'] },
  { char: '📋', keywords: ['clipboard', 'chart', 'records', 'follow up', 'notes'] },
  { char: '📊', keywords: ['stats', 'assessment', 'analytics', 'results', 'report'] },
  { char: '📅', keywords: ['calendar', 'schedule', 'appointment', 'booking'] },
  { char: '⏰', keywords: ['clock', 'time', 'hours', 'wait', 'urgent'] },
  { char: '🔬', keywords: ['microscope', 'lab', 'research', 'pathology'] },
  { char: '🚑', keywords: ['ambulance', 'emergency', 'urgent'] },
  { char: '🌡️', keywords: ['thermometer', 'temperature', 'fever'] },
  { char: '⚕️', keywords: ['medical', 'medicine', 'staff', 'caduceus'] },
];

type Props = {
  name: string;
  defaultValue?: string;
  maxLength?: number;
};

export default function EmojiPicker({ name, defaultValue = '', maxLength = 4 }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return EMOJIS;
    return EMOJIS.filter((e) =>
      e.char === f || e.keywords.some((k) => k.includes(f)),
    );
  }, [filter]);

  return (
    <div className="emoji-picker" ref={containerRef}>
      <div className="emoji-picker-row">
        <input
          className="form-input emoji-picker-input"
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={maxLength}
          aria-label="Icon emoji"
          autoComplete="off"
          spellCheck={false}
        />
        <button type="button" className="btn btn-outline emoji-picker-toggle"
          onClick={() => setOpen((o) => !o)} aria-haspopup="grid" aria-expanded={open}>
          {open ? 'Close picker' : 'Pick an icon'}
        </button>
      </div>

      {open && (
        <div className="emoji-picker-pop" role="dialog" aria-label="Choose an emoji">
          <input
            className="form-input emoji-picker-search"
            type="search"
            placeholder="Search: heart, bone, blood, baby…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            autoFocus
          />
          <div className="emoji-picker-grid" role="grid">
            {filtered.map((e) => (
              <button
                key={e.char}
                type="button"
                className={`emoji-cell ${e.char === value ? 'selected' : ''}`}
                title={e.keywords[0]}
                aria-label={e.keywords[0]}
                onClick={() => { setValue(e.char); setOpen(false); }}
              >
                <span aria-hidden>{e.char}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="emoji-picker-empty">
                No match for &ldquo;{filter}&rdquo;. Type any emoji directly into the field above.
              </div>
            )}
          </div>
          <div className="emoji-picker-hint">
            Tip: you can also paste any emoji into the field above — these are just suggestions.
          </div>
        </div>
      )}
    </div>
  );
}
