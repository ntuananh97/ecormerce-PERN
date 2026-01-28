import { Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import { ExtendedRequest } from '@/types/express';
import { paymentService } from '@/services/payment.service';

/**
 * Payment Controller Layer
 * Handles HTTP requests and responses for payment operations
 */
export class PaymentController {
  /**
   * POST /api/payment
   * Create payment
   */
  createPayment = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    // TODO: Implement logic
    const result = await paymentService.createPayment(req.user!.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: result,
    });
  });

  /**
   * GET /api/payment/:id/status
   * Get payment status
   */
  getPaymentStatus = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await paymentService.getPaymentStatus(req.user!.id, id);

    res.status(200).json({
      success: true,
      message: 'Payment status retrieved successfully',
      data: result,
    });
  });
}

// Export singleton instance
export const paymentController = new PaymentController();
