export const AlertVariant = {
  Info: 'info',
  Success: 'success',
  Warning: 'warning',
  Danger: 'danger',
} as const;

export type AlertVariant = (typeof AlertVariant)[keyof typeof AlertVariant];
