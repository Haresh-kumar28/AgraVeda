import React, { createContext, useContext, useState, useCallback } from 'react';
import { UserProfile, UserRole, Capability, can } from './roles';
import { AuthAdapter, LoginCredentials, SignupData } from './AuthAdapter';

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  can: (capability: Capability) => boolean;
  login: (credentials: LoginCredentials) => Promise<UserProfile>;
  signup: (data: SignupData) => Promise<{ user: UserProfile; note: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => AuthAdapter.getSession());
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const loggedIn = await AuthAdapter.login(credentials);
      setUser(loggedIn);
      return loggedIn;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignup = useCallback(async (data: SignupData) => {
    setIsLoading(true);
    try {
      const res = await AuthAdapter.signup(data);
      setUser(res.user);
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await AuthAdapter.logout();
    setUser(null);
  }, []);

  const handleSwitchRole = useCallback(async (role: UserRole) => {
    setIsLoading(true);
    try {
      const switched = await AuthAdapter.switchDemoRole(role);
      setUser(switched);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkCapability = useCallback((capability: Capability) => {
    return can(user?.role, capability);
  }, [user?.role]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isDemoMode: true, // Clearly honest about demo adapter
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
