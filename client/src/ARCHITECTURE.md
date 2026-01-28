# Frontend Architecture Guide

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router (Pages & Layouts)
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── (auth)/              # Route groups for organization
│       ├── login/
│       └── register/
│
├── components/              # React Components
│   ├── ui/                  # Generic, reusable UI components
│   │   ├── button.tsx      # Button component
│   │   ├── input.tsx       # Input component
│   │   └── card.tsx        # Card component
│   └── features/           # Domain-specific components
│       ├── auth/           # Authentication components
│       └── products/       # Product components
│
├── lib/                    # Third-party library configurations
│   ├── axios.ts           # Axios instance with interceptors
│   └── utils.ts           # Utility functions
│
├── services/              # API Service Layer (Business Logic)
│   ├── auth.service.ts   # Authentication API calls
│   └── products.service.ts # Products API calls
│
├── hooks/                 # Custom React Hooks
│   └── useAuth.ts        # Authentication hook
│
├── types/                 # TypeScript Type Definitions
│   └── api.types.ts      # API request/response types
│
└── constants/            # Static Configuration
    └── api.constants.ts  # API endpoints, error messages
```

## 🏗️ Architecture Principles

### 1. **Separation of Concerns**
- **Components**: Only handle UI rendering and user interactions
- **Services**: Handle all API communication and data transformation
- **Hooks**: Manage state and side effects
- **Types**: Ensure type safety across the application

### 2. **Service Layer Pattern**
Components should **NEVER** import `axios` directly. Always use services:

```typescript
// ❌ BAD - Component calls axios directly
import axios from 'axios';

function ProductList() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    axios.get('/api/products').then(res => setProducts(res.data));
  }, []);
}

// ✅ GOOD - Component uses service layer
import { productsService } from '@/services/products.service';

function ProductList() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    productsService.getProducts().then(setProducts);
  }, []);
}
```

### 3. **Strict TypeScript Typing**
All API calls must be strictly typed:

```typescript
// Define request/response types
interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
}

// Use in service
async login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
    API_ENDPOINTS.AUTH.LOGIN,
    credentials
  );
  return response.data.data;
}
```

## 🔐 Authentication Flow

### 1. **Token Management**
- Access tokens are stored in `localStorage`
- Automatically attached to requests via interceptor
- Automatic token refresh on 401 errors
- Auto-logout when refresh fails

### 2. **Usage Example**

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

## 🚀 Axios Configuration

### Features:
1. **Base URL**: Configured via `NEXT_PUBLIC_API_URL` env variable
2. **Timeout**: 10 seconds by default
3. **Request Interceptor**: Attaches JWT token automatically
4. **Response Interceptor**: 
   - Handles 401 with automatic token refresh
   - Global error handling
   - Logging in development mode

### Interceptor Flow:

```
Request → [Add Auth Token] → API
                                ↓
                            Response
                                ↓
                        [Error Handler]
                                ↓
                    401? → Refresh Token → Retry
                    500? → Log & Show Error
                    Network Error? → Show Network Error
```

## 📝 Creating New Services

When adding new API endpoints:

1. **Add endpoint to constants**:
```typescript
// src/constants/api.constants.ts
export const API_ENDPOINTS = {
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
  }
}
```

2. **Define types**:
```typescript
// src/types/api.types.ts
export interface Order {
  id: string;
  total: number;
  status: string;
}
```

3. **Create service**:
```typescript
// src/services/orders.service.ts
export const ordersService = {
  async getOrders(): Promise<Order[]> {
    const response = await axiosInstance.get<ApiResponse<Order[]>>(
      API_ENDPOINTS.ORDERS.LIST
    );
    return response.data.data;
  }
}
```

4. **Use in component**:
```typescript
import { ordersService } from '@/services/orders.service';
```

## 🛠️ Environment Variables

Create `.env.local` file (not committed to Git):

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_API_TIMEOUT=10000
```

## 📚 Best Practices

1. **Always use the service layer** - Never call axios directly from components
2. **Type everything** - Use TypeScript interfaces for all API data
3. **Centralize constants** - API endpoints, error messages, etc.
4. **Handle errors gracefully** - Use try-catch and show user-friendly messages
5. **Use custom hooks** - Encapsulate complex logic (like `useAuth`)
6. **Keep components dumb** - Logic in services/hooks, UI in components
7. **Use environment variables** - Never hardcode API URLs

## 🔍 Example Usage

### Login Component
```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err) {
      // Error is already handled by the hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}
```

### Products List Component
```typescript
'use client';

import { useEffect, useState } from 'react';
import { productsService } from '@/services/products.service';
import type { Product } from '@/types/api.types';

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsService.getProducts({
        page: 1,
        limit: 10,
      });
      setProducts(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🎯 Summary

This architecture provides:
- ✅ Clean separation between UI and business logic
- ✅ Type-safe API calls
- ✅ Automatic authentication with token refresh
- ✅ Global error handling
- ✅ Scalable and maintainable structure
- ✅ Easy to test (services are pure functions)
