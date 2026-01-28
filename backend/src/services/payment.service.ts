import { CreatePaymentInput } from '@/types/payment.types';
import { prisma } from '../config/database';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { BadRequestError, NotFoundError } from '@/types/errors';

/**
 * Payment Service Layer
 * Handles all business logic and database operations for payment
 */
export class PaymentService {
  /**
   * Create payment
   * @param userId - User ID
   * @param data - Payment data (orderId, provider, amount, etc.)
   * @returns Created payment record
   */
  async createPayment(userId: string, data: CreatePaymentInput): Promise<{ paymentUrl: string, paymentId: string }> {
    const order = await prisma.order.findUnique({
      where: {
        id: data.orderId,
        userId,
      }
    });

    if (!order) throw new NotFoundError('Order not found');
    if (order.status !== OrderStatus.pending_payment) throw new BadRequestError('Order is not pending payment');

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        status: PaymentStatus.init,
        provider: data.provider,
        amount: order.totalAmount,
      },
    });

    const paymentUrl = "" // TODO: Implement payment URL

    return { paymentUrl, paymentId: payment.id };
  }

  /**
   * Get payment status
   * @param paymentId - Payment ID
   * @returns Payment record with current status
   */
  async getPaymentStatus(userId: string, paymentId: string): Promise<{
    status: PaymentStatus;
    orderId: string;
    paymentId: string;
  }> {
    const payment = await prisma.payment.findUnique({
      where: {
        id: paymentId,
        order: {
          userId,
        },
      },
      select: {
        status: true,
        orderId: true,
        id: true,
      },
    });

    if (!payment) throw new NotFoundError('Payment not found');

    return {
      status: payment.status,
      orderId: payment.orderId,
      paymentId: payment.id,
    };
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
