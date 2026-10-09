import { cn } from '../lib/utils.js';

const TONES = {
  ok: { stroke: '#2FBF71', text: 'text-ok', glow: 'rgba(47,191,113,0.18)' },
  warn: { stroke: '#E0A33A', text: 'text-warn', glow: 'rgba(224,163,58,0.18)' },
  bad: { stroke: '#E1555A', text: 'text-bad', glow: 'rgba(225,85,90,0.18)' },
  accent: { stroke: '#2D7FF9', text: 'text-accent', glow: 'rgba(45,127,249,0.18)' },
  info: { stroke: '#2BB6C4', text: 'text-info', glow: 'rgba(43,182,196,0.18)' },
};

/**
 * Circular quality gauge.
 * Renders an SVG arc; `value` is 0..100.
 */
export default function QualityGauge({
  value = 0,
  max = 100,
  size = 168,
  thickness = 10,
  tone = 'accent',
  label = 'Overall Quality Score',
  sublabel,
  display,
  ticks = [0, 25, 50, 75, 100],
  className,
}) {
  const palette = TONES[tone] ?? TONES.accent;
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const ratio = Math.min(1, Math.max(0, value / max));
  const dash = circumference * 0.75; // 270° arc
  const offset = dash * (1 - ratio);

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-[225deg]">
          <defs>
            <filter id="aq-gauge-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* track */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#1B222A"
            strokeWidth={thickness}
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
          />
          {/* value */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={palette.stroke}
            strokeWidth={thickness}
            strokeDasharray={`${dash} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)',
              filter: 'drop-shadow(0 0 6px rgba(45,127,249,0.25))',
            }}
          />
          {/* ticks */}
          {ticks.map((t) => {
            const angle = (t / max) * 270 - 135 + 90;
            const rad = (angle * Math.PI) / 180;
            const inner = r - thickness / 2 - 5;
            const outer = r - thickness / 2 - 1;
            return (
              <line
                key={t}
                x1={cx + Math.cos(rad) * inner}
                y1={cy + Math.sin(rad) * inner}
                x2={cx + Math.cos(rad) * outer}
                y2={cy + Math.sin(rad) * outer}
                stroke="#2A333D"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn('tnum text-[30px] font-semibold leading-none tracking-tight', palette.text)}
            style={{ textShadow: `0 0 18px ${palette.glow}` }}
          >
            {display ?? value.toFixed(1)}
          </span>
          {max !== 100 && <span className="mt-1 text-2xs text-ink-muted">/ {max}</span>}
        </div>
      </div>

      {label && <p className="mt-3 text-xs font-medium text-ink-soft">{label}</p>}
      {sublabel && <p className="mt-0.5 text-2xs text-ink-muted">{sublabel}</p>}
    </div>
  );
}
