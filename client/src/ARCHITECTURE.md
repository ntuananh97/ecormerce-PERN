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
│       │   └── UserInitializer.tsx # Hydrates user store on mount
│       ├── cart/           # Shopping cart components
│       │   └── CartInitializer.tsx # Loads cart on mount
│       └── products/       # Product components
│
├── lib/                    # Third-party library configurations
│   ├── axios.ts           # Axios instance with interceptors
│   ├── react-query.ts     # React Query configuration
│   └── utils.ts           # Utility functions

├── providers/             # React Context Providers
│   └── QueryProvider.tsx # React Query provider
│
├── services/              # API Service Layer (Business Logic)
│   ├── auth.service.ts   # Authentication API calls
│   ├── cart.service.ts   # Cart operations (localStorage + API)
│   └── products.service.ts # Products API calls
│
├── hooks/                 # Custom React Hooks
│   ├── useAuth.ts        # Authentication hook
│   ├── useCart.ts        # Cart operations hook
│   └── useProducts.ts    # Product queries hook (React Query)
│
├── types/                 # TypeScript Type Definitions
│   ├── api.types.ts      # API request/response types
│   ├── cart.types.ts     # Cart-related types
│   └── product.types.ts  # Product-related types
│
├── stores/               # Zustand State Management
│   ├── userStore.ts     # User authentication state
│   └── cartStore.ts     # Shopping cart state
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

## 🛒 Shopping Cart Architecture

### 1. **Hybrid Cart System**

The cart system supports both **guest users** (localStorage) and **authenticated users** (server API):

```
┌─────────────────────────────────────────┐
│         Cart Architecture               │
├─────────────────────────────────────────┤
│                                         │
│  Guest User           Authenticated     │
│  (Not logged in)      (Logged in)       │
│       │                     │            │
│       ▼                     ▼            │
│  localStorage            Server API      │
│  (guest_cart)           (/carts/me)      │
│       │                     │            │
│       └──────┬──────────────┘            │
│              ▼                           │
│         cartStore.ts                     │
│         (Zustand)                        │
│              │                           │
│              ▼                           │
│          Navbar                          │
│      (Cart Badge)                        │
└─────────────────────────────────────────┘
```

### 2. **Cart Components**

**CartInitializer** (`components/features/cart/CartInitializer.tsx`):
- Runs on application mount
- Loads guest cart from localStorage for non-authenticated users
- Loads server cart via API for authenticated users
- Automatically syncs with auth state changes

**Integration in Layout**:
```typescript
// app/layout.tsx
<QueryProvider>
  <UserInitializer initialUser={initialUser} />
  <CartInitializer />  {/* Initializes cart after user */}
  <Navbar />
</QueryProvider>
```

### 3. **Cart State Management (Zustand)**

**cartStore.ts** manages global cart state:

```typescript
import { useCartStore, useCartItemCount, useCartTotal } from '@/stores/cartStore';

// In any component
const cartItemCount = useCartItemCount();  // Get total item count
const cartTotal = useCartTotal();          // Get total price
const items = useCartItems();              // Get all items
```

### 4. **Cart Service Layer**

**cart.service.ts** provides three services:

1. **guestCartService** - localStorage operations for guest users
   - `getCart()`, `addItem()`, `updateItem()`, `removeItem()`, `clearCart()`

2. **authenticatedCartService** - API calls for logged-in users
   - `getCart()`, `addItem()`, `updateItem()`, `removeItem()`

3. **cartService** - Unified helpers
   - `clearLocalCart()` - Clear localStorage (used on logout)
   - `loadCartFromServer()` - Load from API (used on login)

### 5. **Cart Hook**

**useCart** hook (`hooks/useCart.ts`) provides a unified interface:

```typescript
import { useCart } from '@/hooks/useCart';

function ProductCard({ product }) {
  const { addToCart, isLoading } = useCart();

  const handleAddToCart = async () => {
    await addToCart(product.id, 1, {
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images,
      stock: product.stock,
    });
  };

  return (
    <button onClick={handleAddToCart} disabled={isLoading}>
      Add to Cart
    </button>
  );
}
```

### 6. **Login/Logout Cart Flow**

**On Login:**
```typescript
// useAuth.ts - login()
1. User logs in successfully
2. Load cart from server (overwrite local state)
3. Clear guest cart from localStorage
4. Update cartStore with server cart items
```

**On Logout:**
```typescript
// useAuth.ts - logout()
1. User logs out
2. Clear cartStore
3. Clear localStorage guest_cart
4. Cart starts fresh for next guest session
```

### 7. **Cart Data Types**

```typescript
// types/cart.types.ts

// Authenticated cart item (has server-generated id)
interface CartItem {
  id: string;           // Server-generated ID
  productId: string;
  quantity: number;
  product: CartProductInfo;
}

// Guest cart item (no server ID)
type GuestCartItem = Omit<CartItem, 'id'>;
```

### 8. **Usage Examples**

**Display cart count in Navbar:**
```typescript
import { useCartItemCount } from '@/stores/cartStore';

export function Navbar() {
  const cartItemCount = useCartItemCount();

  return (
    <Badge>{cartItemCount}</Badge>
  );
}
```

**Add product to cart:**
```typescript
const { addToCart, isLoading } = useCart();

await addToCart(productId, quantity, productInfo);
```

**Update cart item quantity:**
```typescript
const { updateQuantity } = useCart();

await updateQuantity(itemId, newQuantity);
```

**Remove item from cart:**
```typescript
const { removeFromCart } = useCart();

await removeFromCart(itemId);
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

## 🔄 React Query (TanStack Query)

### Overview
This project uses **TanStack Query** (React Query) for server state management. It provides:
- ✅ Automatic caching and background refetching
- ✅ Loading and error states out of the box
- ✅ Optimistic updates and cache invalidation
- ✅ Built-in retry and pagination support
- ✅ DevTools for debugging (development only)

### Setup

**1. QueryProvider** wraps the entire app in `app/layout.tsx`:

```typescript
import { QueryProvider } from '@/providers/QueryProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

**2. Query Configuration** is centralized in `lib/react-query.ts`:

```typescript
export const queryConfig = {
  queries: {
    staleTime: 5 * 60 * 1000,      // 5 minutes
    gcTime: 10 * 60 * 1000,        // 10 minutes
    retry: 3,
    refetchOnWindowFocus: false,    // Disable in development
  },
};
```

### Query Keys Pattern

All query keys are centralized in `lib/react-query.ts` for consistency:

```typescript
export const queryKeys = {
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...queryKeys.products.details(), id] as const,
  },
  cart: {
    all: ['cart'] as const,
    me: () => [...queryKeys.cart.all, 'me'] as const,
  },
};
```

### Custom Hooks Pattern

**IMPORTANT**: Each domain should have its own hook file (e.g., `useProducts`, `useOrders`).

#### Example: `hooks/useProducts.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import { queryKeys } from '@/lib/react-query';

/**
 * Fetch paginated products list
 */
export function useProducts(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productsService.getProducts(params),
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
}

/**
 * Fetch single product by ID
 */
export function useProduct(id: string | number | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id!),
    queryFn: () => productsService.getProduct(id!),
    enabled: !!id, // Only run when id exists
  });
}

/**
 * Create new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) =>
      productsService.createProduct(data),
    onSuccess: () => {
      // Invalidate list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });
    },
  });
}
```

### Usage in Components

Components should use custom hooks, never call services directly:

```typescript
'use client';

import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/features/products/ProductCard';
import { Loader2 } from 'lucide-react';

export default function ProductsList() {
  // Use React Query hook
  const { data, isLoading, isError, error } = useProducts({
    page: 1,
    limit: 10,
  });

  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {data?.data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Benefits

1. **No Manual Loading States**: React Query handles `isLoading`, `isError` automatically
2. **Automatic Caching**: Same queries share data, reducing API calls
3. **Background Refetching**: Data stays fresh without user intervention
4. **Optimistic Updates**: UI updates instantly before API confirmation
5. **DevTools**: Visual debugging in development mode

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
2. **Use React Query hooks** - For all data fetching, use custom hooks like `useProducts`
3. **Type everything** - Use TypeScript interfaces for all API data
4. **Centralize constants** - API endpoints, error messages, query keys, etc.
5. **Handle errors gracefully** - Use try-catch and show user-friendly messages
6. **Use custom hooks** - Encapsulate complex logic (like `useAuth`, `useProducts`)
7. **Keep components dumb** - Logic in services/hooks, UI in components
8. **Use environment variables** - Never hardcode API URLs
9. **Separate query hooks** - One hook file per domain (e.g., `useProducts`, `useOrders`)
10. **Leverage cache invalidation** - Use `queryClient.invalidateQueries()` after mutations

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

### Products List Component (with React Query)
```typescript
'use client';

import { useProducts } from '@/hooks/useProducts';
import { Loader2 } from 'lucide-react';

export default function ProductsList() {
  // React Query handles loading, error, and data automatically
  const { data, isLoading, isError, error } = useProducts({
    page: 1,
    limit: 10,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div className="grid gap-4">
      {data?.data.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

### Product Mutations Example
```typescript
'use client';

import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';

export default function ProductForm() {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const handleCreate = async () => {
    try {
      await createProduct.mutateAsync({
        name: 'New Product',
        price: 99.99,
        description: 'Description',
        category: 'Electronics',
        stock: 10,
      });
      // Data is automatically refetched due to cache invalidation
      alert('Product created!');
    } catch (error) {
      console.error('Failed to create:', error);
    }
  };

  return (
    <button onClick={handleCreate} disabled={createProduct.isPending}>
      {createProduct.isPending ? 'Creating...' : 'Create Product'}
    </button>
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
