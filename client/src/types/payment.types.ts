/**
 * Payment Type Definitions
 */

import type { OrderStatus } from './checkout.types';

// Payment Status from backend
export type PaymentStatus = 'init' | 'pending' | 'success' | 'failed';

// Payment Provider
export type PaymentProvider = 'stripe' | 'paypal' | 'vnpay';

// Create Payment Request
export interface ICreatePaymentRequest {
  orderId: string;
  provider: PaymentProvider | string;
}

// Payment Response (from POST /payments)
export interface IPaymentResponse {
  paymentUrl: string;
  paymentId: string;
}

// Payment Status Response (from GET /payments/:id/status)
export interface IPaymentStatusResponse {
  status: PaymentStatus;
  orderId: string;
  paymentId: string;
}

// Payment (from GET /payments list)
export interface IPayment {
  id: string;
  orderId: string;
  status: PaymentStatus;
  amount: string;
  provider: string;
  createdAt: string;
  order: {
    id: string;
    status: OrderStatus;
  };
}

// Payment Query Params (for GET /payments)
export interface IPaymentQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  sortOrder?: 'asc' | 'desc';
}
