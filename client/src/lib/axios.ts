/**
 * Axios Instance Configuration
 * Enterprise-level setup with interceptors for authentication and error handling
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_ENDPOINTS, ERROR_MESSAGES, HTTP_STATUS, STORAGE_KEYS } from '@/constants/api.constants';
import type { ApiError } from '@/types/api.types';
import Cookies from 'js-cookie';

// Base configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10000;

/**
 * Create Axios instance with default configuration
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

/**
 * Response Interceptor
 * Global error handling and token refresh logic
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Return the response data directly for cleaner service layer
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Response Error]', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }

    // Handle UNAUTHORIZED error (401)
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      // Prevent infinite retry loop
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Attempt to refresh the token via API
          // Tokens are in httpOnly cookies, no need to send anything
          await axios.post(
            `${BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
            {},
            { withCredentials: true }
          );

          // Refresh successful, retry the original request
          // Cookies will be automatically sent with the retried request
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear auth data and redirect to login
          
          return Promise.reject(new Error(ERROR_MESSAGES.UNAUTHORIZED));
        }
      }
    }

    // Return a structured error for all other cases
    return Promise.reject(formatError(error));
  }
);

/**
 * Helper: Clear authentication data
 * Only clears user data from localStorage as tokens are managed by httpOnly cookies
 */
function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  
  // Only clear user data, tokens are in httpOnly cookies
  Cookies.remove(STORAGE_KEYS.USER_INFO, { path: '/' });

}

/**
 * Helper: Format error for consistent error handling
 */
function formatError(error: AxiosError<ApiError>): ApiError {
  if (error.response?.data) {
    return error.response.data;
  }

  return {
    success: false,
    message: error.message || ERROR_MESSAGES.UNKNOWN,
    statusCode: error.response?.status,
  };
}

/**
 * Public API for managing authentication data
 * Note: Tokens are managed by httpOnly cookies on the server side
 */
export const authManager = {
  clearAuthData,
};

export default axiosInstance;
