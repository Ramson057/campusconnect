import React, { createContext, useCallback, useEffect, useState } from 'react';
import { User, UserRole } from '../types/models';
import { authService, LoginPayload, RegisterPayload } from '../services/authService';
import { AUTH_TOKEN_KEY } from '../services/api';

const USER_STORAGE_KEY = 'cc_usc_current_user_v1';

const DEFAULT_DEMO_STUDENT: User = {
  id: 'usr-student-1',
  name: 'Mateo Lorenzo',
  email: '25102710@usc.edu.ph',
  studentId: '25102710',
  role: 'student',
  course: 'BS Computer Science',
  yearLevel: '3rd Year',
  department: 'School of Arts and Sciences — Dept. of Computer, Information Sciences & Mathematics',
  organizations: [
    'Computer Driven Enthusiasts (CoDE)',
    'USC Supreme Student Council (SSC)',
  ],
  status: 'active',
  createdAt: '2026-08-10T08:00:00Z',
  updatedAt: '2026-10-28T14:30:00Z',
};

const DEFAULT_DEMO_ADMIN: User = {
  id: 'usr-admin-1',
  name: 'Engr. Clarissa Villareal',
  email: 'osa.events@usc.edu.ph',
  studentId: 'ADM-00184',
  role: 'admin',
  course: 'Office of Student Affairs & Organization Council',
  yearLevel: 'Administrator / Adviser',
  department: 'Office of Student Affairs (OSA) — Talamban & Main',
  organizations: [
    'USC Supreme Student Council (SSC)',
    'Collegiate Engineering Council (CEC)',
  ],
  status: 'active',
  createdAt: '2025-06-01T08:00:00Z',
  updatedAt: '2026-10-30T10:00:00Z',
};

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
  updateCurrentUser: (updates: Partial<User>) => Promise<User>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) return JSON.parse(saved) as User;
    } catch {
      // Ignore storage parse error
    }
    return DEFAULT_DEMO_STUDENT;
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY) || 'mock-jwt-token-demo';
    } catch {
      return 'mock-jwt-token-demo';
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch {
      // Ignore storage error
    }
  }, [user]);

  const login = useCallback(async (payload: LoginPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.login(payload);
      localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.register(payload);
      localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const switchDemoRole = useCallback((role: UserRole) => {
    const nextUser = role === 'admin' ? DEFAULT_DEMO_ADMIN : DEFAULT_DEMO_STUDENT;
    const nextToken = `mock-jwt-token-${nextUser.id}`;
    localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const updateCurrentUser = useCallback(
    async (updates: Partial<User>): Promise<User> => {
      if (!user) throw new Error('Not authenticated');
      const updated = await authService.updateProfile(user.id, updates);
      setUser(updated);
      return updated;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
