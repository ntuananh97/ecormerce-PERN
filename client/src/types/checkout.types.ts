/**
 * Checkout & Order Type Definitions
 */

// Checkout Mode
export enum CheckoutMode {
  CART = 'CART',
  DIRECT = 'DIRECT',
}

// Order Status
export type OrderStatus = 'pending_payment' | 'paid' | 'cancelled' | 'expired';

// Checkout Item (returned from create session)
export interface ICheckoutItem {
  productId: string;
  productName: string;
  price: number;
  weight: number;
  quantity: number;
  image?: string;
  stock: number;
  total: number;
}

// Checkout Session Response
export interface ICheckoutSession {
  items: ICheckoutItem[];
  breakdown: {
    totalAmount: number;
    shippingCost: number;
    discount: number;
  };
  valid: boolean;
}

// Direct Item for DIRECT checkout mode
export interface IDirectItem {
  productId: string;
  quantity: number;
}

// Create Checkout Session Request
export interface ICreateCheckoutSessionRequest {
  mode: CheckoutMode;
  cartItemIds?: string[];
  directItems?: IDirectItem[];
  addressId?: string;
  shippingMethodId?: string;
  voucherCode?: string;
}

// Create Order Request
export interface ICreateOrderRequest {
  mode: CheckoutMode;
  cartItemIds?: string[];
  directItems?: IDirectItem[];
  idempotencyKey: string;
  addressId?: string;
  shippingMethodId?: string;
  voucherCode?: string;
  paymentMethodId?: string;
}

// Order Item (snapshot at order time)
export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
}

// Order
export interface IOrder {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: string;
  idempotencyKey: string;
  createdAt: string;
  paidAt?: string;
  cancelledAt?: string;
  items: IOrderItem[];
}

// Order Query Params
export interface IOrderQueryParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  sort?: string;
  sortOrder?: 'asc' | 'desc';
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
}
