import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import { projectService } from '@/services/project.service';
import { ExtendedRequest } from '@/types/express';
import { RequestWithValidatedQuery } from '@/middlewares/validateQuery';

/**
 * Project Controller Layer
 * Handles HTTP requests and responses for project operations
 */
export class ProjectController {
  /**
   * GET /api/projects
   * Get all projects with pagination
   */
  getOwnProjects = asyncHandler(async (req: RequestWithValidatedQuery, res: Response): Promise<void> => {
    const userId = req.user!.id;

    const result = await projectService.getOwnProjects(userId, req.validatedQuery);

    res.status(200).json({
      success: true,
      message: 'Projects retrieved successfully',
      data: result,
    });
  });

  /**
   * GET /api/projects/:id
   * Get project by ID
   */
  getProjectById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const project = await projectService.getProjectById(id);

    res.status(200).json({
      success: true,
      message: 'Project retrieved successfully',
      data: project,
    });
  });

  /**
   * POST /api/projects
   * Create new project
   */
  createProject = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const project = await projectService.createProject(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  });

  /**
   * PUT /api/projects/:id
   * Update project
   */
  updateProject = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user!.id;
    const project = await projectService.updateProject(id, req.body, userId);

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  });

  /**
   * DELETE /api/projects/:id
   * Delete project
   */
  deleteProject = asyncHandler(async (req: ExtendedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user!.id;
    await projectService.deleteProject(id, userId);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  });
}

// Export singleton instance
export const projectController = new ProjectController();
