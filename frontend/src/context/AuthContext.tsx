'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/api-client';
import { User, AuthResponse } from '../types';
import { useLoginRequired } from './LoginRequiredModalContext';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, redirectTo?: string | false) => Promise<User>;
  register: (
    name: string,
    email: string,
    password: string,
    redirectTo?: string | false,
  ) => Promise<User>;
  logout: (redirectTo?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  requireAuth: (callback: () => void, customMessage?: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => { throw new Error('AuthContext not initialized'); },
  register: async () => { throw new Error('AuthContext not initialized'); },
  logout: async () => {},
  refreshUser: async () => {},
  requireAuth: () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { openModal } = useLoginRequired();
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token || token === 'undefined' || token === 'null') {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.get('/auth/me');
      const userData = (response as any).data || response;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    refreshUser();
  }, [refreshUser]);

  const login = async (
    email: string,
    password: string,
    redirectTo: string | false = '/',
  ): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      const data: any = (response as any).data || response;
      if (data.accessToken) {
        localStorage.setItem('access_token', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);

        if (redirectTo) {
          router.push(redirectTo);
        }
        return data.user;
      }
      throw new Error('Authentication response missing access token');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    redirectTo: string | false = '/',
  ): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', {
        name,
        email,
        password,
      });

      const data: any = (response as any).data || response;
      if (data.accessToken) {
        localStorage.setItem('access_token', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);

        if (redirectTo) {
          router.push(redirectTo);
        }
        return data.user;
      }
      throw new Error('Registration response missing access token');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (redirectTo = '/') => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Ignore logout API error during client state reset
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      if (redirectTo) {
        router.push(redirectTo);
      }
    }
  };

  const requireAuth = (callback: () => void, customMessage?: string): boolean => {
    if (user) {
      callback();
      return true;
    }
    openModal(customMessage);
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
