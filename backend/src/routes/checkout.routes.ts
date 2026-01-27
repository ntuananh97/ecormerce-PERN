import { Router } from 'express';
import { checkoutController } from '../controllers/checkout.controller';
import { checkAuthentication } from '@/middlewares/checkAuth';
import { validate } from '@/middlewares/validation';
import { createCheckoutSessionSchema, createOrderSchema, validateOrderQuery } from '@/types/checkout.types';

const router = Router();

/**
 * Checkout Routes
 * All routes are prefixed with /api/checkout
 * All routes require authentication
 */

// POST /api/checkout - Create checkout session
router.post('/', checkAuthentication, validate(createCheckoutSessionSchema),
    checkoutController.createCheckoutSession);

// POST /api/checkout/create-order - Create order from cart
router.post('/create-order', checkAuthentication,
    validate(createOrderSchema),
    checkoutController.createOrder);

// GET /api/checkout/orders/:id - Get my order
router.get('/orders', checkAuthentication, validateOrderQuery, checkoutController.getMyOrders);

// GET /api/checkout/orders/:id - Get order details
// router.get('/orders/:id', checkAuthentication, checkoutController.getOrderById);

// // POST /api/checkout/payment/:orderId - Process payment for order
// router.post('/payment/:orderId', checkAuthentication, checkoutController.processPayment);

export default router;
