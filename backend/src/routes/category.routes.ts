import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { checkAuthentication } from '@/middlewares/checkAuth';
import { checkAdmin } from '@/middlewares/checkRole';
import { createCategorySchema } from '@/types/categories.types';
import { validate } from '@/middlewares/validation';
import { validatePaginationQuery } from '@/middlewares/validateQuery';

const router = Router();

/**
 * Category Routes
 * All routes are prefixed with /api/categories
 */

// GET /api/categories - Get all categories
router.get('/', validatePaginationQuery, categoryController.getAllCategories);

// GET /api/categories/:id - Get category by ID
router.get('/:id', categoryController.getCategoryById);

// POST /api/categories - Create new category
router.post('/', checkAuthentication, checkAdmin, 
    validate(createCategorySchema), 
    categoryController.createCategory);

// PUT /api/categories/:id - Update category
router.put('/:id', checkAuthentication, checkAdmin, 
    validate(createCategorySchema), categoryController.updateCategory);

// DELETE /api/categories/:id - Delete category
router.delete('/:id', checkAuthentication, checkAdmin, categoryController.deleteCategory);

export default router;
