import { apiClient } from './apiClient';
import { tokenStorage } from './tokenStorage';
import type { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../types/auth';

function storeSession(auth: AuthResponse): void {
  tokenStorage.set({
    accessToken: auth.accessToken,
    accessTokenExpiresAt: auth.accessTokenExpiresAt,
    refreshToken: auth.refreshToken,
  });
}

export const authService = {
  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', request);
    storeSession(response.data);
    return response.data;
  },

  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', request);
    storeSession(response.data);
    return response.data;
  },

  async logout(): Promise<void> {
    const tokens = tokenStorage.get();
    if (tokens?.refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refreshToken: tokens.refreshToken });
      } catch {
        // Logging out locally still succeeds even if the server call fails.
      }
    }
    tokenStorage.clear();
  },

  async getCurrentUser(): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>('/auth/me');
    return response.data;
  },
};
