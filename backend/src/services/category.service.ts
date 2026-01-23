import { CreateCategoryInput } from '@/types/categories.types';
import { prisma } from '../config/database';
import { Category } from '@prisma/client';
import { NotFoundError } from '@/types/errors';
import { IPaginatedParams, IPaginatedResponse } from '@/types/common';

/**
 * Category Service Layer
 * Handles all business logic and database operations for categories
 */
export class CategoryService {
  /**
   * Get all categories from database
   * @returns Array of categories
   */
  async getAllCategories(query: IPaginatedParams): Promise<IPaginatedResponse<Category>> {
    // TODO: Implement logic
    // - Fetch all categories from database
    // - Return categories array
    const { page, limit, sort, sortOrder } = query;
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        take: limit,
        skip,
        orderBy: {
          [sort]: sortOrder
        }
      }),
      prisma.category.count()
    ]);
    
    return {
      data: categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get a single category by ID
   * @param id - Category ID
   * @returns Category object
   */
  async getCategoryById(id: string): Promise<Category> {
    // TODO: Implement logic
    // - Find category by ID
    // - Throw NotFoundError if category doesn't exist
    // - Return category

    const category = await prisma.category.findUnique({
      where: { id }
    })
    if (!category) throw new NotFoundError('Category not found');
    return category;
    
  }

  /**
   * Create a new category
   * @param data - Category data
   * @returns Created category
   */
  async createCategory(data: CreateCategoryInput): Promise<Category> {
    // TODO: Implement logic
    // - Validate input data
    // - Check if category name already exists (if needed)
    // - Create new category in database
    // - Return created category
    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description
      }
    })
    
    return category;
  }

  /**
   * Update an existing category
   * @param id - Category ID
   * @param data - Update data
   * @returns Updated category
   */
  async updateCategory(id: string, data: CreateCategoryInput): Promise<Category> {
    // TODO: Implement logic
    // - Check if category exists
    // - Validate input data
    // - Update category in database
    // - Return updated category
    const category = await prisma.category.findUnique({
      where: {id}
    })
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const updatedCategory = await prisma.category.update({
      where: {id},
      data: {
        name: data.name,
        description: data.description
      }
    })

    return updatedCategory;
  }

  /**
   * Delete a category by ID
   * @param id - Category ID
   */
  async deleteCategory(id: string): Promise<void> {
    // TODO: Implement logic
    // - Check if category exists
    // - Check if category is being used by products (if needed)
    // - Delete category from database
    await prisma.category.delete({
      where: {id}
    })
    
    return;
  }
}

// Export singleton instance
export const categoryService = new CategoryService();
