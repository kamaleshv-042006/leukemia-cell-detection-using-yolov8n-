import { cn } from '../lib/utils.js';

const TONES = {
  ok: 'text-ok',
  warn: 'text-warn',
  bad: 'text-bad',
  info: 'text-info',
  alt: 'text-alt',
  accent: 'text-accent',
  muted: 'text-ink-muted',
};

const BAR_TONES = {
  ok: 'bg-ok',
  warn: 'bg-warn',
  bad: 'bg-bad',
  info: 'bg-info',
  alt: 'bg-alt',
  accent: 'bg-accent',
  muted: 'bg-ink-faint',
};

const SIZES = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
};

export default function ProgressBar({
  value,
  max = 1,
  tone = 'accent',
  size = 'sm',
  label,
  valueLabel,
  showValue = false,
  marker = null,
  className,
  trackClassName,
}) {
  const pct = Math.min(100, Math.max(0, (Number(value) / (max || 1)) * 100));

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          {label && <span className="truncate text-xs text-ink-soft">{label}</span>}
          {showValue && (
            <span className={cn('tnum shrink-0 text-xs font-medium', TONES[tone] ?? TONES.accent)}>
              {valueLabel ?? pct.toFixed(0)}
            </span>
          )}
        </div>
      )}
      <div
        className={cn('relative w-full overflow-hidden rounded-full bg-base-700', SIZES[size] ?? SIZES.sm, trackClassName)}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'progress'}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-500 ease-out', BAR_TONES[tone] ?? BAR_TONES.accent)}
          style={{ width: `${pct}%` }}
        />
        {marker !== null && marker !== undefined && (
          <div
            className="absolute top-0 h-full w-px bg-ink/45"
            style={{ left: `${Math.min(100, Math.max(0, (marker / (max || 1)) * 100))}%` }}
            title="Target"
          />
        )}
      </div>
    </div>
  );
}
