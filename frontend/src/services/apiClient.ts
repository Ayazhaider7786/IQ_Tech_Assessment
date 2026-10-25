import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokenStorage';
import type { AuthResponse } from '../types/auth';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const tokens = tokenStorage.get();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const tokens = tokenStorage.get();
  if (!tokens?.refreshToken) {
    return null;
  }

  try {
    const response = await axios.post<AuthResponse>(`${baseURL}/auth/refresh`, {
      refreshToken: tokens.refreshToken,
    });

    tokenStorage.set({
      accessToken: response.data.accessToken,
      accessTokenExpiresAt: response.data.accessTokenExpiresAt,
      refreshToken: response.data.refreshToken,
    });

    return response.data.accessToken;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retried) {
      return Promise.reject(error);
    }

    originalRequest._retried = true;

    // Single-flight: several concurrent 401s share one refresh instead of
    // racing to spend the same refresh token.
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    const newAccessToken = await refreshPromise;
    if (!newAccessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    return apiClient(originalRequest);
  },
);
