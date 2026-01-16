# Guide: Creating a New Module (Router, Controller, Service)

This document describes the steps to create a new module in the backend with Layered Architecture.

## 📋 Overview

When creating a new module (e.g., authentication, products, orders, etc.), you need to create 3 main files:
- **Router**: Define API endpoints
- **Controller**: Handle HTTP requests/responses
- **Service**: Contain business logic and database operations

## 🏗️ File Structure

```
backend/src/
├── routes/
│   └── [module].routes.ts       # API endpoints
├── controllers/
│   └── [module].controller.ts   # Request handlers
└── services/
    └── [module].service.ts      # Business logic
```

## 📝 Implementation Steps

### Step 1: Read Existing Code
Before creating new files, read similar files to understand the pattern:
- `src/controllers/user.controller.ts` - Review controller structure
- `src/services/user.service.ts` - Review service structure
- `src/routes/user.routes.ts` - Review routes structure
- `src/routes/index.ts` - Review how routes are registered

### Step 2: Create Controller File

**Location**: `src/controllers/[module].controller.ts`

**Template**:
```typescript
import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import { [module]Service } from '@/services/[module].service';

/**
 * [Module] Controller Layer
 * Handles HTTP requests and responses for [module] operations
 */
export class [Module]Controller {
  /**
   * [HTTP_METHOD] /api/[module]/[endpoint]
   * [Description of what this endpoint does]
   */
  [methodName] = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // TODO: Implement logic
    const result = await [module]Service.[methodName](req.body);

    res.status([statusCode]).json({
      success: true,
      message: '[Success message]',
      data: result, // Include data or omit depending on endpoint
    });
  });
}

// Export singleton instance
export const [module]Controller = new [Module]Controller();
```

**Notes**:
- Class name: PascalCase (e.g., `AuthController`, `ProductController`)
- Exported instance name: camelCase (e.g., `authController`, `productController`)
- Each method is an arrow function with `asyncHandler` wrapper
- Common status codes: 200 (OK), 201 (Created), 204 (No Content)
- Consistent response format: `{ success, message, data? }`
- Import service with alias `@/services/...`

### Step 3: Create Service File

**Location**: `src/services/[module].service.ts`

**Template**:
```typescript
import { prisma } from '../config/database';

/**
 * [Module] Service Layer
 * Handles all business logic and database operations for [module]
 */
export class [Module]Service {
  /**
   * [Description of what this method does]
   * @param data - [Description of input parameter]
   * @returns [Description of return value]
   */
  async [methodName](data: any): Promise<any> {
    // TODO: Implement logic
    // - [Step 1]
    // - [Step 2]
    // - [Step 3]
    
    return {};
  }
}

// Export singleton instance
export const [module]Service = new [Module]Service();
```

**Notes**:
- Class name: PascalCase (e.g., `AuthService`, `ProductService`)
- Exported instance name: camelCase (e.g., `authService`, `productService`)
- All methods are async
- Include JSDoc comments describing function, parameters, return value
- Include detailed TODO comments for implementation steps
- Import `prisma` from `../config/database` if database operations are needed

### Step 4: Create Routes File

**Location**: `src/routes/[module].routes.ts`

**Template**:
```typescript
import { Router } from 'express';
import { [module]Controller } from '../controllers/[module].controller';

const router = Router();

/**
 * [Module] Routes
 * All routes are prefixed with /api/[module]
 */

// [HTTP_METHOD] /api/[module]/[endpoint] - [Description]
router.[httpMethod]('/[endpoint]', [module]Controller.[methodName]);

export default router;
```

**Notes**:
- HTTP methods: `get`, `post`, `put`, `patch`, `delete`
- Include comments describing each route
- Can add validation middleware: `validate(schema)` between path and controller
- Export default router

### Step 5: Register Routes in Main Router

**File**: `src/routes/index.ts`

**Add**:
```typescript
// 1. Import routes
import [module]Routes from './[module].routes';

// 2. Register in router
router.use('/[module]', [module]Routes);
```

**Location**: Add after health check, before or after other routes

## ✅ Checklist

After creation, verify:

- [ ] Controller file created with correct name and location
- [ ] Service file created with correct name and location
- [ ] Routes file created with correct name and location
- [ ] Routes registered in `src/routes/index.ts`
- [ ] All imports are correct (no import errors)
- [ ] Naming convention is consistent (PascalCase for class, camelCase for instance)
- [ ] All methods have JSDoc comments
- [ ] Controller methods have `asyncHandler` wrapper
- [ ] Service methods are async
- [ ] Response format is consistent
- [ ] Singleton instances are exported

## 🎯 Concrete Example

### Creating Authentication Module

**Requirement**: Create authentication module with register, login, logout

**Endpoints**:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

**Result**:
1. `src/controllers/auth.controller.ts` - AuthController with 3 methods
2. `src/services/auth.service.ts` - AuthService with 3 methods
3. `src/routes/auth.routes.ts` - 3 POST routes
4. `src/routes/index.ts` - Add `router.use('/auth', authRoutes)`

## 🚀 Pattern Conventions

### Naming Pattern
- **Module name**: camelCase (auth, product, order)
- **Class name**: PascalCase (AuthController, ProductService)
- **Instance name**: camelCase (authController, productService)
- **File name**: kebab-case ([module].controller.ts)

### HTTP Status Codes
- `200` - OK (Successful GET, PUT, DELETE)
- `201` - Created (Successful POST creation)
- `204` - No Content (DELETE with no return data)
- `400` - Bad Request (Validation error)
- `401` - Unauthorized (Authentication failed)
- `403` - Forbidden (No permission)
- `404` - Not Found (Resource doesn't exist)
- `409` - Conflict (Duplicate, constraint violation)
- `500` - Internal Server Error

### Response Format
```typescript
// Success with data
{
  success: true,
  message: "Operation successful",
  data: { ... }
}

// Success without data
{
  success: true,
  message: "Operation successful"
}

// Error (handled by error middleware)
{
  success: false,
  message: "Error message",
  error: { ... }
}
```

## 📌 Important Notes

1. **No logic implementation**: If the requirement is only to create structure, only create skeleton with TODO comments
2. **Follow existing patterns**: Always follow the pattern of existing code
3. **Import paths**: Check if the project uses relative imports or alias imports
4. **Validation**: If validation middleware exists, import from `../middlewares/validation`
5. **Error handling**: Use `asyncHandler` wrapper for all async controller methods
6. **Singleton pattern**: Export instances instead of classes for direct usage

## 🔄 Workflow When Receiving Request

1. **Understand**: Identify module name and required endpoints
2. **Read examples**: Read user.controller/service/routes to understand pattern
3. **Create files**: Create in order: Controller → Service → Routes
4. **Register**: Update routes/index.ts
5. **Verify**: Check imports and naming conventions

## 💡 Tips

- When unsure about pattern, always refer to user module
- TODO comments should be detailed so implementers understand what to do
- JSDoc comments help with IDE autocomplete and documentation
- Test imports by checking for TypeScript errors

## 🎓 Usage Instructions for AI

When you need to create a new module, provide this instruction:

> "Read the @GUIDE_CREATE_MODULE.md file and create a [module-name] module with the following endpoints: [list endpoints]"

The AI will follow this guide to maintain consistency in the codebase.

---

**Last Updated**: 2026-01-12
