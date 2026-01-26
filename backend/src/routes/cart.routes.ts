import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { checkAuthentication } from '@/middlewares/checkAuth';
import { validate } from '@/middlewares/validation';
import { addItemToCartSchema, updateCartItemQuantitySchema } from '@/types/cart.types';

const router = Router();

/**
 * Cart Routes
 * All routes are prefixed with /api/carts
 * All routes require authentication
 */

// GET /api/carts/me - Get current user's cart
router.get('/me', checkAuthentication, cartController.getMyCart);

// POST /api/carts/items - Add item to cart
router.post('/items', checkAuthentication, 
    validate(addItemToCartSchema), cartController.addItemToCart);

// // PUT /api/carts/items/:id - Update cart item quantity
router.put('/items/:id', checkAuthentication, validate(updateCartItemQuantitySchema), cartController.updateCartItem);

// // DELETE /api/carts/items/:id - Remove item from cart
router.delete('/items/:id', checkAuthentication, cartController.removeItemFromCart);

// // DELETE /api/carts - Clear entire cart
// router.delete('/', checkAuthentication, cartController.clearCart);

export default router;
