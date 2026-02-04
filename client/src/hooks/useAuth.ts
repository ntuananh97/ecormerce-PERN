/**
 * useAuth Hook
 * Custom hook for authentication operations
 * Integrates with Zustand store and implements the "Optimistic UI" pattern
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useUserStore, useIsAuthenticated, useUser } from '@/stores/userStore';
import { useCartStore } from '@/stores/cartStore';
import { cartService } from '@/services/cart.service';
import { queryKeys } from '@/lib/react-query';
import type { LoginRequest, RegisterRequest, User, UserInfo } from '@/types/api.types';

interface UseAuthReturn {
  // State
  user: User | UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  clearError: () => void;
}

/**
 * Custom hook for authentication
 * Provides loading states, error handling, and Zustand integration
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Zustand store
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  // Cart store
  const setCartItems = useCartStore((state) => state.setItems);
  const clearCart = useCartStore((state) => state.clearCart);

  /**
   * Login user
   * 1. Calls auth service (sets HttpOnly cookie + user_info cookie)
   * 2. Updates Zustand store
   * 3. Loads cart from server (overwrite local state)
   */
  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);

      // Update Zustand store with full user data
      setUser(response.user);

      // Load cart from server and overwrite local state
      try {
        const serverCart = await cartService.loadCartFromServer();
        setCartItems(serverCart.items);
        
        // Clear guest cart from localStorage after loading server cart
        cartService.clearLocalCart();
        
        // Invalidate cart queries
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      } catch (cartError) {
        console.error('Error loading cart after login:', cartError);
        // Don't fail login if cart loading fails
      }

      // Invalidate any existing auth queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setCartItems, queryClient]);

  /**
   * Register new user
   * 1. Calls auth service
   * 2. Updates Zustand store
   * 3. Loads cart from server (overwrite local state)
   */
  const register = useCallback(async (userData: RegisterRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register(userData);

      // Update Zustand store with full user data
      setUser(response.user);

      // Load cart from server and overwrite local state
      try {
        const serverCart = await cartService.loadCartFromServer();
        setCartItems(serverCart.items);
        
        // Clear guest cart from localStorage after loading server cart
        cartService.clearLocalCart();
        
        // Invalidate cart queries
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      } catch (cartError) {
        console.error('Error loading cart after registration:', cartError);
        // Don't fail registration if cart loading fails
      }

      // Invalidate any existing auth queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setCartItems, queryClient]);

  /**
   * Logout user
   * 1. Calls auth service (clears cookies)
   * 2. Clears Zustand store
   * 3. Clears cart (localStorage + store)
   * 4. Clears React Query cache
   * 5. Redirects to login
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.logout();

      // Clear Zustand store
      clearUser();

      // Clear cart store and localStorage
      clearCart();
      cartService.clearLocalCart();

      // Clear React Query cache
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
      queryClient.removeQueries({ queryKey: queryKeys.cart.all });

      // Redirect to login
      router.push('/login');

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      // Still clear local state even if API fails
      clearUser();
      clearCart();
      cartService.clearLocalCart();
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
      queryClient.removeQueries({ queryKey: queryKeys.cart.all });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearUser, clearCart, queryClient, router]);

  /**
   * Get current user from API
   * Used for manual revalidation
   */
  const getCurrentUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const freshUser = await authService.getCurrentUser();

      // Update Zustand store
      setUser(freshUser);

      return freshUser;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    getCurrentUser,
    clearError,
  };
}

export default useAuth;
