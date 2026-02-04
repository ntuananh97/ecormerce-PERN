/**
 * CartInitializer Component
 * Initializes cart state on application mount
 *
 * This component handles:
 * - Loading guest cart from localStorage for non-authenticated users
 * - Loading authenticated cart from server for logged-in users
 * - Automatically syncing cart state with auth state changes
 *
 * Goal: Ensure cart is always loaded and ready to use
 */

'use client';

import { useEffect, useRef } from 'react';
import { useIsAuthenticated } from '@/stores/userStore';
import { useCartStore } from '@/stores/cartStore';
import { guestCartService, authenticatedCartService } from '@/services/cart.service';

export function CartInitializer() {
  const isAuthenticated = useIsAuthenticated();
  const setItems = useCartStore((state) => state.setItems);
  const setLoading = useCartStore((state) => state.setLoading);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitializedRef.current) return;

    const initializeCart = async () => {
      setLoading(true);

      try {
        if (isAuthenticated) {
          // Load cart from server for authenticated users
          const serverCart = await authenticatedCartService.getCart();
          setItems(serverCart.items);
        } else {
          // Load cart from localStorage for guest users
          const guestCart = guestCartService.getCart();
          // Convert guest cart items to cart items format for store
          const cartItems = guestCart.items.map((item) => ({
            id: item.productId, // Use productId as temporary id for guest cart
            productId: item.productId,
            quantity: item.quantity,
            product: item.product,
          }));
          setItems(cartItems);
        }
      } catch (error) {
        console.error('[CartInitializer] Error loading cart:', error);
        // On error, just set empty cart
        setItems([]);
      } finally {
        setLoading(false);
        hasInitializedRef.current = true;
      }
    };

    initializeCart();
  }, [isAuthenticated, setItems, setLoading]);

  // This component doesn't render anything
  return null;
}

export default CartInitializer;
