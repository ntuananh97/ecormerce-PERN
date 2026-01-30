/**
 * Products Service
 * Handles all product-related API calls
 * Example service to demonstrate CRUD operations
 */

import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api.constants';
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from '@/types/api.types';
import { ICreateProductRequest, IProduct, IUpdateProductRequest } from '@/types/product.types';

/**
 * Products Service
 * Demonstrates complete CRUD operations with proper typing
 */
export const productsService = {
  /**
   * Get paginated list of products
   */
  async getProducts(
    params?: PaginationParams & { name?: string; category?: string }
  ): Promise<PaginatedResponse<IProduct>> {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<IProduct>>>(
      API_ENDPOINTS.PRODUCTS.LIST,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get single product by ID
   */
  async getProduct(id: string | number): Promise<IProduct> {
    const response = await axiosInstance.get<ApiResponse<IProduct>>(
      API_ENDPOINTS.PRODUCTS.DETAIL(id)
    );
    return response.data.data;
  },

  /**
   * Create new product
   */
  async createProduct(data: ICreateProductRequest): Promise<IProduct> {
    const response = await axiosInstance.post<ApiResponse<IProduct>>(
      API_ENDPOINTS.PRODUCTS.CREATE,
      data
    );
    return response.data.data;
  },

  /**
   * Update existing product
   */
  async updateProduct(
    id: string | number,
    data: IUpdateProductRequest
  ): Promise<IProduct> {
    const response = await axiosInstance.put<ApiResponse<IProduct>>(
      API_ENDPOINTS.PRODUCTS.UPDATE(id),
      data
    );
    return response.data.data;
  },

  /**
   * Delete product
   */
  async deleteProduct(id: string | number): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  },
};

export default productsService;
