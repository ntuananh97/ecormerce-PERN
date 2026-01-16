import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { asyncHandler } from '../middlewares/errorHandler';
import { ExtendedRequest } from '@/types/express';
import { RequestWithValidatedQuery } from '../middlewares/validateQuery';

/**
 * User Controller Layer
 * Handles HTTP requests and responses for user operations
 */
export class UserController {
  /**
   * GET /api/users
   * Get all users with pagination and sorting
   * Query params: page, limit, sort, sortOrder (validated by middleware)
   */
  getAllUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Query params are already validated and transformed by validatePaginationQuery middleware
    const { page, limit, sort, sortOrder } = (req as RequestWithValidatedQuery).validatedQuery;

    const result = await userService.getAllUsers({ page, limit, sort, sortOrder });

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  });

  /**
   * GET /api/users/:id
   * Get a single user by ID
   */
  getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  });

  /**
   * GET /api/users/me
   * Get current user
   */
  getCurrentUser = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    const user = await userService.getCurrentUser(req.user!.id);
    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  });

  /**
   * PUT /api/users/me
   * Update current user profile
   */
  updateProfile = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    const user = await userService.updateProfile(req.user!.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  });

  /**
   * PUT /api/users/me/password
   * Change current user password
   */
  changePassword = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    await userService.changePassword(req.user!.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  });

  /**
   * POST /api/users
   * Create a new user
   */
  createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await userService.createUser(req.body);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  });

  /**
   * PUT /api/users/:id
   * Update an existing user
   */
  updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await userService.updateUser(id, req.body);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  });

  /**
   * PUT /api/users/:id/change-status
   * Change user status (Admin only)
   */
  changeStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await userService.changeStatus(id, req.body);

    res.status(200).json({
      success: true,
      message: 'User status changed successfully',
      data: user,
    });
  });

  /**
   * PUT /api/users/:id/delete
   * Soft delete a user (Admin only)
   */
  softDeleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await userService.softDeleteUser(id);

    res.status(200).json({
      success: true,
      message: 'User soft deleted successfully',
    });
  });

  /**
   * DELETE /api/users/:id
   * Delete a user
   */
  deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await userService.deleteUser(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  });
}

// Export singleton instance
export const userController = new UserController();
