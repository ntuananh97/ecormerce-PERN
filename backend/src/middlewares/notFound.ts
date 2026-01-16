import { Request, Response } from 'express';

/**
 * 404 Not Found middleware
 * Handles requests to undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404,
  });
};
