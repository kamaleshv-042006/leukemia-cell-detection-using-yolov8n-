import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils.js';

const VARIANTS = {
  primary:
    'bg-accent text-white border-accent hover:bg-accent-hover hover:border-accent-hover active:bg-accent-hover',
  secondary:
    'bg-base-700 text-ink border-line-strong hover:bg-base-650 hover:border-[#3A4653] active:bg-base-600',
  ghost: 'bg-transparent text-ink-soft border-transparent hover:bg-base-700 hover:text-ink',
  outline:
    'bg-transparent text-ink-soft border-line hover:border-accent hover:text-ink active:bg-accent-soft',
  danger:
    'bg-bad-soft text-bad border-[rgba(225,85,90,0.35)] hover:bg-[rgba(225,85,90,0.2)]',
  subtle: 'bg-base-750 text-ink-soft border-line-soft hover:bg-base-700 hover:text-ink',
};

const SIZES = {
  xs: 'h-7 px-2.5 text-2xs gap-1.5',
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-[13px] gap-2',
  lg: 'h-10 px-5 text-sm gap-2',
  icon: 'h-9 w-9 justify-center',
  'icon-sm': 'h-7 w-7 justify-center',
};

const Button = forwardRef(function Button(
  {
    children,
    variant = 'secondary',
    size = 'md',
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    disabled = false,
    fullWidth = false,
    className,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center rounded border font-medium',
        'transition-colors duration-100',
        'disabled:cursor-not-allowed disabled:opacity-45',
        VARIANTS[variant] ?? VARIANTS.secondary,
        SIZES[size] ?? SIZES.md,
        fullWidth && 'w-full justify-center',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className={cn('h-3.5 w-3.5 shrink-0 animate-spin', size === 'xs' && 'h-3 w-3')} />
      ) : (
        Icon && <Icon className={cn('h-3.5 w-3.5 shrink-0', size === 'xs' && 'h-3 w-3')} strokeWidth={2} />
      )}
      {children}
      {IconRight && !loading && (
        <IconRight className={cn('h-3.5 w-3.5 shrink-0', size === 'xs' && 'h-3 w-3')} strokeWidth={2} />
      )}
    </button>
  );
});

export default Button;
export { Button };
