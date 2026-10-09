import { cn } from '../lib/utils.js';

/** Placeholder shown when a dataset/table/view has nothing to render. */
export default function EmptyState({
  icon: Icon,
  title = 'No data available',
  description,
  action,
  className,
  compact = false,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-md border border-dashed border-line bg-base-850/40 text-center',
        compact ? 'px-4 py-6' : 'px-6 py-12',
        className,
      )}
    >
      {Icon && (
        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-md border border-line bg-base-800 text-ink-faint">
          <Icon className="h-4.5 w-4.5" strokeWidth={1.6} />
        </span>
      )}
      <p className="text-[13px] font-medium text-ink-soft">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-ink-muted">{description}</p>}
      {action && <div className="mt-3.5">{action}</div>}
    </div>
  );
}
