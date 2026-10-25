import type { ReactNode } from 'react';
import { AlertVariant } from '../../types/ui';

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
}

const variantClasses: Record<AlertVariant, string> = {
  [AlertVariant.Info]: 'bg-brand-soft text-brand-strong',
  [AlertVariant.Success]: 'bg-success-soft text-success',
  [AlertVariant.Warning]: 'bg-warning-soft text-warning',
  [AlertVariant.Danger]: 'bg-danger-soft text-danger',
};

export function Alert({ variant = AlertVariant.Info, children }: AlertProps) {
  return (
    <div role="alert" className={`rounded-lg px-4 py-3 text-sm ${variantClasses[variant]}`}>
      {children}
    </div>
  );
}
