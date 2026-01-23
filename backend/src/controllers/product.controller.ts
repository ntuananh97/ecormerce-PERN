import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import { productService } from '@/services/product.service';
import { RequestWithProductQuery } from '@/types/products.types';

/**
 * Product Controller Layer
 * Handles HTTP requests and responses for product operations
 */
export class ProductController {
  /**
   * GET /api/products
   * Get all products with pagination and sorting
   */
  getAllProducts = asyncHandler(async (req: RequestWithProductQuery, res: Response): Promise<void> => {
    // TODO: Implement logic
    const result = await productService.getAllProducts(req.validatedQuery);

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result
    });
  });

  /**
   * GET /api/products/:id
   * Get a single product by ID
   */
  getProductById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    // TODO: Implement logic
    const product = await productService.getProductById(id);

    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product,
    });
  });

  /**
   * POST /api/products
   * Create a new product
   */
  createProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // TODO: Implement logic
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  });

  /**
   * PUT /api/products/:id
   * Update an existing product
   */
  updateProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    // TODO: Implement logic
    const product = await productService.updateProduct(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  });

  /**
   * DELETE /api/products/:id
   * Delete a product
   */
  deleteProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    // TODO: Implement logic
    await productService.deleteProduct(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  });
}

// Export singleton instance
export const productController = new ProductController();
