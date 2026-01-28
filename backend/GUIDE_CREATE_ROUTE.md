# Guide to Creating New Routes

This document provides step-by-step instructions for creating a new route in a PERN (PostgreSQL, Express, React, Node.js) application. This process applies to any module (auth, user, product, payment, etc.).

## Architecture Overview

The project uses a 3-layer architecture:
- **Routes Layer**: Defines endpoints and middleware
- **Controller Layer**: Handles HTTP requests/responses
- **Service Layer**: Handles business logic and database operations

## Implementation Steps

### Step 1: Create Route (Routes Layer)
**File**: `backend/src/routes/<module>.routes.ts`

```typescript
// Example: backend/src/routes/auth.routes.ts

// 1. Import corresponding controller
import { authController } from '../controllers/auth.controller';

// 2. Import middleware if needed (validation, authentication, etc.)
import { validate } from '../middlewares/validation';
import { <validationSchema> } from '../types/<module>.types';

// 3. Define route
router.post('/endpoint-name', middleware, controller.method);

// Complete example:
router.post('/refresh-token', authController.refreshToken);

// Example with validation:
router.post('/register', validate(createUserSchema), authController.register);
```

**Route Naming Convention:**
- Use kebab-case: `/refresh-token`, `/create-order`
- HTTP Methods:
  - `POST`: Create new or actions (login, logout, refresh-token)
  - `GET`: Retrieve data
  - `PUT/PATCH`: Update
  - `DELETE`: Delete

### Step 2: Create Controller Method (Controller Layer)
**File**: `backend/src/controllers/<module>.controller.ts`

```typescript
// Example: backend/src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import { <module>Service } from '../services/<module>.service';

export class <Module>Controller {
  /**
   * POST /api/<module>/<endpoint>
   * <Function description>
   */
  <methodName> = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // TODO: Implement logic
    const result = await <module>Service.<methodName>(req.body);

    res.status(<statusCode>).json({
      success: true,
      message: '<Success message>',
      data: result,
    });
  });
}
```

**Conventions:**
- Use `asyncHandler` for automatic error handling
- Method name: camelCase (`refreshToken`, `createOrder`)
- Common status codes:
  - `200`: Success (GET, PUT, PATCH)
  - `201`: Created (POST)
  - `204`: No Content (DELETE)
- Consistent response format:
  ```typescript
  {
    success: true/false,
    message: 'Message',
    data?: any,
    error?: any
  }
  ```

### Step 3: Create Service Method (Service Layer)
**File**: `backend/src/services/<module>.service.ts`

```typescript
// Example: backend/src/services/auth.service.ts

import { prisma } from '../config/database';

export class <Module>Service {
  /**
   * <Function description>
   * @param data - <Input description>
   * @returns <Output description>
   */
  async <methodName>(data: <InputType>): Promise<<ReturnType>> {
    // TODO: Implement business logic
    // - Validate input
    // - Process data
    // - Database operations (CRUD)
    // - Return result
    
    return {};
  }
}
```

**Conventions:**
- All methods must be `async`
- Use TypeScript types for input/output
- Handle business logic and database operations
- Throw custom errors when needed:
  - `ValidationError`: Validation error
  - `ConflictError`: Conflict (duplicate, etc.)
  - `NotFoundError`: Resource not found
  - `UnauthorizedError`: Unauthorized access

## Complete Example: Refresh Token Endpoint

### 1. Route (`backend/src/routes/auth.routes.ts`)
```typescript
router.post('/refresh-token', authController.refreshToken);
```

### 2. Controller (`backend/src/controllers/auth.controller.ts`)
```typescript
refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await authService.refreshToken(req.body);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: result,
  });
});
```

### 3. Service (`backend/src/services/auth.service.ts`)
```typescript
async refreshToken(data: any): Promise<any> {
  // TODO: Implement refresh token logic
  // - Verify refresh token
  // - Generate new access token
  // - Return new token
  
  return {};
}
```

## New Route Checklist

- [ ] **Step 1**: Add route definition to `routes/<module>.routes.ts`
- [ ] **Step 2**: Create controller method in `controllers/<module>.controller.ts`
- [ ] **Step 3**: Create service method in `services/<module>.service.ts`
- [ ] **Step 4**: Define types/interfaces if needed in `types/<module>.types.ts`
- [ ] **Step 5**: Create validation schema if needed (using Zod)
- [ ] **Step 6**: Implement business logic in service
- [ ] **Step 7**: Test endpoint with Postman/Thunder Client
- [ ] **Step 8**: Write unit tests if needed

## Important Notes

1. **Separation of Concerns**: 
   - Routes: Only define endpoints and middleware
   - Controllers: Only handle HTTP (request/response)
   - Services: Contains all business logic

2. **Error Handling**: 
   - Use `asyncHandler` in controller
   - Throw custom errors in service
   - No try-catch in controller (let middleware handle)

3. **Validation**: 
   - Input validation at route level (middleware)
   - Business validation at service level

4. **Security**:
   - Authentication middleware for protected routes
   - Validation for all user input
   - Rate limiting for sensitive endpoints

5. **Naming Convention**:
   - Files: kebab-case (`auth.routes.ts`)
   - Classes: PascalCase (`AuthController`)
   - Methods/functions: camelCase (`refreshToken`)
   - Routes: kebab-case (`/refresh-token`)

## Resources

- Express Router: https://expressjs.com/en/guide/routing.html
- TypeScript Best Practices: https://www.typescriptlang.org/docs/handbook/
- REST API Design: https://restfulapi.net/

---

**Created**: 2026-01-28
**Version**: 1.0.0
