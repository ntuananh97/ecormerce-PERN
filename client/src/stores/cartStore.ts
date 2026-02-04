/**
 * Cart Store (Zustand)
 * Global state management for shopping cart
 * Supports both guest (localStorage) and authenticated (server) carts
 */

import { create } from 'zustand';
import type { CartItem } from '@/types/cart.types';

interface CartState {
  // Cart items
  items: CartItem[];

  // Loading state
  isLoading: boolean;

  // Actions
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateItem: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Cart Store
 * Used for global cart state across the application
 */
export const useCartStore = create<CartState>((set) => ({
  items: [],
  isLoading: true,

  setItems: (items) =>
    set({
      items,
    }),

  addItem: (item) =>
    set((state) => {
      const existingItemIndex = state.items.findIndex(
        (i) => i.productId === item.productId
      );

      if (existingItemIndex > -1) {
        // Update existing item quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity,
        };
        return { items: updatedItems };
      } else {
        // Add new item
        return { items: [...state.items, item] };
      }
    }),

  updateItem: (itemId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return {
          items: state.items.filter((item) => item.id !== itemId),
        };
      }

      // Update item quantity
      const updatedItems = state.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      return { items: updatedItems };
    }),

  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    })),

  clearCart: () =>
    set({
      items: [],
    }),

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),
}));

/**
 * Selector hooks for common use cases
 */

// Get all cart items
export const useCartItems = () => useCartStore((state) => state.items);

// Get cart item count
export const useCartItemCount = () =>
  useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );

// Get cart total price
export const useCartTotal = () =>
  useCartStore((state) =>
    state.items.reduce((total, item) => {
      const price = parseFloat(item.product.price);
      return total + price * item.quantity;
    }, 0)
  );

// Get cart loading state
export const useCartLoading = () => useCartStore((state) => state.isLoading);
