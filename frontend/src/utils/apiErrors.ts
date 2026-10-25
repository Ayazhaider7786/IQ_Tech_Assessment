import { isAxiosError } from 'axios';
import type { IdentityErrorResponse, ProblemDetailsResponse } from '../types/api';

export function extractApiError(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) {
    return fallback;
  }

  const status = error.response?.status;
  if (status !== undefined && status < 500) {
    const data = error.response?.data as Partial<ProblemDetailsResponse & IdentityErrorResponse> | undefined;

    if (data?.errors?.length) {
      return data.errors.join(' ');
    }

    if (data?.detail) {
      return data.detail;
    }
  }

  return fallback;
}
