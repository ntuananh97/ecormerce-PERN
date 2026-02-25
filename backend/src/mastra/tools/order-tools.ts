import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { OrderStatus } from '@prisma/client';

/**
 * Tool: getMyOrders
 * Retrieves the authenticated user's order list from the database.
 * Accepts an optional status filter and returns a summary of each order.
 */
export const getMyOrders = createTool({
  id: 'get-my-orders',
  description:
    'Lấy danh sách đơn hàng của người dùng hiện tại. Có thể lọc theo trạng thái đơn hàng (pending_payment, paid, cancelled, expired). Trả về thông tin tóm tắt mỗi đơn hàng bao gồm mã đơn, trạng thái, tổng tiền, ngày tạo và số lượng sản phẩm.',
  inputSchema: z.object({
    status: z
      .enum(['pending_payment', 'paid', 'cancelled', 'expired'])
      .optional()
      .describe('Lọc đơn hàng theo trạng thái (không bắt buộc)'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(20)
      .optional()
      .default(10)
      .describe('Số lượng đơn hàng tối đa trả về (mặc định: 10, tối đa: 20)'),
  }),
  outputSchema: z.object({
    orders: z.array(
      z.object({
        id: z.string(),
        status: z.string(),
        totalAmount: z.number(),
        itemCount: z.number(),
        createdAt: z.string(),
        paidAt: z.string().nullable(),
      }),
    ),
    total: z.number(),
  }),
  execute: async (inputData, context) => {
    const userId = context?.requestContext?.get('userId') as string | undefined;

    if (!userId) {
      return { orders: [], total: 0 };
    }

    const where = {
      userId,
      ...(inputData.status ? { status: inputData.status as OrderStatus } : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        take: inputData.limit ?? 10,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { items: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((order) => ({
        id: order.id,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        itemCount: order._count.items,
        createdAt: order.createdAt.toISOString(),
        paidAt: order.paidAt ? order.paidAt.toISOString() : null,
      })),
      total,
    };
  },
});

/**
 * Tool: getOrderDetail
 * Retrieves full details of a specific order by ID.
 * Verifies the order belongs to the authenticated user before returning data.
 */
export const getOrderDetail = createTool({
  id: 'get-order-detail',
  description:
    'Lấy thông tin chi tiết của một đơn hàng cụ thể theo mã đơn hàng (ID). Trả về đầy đủ thông tin: danh sách sản phẩm, đơn giá, số lượng, tổng tiền từng dòng, trạng thái thanh toán và lịch sử đơn hàng. Chỉ có thể xem đơn hàng thuộc về người dùng hiện tại.',
  inputSchema: z.object({
    orderId: z.string().describe('Mã ID của đơn hàng cần tra cứu'),
  }),
  outputSchema: z.object({
    found: z.boolean(),
    order: z
      .object({
        id: z.string(),
        status: z.string(),
        totalAmount: z.number(),
        createdAt: z.string(),
        paidAt: z.string().nullable(),
        cancelledAt: z.string().nullable(),
        items: z.array(
          z.object({
            id: z.string(),
            productName: z.string(),
            unitPrice: z.number(),
            quantity: z.number(),
            lineTotal: z.number(),
          }),
        ),
        payments: z.array(
          z.object({
            id: z.string(),
            status: z.string(),
            amount: z.number(),
            provider: z.string(),
            createdAt: z.string(),
          }),
        ),
      })
      .nullable(),
    error: z.string().optional(),
  }),
  execute: async (inputData, context) => {
    const userId = context?.requestContext?.get('userId') as string | undefined;

    if (!userId) {
      return { found: false, order: null, error: 'No user found.' };
    }

    const order = await prisma.order.findUnique({
      where: { id: inputData.orderId },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!order) {
      return { found: false, order: null, error: `Order not found with ID: ${inputData.orderId}` };
    }

    if (order.userId !== userId) {
      return { found: false, order: null, error: 'You do not have permission to view this order.' };
    }

    return {
      found: true,
      order: {
        id: order.id,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt.toISOString(),
        paidAt: order.paidAt ? order.paidAt.toISOString() : null,
        cancelledAt: order.cancelledAt ? order.cancelledAt.toISOString() : null,
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          unitPrice: Number(item.unitPrice),
          quantity: item.quantity,
          lineTotal: Number(item.lineTotal),
        })),
        payments: order.payments.map((payment) => ({
          id: payment.id,
          status: payment.status,
          amount: Number(payment.amount),
          provider: payment.provider,
          createdAt: payment.createdAt.toISOString(),
        })),
      },
    };
  },
});
