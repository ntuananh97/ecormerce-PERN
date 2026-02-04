import { z } from "zod";

export const createPaymentSchema = z.object({
    body: z.object({
        orderId: z.string().uuid('Invalid order ID'),
        provider: z.string().trim().min(2, 'Provider must be at least 2 characters'),
    }),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>['body'];

// Get payments query params
export interface IPaymentParams {
    page: number;
    limit: number;
    sort: string;
    sortOrder: 'asc' | 'desc';
}
