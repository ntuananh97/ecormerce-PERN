/**
 * Mock Data for E-commerce Application
 * Contains product data and cart items for development/testing
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  rating: number;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// Mock Products Data
export const products: Product[] = [
  {
    id: "1",
    name: "Minimalist Leather Watch",
    price: 199.99,
    description:
      "A sleek, minimalist watch with a genuine leather strap and stainless steel case. Features a Japanese quartz movement and water resistance up to 30 meters. Perfect for both casual and formal occasions.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
    category: "Accessories",
    rating: 4.8,
    stock: 25,
  },
  {
    id: "2",
    name: "Wireless Noise-Canceling Headphones",
    price: 349.99,
    description:
      "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and Hi-Res Audio support. Crafted with memory foam ear cushions for all-day comfort.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    category: "Electronics",
    rating: 4.9,
    stock: 18,
  },
  {
    id: "3",
    name: "Premium Cotton T-Shirt",
    price: 49.99,
    description:
      "Made from 100% organic cotton, this essential t-shirt features a relaxed fit and reinforced stitching. Pre-shrunk and machine washable for easy care.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
    category: "Clothing",
    rating: 4.5,
    stock: 100,
  },
  {
    id: "4",
    name: "Ceramic Pour-Over Coffee Set",
    price: 79.99,
    description:
      "Handcrafted ceramic dripper with matching server and filter holder. Produces a clean, flavorful cup every time. Includes reusable stainless steel filter.",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=500&fit=crop",
    category: "Home & Kitchen",
    rating: 4.7,
    stock: 35,
  },
  {
    id: "5",
    name: "Ultralight Running Sneakers",
    price: 159.99,
    description:
      "Engineered mesh upper with responsive foam cushioning. Weighs only 8oz and features a carbon fiber plate for maximum energy return. Ideal for marathon runners.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
    category: "Footwear",
    rating: 4.6,
    stock: 42,
  },
  {
    id: "6",
    name: "Leather Laptop Sleeve",
    price: 89.99,
    description:
      "Full-grain leather sleeve fits laptops up to 15 inches. Features soft microfiber lining and magnetic closure. Includes front pocket for accessories.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
    category: "Accessories",
    rating: 4.4,
    stock: 60,
  },
  {
    id: "7",
    name: "Smart Home Speaker",
    price: 129.99,
    description:
      "Voice-controlled speaker with premium 360-degree sound. Compatible with all major smart home platforms. Features built-in ambient light sensor.",
    image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=500&h=500&fit=crop",
    category: "Electronics",
    rating: 4.3,
    stock: 55,
  },
  {
    id: "8",
    name: "Bamboo Sunglasses",
    price: 69.99,
    description:
      "Eco-friendly sunglasses with bamboo temples and polarized lenses. Provides 100% UV protection. Comes with a recycled cork case.",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop",
    category: "Accessories",
    rating: 4.2,
    stock: 80,
  },
];

// Featured products (subset for homepage)
export const featuredProducts = products.slice(0, 6);

// Mock Cart Data (for Cart Page)
export const mockCartItems: CartItem[] = [
  {
    product: products[0],
    quantity: 1,
  },
  {
    product: products[1],
    quantity: 2,
  },
  {
    product: products[4],
    quantity: 1,
  },
];

// Helper functions
export const getProductById = (id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

export const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
};

export const calculateTax = (subtotal: number, taxRate: number = 0.08): number => {
  return subtotal * taxRate;
};

export const calculateTotal = (subtotal: number, tax: number): number => {
  return subtotal + tax;
};
