import { Request } from 'express';
import { UserRole } from '@prisma/client';

/**
 * Extended Express Request type with additional properties
 */
export interface ExtendedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}
