export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}
