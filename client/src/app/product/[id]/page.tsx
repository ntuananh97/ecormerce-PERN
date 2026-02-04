"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingCart, Star, Truck, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getProductById, formatPrice, products } from "@/data/mockData";
import { ProductCard } from "@/components/features/products/ProductCard";
import { useProduct } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = use(params);
  const { data: product } = useProduct(id);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  // Get related products (same category, excluding current product)
  // const relatedProducts = products
  //   .filter((p) => p.category === product?.category && p.id !== id)
  //   .slice(0, 3);

  if (!product) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The product you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    );
  }

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAdding(true);
    try {
      const productInfo = {
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images,
        stock: product.stock,
      };

      await addToCart(product.id, quantity, productInfo);
      
      // Optional: Show success message
      console.log(`Added ${quantity} ${product.name} to cart!`);
      setQuantity(1); // Reset quantity
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Optional: Show error message
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/#featured" className="hover:text-foreground">
              Shop
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground">{product.name}</li>
        </ol>
      </nav>

      {/* Product Details */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
          <Image
            src={product.images}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          {product.stock < 10 && product.stock > 0 && (
            <Badge className="absolute left-4 top-4 bg-amber-500 hover:bg-amber-500">
              Only {product.stock} left
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="destructive" className="absolute left-4 top-4">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Category */}
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {product.category.name}
          </p>

          {/* Title */}
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {product.name}
          </h1>

          {/* Rating */}
          {/* <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating} out of 5
            </span>
          </div> */}

          {/* Price */}
          <p className="mt-6 text-4xl font-bold text-foreground">
            {/* {formatPrice(product.price)} */}
            {product.price}
          </p>

          <Separator className="my-6" />

          {/* Description */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </h2>
            <p className="mt-3 leading-relaxed text-foreground">
              {product.description}
            </p>
          </div>

          <Separator className="my-6" />

          {/* Quantity Selector */}
          <div>
            <label
              htmlFor="quantity"
              className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Quantity
            </label>
            <div className="mt-3 flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1 || product.stock === 0}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-20 text-center"
                disabled={product.stock === 0}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                disabled={quantity >= product.stock || product.stock === 0}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {product.stock} available
              </span>
            </div>
          </div>

          {/* Add to Cart & Buy Now Buttons */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button
              size="lg"
              className="flex-1"
              disabled={product.stock === 0 || isAdding}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {isAdding ? 'Adding to Cart...' : `Add to Cart - $${Number(product.price) * quantity}`}
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="flex-1"
              disabled={product.stock === 0}
            >
              <Link href={`/checkout?mode=DIRECT&productId=${product.id}&quantity=${quantity}`}>
                <Zap className="mr-2 h-5 w-5" />
                Buy Now
              </Link>
            </Button>
          </div>

          {/* Shipping Info */}
          <div className="mt-8 flex items-center gap-3 rounded-lg bg-muted p-4">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Free Shipping</p>
              <p className="text-xs text-muted-foreground">
                On orders over $50. Delivery in 3-5 business days.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {/* {relatedProducts.length > 0 && (
        <section className="mt-16">
          <Separator className="mb-12" />
          <h2 className="text-2xl font-bold tracking-tight">
            You May Also Like
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )} */}
    </div>
  );
}
