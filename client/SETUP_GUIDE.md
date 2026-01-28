# 🚀 Setup Guide - Enterprise Next.js Architecture

## ✅ What Was Implemented

### 1. **Folder Structure** (Enterprise-Level)
```
src/
├── app/                      # Next.js App Router pages
├── components/
│   ├── ui/                   # Reusable UI components (buttons, inputs)
│   └── features/             # Domain-specific components (auth, products)
│       └── auth/LoginForm.tsx
├── lib/
│   ├── axios.ts             # ⭐ Axios instance with interceptors
│   └── utils.ts
├── services/                # ⭐ API service layer
│   ├── auth.service.ts     # Authentication API calls
│   └── products.service.ts # Products CRUD operations
├── hooks/                   # Custom React hooks
│   └── useAuth.ts          # Authentication hook
├── types/                   # TypeScript definitions
│   └── api.types.ts        # API types
└── constants/              # Static configuration
    └── api.constants.ts    # API endpoints, error messages
```

### 2. **Axios Configuration** (`src/lib/axios.ts`)

✅ **Features Implemented:**
- Base URL from environment variable
- 10-second timeout
- Automatic JWT token attachment
- Token refresh on 401 errors
- Global error handling (401, 403, 404, 500, network errors)
- Request/Response logging in development mode
- TypeScript strict typing

✅ **Interceptors:**
- **Request**: Automatically adds `Bearer` token from localStorage
- **Response**: 
  - Handles 401 → Attempts token refresh → Retries request
  - Handles 403, 404, 500 with appropriate error messages
  - Clears auth data and redirects to `/login` on auth failure

### 3. **Service Layer Pattern**

✅ **Services Created:**
- `auth.service.ts`: Login, Register, Logout, Get Current User
- `products.service.ts`: Full CRUD (Create, Read, Update, Delete)

✅ **Benefits:**
- Components never call axios directly
- Centralized API logic
- Easy to test
- Type-safe API calls

### 4. **Type Safety**

✅ **Types Defined:**
- `ApiResponse<T>`: Generic API response wrapper
- `ApiError`: Error response structure
- `LoginRequest`, `RegisterRequest`: Auth request types
- `AuthResponse`, `User`: Auth response types
- `Product`, `CreateProductRequest`: Product types
- `PaginatedResponse<T>`: Paginated list responses

### 5. **Environment Variables**

✅ **Files Created:**
- `.env.example`: Template for environment variables
- `.env.local`: Local development configuration (already configured)

## 🎯 Quick Start

### Step 1: Verify Environment Variables

Check that `.env.local` exists with:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_API_TIMEOUT=10000
```

### Step 2: Update Backend URL (if different)

If your backend runs on a different port, update `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:YOUR_PORT/api
```

### Step 3: Use the Service Layer

**Example: Login Component**
```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email: 'user@example.com', password: 'password123' });
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed');
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Example: Fetch Products**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { productsService } from '@/services/products.service';

export default function ProductsList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    productsService.getProducts({ page: 1, limit: 10 })
      .then(data => setProducts(data.data));
  }, []);

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

## 🔐 Authentication Flow

### How It Works:

1. **User logs in** → `authService.login()` called
2. **Tokens stored** → `accessToken` and `refreshToken` saved to localStorage
3. **Subsequent requests** → Axios interceptor automatically adds `Bearer {token}`
4. **Token expires** → 401 error → Interceptor refreshes token → Retries request
5. **Refresh fails** → User redirected to `/login`

### Token Storage:

Tokens are stored in `localStorage` with these keys:
- `access_token`: JWT for API authentication
- `refresh_token`: Token for refreshing expired access token
- `user`: Current user data

## 📝 Adding New API Endpoints

### Step 1: Add Endpoint Constant
```typescript
// src/constants/api.constants.ts
export const API_ENDPOINTS = {
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
  }
}
```

### Step 2: Define Types
```typescript
// src/types/api.types.ts
export interface Order {
  id: string;
  userId: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
}
```

### Step 3: Create Service
```typescript
// src/services/orders.service.ts
import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api.constants';
import type { ApiResponse, Order } from '@/types/api.types';

export const ordersService = {
  async getOrders(): Promise<Order[]> {
    const response = await axiosInstance.get<ApiResponse<Order[]>>(
      API_ENDPOINTS.ORDERS.LIST
    );
    return response.data.data;
  },
  
  async getOrder(id: string): Promise<Order> {
    const response = await axiosInstance.get<ApiResponse<Order>>(
      API_ENDPOINTS.ORDERS.DETAIL(id)
    );
    return response.data.data;
  }
};
```

### Step 4: Use in Component
```typescript
import { ordersService } from '@/services/orders.service';

const orders = await ordersService.getOrders();
```

## 🛡️ Error Handling

The Axios instance automatically handles common errors:

| Status Code | Action |
|-------------|--------|
| **401 Unauthorized** | Attempts token refresh, then redirects to `/login` |
| **403 Forbidden** | Logs error message |
| **404 Not Found** | Logs "Resource not found" |
| **500 Server Error** | Logs "Server error" |
| **Network Error** | Logs "Network error" |
| **Timeout** | Logs "Request timeout" |

### Custom Error Handling:

```typescript
try {
  await authService.login(credentials);
} catch (error: any) {
  if (error.statusCode === 400) {
    console.error('Invalid credentials');
  } else if (error.statusCode === 429) {
    console.error('Too many requests');
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

## 📚 Best Practices

### ✅ DO:
- Always use the service layer (never call axios directly from components)
- Use TypeScript types for all API calls
- Handle loading and error states in UI
- Use custom hooks for complex logic
- Keep components focused on UI rendering

### ❌ DON'T:
- Import `axios` directly in components
- Hardcode API URLs in code
- Store sensitive data in localStorage without encryption
- Skip error handling
- Mix business logic with UI logic

## 🔍 Debugging Tips

### Check if token is being sent:
```typescript
// Open browser DevTools → Network tab → Click any API request → Headers
// You should see: Authorization: Bearer eyJhbGc...
```

### Check if interceptor is working:
```typescript
// Open console and look for:
// [API Request] POST /auth/login
// [API Response] POST /auth/login
```

### Check token in storage:
```typescript
// Open DevTools → Application → Local Storage
// You should see: access_token, refresh_token, user
```

## 🎨 Example Components

### Login Form
See: `src/components/features/auth/LoginForm.tsx`

### Using the Login Form:
```typescript
// app/login/page.tsx
import LoginForm from '@/components/features/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm />
    </div>
  );
}
```

## 📖 Additional Resources

- **Architecture Guide**: See `src/ARCHITECTURE.md` for detailed documentation
- **API Constants**: `src/constants/api.constants.ts` - All API endpoints
- **API Types**: `src/types/api.types.ts` - All TypeScript types
- **Axios Config**: `src/lib/axios.ts` - Axios instance with interceptors

## 🚀 Next Steps

1. **Create login/register pages** using the `LoginForm` component
2. **Add protected routes** using middleware
3. **Create product pages** using `productsService`
4. **Add loading states** with React Suspense
5. **Implement error boundaries** for better error handling
6. **Add toast notifications** for user feedback

## ✨ Summary

You now have:
- ✅ Enterprise-level folder structure
- ✅ Robust Axios setup with interceptors
- ✅ Automatic authentication with token refresh
- ✅ Type-safe API calls
- ✅ Service layer pattern (separation of concerns)
- ✅ Example components and hooks
- ✅ Global error handling
- ✅ Development/production environment configuration

Your frontend is now production-ready! 🎉
