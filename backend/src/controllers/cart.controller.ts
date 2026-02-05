import { Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import { ExtendedRequest } from '@/types/express';
import { cartService } from '@/services/cart.service';

/**
 * Cart Controller Layer
 * Handles HTTP requests and responses for cart operations
 */
export class CartController {
  /**
   * GET /api/carts/me
   * Get current user's cart with items
   */
  getMyCart = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    // TODO: Implement logic
    const cart = await cartService.getMyCart(req.user!.id);

    res.status(200).json({
      success: true,
      message: 'Cart retrieved successfully',
      data: cart,
    });
  });

  /**
   * POST /api/carts/items
   * Add item to cart
   */
  addItemToCart = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    // TODO: Implement logic
    const cart = await cartService.addItemToCart(req.user!.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: cart,
    });
  });

  /**
   * PUT /api/carts/items/:id
   * Update cart item quantity
   */
  updateCartItem = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    // TODO: Implement logic
    const cart = await cartService.updateCartItem(req.user!.id, id, req.body);

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      data: cart,
    });
  });

  /**
   * DELETE /api/carts/items/:id
   * Remove item from cart
   */
  removeItemFromCart = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    // TODO: Implement logic
    await cartService.removeItemFromCart(req.user!.id, id);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
    });
  });

  /**
   * DELETE /api/carts
   * Clear entire cart
   */
  clearCart = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    // TODO: Implement logic
    await cartService.clearCart(req.user!.id);

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
    });
  });
}

// Export singleton instance
export const cartController = new CartController();
