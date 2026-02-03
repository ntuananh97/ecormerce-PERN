/**
 * User Store (Zustand)
 * Global state management for user authentication
 * Implements the "Optimistic UI with Background Revalidation" pattern
 */

import { create } from 'zustand';
import type { User, UserInfo } from '@/types/api.types';

interface UserState {
  // User data (can be full User or just UserInfo for SSR)
  user: User | UserInfo | null;

  // Authentication status
  isAuthenticated: boolean;

  // Hydration flag to prevent flash
  isHydrated: boolean;

  // Actions
  setUser: (user: User | UserInfo | null) => void;
  updateUser: (userData: Partial<User>) => void;
  clearUser: () => void;
  setHydrated: (hydrated: boolean) => void;
}

/**
 * User Store
 * Used for global user state across the application
 */
export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),

  setHydrated: (hydrated) =>
    set({
      isHydrated: hydrated,
    }),
}));

/**
 * Selector hooks for common use cases
 */
export const useUser = () => useUserStore((state) => state.user);
export const useIsAuthenticated = () => useUserStore((state) => state.isAuthenticated);
export const useIsHydrated = () => useUserStore((state) => state.isHydrated);
