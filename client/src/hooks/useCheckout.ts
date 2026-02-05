/**
 * useCheckout Hook
 * Custom hook for checkout and order operations using React Query
 */

'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { queryKeys } from '@/lib/react-query';
import { checkoutService } from '@/services/checkout.service';
import { useCartStore } from '@/stores/cartStore';
import type {
  ICheckoutSession,
  ICreateCheckoutSessionRequest,
  ICreateOrderRequest,
  IOrder,
  IOrderQueryParams,
  CheckoutMode,
} from '@/types/checkout.types';

/**
 * Hook for creating checkout session
 */
export function useCheckoutSession() {
  const mutation = useMutation({
    mutationFn: (data: ICreateCheckoutSessionRequest) =>
      checkoutService.createSession(data),
  });

  return {
    createSession: mutation.mutateAsync,
    session: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    reset: mutation.reset,
  };
}

/**
 * Hook for creating an order
 */
export function useCreateOrder() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearCart = useCartStore((state) => state.clearCart);

  const mutation = useMutation({
    mutationFn: (data: ICreateOrderRequest) => checkoutService.createOrder(data),
    onSuccess: (order) => {
      // Clear cart after successful order (for CART mode)
      clearCart();
      
      // Invalidate cart query
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.me() });
      
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      
      // Redirect to success page
      router.push(`/checkout/success?orderId=${order.id}`);
    },
  });

  return {
    createOrder: mutation.mutateAsync,
    order: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    reset: mutation.reset,
  };
}

/**
 * Hook for fetching user's orders
 */
export function useOrders(params?: IOrderQueryParams) {
  return useQuery({
    queryKey: queryKeys.orders.list(params as Record<string, unknown> | undefined),
    queryFn: () => checkoutService.getOrders(params),
  });
}

/**
 * Hook for fetching order details
 */
export function useOrderDetail(orderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId!),
    queryFn: () => checkoutService.getOrderDetail(orderId!),
    enabled: !!orderId,
  });
}

/**
 * Combined checkout hook for the checkout page
 */
export function useCheckout() {
  const {
    createSession,
    session,
    isLoading: isSessionLoading,
    error: sessionError,
    isError: isSessionError,
    reset: resetSession,
  } = useCheckoutSession();

  const {
    createOrder,
    isLoading: isOrderLoading,
    error: orderError,
    isError: isOrderError,
    reset: resetOrder,
  } = useCreateOrder();

  /**
   * Initialize checkout session from URL params
   */
  const initializeCheckout = useCallback(
    async (
      mode: CheckoutMode,
      cartItemIds?: string[],
      productId?: string,
      quantity?: number
    ): Promise<ICheckoutSession | null> => {
      try {
        const requestData: ICreateCheckoutSessionRequest = {
          mode,
          ...(mode === 'CART' && cartItemIds
            ? { cartItemIds }
            : { directItems: [{ productId: productId!, quantity: quantity || 1 }] }),
        };

        return await createSession(requestData);
      } catch (error) {
        console.error('Failed to initialize checkout:', error);
        return null;
      }
    },
    [createSession]
  );

  /**
   * Place order with idempotency key
   */
  const placeOrder = useCallback(
    async (
      mode: CheckoutMode,
      cartItemIds?: string[],
      productId?: string,
      quantity?: number
    ): Promise<IOrder | null> => {
      try {
        const idempotencyKey = crypto.randomUUID();

        const requestData: ICreateOrderRequest = {
          mode,
          idempotencyKey,
          ...(mode === 'CART' && cartItemIds
            ? { cartItemIds }
            : { directItems: [{ productId: productId!, quantity: quantity || 1 }] }),
        };

        return await createOrder(requestData);
      } catch (error) {
        console.error('Failed to place order:', error);
        throw error;
      }
    },
    [createOrder]
  );

  return {
    // Session
    session,
    initializeCheckout,
    isSessionLoading,
    sessionError,
    isSessionError,
    resetSession,

    // Order
    placeOrder,
    isOrderLoading,
    orderError,
    isOrderError,
    resetOrder,

    // Combined loading state
    isLoading: isSessionLoading || isOrderLoading,
  };
}

export default useCheckout;
