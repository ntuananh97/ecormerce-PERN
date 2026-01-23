import { IPaginatedResponse } from '@/types/common';
import { prisma } from '../config/database';
import { Prisma, Product, ProductStatus } from '@prisma/client';
import { CreateProductInput, IProductParams, UpdateProductInput } from '@/types/products.types';
import { NotFoundError } from '@/types/errors';
import { categoryService } from './category.service';

/**
 * Product Service Layer
 * Handles all business logic and database operations for products
 */
export class ProductService {
  /**
   * Get all products from database with pagination and sorting
   * @returns Paginated products
   */
  async getAllProducts(query: IProductParams): Promise<IPaginatedResponse<Product>> {
    const { page, limit, sort, sortOrder, category, name } = query;
    const skip = (page - 1) * limit;
    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sort]: sortOrder,
    };
    const where: Prisma.ProductWhereInput = {};
    if (category) where.categoryId = category;
    if (name) where.name = { contains: name, mode: 'insensitive' };
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
        }
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    
    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      }
    };
  }

  /**
   * Get a single product by ID
   * @param id - Product ID
   * @returns Product object
   */
  async getProductById(id: string): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      }
    })

    if (!product) throw new NotFoundError('Product not found');
    
    return product;
  }

  /**
   * Create a new product
   * @param data - Product data
   * @returns Created product
   */
  async createProduct(data: CreateProductInput): Promise<Product> {
    // TODO: Implement logic
    // - Validate input data
    // - Check if product name already exists
    // - Validate category exists (if categoryId provided)
    // - Create new product in database
    // - Return created product
    const categoryId = data.categoryId;

    if (categoryId) {
      // Check if category exists
      await categoryService.getCategoryById(categoryId);
    }

    const payload = {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      categoryId: categoryId,
      images: data.images,
      status: ProductStatus.active,
    }

    // Create product
    const product = await prisma.product.create({ data: payload });
    return product;
  }

  /**
   * Update an existing product
   * @param id - Product ID
   * @param data - Update data
   * @returns Updated product
   */
  async updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
    // Check if product exists
    await this.getProductById(id);

    // Check if category exists
    if (data.categoryId) {
      await categoryService.getCategoryById(data.categoryId);
    }

    const payload = {
      name: data.name,
      description: data.description,
      price: data.price,
      categoryId: data.categoryId,
      images: data.images,
      status: data.status,
    }

    const product = await prisma.product.update({
      where: { id },
      data: payload,
    });
 
    
    return product;
  }

  /**
   * Delete a product by ID
   * @param id - Product ID
   */
  async deleteProduct(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }
}

// Export singleton instance
export const productService = new ProductService();
