import { setActiveSession } from "@/src/lib/auth-session";
import {
    clearPersistedSession,
    loadPersistedSession,
    persistSession,
    type AuthSession,
} from "@/src/lib/session-storage";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

type AuthContextType = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  loginWithTokens: (session: AuthSession) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrateSession() {
      try {
        const storedSession = await loadPersistedSession();

        if (!isMounted) {
          return;
        }

        setSession(storedSession);
        setActiveSession(storedSession);
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    }

    hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const loginWithTokens = useCallback(async (nextSession: AuthSession) => {
    setSession(nextSession);
    setActiveSession(nextSession);
    await persistSession(nextSession);
  }, []);

  const logout = useCallback(async () => {
    setSession(null);
    setActiveSession(null);
    await clearPersistedSession();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      isAuthenticated: !!session?.accessToken,
      isHydrated,
      loginWithTokens,
      logout,
    }),
    [isHydrated, loginWithTokens, logout, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }

  return context;
}
