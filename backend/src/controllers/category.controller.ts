import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import { categoryService } from '@/services/category.service';
import { RequestWithValidatedQuery } from '@/middlewares/validateQuery';

/**
 * Category Controller Layer
 * Handles HTTP requests and responses for category operations
 */
export class CategoryController {
  /**
   * GET /api/categories
   * Get all categories
   */
  getAllCategories = asyncHandler(async (req: RequestWithValidatedQuery, res: Response): Promise<void> => {
    // TODO: Implement logic
    const result = await categoryService.getAllCategories(req.validatedQuery);

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: result,
    });
  });

  /**
   * GET /api/categories/:id
   * Get a single category by ID
   */
  getCategoryById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    // TODO: Implement logic
    const category = await categoryService.getCategoryById(id);

    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category,
    });
  });

  /**
   * POST /api/categories
   * Create a new category
   */
  createCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // TODO: Implement logic
    const category = await categoryService.createCategory(req.body);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  });

  /**
   * PUT /api/categories/:id
   * Update an existing category
   */
  updateCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    // TODO: Implement logic
    const category = await categoryService.updateCategory(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  });

  /**
   * DELETE /api/categories/:id
   * Delete a category
   */
  deleteCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await categoryService.deleteCategory(id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  });
}

// Export singleton instance
export const categoryController = new CategoryController();
