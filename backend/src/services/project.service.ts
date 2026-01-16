import { CreateProjectInput } from '@/types/project.types';
import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../types/errors';
import { Project } from '@prisma/client';
import { IPaginatedParams, IPaginatedResponse } from '@/types/common';

/**
 * Project Service Layer
 * Handles all business logic and database operations for projects
 */
export class ProjectService {
  /**
   * Get all projects with pagination
   * @param query - Query parameters for pagination and filtering
   * @returns Paginated list of projects
   */
  async getOwnProjects(userId: string, query: IPaginatedParams): Promise<IPaginatedResponse<Project>> {
    const { page, limit, sort, sortOrder } = query;

    const skip = (page - 1) * limit;

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sort]: sortOrder,
    };

    const [total, projects] = await Promise.all([
      prisma.project.count({
        where: {
          ownerId: userId,
        },
      }),
      prisma.project.findMany({
        where: {
          ownerId: userId,
        },
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy,
      }),
    ]);

    return {
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get project by ID
   * @param id - Project ID
   * @returns Project data with owner and tasks
   */
  async getProjectById(id: string): Promise<any> {
    // TODO: Implement logic
    // - Find project by ID with related data (owner, tasks)
    // - Throw NotFoundError if project doesn't exist
    // - Return project data

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    return project;
  }

  /**
   * Create new project
   * @param data - Project data (title, description, ownerId)
   * @returns Created project
   */
  async createProject(userId: string, data: CreateProjectInput): Promise<Project> {
    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        ownerId: userId,
      }
    });

    return project;
  }

  /**
   * Update project
   * @param id - Project ID
   * @param data - Updated project data
   * @param userId - Current user ID (for authorization)
   * @returns Updated project
   */
  async updateProject(id: string, data: CreateProjectInput, userId: string): Promise<Project> {
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Check if user is the owner
    if (project.ownerId !== userId) {
      throw new ForbiddenError('You do not have permission to update this project');
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return updatedProject;
  }

  /**
   * Delete project
   * @param id - Project ID
   * @param userId - Current user ID (for authorization)
   */
  async deleteProject(id: string, userId?: string): Promise<void> {
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Check if user is the owner
    if (project.ownerId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this project');
    }

    await prisma.project.delete({
      where: { id },
    });
  }
}

// Export singleton instance
export const projectService = new ProjectService();
