/**
 * Categories Hooks
 * Custom React Query hooks for category-related operations
 */

import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '@/services/categories.service';
import { queryKeys } from '@/lib/react-query';
import type { PaginationParams } from '@/types/api.types';

/**
 * Hook to fetch paginated categories list
 * @param params - Pagination parameters
 */
export function useCategories(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoriesService.getCategories(params),
    // Categories don't change often, so we can cache them longer
    staleTime: 10 * 60 * 1000, // 10 minutes
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to fetch a single category by ID
 * @param id - Category ID
 */
export function useCategory(id: string | number | undefined) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id!),
    queryFn: () => categoriesService.getCategory(id!),
    enabled: !!id,
  });
}
