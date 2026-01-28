/**
 * useAuth Hook
 * Custom hook for authentication operations
 * Demonstrates how to use the service layer in React components
 */

'use client';

import { useState, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import type { LoginRequest, RegisterRequest, User } from '@/types/api.types';

interface UseAuthReturn {
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
}

/**
 * Custom hook for authentication
 * Provides loading states and error handling
 */
export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.login(credentials);
      // Redirect or update state as needed
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.register(userData);
      // Redirect or update state as needed
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.logout();
      // Redirect to login page
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCurrentUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    login,
    register,
    logout,
    getCurrentUser,
  };
}

export default useAuth;
