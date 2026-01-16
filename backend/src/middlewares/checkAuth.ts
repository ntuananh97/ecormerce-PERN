import { env } from '@/config/env';
import { Request, Response, NextFunction } from 'express';
import { ExtendedRequest } from '@/types/express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '@/types/errors';
import { UserRole } from '@prisma/client';

/**
 * Authentication middleware
 * Validates JWT token from Authorization header and attaches user to request
 */
export const checkAuthentication = async (
  req: Request,
  _: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Get token from cookies
    const token = req.cookies[env.COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedError('Unauthorized');
    }

    // 3. Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };

    if (!decoded.userId || !decoded.email) {
      throw new UnauthorizedError('Unauthorized');
    }

    // 4. Attach user to request
    (req as ExtendedRequest).user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role as unknown as UserRole,
    };

    // 5. Continue to next middleware
    next();
  } catch (error) {
    // Handle JWT specific errors
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token. Please authenticate again.'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired. Please login again.'));
    } else {
      // Pass other errors to error handler
      next(error);
    }
  }
};
