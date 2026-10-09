import { cn } from '../lib/utils.js';

/** Page title block. Keeps every page's header rhythm identical. */
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  description,
  icon: Icon,
  actions,
  meta = null,
  className,
}) {
  return (
    <header className={cn('mb-4 flex flex-col gap-2.5', className)}>
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <div className="flex min-w-0 items-start gap-2.5">
          {Icon && (
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-line bg-base-800 text-accent">
              <Icon className="h-4 w-4" strokeWidth={1.9} />
            </span>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[10px] font-semibold uppercase leading-none tracking-[0.12em] text-ink-faint">
                {eyebrow}
              </p>
            )}
            <h1 className="truncate text-base font-semibold leading-tight tracking-tight text-ink sm:text-lg">
              {title}
            </h1>
            {subtitle && <p className="mt-1 text-[12.5px] leading-snug text-ink-soft">{subtitle}</p>}
            {description && (
              <p className="mt-1 max-w-3xl text-[11.5px] leading-relaxed text-ink-muted">{description}</p>
            )}
          </div>
        </div>

        {actions && <div className="flex shrink-0 flex-wrap items-center gap-1.5">{actions}</div>}
      </div>

      {meta && <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">{meta}</div>}
    </header>
  );
}

export function MetaItem({ icon: Icon, label, value, tone = 'muted' }) {
  const toneCls = {
    muted: 'text-ink-muted',
    ok: 'text-ok',
    warn: 'text-warn',
    bad: 'text-bad',
    accent: 'text-accent',
    info: 'text-info',
  }[tone];

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] leading-none">
      {Icon && <Icon className={cn('h-3 w-3', toneCls)} strokeWidth={2} />}
      <span className="text-ink-faint">{label}</span>
      <span className={cn('font-medium tnum', toneCls)}>{value}</span>
    </span>
  );
}
