/**
 * Payment Service
 * Handles payment operations
 */

import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api.constants';
import type { PaginatedResponse } from '@/types/api.types';
import type {
  ICreatePaymentRequest,
  IPayment,
  IPaymentQueryParams,
  IPaymentResponse,
  IPaymentStatusResponse,
} from '@/types/payment.types';

// Response type for paginated payments (backend returns success, message, data, pagination at root level)
interface PaymentsListResponse extends PaginatedResponse<IPayment> {
  success: boolean;
  message: string;
}

/**
 * Payment Service
 */
export const paymentService = {
  /**
   * Get payment history for the authenticated user
   * @param params - Query params (pagination, sorting)
   * @returns Paginated list of payments
   */
  async getPayments(params?: IPaymentQueryParams): Promise<PaginatedResponse<IPayment>> {
    const response = await axiosInstance.get<PaymentsListResponse>(
      API_ENDPOINTS.PAYMENTS.LIST,
      { params }
    );
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  /**
   * Initialize a payment for an order
   * @param data - Payment request data (orderId, provider)
   * @returns Payment URL and payment ID
   */
  async initPayment(data: ICreatePaymentRequest): Promise<IPaymentResponse> {
    const response = await axiosInstance.post<{ success: boolean; data: IPaymentResponse }>(
      API_ENDPOINTS.PAYMENTS.CREATE,
      data
    );
    return response.data.data;
  },

  /**
   * Get payment status
   * @param paymentId - Payment ID to check
   * @returns Payment status information
   */
  async getPaymentStatus(paymentId: string): Promise<IPaymentStatusResponse> {
    const response = await axiosInstance.get<{ success: boolean; data: IPaymentStatusResponse }>(
      API_ENDPOINTS.PAYMENTS.STATUS(paymentId)
    );
    return response.data.data;
  },
};

export default paymentService;
