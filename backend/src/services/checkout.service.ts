import { CheckoutMode, CreateCheckoutSessionInput, CreateOrderInput, ICheckoutItem, ICheckoutSessionResponse, IOrderParams, OrderEventType } from '@/types/checkout.types';
import { prisma } from '../config/database';
import { BadRequestError } from '@/types/errors';
import { Order, OrderStatus, Prisma, ProductStatus } from '@prisma/client';
import { IPaginatedResponse } from '@/types/common';


/**
 * Checkout Service Layer
 * Handles all business logic and database operations for checkout
 */
export class CheckoutService {
  /**
   * Create checkout session
   * @param userId - User ID
   * @param data - checkout session data (mode, cartItemIds, directItems)
   * @returns Checkout session response
   */
  async createCheckoutSession(userId: string, data: CreateCheckoutSessionInput): Promise<ICheckoutSessionResponse> {
    // Resolve items from cart or direct items
    let checkoutItems: ICheckoutItem[] = [];

    if (data.mode === CheckoutMode.CART) {
      if (!data.cartItemIds) throw new BadRequestError('Cart item IDs are required');
      // Get cart items  from user's cart
      // Validate cart items are not empty
      // Normalize cart items to ICheckoutItem[]
      const cartItems = await prisma.cartItem.findMany({
        where: {
          id: {in: data.cartItemIds},
          cart: {
            userId
          },
          product: {
            status: ProductStatus.active,
          }
        },
        include: {
          product: true
        }
      });

      if (cartItems.length === 0) throw new BadRequestError('Cart items not found');
      checkoutItems = cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price.toNumber(),
        weight: 0, // TODO: Implement weight calculation
        quantity: item.quantity,
        stock: item.product.stock,
        total: item.product.price.toNumber() * item.quantity,
      }));
    }
    else {
      if (!data.directItems) throw new BadRequestError('Direct items are required');
      const products = await prisma.product.findMany({
        where: {
          id: {in: data.directItems.map(item => item.productId)},
          status: ProductStatus.active,
        }
      });

      if (products.length === 0) throw new BadRequestError('Products not found');
      checkoutItems = data.directItems.map(item => {
        const product = products.find(product => product.id === item.productId);

        if (!product) throw new BadRequestError(`Product ID ${item.productId} not found`);

        return ({
          productId: item.productId,
          productName: product.name,
          price: product.price.toNumber(),
          weight: 0, // TODO: Implement weight calculation
          quantity: item.quantity,
          stock: product.stock,
          total: product.price.toNumber() * item.quantity,
        })
      });
    }

    // Check stock
    checkoutItems.forEach(item => {
      if (item.quantity > item.stock) throw new BadRequestError(`Product ${item.productName} out of stock`);
    });

    // Calculate total amount
    const shippingCost = 0; // TODO: Implement shipping cost calculation
    const discount = 0; // TODO: Implement discount calculation
    const totalAmount = (checkoutItems.reduce((acc, item) => acc + item.total, 0) + shippingCost) - discount;

    // Return response
    return {
      items: checkoutItems,
      breakdown: {
        totalAmount,
        shippingCost,
        discount,
      },
      valid: true
    };

  }
  /**
   * Create order from user's cart
   * @param userId - User ID
   * @param data - Order data (idempotencyKey, etc.)
   * @returns Created order with items
   */
  async createOrder(userId: string, data: CreateOrderInput): Promise<any> {
    // Check idempotency key
    const existingOrder = await prisma.order.findUnique({
      where: {
        userId_idempotencyKey: {
          userId,
          idempotencyKey: data.idempotencyKey,
        }
      }
    });
    if (existingOrder) throw new BadRequestError('Order already exists');

    // Start transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      // Phase 1: Prepare data
      let itemsToBuy: {productId: string, quantity: number}[] = []
      if (data.mode === CheckoutMode.CART) {
        // Check cartItemIds are in user's cart 
        const cartItems = await tx.cartItem.findMany({
          where: {
            id: {in: data.cartItemIds},
            cart: {
              userId
            },
          },
          select: { productId: true, quantity: true }
        })
        itemsToBuy = cartItems.map(item => ({ productId: item.productId, quantity: item.quantity }));
      }
      else {
        itemsToBuy = data.directItems?.map(item => ({ productId: item.productId, quantity: item.quantity })) || [];
      }
      if (itemsToBuy.length === 0) throw new BadRequestError('No items to buy');

      // Phase 2: Lock and stock check
      // Sort Id to avoid dead lock
      itemsToBuy.sort((a, b) => a.productId.localeCompare(b.productId));
      let subTotal = 0;
      const orderItemsData = []

      for (const item of itemsToBuy) {
        // Use raw query for row-level locking (SELECT FOR UPDATE)
        const products = await tx.$queryRaw<Array<{id: string, name: string, price: number, images: string, stock: number}>>`
          SELECT id, name, price, images, stock FROM "products" WHERE id = ${item.productId} FOR UPDATE
        `;
        const product = products[0];
        if (!product) throw new BadRequestError(`Product ${item.productId} not found`);
        if (product.stock < item.quantity) throw new BadRequestError(`Product ${item.productId} out of stock`);

        // Calculate total price
        const lineTotal = Number(product.price) * item.quantity;
        subTotal += lineTotal;
        orderItemsData.push({
          productId: item.productId,
          productName: product.name,
          unitPrice: product.price,
          quantity: item.quantity,
          lineTotal: lineTotal,
        });

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Phase 3: Calculate fee
      const shippingCost = 0; // TODO: Implement shipping cost calculation
      const discount = 0; // TODO: Implement discount calculation
      const totalAmount = subTotal + shippingCost - discount;

      // Phase 4: Create order
      const order = await tx.order.create({
        data: {
          userId,
          idempotencyKey: data.idempotencyKey,
          status: OrderStatus.pending_payment,
          totalAmount,
          items: {
            create: orderItemsData,
          },
          events: {
            create: {
              eventType: OrderEventType.ORDER_CREATED,
              metadata: {
                source: data.mode
              }
            }
          }
        },
      });

      // Phase 5: Clean up cart items
      if (data.mode === CheckoutMode.CART) {
        await tx.cartItem.deleteMany({
          where: {
            id: {in: data.cartItemIds},
          }
        });
      }

      return order;

      
    });


    return newOrder;
  }

  /**
   * Get order details by ID
   * @param userId - User ID
   * @param orderId - Order ID
   * @returns Order with items and payments
   */
  async getOrderById(userId: string, orderId: string): Promise<any> {
    // TODO: Implement logic
    // - Find order by ID
    // - Verify order belongs to user
    // - Include order items, payments, and events
    // - Return order details

    return {};
  }

  /**
   * Get my orders
   * @param userId - User ID
   * @returns My orders
   */
  async myOrders(userId: string, query: IOrderParams): Promise<IPaginatedResponse<Order>> {
    // TODO: Implement logic
    const { page, limit, sort, sortOrder, status, startDate, endDate } = query;
    const skip = (page - 1) * limit;
    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sort]: sortOrder,
    };
    const where: Prisma.OrderWhereInput = {
      userId,
    };
    if (status) where.status = status;
    if (startDate) where.createdAt = { gte: new Date(startDate) };
    if (endDate) where.createdAt = { lte: new Date(endDate) };
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Process payment for an order
   * @param userId - User ID
   * @param orderId - Order ID
   * @param data - Payment data (provider, amount, etc.)
   * @returns Payment record
   */
  async processPayment(userId: string, orderId: string, data: any): Promise<any> {
    // TODO: Implement logic
    // - Find order by ID
    // - Verify order belongs to user
    // - Verify order status is pending_payment
    // - Create payment record with status 'init'
    // - Call payment provider API
    // - Update payment status based on provider response
    // - If payment success, update order status to 'paid' and set paidAt
    // - Create order event (PAYMENT_CONFIRMED or PAYMENT_FAILED)
    // - Return payment result

    return {};
  }
}

// Export singleton instance
export const checkoutService = new CheckoutService();
