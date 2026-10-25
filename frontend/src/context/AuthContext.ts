import { createContext } from 'react';
import type { UserResponse } from '../types/auth';

export interface AuthContextValue {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isRestoringSession: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
