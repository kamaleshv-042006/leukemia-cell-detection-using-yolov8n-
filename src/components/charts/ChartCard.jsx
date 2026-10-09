import { cn } from '../../lib/utils.js';
import { Download, Info } from 'lucide-react';
import Button from '../Button.jsx';

/**
 * Wrapper that gives every chart the same title row, optional legend, and an
 * export affordance.
 */
export default function ChartCard({
  title,
  subtitle,
  description,
  icon: Icon,
  actions,
  legend,
  footer,
  children,
  height = 240,
  className,
  bodyClassName,
  exportData,
  exportName = 'chart-data.csv',
}) {
  return (
    <section className={cn('flex min-w-0 flex-col rounded-md border border-line bg-base-800 shadow-panel', className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line-soft px-3.5 py-2.5">
        <div className="flex min-w-0 items-start gap-2.5">
          {Icon && (
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-line-soft bg-base-750 text-ink-muted">
              <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
            </span>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-[13px] font-semibold leading-tight text-ink">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {actions}
          {exportData && (
            <Button variant="subtle" size="xs" icon={Download} onClick={exportData}>
              CSV
            </Button>
          )}
        </div>
      </header>

      {(legend || description) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft px-3.5 py-2">
          {legend}
          {description && (
            <span className="inline-flex items-center gap-1 text-2xs text-ink-faint" title={description}>
              <Info className="h-3 w-3" />
              {description}
            </span>
          )}
        </div>
      )}

      <div className={cn('min-w-0 flex-1 px-1.5 py-3', bodyClassName)} style={{ minHeight: height }}>
        {children}
      </div>

      {footer && <footer className="border-t border-line-soft px-3.5 py-2 text-2xs text-ink-muted">{footer}</footer>}
    </section>
  );
}
