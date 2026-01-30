import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { checkAuthentication } from '@/middlewares/checkAuth';
import { checkAdmin } from '@/middlewares/checkRole';
import { validate } from '@/middlewares/validation';
import { createProductSchema, createMultipleProductsSchema, updateProductSchema, validateProductQuery } from '@/types/products.types';

const router = Router();

/**
 * Product Routes
 * All routes are prefixed with /api/products
 */

// GET /api/products - Get all products
router.get('/', validateProductQuery, productController.getAllProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', productController.getProductById);

// POST /api/products - Create new product
router.post('/', checkAuthentication, checkAdmin,
     validate(createProductSchema), productController.createProduct);

// POST /api/products/multiple - Create multiple products at once
router.post('/multiple', checkAuthentication, checkAdmin,
     validate(createMultipleProductsSchema), productController.createMultipleProducts);

// PUT /api/products/:id - Update product
router.put('/:id', checkAuthentication, checkAdmin, validate(updateProductSchema),
 productController.updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', checkAuthentication, checkAdmin, productController.deleteProduct);

export default router;
