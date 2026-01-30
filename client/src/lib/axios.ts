/**
 * Axios Instance Configuration
 * Enterprise-level setup with interceptors for authentication and error handling
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_ENDPOINTS, ERROR_MESSAGES, HTTP_STATUS, STORAGE_KEYS } from '@/constants/api.constants';
import type { ApiError, ApiResponse } from '@/types/api.types';

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
 * Request Interceptor
 * Attaches authentication token to every request
 */
// axiosInstance.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     // Get token from localStorage (you can also use cookies or other storage)
//     const token = getAccessToken();

//     // Attach token to Authorization header if available
//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     // Log request in development
//     if (process.env.NODE_ENV === 'development') {
//       console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
//         params: config.params,
//         data: config.data,
//       });
//     }

//     return config;
//   },
//   (error: AxiosError) => {
//     // Handle request error
//     console.error('[API Request Error]', error);
//     return Promise.reject(error);
//   }
// );

/**
 * Response Interceptor
 * Global error handling and token refresh logic
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

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

    // Handle different error status codes
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case HTTP_STATUS.UNAUTHORIZED:
          // Token expired - attempt to refresh
          if (!originalRequest._retry) {
            originalRequest._retry = true;

            try {
              // Attempt to refresh the token
              const newToken = await refreshAccessToken();
              
              if (newToken && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);
              }
            } catch (refreshError) {
              // Refresh failed - clear auth and redirect to login
              clearAuthData();
              
              // Redirect to login (only on client-side)
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
              
              return Promise.reject(new Error(ERROR_MESSAGES.UNAUTHORIZED));
            }
          }
          break;

        case HTTP_STATUS.FORBIDDEN:
          // User doesn't have permission
          console.error(ERROR_MESSAGES.FORBIDDEN);
          break;

        case HTTP_STATUS.NOT_FOUND:
          console.error(ERROR_MESSAGES.NOT_FOUND);
          break;

        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        case HTTP_STATUS.BAD_GATEWAY:
        case HTTP_STATUS.SERVICE_UNAVAILABLE:
          console.error(ERROR_MESSAGES.SERVER_ERROR);
          break;
      }
    } else if (error.code === 'ECONNABORTED') {
      // Request timeout
      console.error(ERROR_MESSAGES.TIMEOUT);
    } else if (error.message === 'Network Error') {
      // Network error
      console.error(ERROR_MESSAGES.NETWORK_ERROR);
    }

    // Return a structured error
    return Promise.reject(formatError(error));
  }
);

/**
 * Helper: Get access token from storage
 */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Helper: Get refresh token from storage
 */
function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Helper: Refresh access token
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post<ApiResponse<{ accessToken: string }>>(
      `${BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
      { refreshToken },
      { withCredentials: true }
    );

    const newAccessToken = response.data.data.accessToken;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
    }

    return newAccessToken;
  } catch (error) {
    console.error('[Token Refresh Failed]', error);
    throw error;
  }
}

/**
 * Helper: Clear authentication data
 */
function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
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
 * Public API for managing tokens (used by auth service)
 */
export const tokenManager = {
  getAccessToken,
  getRefreshToken,
  setTokens: (accessToken: string, refreshToken: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },
  clearTokens: clearAuthData,
};

export default axiosInstance;
