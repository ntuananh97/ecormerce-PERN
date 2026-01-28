/**
 * Authentication Service
 * Handles all authentication-related API calls
 * Demonstrates proper service layer pattern with strict typing
 */

import axiosInstance, { tokenManager } from '@/lib/axios';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/constants/api.constants';
import type {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from '@/types/api.types';

/**
 * Auth Service
 * All authentication operations are centralized here
 * Components should never call axios directly - always use services
 */
export const authService = {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    const { user, accessToken, refreshToken } = response.data.data;

    // Store tokens
    tokenManager.setTokens(accessToken, refreshToken);

    // Store user data
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }

    return response.data.data;
  },

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );

    const { user, accessToken, refreshToken } = response.data.data;

    // Store tokens
    tokenManager.setTokens(accessToken, refreshToken);

    // Store user data
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }

    return response.data.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Even if the API call fails, we still clear local data
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and user data
      tokenManager.clearTokens();
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await axiosInstance.get<ApiResponse<User>>(
      API_ENDPOINTS.AUTH.ME
    );

    const user = response.data.data;

    // Update stored user data
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }

    return user;
  },

  /**
   * Check if user is authenticated (client-side only)
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!tokenManager.getAccessToken();
  },

  /**
   * Get stored user data (client-side only)
   */
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      return null;
    }
  },
};

export default authService;
