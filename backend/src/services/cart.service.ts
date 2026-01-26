import { Prisma, ProductStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { AddItemToCartInput, UpdateCartItemQuantityInput } from '@/types/cart.types';
import { BadRequestError, ForbiddenError, NotFoundError } from '@/types/errors';

// Type for cart with items and product details
type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

/**
 * Cart Service Layer
 * Handles all business logic and database operations for carts
 */
export class CartService {

  async createCart(userId: string): Promise<CartWithItems> {
    const cart = await prisma.cart.create({
      data: {
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          }
        }
      }
    });
    return cart;
  }


  /**
   * Get or create user's cart with all items
   * @param userId - User ID
   * @returns Cart with items
   */
  async getMyCart(userId: string): Promise<CartWithItems> {
    // TODO: Implement logic
    // - Find cart by userId
    // - If cart doesn't exist, create new cart for user
    // - Include cart items with product details
    // - Return cart with items
    let cart = await prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          }
        }
      }
    })

    if (!cart) {
     cart = await this.createCart(userId);
    }
    
    return cart;
  }

  /**
   * Add item to cart
   * @param userId - User ID
   * @param data - Item data (productId, quantity)
   * @returns Updated cart
   */
  async addItemToCart(userId: string, data: AddItemToCartInput): Promise<CartWithItems> {
    const product = await prisma.product.findUnique({
      where: {
        id: data.productId,
        status: ProductStatus.active,
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        status: true,
      }
    });

    if (!product) throw new NotFoundError('Product not found');

    if (data.quantity > product.stock) throw new BadRequestError('Product out of stock');

    const cart = await this.getMyCart(userId);
    // const existingItem = cart.items.find(item => item.productId === data.productId);
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: data.productId },
    });

    if (existingItem) {
      if (existingItem.quantity + data.quantity > product.stock) throw new BadRequestError('Product out of stock');
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: data.quantity } },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId: data.productId, quantity: data.quantity },
      });
    }

    const newCart = await prisma.cart.findUniqueOrThrow({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true,
          }
        }
      }
    });

    return newCart;

    
  }

  /**
   * Update cart item quantity
   * @param userId - User ID
   * @param cartItemId - Cart item ID
   * @param data - Update data (quantity)
   * @returns Updated cart
   */
  async updateCartItem(userId: string, cartItemId: string, data: UpdateCartItemQuantityInput): Promise<CartWithItems> {
    // TODO: Implement logic
    // - Get user's cart
    // - Check if cart item exists and belongs to user's cart
    // - Check if product has enough stock for new quantity
    // - Update cart item quantity
    // - Return updated cart with items

    const userCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          where: {
            id: cartItemId,
          },
          include: {
            product: true,
          }
        }
      }
    });

    if (!userCart) throw new NotFoundError('Cart not found');

    const cartItem = userCart.items[0];

    if (!cartItem) throw new NotFoundError('Cart item not found');

    // Check stock
    const product = cartItem.product;

    if (!product) throw new NotFoundError('Product not found');

    if (data.quantity > product.stock) throw new BadRequestError('Product out of stock');

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: data.quantity },
    });

    const updatedCart = await prisma.cart.findUniqueOrThrow({
      where: { id: userCart.id },
      include: {
        items: {
          include: {
            product: true,
          }
        }
      }
    });
    return updatedCart;
  }

  /**
   * Remove item from cart
   * @param userId - User ID
   * @param cartItemId - Cart item ID
   */
  async removeItemFromCart(userId: string, cartItemId: string): Promise<void> {
    // TODO: Implement logic
    // - Get user's cart
    // - Check if cart item exists and belongs to user's cart
    // - Delete cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: {
        id: cartItemId,
        
      },
      include: {
        cart: true,
      }
    });

    // Check if cart item belongs to user
    if (cartItem?.cart.userId !== userId) throw new ForbiddenError('You do not have permission to remove this item from cart');

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return;
  }

  /**
   * Clear entire cart (remove all items)
   * @param userId - User ID
   */
  async clearCart(userId: string): Promise<void> {
    // TODO: Implement logic
    // - Get user's cart
    // - Delete all cart items
    // - Or delete entire cart
    
    return;
  }
}

// Export singleton instance
export const cartService = new CartService();
