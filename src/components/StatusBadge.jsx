import { cn } from '../lib/utils.js';

const TONES = {
  ok: 'bg-ok-soft text-ok border-[rgba(47,191,113,0.3)]',
  warn: 'bg-warn-soft text-warn border-[rgba(224,163,58,0.3)]',
  bad: 'bg-bad-soft text-bad border-[rgba(225,85,90,0.3)]',
  info: 'bg-info-soft text-info border-[rgba(43,182,196,0.3)]',
  alt: 'bg-alt-soft text-alt border-[rgba(139,123,232,0.3)]',
  accent: 'bg-accent-soft text-accent border-[rgba(45,127,249,0.32)]',
  muted: 'bg-base-700 text-ink-soft border-line',
};

const DOTS = {
  ok: 'bg-ok',
  warn: 'bg-warn',
  bad: 'bg-bad',
  info: 'bg-info',
  alt: 'bg-alt',
  accent: 'bg-accent',
  muted: 'bg-ink-faint',
};

const SIZES = {
  sm: 'h-[18px] px-1.5 text-2xs gap-1',
  md: 'h-[22px] px-2 text-xs gap-1.5',
};

/**
 * Compact status pill. `dot` renders the status indicator used across the
 * system-health panels; `label` is omitted when the caller renders its own
 * children.
 */
export default function StatusBadge({
  children,
  tone = 'muted',
  size = 'md',
  dot = false,
  pulse = false,
  uppercase = true,
  className,
  icon: Icon,
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border font-medium leading-none',
        uppercase && 'tracking-[0.04em]',
        TONES[tone] ?? TONES.muted,
        SIZES[size] ?? SIZES.md,
        className,
      )}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {pulse && (
            <span
              className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', DOTS[tone])}
            />
          )}
          <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', DOTS[tone])} />
        </span>
      )}
      {Icon && <Icon className="h-3 w-3 shrink-0" strokeWidth={2.2} />}
      {children}
    </span>
  );
}
