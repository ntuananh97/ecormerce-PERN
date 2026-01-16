import { User, UserStatus } from '@prisma/client';
import { z } from 'zod';

/**
 * Zod validation schemas for User operations
 */

// Schema for creating a new user (registration)
export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')

  }),
});

// Schema for user login
export const loginUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// Schema for updating a user
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
  body: z.object({
    email: z.string().email('Invalid email format').optional(),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters').optional(),
  }),
});
export const updateUserProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  }),
});

// Schema for changing password
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }),
});

// Schema for changing user status
export const changeStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
  body: z.object({
    status: z.nativeEnum(UserStatus, {
      errorMap: () => ({ message: 'Status must be either active or blocked' }),
    }),
  }),
});

// Schema for getting/deleting a user by ID
export const userIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
});

/**
 * TypeScript types inferred from Zod schemas
 */
export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type LoginUserInput = z.infer<typeof loginUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>['body'];
export type UserIdParam = z.infer<typeof userIdSchema>['params'];

export interface IUserWithoutPassword  extends Omit<User, 'password' > {}

