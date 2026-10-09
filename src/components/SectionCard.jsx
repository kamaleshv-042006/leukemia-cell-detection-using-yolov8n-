import { cn } from '../lib/utils.js';

/**
 * Standard panel container. Everything on the dashboard sits inside one of
 * these so borders, radii and padding stay identical across pages.
 */
export default function SectionCard({
  title,
  subtitle,
  description,
  icon: Icon,
  actions,
  footer,
  children,
  className,
  bodyClassName,
  padded = true,
  dense = false,
}) {
  return (
    <section
      className={cn(
        'flex min-w-0 flex-col rounded border border-line bg-base-800 shadow-panel',
        className,
      )}
    >
      {(title || actions) && (
        <header
          className={cn(
            'flex flex-wrap items-center justify-between gap-2 border-b border-line-soft',
            dense ? 'px-2.5 py-1.5' : 'px-3 py-2',
          )}
        >
          <div className="flex min-w-0 items-start gap-2">
            {Icon && (
              <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-line-soft bg-base-750 text-ink-muted">
                <Icon className="h-3 w-3" strokeWidth={2} />
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h2 className="truncate text-[12.5px] font-semibold leading-tight text-ink">{title}</h2>
              )}
              {subtitle && <p className="mt-0.5 truncate text-[11.5px] leading-tight text-ink-muted">{subtitle}</p>}
              {!subtitle && description && (
                <p className="mt-0.5 text-[11.5px] leading-tight text-ink-muted">{description}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-1.5">{actions}</div>}
        </header>
      )}

      <div className={cn('min-w-0 flex-1', padded && (dense ? 'p-2.5' : 'p-3'))}>{children}</div>

      {footer && (
        <footer className="border-t border-line-soft px-3 py-1.5 text-[11.5px] leading-relaxed text-ink-muted">
          {footer}
        </footer>
      )}
    </section>
  );
}
