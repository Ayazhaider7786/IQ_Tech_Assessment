import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '../services/authService';
import { tokenStorage } from '../services/tokenStorage';
import type { UserResponse } from '../types/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const tokens = tokenStorage.get();
      if (!tokens?.accessToken) {
        setIsRestoringSession(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        tokenStorage.clear();
        setUser(null);
      } finally {
        setIsRestoringSession(false);
      }
    };

    void restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const auth = await authService.login({ email, password });
    setUser(auth.user);
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    const auth = await authService.register({ fullName, email, password });
    setUser(auth.user);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isRestoringSession,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
