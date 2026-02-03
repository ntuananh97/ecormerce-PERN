import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation';
import { createUserSchema, loginUserSchema } from '../types/user.types';
import { checkAuthentication } from '../middlewares/checkAuth';

const router = Router();

/**
 * Auth Routes
 * All routes are prefixed with /api/auth
 */

// POST /api/auth/register - Register new user
// Validates email and password format before processing
router.post('/register', validate(createUserSchema), authController.register);

// POST /api/auth/login - Login user
// Validates email and password before authentication
router.post('/login', validate(loginUserSchema), authController.login);


// POST /api/auth/logout - Logout user
router.post('/logout', authController.logout);

// POST /api/auth/refresh-token - Refresh authentication token
router.post('/refresh-token', authController.refreshToken);

// GET /api/auth/me - Get current user information
// Requires authentication
router.get('/me', checkAuthentication, authController.getCurrentUser);

export default router;
