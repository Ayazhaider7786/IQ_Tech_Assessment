const SESSION_KEY = 'myapp.auth';

interface StoredTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
}

export const tokenStorage = {
  get(): StoredTokens | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as StoredTokens) : null;
    } catch {
      return null;
    }
  },

  set(tokens: StoredTokens): void {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(tokens));
    } catch {
      // Ignore storage failures (private browsing, quota, etc.) — the session
      // just won't survive a refresh.
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore.
    }
  },
};
