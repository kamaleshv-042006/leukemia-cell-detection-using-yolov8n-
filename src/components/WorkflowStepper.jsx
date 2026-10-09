import { Check, ChevronDown, CircleDot, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils.js';

const TONES = {
  accent: 'border-accent bg-accent-soft text-accent',
  ok: 'border-[rgba(47,191,113,0.4)] bg-ok-soft text-ok',
  warn: 'border-[rgba(224,163,58,0.4)] bg-warn-soft text-warn',
  bad: 'border-[rgba(225,85,90,0.4)] bg-bad-soft text-bad',
  info: 'border-[rgba(43,182,196,0.4)] bg-info-soft text-info',
  alt: 'border-[rgba(139,123,232,0.4)] bg-alt-soft text-alt',
  muted: 'border-line bg-base-800 text-ink-muted',
};

const STATUS_ICON = {
  done: Check,
  active: CircleDot,
  pending: null,
  running: Loader2,
};

/**
 * Horizontal pipeline stepper.
 * steps: [{ id, label, detail?, status: 'done'|'active'|'pending'|'running', tone? }]
 */
export default function WorkflowStepper({ steps, className, dense = false }) {
  return (
    <ol className={cn('flex flex-wrap items-stretch gap-1.5', className)}>
      {steps.map((step, i) => {
        const Icon = STATUS_ICON[step.status];
        const isLast = i === steps.length - 1;
        return (
          <li key={step.id} className="flex min-w-0 flex-1 basis-[150px] items-stretch gap-1.5">
            <div
              className={cn(
                'flex min-w-0 flex-1 flex-col justify-center rounded border px-2.5 transition-colors',
                dense ? 'py-1.5' : 'py-2',
                step.status === 'pending'
                  ? 'border-line-soft bg-base-850 text-ink-faint'
                  : TONES[step.tone ?? 'accent'],
              )}
            >
              <div className="flex items-center gap-1.5">
                {Icon ? (
                  <Icon
                    className={cn('h-3 w-3 shrink-0', step.status === 'running' && 'animate-spin')}
                    strokeWidth={2.4}
                  />
                ) : (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" />
                )}
                <span className="truncate text-2xs font-semibold uppercase tracking-[0.06em]">
                  {step.label}
                </span>
                <span className="tnum ml-auto text-[10px] opacity-60">{i + 1}</span>
              </div>
              {step.detail && !dense && (
                <p className="mt-0.5 truncate text-[10px] opacity-70">{step.detail}</p>
              )}
            </div>
            {!isLast && (
              <span className="flex items-center" aria-hidden="true">
                <ChevronDown className="h-3 w-3 -rotate-90 text-ink-faint" />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Vertical variant used inside narrow panels. */
export function VerticalStepper({ steps, className }) {
  return (
    <ol className={cn('relative space-y-0', className)}>
      {steps.map((step, i) => {
        const Icon = STATUS_ICON[step.status];
        const isLast = i === steps.length - 1;
        return (
          <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
            {!isLast && <span className="absolute left-[11px] top-6 h-full w-px bg-line" />}
            <span
              className={cn(
                'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border',
                step.status === 'pending' ? 'border-line bg-base-800 text-ink-faint' : TONES[step.tone ?? 'accent'],
              )}
            >
              {Icon ? (
                <Icon className={cn('h-3 w-3', step.status === 'running' && 'animate-spin')} strokeWidth={2.4} />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-40" />
              )}
            </span>
            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  'truncate text-xs font-medium',
                  step.status === 'pending' ? 'text-ink-faint' : 'text-ink-soft',
                )}
              >
                {step.label}
              </p>
              {step.detail && <p className="mt-0.5 text-2xs leading-relaxed text-ink-muted">{step.detail}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
