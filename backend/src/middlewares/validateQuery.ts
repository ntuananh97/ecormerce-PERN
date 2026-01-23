import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DEFAULT_QUERY_PARAMS } from '../config/query';
import { ExtendedRequest } from '@/types/express';

/**
 * Base validated query params
 */
export interface BaseValidatedQuery {
  page: number;
  limit: number;
  sort: string;
  sortOrder: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}

/**
 * Extended Request with validated query params
 */
export interface RequestWithValidatedQuery extends ExtendedRequest {
  validatedQuery: BaseValidatedQuery;
}

/**
 * Configuration for query validation middleware
 */
interface QueryValidationConfig {
  /** Maximum allowed limit value */
  maxLimit?: number;
  /** Additional custom validation schema */
  customSchema?: z.ZodObject<z.ZodRawShape>;
}

/**
 * Creates a middleware to validate and transform query parameters
 * @param config - Configuration options for validation
 */
export const validateQuery = (config: QueryValidationConfig = {}) => {
  const {
    maxLimit = 100,
    customSchema,
  } = config;

  // Base schema for common pagination and sorting params
  const baseSchema = z.object({
    page: z
      .string()
      .optional()
      .default(String(DEFAULT_QUERY_PARAMS.PAGE))
      .transform((val) => {
        const num = parseInt(val, 10);
        return isNaN(num) || num < 1 ? DEFAULT_QUERY_PARAMS.PAGE : num;
      }),
    limit: z
      .string()
      .optional()
      .default(String(DEFAULT_QUERY_PARAMS.LIMIT))
      .transform((val) => {
        const num = parseInt(val, 10);
        if (isNaN(num) || num < 1) return DEFAULT_QUERY_PARAMS.LIMIT;
        return Math.min(num, maxLimit); // Cap at maxLimit
      }),
    sort: z
      .string()
      .optional()
      .default(DEFAULT_QUERY_PARAMS.SORT),
    sortOrder: z
      .enum(['asc', 'desc'])
      .optional()
      .default(DEFAULT_QUERY_PARAMS.SORT_ORDER as 'asc' | 'desc'),
  });

  // Merge with custom schema if provided
  const schema = customSchema ? baseSchema.merge(customSchema) : baseSchema;

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate and transform query params
      // Zod ensures type safety at runtime
      const parsedQuery = schema.parse(req.query);
      
      // Type assertion is safe here because:
      // 1. Zod validates at runtime
      // 2. baseSchema guarantees all required BaseValidatedQuery fields
      // 3. customSchema only adds optional fields
      const validatedQuery = parsedQuery as BaseValidatedQuery;

      // Attach validated query to request
      (req as RequestWithValidatedQuery).validatedQuery = validatedQuery;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }

      next(error);
    }
  };
};

/**
 * Pre-configured middleware for basic pagination and sorting
 */
export const validatePaginationQuery = validateQuery();

/**
 * Helper function to create custom query validation
 * @example
 * const validateUserQuery = createQueryValidator({
 *   maxLimit: 50,
 *   customSchema: z.object({
 *     role: z.enum(['admin', 'user']).optional(),
 *     search: z.string().optional(),
 *   }),
 * });
 */
export const createQueryValidator = (config: QueryValidationConfig) => {
  return validateQuery(config);
};
