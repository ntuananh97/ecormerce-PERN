/**
 * Global API Type Definitions
 * Centralized types for API requests and responses
 */

// Base API Response Structure
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Error Response Structure
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

/**
 * User info stored in the visible cookie for SSR hydration
 * Contains only non-sensitive data for UI persistence
 */
export interface UserInfo {
  id: string;
  name: string;
}


