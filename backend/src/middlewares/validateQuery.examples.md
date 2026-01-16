# Query Validation Middleware - Examples

## Overview
Middleware để validate và transform query parameters với Zod, đặc biệt hữu ích cho pagination, sorting và filtering.

## Basic Usage

### 1. Basic Pagination & Sorting (Cơ bản)

```typescript
import { validatePaginationQuery } from '../middlewares/validateQuery';

// Sử dụng middleware có sẵn với cấu hình mặc định
router.get('/users', validatePaginationQuery, userController.getAllUsers);
```

**Query parameters được validate:**
- `page`: số trang (default: 1, min: 1)
- `limit`: số items mỗi trang (default: 10, max: 100)
- `sort`: field để sort (default: 'createdAt', allowed: ['createdAt', 'updatedAt', 'email', 'name', 'role'])
- `sortOrder`: thứ tự sort (default: 'desc', values: 'asc' | 'desc')

**Example requests:**
```
GET /api/users
GET /api/users?page=2&limit=20
GET /api/users?sort=email&sortOrder=asc
GET /api/users?page=1&limit=50&sort=name&sortOrder=desc
```

### 2. Custom Validation (Tùy chỉnh)

```typescript
import { createQueryValidator } from '../middlewares/validateQuery';
import { z } from 'zod';

// Tạo middleware với cấu hình tùy chỉnh
const validateProductQuery = createQueryValidator({
  maxLimit: 50, // Giới hạn tối đa 50 items
  allowedSortFields: ['name', 'price', 'createdAt'], // Chỉ cho phép sort theo 3 fields này
  customSchema: z.object({
    category: z.string().optional(),
    minPrice: z.string().transform(Number).optional(),
    maxPrice: z.string().transform(Number).optional(),
    inStock: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  }),
});

router.get('/products', validateProductQuery, productController.getAllProducts);
```

**Example requests:**
```
GET /api/products?category=electronics
GET /api/products?minPrice=100&maxPrice=500
GET /api/products?inStock=true&sort=price&sortOrder=asc
GET /api/products?page=1&limit=20&category=books&sort=name
```

### 3. Advanced Custom Validation (Nâng cao)

```typescript
import { createQueryValidator } from '../middlewares/validateQuery';
import { z } from 'zod';

const validateOrderQuery = createQueryValidator({
  maxLimit: 100,
  allowedSortFields: ['createdAt', 'totalAmount', 'status'],
  customSchema: z.object({
    status: z.enum(['pending', 'processing', 'completed', 'cancelled']).optional(),
    startDate: z.string()
      .optional()
      .refine(val => !val || !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
      })
      .transform(val => val ? new Date(val) : undefined),
    endDate: z.string()
      .optional()
      .refine(val => !val || !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
      })
      .transform(val => val ? new Date(val) : undefined),
    customerId: z.string().uuid().optional(),
    search: z.string().min(2).max(100).optional(),
  }),
});

router.get('/orders', validateOrderQuery, orderController.getAllOrders);
```

**Example requests:**
```
GET /api/orders?status=completed&sort=totalAmount&sortOrder=desc
GET /api/orders?startDate=2024-01-01&endDate=2024-12-31
GET /api/orders?customerId=123e4567-e89b-12d3-a456-426614174000
GET /api/orders?search=john&page=1&limit=20
```

## Controller Usage

### Accessing Validated Query Parameters

```typescript
import { RequestWithValidatedQuery } from '../middlewares/validateQuery';

class UserController {
  getAllUsers = asyncHandler(async (req: RequestWithValidatedQuery, res: Response) => {
    // Query params đã được validate và transform
    const { page, limit, sort, sortOrder } = req.validatedQuery;
    
    // Gọi service với params đã validate
    const result = await userService.getAllUsers({ page, limit, sort, sortOrder });
    
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  });
}
```

### With Custom Query Parameters

```typescript
import { RequestWithValidatedQuery } from '../middlewares/validateQuery';

class ProductController {
  getAllProducts = asyncHandler(async (req: RequestWithValidatedQuery, res: Response) => {
    const { 
      page, 
      limit, 
      sort, 
      sortOrder,
      // Custom params
      category,
      minPrice,
      maxPrice,
      inStock,
    } = req.validatedQuery;
    
    const result = await productService.getAllProducts({
      page,
      limit,
      sort,
      sortOrder,
      filters: { category, minPrice, maxPrice, inStock },
    });
    
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  });
}
```

## Configuration Options

### `maxLimit`
Giới hạn tối đa số items mỗi trang. Default: 100

```typescript
createQueryValidator({ maxLimit: 50 })
```

### `allowedSortFields`
Danh sách các fields được phép sort. Default: ['createdAt', 'updatedAt', 'email', 'name', 'role']

```typescript
createQueryValidator({ 
  allowedSortFields: ['name', 'price', 'stock'] 
})
```

### `customSchema`
Schema Zod tùy chỉnh để validate thêm query params khác.

```typescript
createQueryValidator({
  customSchema: z.object({
    status: z.enum(['active', 'inactive']).optional(),
    search: z.string().min(2).optional(),
  }),
})
```

## Error Response

Khi validation thất bại, middleware trả về response:

```json
{
  "success": false,
  "message": "Invalid query parameters",
  "errors": [
    {
      "field": "page",
      "message": "Expected number, received string"
    },
    {
      "field": "sort",
      "message": "Sort field must be one of: createdAt, updatedAt, email, name, role"
    }
  ]
}
```

## Best Practices

1. **Sử dụng `validatePaginationQuery` cho các trường hợp đơn giản:**
   ```typescript
   router.get('/users', validatePaginationQuery, controller.getAll);
   ```

2. **Tạo validator riêng cho mỗi resource khi cần custom:**
   ```typescript
   const validateUserQuery = createQueryValidator({ ... });
   const validateProductQuery = createQueryValidator({ ... });
   ```

3. **Đặt tên validator theo resource:**
   ```typescript
   // ✅ Good
   const validateUserQuery = createQueryValidator({ ... });
   const validateOrderQuery = createQueryValidator({ ... });
   
   // ❌ Bad
   const validator1 = createQueryValidator({ ... });
   const myValidator = createQueryValidator({ ... });
   ```

4. **Type-safe trong Controller:**
   ```typescript
   // ✅ Good - có type safety
   async (req: RequestWithValidatedQuery, res: Response) => {
     const { page, limit } = req.validatedQuery;
   }
   
   // ❌ Bad - không có type safety
   async (req: Request, res: Response) => {
     const page = Number(req.query.page);
   }
   ```

5. **Validate ở middleware, không validate ở controller hay service:**
   ```typescript
   // ✅ Good
   router.get('/', validateQuery, controller.getAll);
   
   // ❌ Bad - validate trong controller
   controller.getAll = async (req, res) => {
     const page = req.query.page ? Number(req.query.page) : 1;
     // ...
   }
   ```

## Testing

```typescript
import request from 'supertest';
import app from '../app';

describe('Query Validation', () => {
  it('should apply default values', async () => {
    const res = await request(app).get('/api/users');
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(10);
  });

  it('should validate page number', async () => {
    const res = await request(app).get('/api/users?page=0');
    expect(res.body.pagination.page).toBe(1); // Should default to 1
  });

  it('should cap limit at maxLimit', async () => {
    const res = await request(app).get('/api/users?limit=200');
    expect(res.body.pagination.limit).toBe(100); // Should cap at 100
  });

  it('should validate sort field', async () => {
    const res = await request(app).get('/api/users?sort=invalidField');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
```
