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

  /**
   * GET /api/payments
   * Get payment history for the authenticated user
   */
  getPayments = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const result = await paymentService.getPayments(req.user!.id, {
      page,
      limit,
      sort,
      sortOrder,
    });

    res.status(200).json({
      success: true,
      message: 'Payments retrieved successfully',
      ...result,
    });
  });
}

// Export singleton instance
export const paymentController = new PaymentController();
