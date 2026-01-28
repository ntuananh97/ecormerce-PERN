/**
 * Products Service
 * Handles all product-related API calls
 * Example service to demonstrate CRUD operations
 */

import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api.constants';
import type {
  ApiResponse,
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types/api.types';

/**
 * Products Service
 * Demonstrates complete CRUD operations with proper typing
 */
export const productsService = {
  /**
   * Get paginated list of products
   */
  async getProducts(
    params?: PaginationParams & { search?: string; category?: string }
  ): Promise<PaginatedResponse<Product>> {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Product>>>(
      API_ENDPOINTS.PRODUCTS.LIST,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get single product by ID
   */
  async getProduct(id: string | number): Promise<Product> {
    const response = await axiosInstance.get<ApiResponse<Product>>(
      API_ENDPOINTS.PRODUCTS.DETAIL(id)
    );
    return response.data.data;
  },

  /**
   * Create new product
   */
  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await axiosInstance.post<ApiResponse<Product>>(
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
    data: UpdateProductRequest
  ): Promise<Product> {
    const response = await axiosInstance.put<ApiResponse<Product>>(
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
