import { prisma } from '../config/database';
import { CreateUserInput, UpdateUserInput, UpdateUserProfileInput, ChangePasswordInput, ChangeStatusInput, IUserWithoutPassword } from '../types/user.types';
import { NotFoundError, ConflictError, ValidationError } from '../types/errors';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { IPaginatedParams, IPaginatedResponse } from '@/types/common';

/**
 * User Service Layer
 * Handles all business logic and database operations for users
 */
export class UserService {
  /**
   * Get all users from database with pagination and sorting
   * @param params - Query parameters (validated by middleware)
   */
  async getAllUsers(params: Required<IPaginatedParams>): Promise<IPaginatedResponse<IUserWithoutPassword>> {
    const { page, limit, sort, sortOrder } = params;

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build orderBy object dynamically
    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sort]: sortOrder,
    };

    // Get total count and users in parallel
    const [total, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take: limit,
        orderBy,
        omit: {
          password: true,
        }
      }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get a single user by ID
   * @throws {NotFoundError} If user doesn't exist
   */
  async getUserById(id: string): Promise<Omit<User, 'password' | 'deletedAt'>> {
    const user = await prisma.user.findUnique({
      where: { id },
      omit: {
        password: true,
        deletedAt: true,
      }
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    return user;
  }

  async getCurrentUser(id: string): Promise<Omit<User, 'password' | 'deletedAt'>> {
    const user = await prisma.user.findUnique({
      where: { id },
      omit: {
        password: true,
        deletedAt: true,
      }
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Update current user profile
   * @param id - Current user ID
   * @param data - Update data
   * @returns Updated user
   */
  async updateProfile(id: string, data: UpdateUserProfileInput): Promise<Omit<User, 'password' | 'deletedAt'>> {
      // Check if user exists
      await this.getUserById(id);
    const updateUser = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
      },
      omit: {
        password: true,
        deletedAt: true,
      }
    });

    return updateUser;
  }

  /**
   * Change user password
   * @param id - Current user ID
   * @param data - Change password data (currentPassword, newPassword)
   */
  async changePassword(id: string, data: ChangePasswordInput): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, password: true }
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    const { currentPassword, newPassword } = data;

    // Verify current password is correct
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new ValidationError('Current password is incorrect');
    }

    // Check if new password is same as current (optional)
  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    throw new ValidationError('New password must be different from current password');
  }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedNewPassword,
      },
    });

    return;
  }

  /**
   * Create a new user
   * @throws {ConflictError} If email already exists
   */
  async createUser(data: CreateUserInput): Promise<User> {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError(`User with email ${data.email} already exists`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        // name: data.name,
      },
    });

    return user;
  }

  /**
   * Update an existing user
   * @throws {NotFoundError} If user doesn't exist
   * @throws {ConflictError} If email already taken by another user
   */
  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    // Check if user exists
    await this.getUserById(id);

    // If updating email, check if it's already taken
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictError(`Email ${data.email} is already taken`);
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return user;
  }

  /**
   * Change user status (active/blocked)
   * @param id - User ID
   * @param data - Status data
   * @returns Updated user
   * @throws {NotFoundError} If user doesn't exist
   */
  async changeStatus(id: string, data: ChangeStatusInput): Promise<IUserWithoutPassword> {
    // Check if user exists
    await this.getUserById(id);

    // Update user status
    const user = await prisma.user.update({
      where: { id },
      data: { status: data.status },
      omit: {
        password: true,
      }
    });

    return user;
  }

  /**
   * Soft delete a user by ID (set deletedAt timestamp)
   * @param id - User ID
   * @throws {NotFoundError} If user doesn't exist
   */
  async softDeleteUser(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

  }

  /**
   * Delete a user by ID
   * @throws {NotFoundError} If user doesn't exist
   */
  async deleteUser(id: string): Promise<void> {
    // Check if user exists
    await this.getUserById(id);

    // Delete user
    await prisma.user.delete({
      where: { id },
    });
  }
}

// Export singleton instance
export const userService = new UserService();
