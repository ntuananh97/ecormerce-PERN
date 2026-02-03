/**
 * Authentication Service
 * Handles all authentication-related API calls
 * Implements "Optimistic UI with Background Revalidation" pattern
 *
 * Security Strategy:
 * - access_token: Managed by backend via HttpOnly cookies (automatic, secure)
 * - user_info: Standard cookie with non-sensitive data for SSR hydration
 */

import Cookies from 'js-cookie';
import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/constants/api.constants';
import type {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  UserInfo,
} from '@/types/api.types';

/**
 * Cookie configuration for user_info
 */
const USER_INFO_COOKIE_OPTIONS: Cookies.CookieAttributes = {
  expires: 7, // 7 days
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
};

/**
 * Helper: Extract UserInfo from full User object
 * Only includes non-sensitive data for the visible cookie
 */
function extractUserInfo(user: User): UserInfo {
  return {
    id: user.id,
    name: user.name,
 
  };
}

/**
 * Auth Service
 * All authentication operations are centralized here
 * Components should never call axios directly - always use services
 */
export const authService = {
  /**
   * Login user with email and password
   * On success:
   * 1. Backend sets HttpOnly access_token cookie automatically
   * 2. We save user_info to a standard cookie for SSR hydration
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    const { user } = response.data.data;

    // Store tokens (for backward compatibility)

    // CRITICAL: Save user_info to standard cookie for SSR hydration
    const userInfo = extractUserInfo(user);
    Cookies.set(
      STORAGE_KEYS.USER_INFO,
      JSON.stringify(userInfo),
      USER_INFO_COOKIE_OPTIONS
    );

   

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

    



   

    return response.data.data;
  },

  /**
   * Logout user
   * Clears both HttpOnly cookie (via API) and user_info cookie
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Even if the API call fails, we still clear local data
      console.error('Logout error:', error);
    } finally {
      // Remove user_info cookie
      Cookies.remove(STORAGE_KEYS.USER_INFO, { path: '/' });

      
    }
  },

  /**
   * Get current authenticated user from API
   * Used for background revalidation
   */
  async getCurrentUser(): Promise<User> {
    const response = await axiosInstance.get<ApiResponse<User>>(
      API_ENDPOINTS.AUTH.ME
    );

    const user = response.data.data;
    return user;
  },

  /**
   * Check if user is authenticated (client-side only)
   * Checks for user_info cookie presence
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!Cookies.get(STORAGE_KEYS.USER_INFO);
  },

  /**
   * Get user info from cookie (client-side only)
   */
  getUserInfoFromCookie(): UserInfo | null {
    if (typeof window === 'undefined') return null;

    const userInfoStr = Cookies.get(STORAGE_KEYS.USER_INFO);
    if (!userInfoStr) return null;

    try {
      return JSON.parse(userInfoStr) as UserInfo;
    } catch (error) {
      console.error('Failed to parse user_info cookie:', error);
      return null;
    }
  },

  /**
   * Update user_info cookie
   * Called when background revalidation finds updated data
   */
  updateUserInfoCookie(userInfo: UserInfo): void {
    Cookies.set(
      STORAGE_KEYS.USER_INFO,
      JSON.stringify(userInfo),
      USER_INFO_COOKIE_OPTIONS
    );
  },

  /**
   * Get stored user data from localStorage (client-side only)
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
