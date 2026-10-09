import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils.js';

/* ------------------------------------------------------------------ label --- */

export function Field({ label, hint, htmlFor, children, className, required, inline = false }) {
  return (
    <div className={cn(inline ? 'flex items-center justify-between gap-4' : 'space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className={cn(
            'text-2xs font-medium uppercase tracking-[0.07em] text-ink-muted',
            inline && 'shrink-0',
          )}
        >
          {label}
          {required && <span className="ml-0.5 text-bad">*</span>}
        </label>
      )}
      <div className={cn(!inline && 'min-w-0')}>{children}</div>
      {hint && <p className="text-2xs leading-relaxed text-ink-faint">{hint}</p>}
    </div>
  );
}

/* ----------------------------------------------------------------- select --- */

export function Select({
  label,
  hint,
  value,
  onChange,
  options,
  disabled = false,
  className,
  id: providedId,
  placeholder,
}) {
  const autoId = useId();
  const id = providedId ?? autoId;

  return (
    <Field label={label} hint={hint} htmlFor={id} className={className}>
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            'h-9 w-full appearance-none rounded border border-line bg-base-850 pl-2.5 pr-8 text-[13px] text-ink outline-none transition-colors',
            'hover:border-line-strong focus:border-accent disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {(options ?? []).map((opt) => {
            const o = typeof opt === 'object' ? opt : { value: opt, label: opt };
            return (
              <option key={o.value} value={o.value} disabled={o.disabled}>
                {o.label}
              </option>
            );
          })}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
      </div>
    </Field>
  );
}

/* -------------------------------------------------------------- text input --- */

export function TextInput({ label, hint, value, onChange, className, id: providedId, mono = false, ...rest }) {
  const autoId = useId();
  const id = providedId ?? autoId;
  return (
    <Field label={label} hint={hint} htmlFor={id} className={className}>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          'h-9 w-full rounded border border-line bg-base-850 px-2.5 text-[13px] text-ink outline-none transition-colors placeholder:text-ink-faint hover:border-line-strong focus:border-accent',
          mono && 'font-mono text-xs',
        )}
        {...rest}
      />
    </Field>
  );
}

/* ----------------------------------------------------------- number slider --- */

export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  format = (v) => v.toFixed(2),
  tone = 'accent',
  hint,
  className,
  ticks = null,
  id: providedId,
}) {
  const autoId = useId();
  const id = providedId ?? autoId;
  const ratio = ((value - min) / (max - min)) * 100;
  const fill =
    tone === 'ok' ? 'ok' : tone === 'warn' ? 'warn' : tone === 'bad' ? 'bad' : 'accent';

  const rangeClass = {
    ok: 'accent-[#2FBF71]',
    warn: 'accent-[#E0A33A]',
    bad: 'accent-[#E1555A]',
    accent: 'accent-[#2D7FF9]',
  }[fill];

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-2xs font-medium uppercase tracking-[0.07em] text-ink-muted">
          {label}
        </label>
        <span
          className={cn(
            'tnum rounded-sm border px-1.5 py-0.5 text-xs font-medium',
            fill === 'ok' && 'border-[rgba(47,191,113,0.3)] bg-ok-soft text-ok',
            fill === 'warn' && 'border-[rgba(224,163,58,0.3)] bg-warn-soft text-warn',
            fill === 'bad' && 'border-[rgba(225,85,90,0.3)] bg-bad-soft text-bad',
            fill === 'accent' && 'border-[rgba(45,127,249,0.32)] bg-accent-soft text-accent',
          )}
        >
          {format(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn('h-1.5 w-full cursor-pointer appearance-none rounded-full bg-base-700', rangeClass)}
        style={{
          background: `linear-gradient(to right, var(--aq-accent) 0%, var(--aq-accent) ${ratio}%, #1B222A ${ratio}%, #1B222A 100%)`,
        }}
      />
      {ticks && (
        <div className="flex justify-between text-[10px] text-ink-faint">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      )}
      {hint && <p className="text-2xs leading-relaxed text-ink-faint">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------- number field --- */

export function NumberInput({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  className,
  id: providedId,
}) {
  const autoId = useId();
  const id = providedId ?? autoId;
  return (
    <Field label={label} hint={hint} htmlFor={id} className={className}>
      <div className="relative">
        <input
          id={id}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = e.target.value === '' ? '' : Number(e.target.value);
            onChange?.(v);
          }}
          className={cn(
            'tnum h-9 w-full rounded border border-line bg-base-850 pl-2.5 text-[13px] text-ink outline-none transition-colors hover:border-line-strong focus:border-accent',
            suffix && 'pr-9',
          )}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-2xs text-ink-faint">
            {suffix}
          </span>
        )}
      </div>
    </Field>
  );
}

/* ------------------------------------------------------------------ toggle --- */

export function Toggle({ label, hint, checked, onChange, disabled = false, className, id: providedId }) {
  const autoId = useId();
  const id = providedId ?? autoId;
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-[13px] text-ink-soft">
          {label}
        </label>
        {hint && <p className="mt-0.5 text-2xs leading-relaxed text-ink-faint">{hint}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'relative h-[18px] w-8 shrink-0 rounded-full border transition-colors',
          checked ? 'border-accent/60 bg-accent' : 'border-line bg-base-700',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <span
          className={cn(
            'absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full transition-transform',
            checked ? 'translate-x-[15px] bg-white' : 'translate-x-[2px] bg-ink-faint',
          )}
        />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------ segmented --- */

export function SegmentedControl({ label, value, onChange, options, className, size = 'md' }) {
  return (
    <Field label={label} className={className}>
      <div className="inline-flex flex-wrap items-center gap-1 rounded-md border border-line bg-base-850 p-1">
        {options.map((opt) => {
          const o = typeof opt === 'object' ? opt : { value: opt, label: opt };
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange?.(o.value)}
              title={o.description}
              className={cn(
                'rounded-sm font-medium transition-colors',
                size === 'sm' ? 'h-6 px-2 text-2xs' : 'h-7 px-2.5 text-xs',
                active
                  ? 'bg-accent text-white'
                  : 'text-ink-muted hover:bg-base-700 hover:text-ink-soft',
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </Field>
  );
}
