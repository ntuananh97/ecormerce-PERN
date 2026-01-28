import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import { ExtendedRequest } from '@/types/express';
import { checkoutService } from '@/services/checkout.service';
import { RequestWithOrderQuery } from '@/types/checkout.types';

/**
 * Checkout Controller Layer
 * Handles HTTP requests and responses for checkout operations
 */
export class CheckoutController {
  /**
   * POST /api/checkout
   * Create checkout session
   */
  createCheckoutSession = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    // TODO: Implement logic
    const result = await checkoutService.createCheckoutSession(req.user!.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Checkout session created successfully',
      data: result,
    });
  });
  /**
   * POST /api/checkout/create-order
   * Create order from cart
   */
  createOrder = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    // TODO: Implement logic
    const result = await checkoutService.createOrder(req.user!.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: result,
    });
  });

  /**
   * GET /api/checkout/orders
   * Get my orders
   */
  getMyOrders = asyncHandler(async (req: RequestWithOrderQuery, res: Response): Promise<void> => {
    // TODO: Implement logic
    const result = await checkoutService.myOrders(req.user!.id, req.validatedQuery);

    res.status(200).json({
      success: true,
      message: 'My orders retrieved successfully',
      data: result,
    });
  });

  /**
   * GET /api/checkout/orders/:id
   * Get order details
   */
  getOrderById = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    // TODO: Implement logic
    const result = await checkoutService.getOrderById(req.user!.id, req.user!.role, id);

    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: result,
    });
  });

  /**
   * POST /api/checkout/payment/:orderId
   * Process payment for order
   */
  processPayment = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    const { orderId } = req.params;
    // TODO: Implement logic
    const result = await checkoutService.processPayment(req.user!.id, orderId, req.body);

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: result,
    });
  });
}

// Export singleton instance
export const checkoutController = new CheckoutController();
