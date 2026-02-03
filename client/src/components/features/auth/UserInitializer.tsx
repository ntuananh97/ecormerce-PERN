/**
 * UserInitializer Component
 * Hydrates the Zustand store with initial user data from Server Component
 *
 * This component is part of the "Optimistic UI with Background Revalidation" pattern:
 * - Receives initial user data from Server Component (read from user_info cookie)
 * - Hydrates the Zustand store immediately on mount
 * - Triggers background revalidation via useAuthCheck hook
 *
 * Goal: Zero LCP delay - user sees their avatar immediately upon page load
 */

'use client';

import { useEffect, useRef } from 'react';
import { useUserStore } from '@/stores/userStore';
import type { UserInfo } from '@/types/api.types';
import useAuthCheck from '@/hooks/useAuthCheck';

interface UserInitializerProps {
  initialUser: UserInfo | null;
}

export function UserInitializer({ initialUser }: UserInitializerProps) {
  const setUser = useUserStore((state) => state.setUser);
  const setHydrated = useUserStore((state) => state.setHydrated);
  const isHydrated = useUserStore((state) => state.isHydrated);
  const user = useUserStore((state) => state.user);
  const hasHydratedRef = useRef(false);

  // Step 1: Immediately hydrate the store with server data (synchronous)
  useEffect(() => {
    // Only hydrate once to prevent loops
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    if (initialUser) {
      setUser(initialUser);
    }
    setHydrated(true);
  }, [initialUser, setUser, setHydrated]);

  // Step 2: Background revalidation - only run after hydration and when user exists in store
  // CRITICAL: Check store (user) instead of prop (initialUser) to disable after logout
  useAuthCheck({
    initialData: initialUser,
    enabled: isHydrated && !!user,
  });

  // This component doesn't render anything
  return null;
}

export default UserInitializer;
