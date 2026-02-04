/**
 * Cart Service
 * Handles cart operations for both guest (localStorage) and authenticated (API) users
 */

import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/constants/api.constants';
import {
  Cart,
  CartItem,
  GuestCart,
  GuestCartItem,
  CartProductInfo,
} from '@/types/cart.types';

/**
 * LocalStorage operations for guest cart
 */
const guestCartStorage = {
  get(): GuestCart {
    try {
      const cartData = localStorage.getItem(STORAGE_KEYS.GUEST_CART);
      if (!cartData) {
        return { items: [] };
      }
      return JSON.parse(cartData) as GuestCart;
    } catch (error) {
      console.error('Error reading guest cart from localStorage:', error);
      return { items: [] };
    }
  },

  set(cart: GuestCart): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving guest cart to localStorage:', error);
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.GUEST_CART);
    } catch (error) {
      console.error('Error clearing guest cart from localStorage:', error);
    }
  },
};

/**
 * Cart Service for Guest Users (localStorage)
 */
export const guestCartService = {
  /**
   * Get guest cart from localStorage
   */
  getCart(): GuestCart {
    return guestCartStorage.get();
  },

  /**
   * Add item to guest cart
   */
  addItem(productId: string, quantity: number, product: CartProductInfo): GuestCart {
    const cart = guestCartStorage.get();
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity,
        product,
      });
    }

    guestCartStorage.set(cart);
    return cart;
  },

  /**
   * Update item quantity in guest cart
   */
  updateItem(productId: string, quantity: number): GuestCart {
    const cart = guestCartStorage.get();
    const itemIndex = cart.items.findIndex((item) => item.productId === productId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
    }

    guestCartStorage.set(cart);
    return cart;
  },

  /**
   * Remove item from guest cart
   */
  removeItem(productId: string): GuestCart {
    const cart = guestCartStorage.get();
    cart.items = cart.items.filter((item) => item.productId !== productId);
    guestCartStorage.set(cart);
    return cart;
  },

  /**
   * Clear guest cart
   */
  clearCart(): void {
    guestCartStorage.clear();
  },

  /**
   * Get total item count
   */
  getItemCount(): number {
    const cart = guestCartStorage.get();
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  },
};

/**
 * Cart Service for Authenticated Users (API)
 */
export const authenticatedCartService = {
  /**
   * Get authenticated user's cart from server
   */
  async getCart(): Promise<Cart> {
    const response = await axiosInstance.get<{ success: boolean; data: Cart }>(
      API_ENDPOINTS.CART.ME
    );
    return response.data.data;
  },

  /**
   * Add item to cart
   */
  async addItem(
    productId: string,
    quantity: number,
    product: CartProductInfo
  ): Promise<Cart> {
    const response = await axiosInstance.post<{ success: boolean; data: Cart }>(
      API_ENDPOINTS.CART.ADD_ITEM,
      {
        productId,
        quantity,
        product,
      }
    );
    return response.data.data;
  },

  /**
   * Update item quantity
   */
  async updateItem(itemId: string, quantity: number): Promise<Cart> {
    const response = await axiosInstance.put<{ success: boolean; data: Cart }>(
      API_ENDPOINTS.CART.UPDATE_ITEM(itemId),
      {
        quantity,
      }
    );
    return response.data.data;
  },

  /**
   * Remove item from cart
   * Note: API only returns success/message, no cart data
   */
  async removeItem(itemId: string): Promise<void> {
    await axiosInstance.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.CART.REMOVE_ITEM(itemId)
    );
  },

  /**
   * Get total item count
   */
  async getItemCount(): Promise<number> {
    const cart = await this.getCart();
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  },
};

/**
 * Unified Cart Service
 * Automatically routes to guest or authenticated service based on auth state
 */
export const cartService = {
  /**
   * Clear local cart (used on logout)
   */
  clearLocalCart(): void {
    guestCartService.clearCart();
  },

  /**
   * Load cart from server (used on login to overwrite local state)
   */
  async loadCartFromServer(): Promise<Cart> {
    return await authenticatedCartService.getCart();
  },

  /**
   * Convert guest cart items to authenticated cart items format
   * This is useful when migrating guest cart to server after login
   */
  convertGuestItemsToCartItems(guestItems: GuestCartItem[]): Omit<CartItem, 'id'>[] {
    return guestItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      product: item.product,
    }));
  },
};
