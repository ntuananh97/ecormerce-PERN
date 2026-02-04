/**
 * useCart Hook
 * Custom hook for cart operations
 * Automatically handles guest (localStorage) vs authenticated (API) cart
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/stores/userStore';
import {
  useCartStore,
  useCartItems,
  useCartItemCount,
  useCartTotal,
  useCartLoading,
} from '@/stores/cartStore';
import {
  guestCartService,
  authenticatedCartService,
  cartService,
} from '@/services/cart.service';
import { queryKeys } from '@/lib/react-query';
import type { CartItem, CartProductInfo, GuestCartItem } from '@/types/cart.types';

interface UseCartReturn {
  // State
  items: CartItem[];
  itemCount: number;
  total: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  addToCart: (productId: string, quantity: number, product: CartProductInfo) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => void;
  loadCart: () => Promise<void>;
}

/**
 * Custom hook for cart operations
 * Routes to guest or authenticated service based on auth state
 */
export function useCart(): UseCartReturn {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Auth state
  const isAuthenticated = useIsAuthenticated();

  // Cart store
  const items = useCartItems();
  const itemCount = useCartItemCount();
  const total = useCartTotal();
  const isLoading = useCartLoading();
  const setItems = useCartStore((state) => state.setItems);
  const setLoading = useCartStore((state) => state.setLoading);
  const clearCartStore = useCartStore((state) => state.clearCart);

  /**
   * Convert guest cart items to cart items format for store
   */
  const convertGuestToCartItems = useCallback((guestItems: GuestCartItem[]): CartItem[] => {
    return guestItems.map((item) => ({
      id: item.productId, // Use productId as temporary id for guest cart
      productId: item.productId,
      quantity: item.quantity,
      product: item.product,
    }));
  }, []);

  /**
   * Load cart from server (authenticated users)
   */
  const { data: serverCart } = useQuery({
    queryKey: queryKeys.cart.me(),
    queryFn: () => authenticatedCartService.getCart(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  /**
   * Load cart based on auth state
   */
  const loadCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        // Load from server
        const cart = await authenticatedCartService.getCart();
        setItems(cart.items);
      } else {
        // Load from localStorage
        const guestCart = guestCartService.getCart();
        const cartItems = convertGuestToCartItems(guestCart.items);
        setItems(cartItems);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cart';
      setError(errorMessage);
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, setItems, setLoading, convertGuestToCartItems]);

  /**
   * Initialize cart on mount and auth state change
   */
  useEffect(() => {
    if (isAuthenticated && serverCart) {
      // Use server cart data
      setItems(serverCart.items);
    } else if (!isAuthenticated) {
      // Load guest cart from localStorage
      const guestCart = guestCartService.getCart();
      const cartItems = convertGuestToCartItems(guestCart.items);
      setItems(cartItems);
    }
  }, [isAuthenticated, serverCart, setItems, convertGuestToCartItems]);

  /**
   * Add item to cart
   */
  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
      product,
    }: {
      productId: string;
      quantity: number;
      product: CartProductInfo;
    }) => {
      if (isAuthenticated) {
        return await authenticatedCartService.addItem(productId, quantity, product);
      } else {
        const guestCart = guestCartService.addItem(productId, quantity, product);
        return {
          id: 'guest-cart',
          userId: 'guest',
          items: convertGuestToCartItems(guestCart.items),
        };
      }
    },
    onSuccess: (data) => {
      setItems(data.items);
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.me() });
      }
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const addToCart = useCallback(
    async (productId: string, quantity: number, product: CartProductInfo) => {
      setError(null);
      await addToCartMutation.mutateAsync({ productId, quantity, product });
    },
    [addToCartMutation]
  );

  /**
   * Update item quantity
   */
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (isAuthenticated) {
        return await authenticatedCartService.updateItem(itemId, quantity);
      } else {
        // For guest cart, itemId is the productId
        const guestCart = guestCartService.updateItem(itemId, quantity);
        return {
          id: 'guest-cart',
          userId: 'guest',
          items: convertGuestToCartItems(guestCart.items),
        };
      }
    },
    onSuccess: (data) => {
      setItems(data.items);
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.me() });
      }
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      setError(null);
      await updateQuantityMutation.mutateAsync({ itemId, quantity });
    },
    [updateQuantityMutation]
  );

  // Get removeItem from cart store for optimistic update
  const removeItemFromStore = useCartStore((state) => state.removeItem);

  /**
   * Remove item from cart
   */
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (isAuthenticated) {
        // API only returns success/message, no cart data
        await authenticatedCartService.removeItem(itemId);
        return { itemId, isAuthenticated: true };
      } else {
        // For guest cart, itemId is the productId
        const guestCart = guestCartService.removeItem(itemId);
        return {
          itemId,
          isAuthenticated: false,
          items: convertGuestToCartItems(guestCart.items),
        };
      }
    },
    onSuccess: (data) => {
      if (data.isAuthenticated) {
        // For authenticated users: remove item from store directly
        removeItemFromStore(data.itemId);
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.me() });
      } else {
        // For guest users: use the returned items from localStorage
        setItems(data.items!);
      }
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const removeFromCart = useCallback(
    async (itemId: string) => {
      setError(null);
      await removeFromCartMutation.mutateAsync(itemId);
    },
    [removeFromCartMutation]
  );

  /**
   * Clear cart
   */
  const clearCart = useCallback(() => {
    clearCartStore();
    if (!isAuthenticated) {
      cartService.clearLocalCart();
    }
  }, [clearCartStore, isAuthenticated]);

  return {
    items,
    itemCount,
    total,
    isLoading:
      isLoading ||
      addToCartMutation.isPending ||
      updateQuantityMutation.isPending ||
      removeFromCartMutation.isPending,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
  };
}

export default useCart;
