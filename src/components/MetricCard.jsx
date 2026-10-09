import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  ChartLine,
  CircleCheck,
  Cpu,
  Crosshair,
  Database,
  Gauge,
  Images,
  Microscope,
  Minus,
  Radar,
  Scale,
  ScanEye,
  Target,
  Timer,
  Zap,
} from 'lucide-react';
import { cn } from '../lib/utils.js';

/** Explicit map keeps the bundle tree-shakeable (a namespace import of
 *  `lucide-react` would pull in all ~1,600 icons). */
const ICON_MAP = {
  Boxes,
  ChartLine,
  CircleCheck,
  Cpu,
  Crosshair,
  Database,
  Gauge,
  Images,
  Microscope,
  Radar,
  Scale,
  ScanEye,
  Target,
  Timer,
  Zap,
};

const TONE_RING = {
  accent: 'text-accent bg-accent-soft border-[rgba(45,127,249,0.24)]',
  ok: 'text-ok bg-ok-soft border-[rgba(47,191,113,0.24)]',
  warn: 'text-warn bg-warn-soft border-[rgba(224,163,58,0.24)]',
  bad: 'text-bad bg-bad-soft border-[rgba(225,85,90,0.24)]',
  info: 'text-info bg-info-soft border-[rgba(43,182,196,0.24)]',
  alt: 'text-alt bg-alt-soft border-[rgba(139,123,232,0.24)]',
  muted: 'text-ink-muted bg-base-700 border-line',
};

const TREND_TONE = {
  up: 'text-ok',
  down: 'text-bad',
  flat: 'text-ink-muted',
};

export default function MetricCard({
  label,
  value,
  sub,
  icon: IconName,
  tone = 'accent',
  trend = null,
  progress = null,
  onClick,
  active = false,
  className,
}) {
  const Icon = ICON_MAP[IconName] ?? Gauge;
  const TrendIcon = trend?.dir === 'up' ? ArrowUpRight : trend?.dir === 'down' ? ArrowDownRight : Minus;
  const isInteractive = typeof onClick === 'function';

  const Wrapper = isInteractive ? 'button' : 'div';

  return (
    <Wrapper
      type={isInteractive ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'group flex min-w-0 flex-col rounded border border-line bg-base-800 p-3 text-left shadow-panel transition-colors',
        isInteractive && 'hover:border-line-strong hover:bg-base-750',
        active && 'border-accent/50 bg-accent-soft',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-2xs font-medium uppercase leading-tight tracking-[0.07em] text-ink-muted">
          {label}
        </p>
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border',
            TONE_RING[tone] ?? TONE_RING.muted,
          )}
        >
          <Icon className="h-3 w-3" strokeWidth={2} />
        </span>
      </div>

      <p className="tnum mt-1.5 truncate text-xl font-semibold leading-none tracking-tight text-ink">
        {value}
      </p>

      {(sub || trend) && (
        <div className="mt-1.5 flex items-center justify-between gap-2">
          {sub && <p className="truncate text-2xs leading-tight text-ink-muted">{sub}</p>}
          {trend && (
            <span
              className={cn(
                'tnum inline-flex shrink-0 items-center gap-0.5 text-2xs font-medium leading-none',
                TREND_TONE[trend.dir] ?? TREND_TONE.flat,
              )}
              title={trend.label}
            >
              <TrendIcon className="h-3 w-3" strokeWidth={2.2} />
              {trend.value}
            </span>
          )}
        </div>
      )}

      {typeof progress === 'number' && (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-base-700">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
      )}
    </Wrapper>
  );
}

export { MetricCard };
