
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { UserProfile, UserRole, Capability, can } from './roles';
import {
  AuthAdapter,
  LoginCredentials,
  SignupData,
  SignupResult,
} from './AuthAdapter';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  can: (capability: Capability) => boolean;
  login: (credentials: LoginCredentials) => Promise<UserProfile>;
  signup: (data: SignupData) => Promise<SignupResult>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(
    () => AuthAdapter.getSession()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      const demoUser = AuthAdapter.getSession();

      if (demoUser) {
        if (active) {
          setUser(demoUser);
          setIsLoading(false);
        }
        return;
      }

      try {
        const realUser = await AuthAdapter.getRealSession();
        if (active) setUser(realUser);
      } catch (error) {
        console.error('Failed to restore AgraVeda session:', error);
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      const demoUser = AuthAdapter.getSession();

      if (demoUser) {
        setUser(demoUser);
        return;
      }

      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        return;
      }

      // Defer Supabase profile fetching until the auth callback completes.
      if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED' ||
        event === 'INITIAL_SESSION'
      ) {
        setTimeout(() => {
          if (!active) return;

          void AuthAdapter.getRealSession()
            .then((realUser) => {
              if (active) setUser(realUser);
            })
            .catch((error) => {
              console.error('Failed to load authenticated profile:', error);
              if (active) setUser(null);
            });
        }, 0);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      try {
        const loggedIn = await AuthAdapter.login(credentials);
        setUser(loggedIn);
        return loggedIn;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSignup = useCallback(async (data: SignupData) => {
    setIsLoading(true);

    try {
      const result = await AuthAdapter.signup(data);

      if (result.user) {
        setUser(result.user);
      }

      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setIsLoading(true);

    try {
      await AuthAdapter.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSwitchRole = useCallback(async (role: UserRole) => {
    setIsLoading(true);

    try {
      const demoUser = await AuthAdapter.switchDemoRole(role);
      setUser(demoUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkCapability = useCallback(
    (capability: Capability) => can(user?.role, capability),
    [user?.role]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isDemoMode: user?.isDemoAccount === true,
        can: checkCapability,
        login: handleLogin,
        signup: handleSignup,
        logout: handleLogout,
        switchDemoRole: handleSwitchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return ctx;
}
