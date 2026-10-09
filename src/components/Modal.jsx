import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils.js';
import Button from './Button.jsx';

const WIDTHS = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[min(96vw,1200px)]',
};

/** Accessible modal: ESC to close, click-outside to close, focus trapped-ish. */
export default function Modal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  size = 'md',
  children,
  footer,
  closeOnBackdrop = true,
  className,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <div
        className="fixed inset-0 animate-fade-in bg-black/70 backdrop-blur-[2px]"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Dialog'}
        className={cn(
          'relative z-10 my-auto w-full animate-scale-in rounded-md border border-line bg-base-800 shadow-pop outline-none',
          WIDTHS[size] ?? WIDTHS.md,
          className,
        )}
      >
        {(title || onClose) && (
          <header className="flex items-start justify-between gap-4 border-b border-line-soft px-4 py-3">
            <div className="flex min-w-0 items-start gap-2.5">
              {Icon && (
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-line-soft bg-base-750 text-accent">
                  <Icon className="h-4 w-4" strokeWidth={1.9} />
                </span>
              )}
              <div className="min-w-0">
                {title && <h2 className="text-sm font-semibold text-ink">{title}</h2>}
                {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
              </div>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close dialog">
              <X className="h-3.5 w-3.5" />
            </Button>
          </header>
        )}

        <div className="max-h-[70vh] overflow-y-auto px-4 py-4 scroll-thin">{children}</div>

        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line-soft px-4 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
