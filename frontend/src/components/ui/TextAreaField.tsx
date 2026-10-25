import type { TextareaHTMLAttributes } from 'react';

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextAreaField({ label, error, id, className = '', ...rest }: TextAreaFieldProps) {
  const fieldId = id ?? rest.name;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium text-ink-soft">
        {label}
      </label>
      <textarea
        id={fieldId}
        className={`rounded-lg border px-3 py-2 text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-brand ${error ? 'border-danger' : 'border-line'} ${className}`}
        rows={4}
        {...rest}
      />
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}
