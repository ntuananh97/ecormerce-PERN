import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import { authService } from '../services/auth.service';
import { env } from '../config/env';
import { ExtendedRequest } from '../types/express';
import { UnauthorizedError } from '@/types/errors';

/**
 * Auth Controller Layer
 * Handles HTTP requests and responses for authentication operations
 */
export class AuthController {
  /**
   * Helper function to get base cookie options
   * Returns secure cookie configuration (without maxAge)
   */
  private getBaseCookieOptions() {
    return {
      httpOnly: true, // Ngăn JavaScript truy cập cookie (bảo vệ khỏi XSS)
      secure: env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS trong production
      sameSite: 'lax' as const, // Ngăn CSRF attacks
      path: '/', // Cookie available cho toàn bộ domain
    };
  }

  /**
   * Helper function to get cookie options for setting cookie
   * Returns secure cookie configuration with maxAge
   */
  private getCookieOptions(expiresIn: string) {
    // Parse JWT_EXPIRES_IN (e.g., "7d", "24h") to milliseconds
    let maxAge = 7 * 24 * 60 * 60 * 1000; // Default: 7 days in milliseconds

    if (expiresIn.endsWith('d')) {
      maxAge = parseInt(expiresIn) * 24 * 60 * 60 * 1000;
    } else if (expiresIn.endsWith('h')) {
      maxAge = parseInt(expiresIn) * 60 * 60 * 1000;
    } else if (expiresIn.endsWith('m')) {
      maxAge = parseInt(expiresIn) * 60 * 1000;
    }

    return {
      ...this.getBaseCookieOptions(),
      maxAge, // Thời gian sống của cookie (milliseconds)
    };
  }

  /**
   * POST /api/auth/register
   * Register a new user
   */
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // TODO: Implement registration logic
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  });

  /**
   * POST /api/auth/login
   * Login user and return authentication token
   */
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.login(req.body);

    // Set token in httpOnly cookie với các options bảo mật
    res.cookie(env.COOKIE_NAME, result.token, this.getCookieOptions(env.JWT_EXPIRES_IN));
    res.cookie(env.RT_COOKIE_NAME, result.refreshToken, this.getCookieOptions(env.RT_EXPIRES_IN));

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  });

  /**
   * POST /api/auth/logout
   * Logout user and invalidate token
   */
  logout = asyncHandler(async (_: Request, res: Response): Promise<void> => {
    // Clear the authentication cookie với options giống hệt lúc set cookie
    res.clearCookie(env.COOKIE_NAME, this.getBaseCookieOptions());
    res.clearCookie(env.RT_COOKIE_NAME, this.getBaseCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  });

  /**
   * POST /api/auth/refresh-token
   * Refresh authentication token
   */
  refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // TODO: Implement refresh token logic
    const refreshToken = req.cookies[env.RT_COOKIE_NAME];
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token not found');
    }
    const { accessToken } = await authService.refreshToken({ refreshToken });
    res.cookie(env.COOKIE_NAME, accessToken, this.getCookieOptions(env.JWT_EXPIRES_IN));


    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
    });
  });

  /**
   * GET /api/auth/me
   * Get current authenticated user information
   */
  getCurrentUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const extReq = req as ExtendedRequest;
    const userId = extReq.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const user = await authService.getCurrentUser(userId);

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  });
}

// Export singleton instance
export const authController = new AuthController();
