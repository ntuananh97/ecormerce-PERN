import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { checkAuthentication } from '@/middlewares/checkAuth';
import { validate } from '@/middlewares/validation';
import { createPaymentSchema } from '@/types/payment.types';

const router = Router();

/**
 * Payment Routes
 * All routes are prefixed with /api/payment
 */

// POST /api/payment - Create payment
router.post('/', checkAuthentication, validate(createPaymentSchema), paymentController.createPayment);

// GET /api/payment/:id/status - Get payment status
router.get('/:id/status', checkAuthentication, paymentController.getPaymentStatus);

// TODO: Need webhook to update payment status

export default router;
