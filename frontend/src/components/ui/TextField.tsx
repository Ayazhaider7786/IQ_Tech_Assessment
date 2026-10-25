import type { InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextField({ label, error, id, className = '', ...rest }: TextFieldProps) {
  const inputId = id ?? rest.name;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-ink-soft">
        {label}
      </label>
      <input
        id={inputId}
        className={`rounded-lg border px-3 py-2 text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-brand ${error ? 'border-danger' : 'border-line'} ${className}`}
        {...rest}
      />
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}
