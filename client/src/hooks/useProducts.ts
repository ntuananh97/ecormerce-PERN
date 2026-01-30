/**
 * Products Hooks
 * Custom React Query hooks for product-related operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import { queryKeys } from '@/lib/react-query';
import type {
  PaginationParams,
} from '@/types/api.types';
import { ICreateProductRequest, IUpdateProductRequest } from '@/types/product.types';

/**
 * Hook to fetch paginated products list
 * @param params - Pagination and filter parameters
 */
export function useProducts(
  params?: PaginationParams & { name?: string; category?: string }
) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productsService.getProducts(params),
    // Keep previous data while fetching new data (useful for pagination)
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to fetch a single product by ID
 * @param id - Product ID
 * @param enabled - Whether to enable the query (default: true when id exists)
 */
export function useProduct(id: string | number | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id!),
    queryFn: () => productsService.getProduct(id!),
    // Only run query when id exists
    enabled: !!id,
  });
}

/**
 * Hook to create a new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateProductRequest) =>
      productsService.createProduct(data),
    onSuccess: () => {
      // Invalidate products list to refetch with new product
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });
    },
  });
}

/**
 * Hook to update an existing product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: IUpdateProductRequest }) =>
      productsService.updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      // Invalidate products list
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });
      
      // Update the specific product in cache
      queryClient.setQueryData(
        queryKeys.products.detail(updatedProduct.id),
        updatedProduct
      );
    },
  });
}

/**
 * Hook to delete a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => productsService.deleteProduct(id),
    onSuccess: (_, deletedId) => {
      // Invalidate products list
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });
      
      // Remove the deleted product from cache
      queryClient.removeQueries({
        queryKey: queryKeys.products.detail(deletedId),
      });
    },
  });
}

/**
 * Hook to prefetch products list
 * Useful for optimistic navigation
 */
export function usePrefetchProducts() {
  const queryClient = useQueryClient();

  return (params?: PaginationParams & { name?: string; category?: string }) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.list(params),
      queryFn: () => productsService.getProducts(params),
    });
  };
}
