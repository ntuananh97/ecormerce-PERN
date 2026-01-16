import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { validate } from '../middlewares/validation';
import { createUserSchema, updateUserProfileSchema, updateUserSchema, userIdSchema, changePasswordSchema, changeStatusSchema } from '../types/user.types';
import { checkAuthentication } from '../middlewares/checkAuth';
import { checkAdmin } from '../middlewares/checkRole';
import { validatePaginationQuery } from '../middlewares/validateQuery';

const router = Router();

/**
 * User Routes
 * All routes are prefixed with /api/users
 */

// GET /api/users - Get all users (Admin only)
router.get('/', checkAuthentication, checkAdmin, validatePaginationQuery, userController.getAllUsers);

// GET /api/users/me - Get current user
router.get('/me', checkAuthentication, userController.getCurrentUser);

// PUT /api/users/me - Update current user profile
router.put('/me', checkAuthentication, validate(updateUserProfileSchema), userController.updateProfile);

// PUT /api/users/me/password - Change current user password
router.put('/me/change-password', checkAuthentication, validate(changePasswordSchema), userController.changePassword);

// GET /api/users/:id - Get user by ID
router.get('/:id', checkAuthentication, checkAdmin, validate(userIdSchema), userController.getUserById);

// POST /api/users - Create new user (Admin only)
router.post('/', checkAuthentication, checkAdmin, validate(createUserSchema), userController.createUser);

// PUT /api/users/:id - Update user (Admin only)
router.put('/:id', checkAuthentication, checkAdmin, validate(updateUserSchema), userController.updateUser);

// PUT /api/users/:id/change-status - Change user status (Admin only)
router.put('/:id/change-status', checkAuthentication, checkAdmin, validate(changeStatusSchema), userController.changeStatus);

// PUT /api/users/:id/delete - Soft delete user (Admin only)
router.put('/:id/delete', checkAuthentication, checkAdmin, validate(userIdSchema), userController.softDeleteUser);

// DELETE /api/users/:id - Delete user (Admin only)
router.delete('/:id', checkAuthentication, checkAdmin, validate(userIdSchema), userController.deleteUser);

export default router;
