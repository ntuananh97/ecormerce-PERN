/**
 * Checkout Service
 * Handles checkout and order operations
 */

import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api.constants';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type {
  ICheckoutSession,
  ICreateCheckoutSessionRequest,
  ICreateOrderRequest,
  IOrder,
  IOrderQueryParams,
} from '@/types/checkout.types';

/**
 * Checkout Service
 */
export const checkoutService = {
  /**
   * Create a checkout session
   * Validates items and returns breakdown
   */
  async createSession(data: ICreateCheckoutSessionRequest): Promise<ICheckoutSession> {
    const response = await axiosInstance.post<ApiResponse<ICheckoutSession>>(
      API_ENDPOINTS.CHECKOUT.CREATE_SESSION,
      data
    );
    return response.data.data;
  },

  /**
   * Create an order from checkout session
   */
  async createOrder(data: ICreateOrderRequest): Promise<IOrder> {
    const response = await axiosInstance.post<ApiResponse<IOrder>>(
      API_ENDPOINTS.CHECKOUT.CREATE_ORDER,
      data
    );
    return response.data.data;
  },

  /**
   * Get user's orders (paginated)
   */
  async getOrders(params?: IOrderQueryParams): Promise<PaginatedResponse<IOrder>> {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<IOrder>>>(
      API_ENDPOINTS.CHECKOUT.ORDERS,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get order details by ID
   */
  async getOrderDetail(orderId: string): Promise<IOrder> {
    const response = await axiosInstance.get<ApiResponse<IOrder>>(
      API_ENDPOINTS.CHECKOUT.ORDER_DETAIL(orderId)
    );
    return response.data.data;
  },
};

export default checkoutService;
