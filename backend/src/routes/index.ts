import { Router } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';

const router = Router();

/**
 * Main API Routes
 * All routes are prefixed with /api
 */

// Health check endpoint
router.get('/health', (_, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Project routes
router.use('/projects', projectRoutes);

// Task routes
router.use('/tasks', taskRoutes);

export default router;
