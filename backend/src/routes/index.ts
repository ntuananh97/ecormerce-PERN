import { Router } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import checkoutRoutes from './checkout.routes';

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

// Category routes
router.use('/categories', categoryRoutes);

// Product routes
router.use('/products', productRoutes);

// Cart routes
router.use('/carts', cartRoutes);

// Checkout routes
router.use('/checkout', checkoutRoutes);

export default router;
