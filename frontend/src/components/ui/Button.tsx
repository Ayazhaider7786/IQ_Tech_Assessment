import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-on-brand hover:bg-brand-strong',
  secondary: 'bg-surface-sunken text-ink border border-line hover:bg-surface-raised',
  ghost: 'bg-transparent text-ink hover:bg-surface-sunken',
};

export function Button({
  variant = 'primary',
  children,
  isLoading = false,
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? 'Please wait…' : children}
    </button>
  );
}
