import { IProduct } from './product.types';

// Product info included in cart item (subset of IProduct)
export type CartProductInfo = Pick<IProduct, 'id' | 'name' | 'price' | 'images' | 'stock'>;

export interface CartItem {
  id: string;           // Server-generated cart item ID
  productId: string;
  quantity: number;
  product: CartProductInfo;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

// For localStorage guest cart - derives from CartItem, omit server-generated 'id'
export type GuestCartItem = Omit<CartItem, 'id'>;

export interface GuestCart {
  items: GuestCartItem[];
}
