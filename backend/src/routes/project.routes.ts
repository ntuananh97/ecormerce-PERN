import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { checkAuthentication } from '../middlewares/checkAuth';
import { validatePaginationQuery } from '../middlewares/validateQuery';
import { validate } from '@/middlewares/validation';
import { createProjectSchema, projectIdSchema } from '@/types/project.types';

const router = Router();

/**
 * Project Routes
 * All routes are prefixed with /api/projects
 */

// GET /api/projects - Get all projects (authenticated users)
router.get('/', checkAuthentication, validatePaginationQuery, projectController.getOwnProjects);

// GET /api/projects/:id - Get project by ID (authenticated users)
// router.get('/:id', checkAuthentication, projectController.getProjectById);

// POST /api/projects - Create new project (authenticated users)
router.post('/', checkAuthentication, validate(createProjectSchema), projectController.createProject);

// PUT /api/projects/:id - Update project (owner only)
router.put('/:id', checkAuthentication, validate(createProjectSchema), projectController.updateProject);

// DELETE /api/projects/:id - Delete project (owner only)
router.delete('/:id', checkAuthentication, validate(projectIdSchema), projectController.deleteProject);

export default router;
