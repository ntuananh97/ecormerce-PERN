import { createQueryValidator } from "@/middlewares/validateQuery";
import { OrderStatus } from "@prisma/client";
import z from "zod";
import { ExtendedRequest } from "./express";
import { IPaginatedParams } from "./common";

export enum CheckoutMode {
    CART = "CART",
    DIRECT = "DIRECT",
}


export interface ICheckoutItem {
    productId: string;
    productName: string;
    price: number;       // Product price from DB (Source of Truth)
    weight: number;      // Used to calculate shipping
    quantity: number;    // Taken from request or cart
    image?: string;
    stock: number;
    total: number;       // product price * quantity
}

export interface ICheckoutSessionResponse {
    items: ICheckoutItem[];
    breakdown: {
        totalAmount: number;
        shippingCost: number;
        discount: number;
    };
    valid: boolean; // Allow create order
}

export enum OrderEventType {
    ORDER_CREATED = "ORDER_CREATED",
    ORDER_PAID = "ORDER_PAID",
    ORDER_CANCELLED = "ORDER_CANCELLED",
    ORDER_EXPIRED = "ORDER_EXPIRED",
}

// Schema for checkout item source (mode + items selection)
const checkoutItemSourceSchema = z.object({
    mode: z.nativeEnum(CheckoutMode),
    cartItemIds: z.array(z.string()).optional(),
    directItems: z.array(z.object({
        productId: z.string().uuid('Invalid product ID'),
        quantity: z.number().min(1, 'Quantity must be at least 1')
    })).optional(),
});

export type CheckoutItemSource = z.infer<typeof checkoutItemSourceSchema>;

const defaultCheckoutOrderBody = {
    ...checkoutItemSourceSchema.shape,
    addressId: z.string().optional(),
    shippingMethodId: z.string().optional(),
    voucherCode: z.string().optional(),
}

export const createCheckoutSessionSchema = z.object({
    body: z.object(defaultCheckoutOrderBody),
});

export const createOrderSchema = z.object({
    body: z.object({
        ...defaultCheckoutOrderBody,
        idempotencyKey: z.string().uuid('Invalid idempotency key'),
        paymentMethodId: z.string().optional(),
    }),
});


const orderQuerySchema = z.object({
    status: z.nativeEnum(OrderStatus).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

export const validateOrderQuery = createQueryValidator({
    customSchema: orderQuerySchema,
});


export interface IOrderParams extends IPaginatedParams {
    status?: OrderStatus;
    startDate?: string;
    endDate?: string;
}

export interface RequestWithOrderQuery extends ExtendedRequest {
    validatedQuery: IOrderParams;
}


export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>['body'];
export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];