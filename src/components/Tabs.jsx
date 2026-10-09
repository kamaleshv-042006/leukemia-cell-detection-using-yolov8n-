import { cn } from '../lib/utils.js';

/**
 * Segmented tab bar.
 * `items` = [{ id, label, icon?, badge?, disabled? }]
 */
export default function Tabs({
  items,
  value,
  onChange,
  size = 'md',
  variant = 'underline',
  className,
  ariaLabel = 'Tabs',
}) {
  const sizes = {
    sm: 'h-7 px-2.5 text-2xs',
    md: 'h-8 px-3 text-xs',
    lg: 'h-9 px-4 text-[13px]',
  };

  if (variant === 'segmented') {
    return (
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={cn('inline-flex flex-wrap items-center gap-1 rounded-md border border-line bg-base-850 p-1', className)}
      >
        {items.map((item) => {
          const active = item.id === value;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              role="tab"
              type="button"
              aria-selected={active}
              disabled={item.disabled}
              onClick={() => onChange?.(item.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-sm font-medium transition-colors',
                sizes[size] ?? sizes.md,
                active
                  ? 'bg-accent text-white shadow-panel'
                  : 'text-ink-muted hover:bg-base-700 hover:text-ink-soft',
                item.disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-ink-muted',
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2} />}
              {item.label}
              {item.badge !== undefined && item.badge !== null && (
                <span
                  className={cn(
                    'tnum ml-0.5 rounded-sm px-1 text-2xs leading-[14px]',
                    active ? 'bg-white/20 text-white' : 'bg-base-700 text-ink-muted',
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('flex items-center gap-0 overflow-x-auto border-b border-line scroll-thin', className)}
    >
      {items.map((item) => {
        const active = item.id === value;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={active}
            disabled={item.disabled}
            onClick={() => onChange?.(item.id)}
            className={cn(
              'relative inline-flex shrink-0 items-center gap-1.5 border-b-2 font-medium transition-colors',
              size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-9 px-3.5 text-[13px]',
              active
                ? 'border-accent text-ink'
                : 'border-transparent text-ink-muted hover:border-line-strong hover:text-ink-soft',
              item.disabled && 'cursor-not-allowed opacity-40',
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2} />}
            {item.label}
            {item.badge !== undefined && item.badge !== null && (
              <span className="tnum ml-0.5 rounded-sm bg-base-700 px-1 text-2xs leading-[14px] text-ink-muted">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
