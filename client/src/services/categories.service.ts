/**
 * Categories Service
 * Handles all category-related API calls
 */

import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api.constants';
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from '@/types/api.types';
import type { ICategory } from '@/types/product.types';

/**
 * Categories Service
 */
export const categoriesService = {
  /**
   * Get paginated list of categories
   */
  async getCategories(
    params?: PaginationParams
  ): Promise<PaginatedResponse<ICategory>> {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<ICategory>>>(
      API_ENDPOINTS.CATEGORIES.LIST,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get single category by ID
   */
  async getCategory(id: string | number): Promise<ICategory> {
    const response = await axiosInstance.get<ApiResponse<ICategory>>(
      API_ENDPOINTS.CATEGORIES.DETAIL(id)
    );
    return response.data.data;
  },
};

export default categoriesService;
