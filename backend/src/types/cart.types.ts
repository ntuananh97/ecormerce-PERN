import { z } from 'zod';

export const addItemToCartSchema = z.object({
    body: z.object({
        productId: z.string().uuid('Invalid product ID'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    }),
});

export const updateCartItemQuantitySchema = z.object({
    body: z.object({
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    }),
});

export type AddItemToCartInput = z.infer<typeof addItemToCartSchema>['body'];
export type UpdateCartItemQuantityInput = z.infer<typeof updateCartItemQuantitySchema>['body'];