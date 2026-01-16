import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import { authService } from '../services/auth.service';
import { env } from '../config/env';

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
  private getCookieOptions() {
    // Parse JWT_EXPIRES_IN (e.g., "7d", "24h") to milliseconds
    const expiresIn = env.JWT_EXPIRES_IN;
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
    res.cookie(env.COOKIE_NAME, result.token, this.getCookieOptions());

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

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  });
}

// Export singleton instance
export const authController = new AuthController();
