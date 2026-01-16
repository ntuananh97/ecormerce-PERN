import { Request, Response, NextFunction } from 'express';
import { ExtendedRequest } from '@/types/express';
import { ForbiddenError, UnauthorizedError } from '@/types/errors';
import { UserRole } from '@prisma/client';

/**
 * Role-based authorization middleware
 * Checks if the authenticated user has one of the required roles
 * 
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @returns Express middleware function
 * 
 * @example
 * // Only admins can access
 * router.get('/admin-only', checkAuthentication, checkRole([UserRole.admin]), controller);
 * 
 * @example
 * // Both admins and users can access
 * router.get('/all-users', checkAuthentication, checkRole([UserRole.admin, UserRole.user]), controller);
 */
export const checkRole = (allowedRoles: UserRole[]) => {
  return async (
    req: Request,
    _: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Get user from request (set by checkAuthentication middleware)
      const user = (req as ExtendedRequest).user;

      // Check if user exists on request
      if (!user) {
        throw new UnauthorizedError('Authentication required');
      }

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(user.role)) {
        throw new ForbiddenError(
          `Access denied. Required role: ${allowedRoles.join(' or ')}`
        );
      }

      // User has required role, continue to next middleware
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Convenience middleware to check if user is an admin
 * Shorthand for checkRole([UserRole.admin])
 */
export const checkAdmin = checkRole([UserRole.admin]);

/**
 * Convenience middleware to allow both admin and user roles
 * Shorthand for checkRole([UserRole.admin, UserRole.user])
 */
export const checkAdminOrUser = checkRole([UserRole.admin, UserRole.user]);
