import { z } from 'zod';

export const createCategorySchema = z.object({
    body: z.object({
        name: z.string().trim().min(2, 'Name must be at least 2 characters'),
        description: z.string().trim().optional(),
    }),
});

export const categoryIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid ID'),
    }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];

