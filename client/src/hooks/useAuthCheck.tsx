/**
 * useAuthCheck Hook
 * Background revalidation hook for the "Optimistic UI with Background Revalidation" pattern
 *
 * Logic:
 * - Fetches /api/auth/me in the background using React Query
 * - Uses initialData from Server Component for immediate display
 * - On success (200): Compares fresh data with store, updates if changed
 * - On unauthorized (401): Performs logout (clears cookie, store, redirects)
 */

'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useUserStore } from '@/stores/userStore';
import { queryKeys } from '@/lib/react-query';
import type { User, UserInfo } from '@/types/api.types';

interface UseAuthCheckOptions {
  initialData: UserInfo | null;
  enabled?: boolean;
}

/**
 * Helper: Extract UserInfo from User
 */
function extractUserInfo(user: User): UserInfo {
  return {
    id: user.id,
    name: user.name,
   
  };
}

export function useAuthCheck({ enabled = true }: UseAuthCheckOptions) {

  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  // React Query for background revalidation
  const { data: freshUser, error,  } = useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: () => authService.getCurrentUser(),
    enabled: enabled,
    staleTime: 30 * 1000, // 30 seconds - more aggressive revalidation
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: false, // Don't retry on 401
  });

  // Handle successful revalidation - compare and update if needed
  useEffect(() => {
    if (!freshUser) return;

    // Update Zustand store with full user data
    setUser(freshUser);

    // Update user_info cookie with fresh data
    const userInfo = extractUserInfo(freshUser);
    authService.updateUserInfoCookie(userInfo);
  }, [freshUser, setUser]);

  // Handle error (401 Unauthorized) - clear user to stop fetching
  useEffect(() => {
    if (error) {
      console.log('[useAuthCheck] Auth check failed, clearing user store');
      clearUser();
    }
  }, [error, clearUser]);

  return {
    isRevalidating: !freshUser && enabled,
    freshUser,
    error,
  };
}

export default useAuthCheck;
