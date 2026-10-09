/** Tiny class-name joiner — avoids pulling in clsx for a handful of call sites. */
export function cn(...parts) {
  return parts
    .flat(Infinity)
    .filter((p) => typeof p === 'string' && p.length > 0)
    .join(' ');
}

/** Clamp a number into a range. */
export const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/** Format a 0..1 confidence as a percentage string. */
export const pct = (v, digits = 1) => `${(v * 100).toFixed(digits)}%`;

/** Format a 0..1 ratio as a 0..100 number string. */
export const score = (v, digits = 1) => (v * 100).toFixed(digits);

/** Compact number formatting: 14289 -> "14,289". */
export const num = (v) => Number(v).toLocaleString('en-US');

/** 12400000 -> "12.4M" */
export const compact = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
};
