import { Router } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import checkoutRoutes from './checkout.routes';
import paymentRoutes from './payment.routes';
import agentRoutes from './agent.routes';
import knowledgeRoutes from './knowledge.routes';

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

// Category routes
router.use('/categories', categoryRoutes);

// Product routes
router.use('/products', productRoutes);

// Cart routes
router.use('/carts', cartRoutes);

// Checkout routes
router.use('/checkout', checkoutRoutes);

// Payment routes
router.use('/payments', paymentRoutes);

// Agent routes
router.use('/agent', agentRoutes);

// Knowledge base routes
router.use('/knowledge', knowledgeRoutes);

export default router;
