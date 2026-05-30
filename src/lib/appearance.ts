// Curated appearance options. Named choices that map to safe, constrained
// values — never free-form CSS. Keep this list short and high-impact.

export type BrandSizeOption = { value: number; label: string };

export const BRAND_SIZE_OPTIONS: BrandSizeOption[] = [
  { value: 1.0,  label: 'Default' },
  { value: 1.15, label: 'Large' },
  { value: 1.3,  label: 'Extra large' },
  { value: 1.5,  label: 'Huge' },
];

export const BRAND_SCALE_MIN = 1.0;
export const BRAND_SCALE_MAX = 1.6;

export function clampBrandScale(n: number): number {
  if (!Number.isFinite(n)) return 1.0;
  return Math.min(BRAND_SCALE_MAX, Math.max(BRAND_SCALE_MIN, n));
}

// Nearest named option, for showing the current selection in the admin UI.
export function brandSizeLabel(scale: number): string {
  let best = BRAND_SIZE_OPTIONS[0];
  let bestDiff = Infinity;
  for (const opt of BRAND_SIZE_OPTIONS) {
    const d = Math.abs(opt.value - scale);
    if (d < bestDiff) { bestDiff = d; best = opt; }
  }
  return best.label;
}
