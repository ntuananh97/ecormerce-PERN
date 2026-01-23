import { z } from "zod";
import { Request } from "express";
import { IPaginatedParams } from "./common";
import { createQueryValidator } from "@/middlewares/validateQuery";
import { ProductStatus } from "@prisma/client";

export interface IProductParams extends IPaginatedParams {
    category?: string;
    name?: string
}

/**
 * Request type with product-specific validated query
 */
export interface RequestWithProductQuery extends Request {
    validatedQuery: IProductParams;
}

// Zod schema for product query parameters
const productQuerySchema = z.object({
    category: z.string().optional(),
    name: z.string().optional(),
});

// Export the validator middleware for product queries
export const validateProductQuery = createQueryValidator({
    customSchema: productQuerySchema,
});

export const createProductSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.number().min(0),
        stock: z.number().min(0),
        categoryId: z.string().optional(),
        images: z.string().optional(),
    }),
});

export const updateProductSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.number().min(0).optional(),
        categoryId: z.string().optional(),
        images: z.string().optional(),
        status: z.nativeEnum(ProductStatus).optional(),
    }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];