'use client';

import { ProductCard } from "@/components/features/products/ProductCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { getDefaultsQueryParams } from "@/lib/utils";

const defaultQueryParams = getDefaultsQueryParams();

const FeaturedProducts = () => {
  // Fetch products using React Query
  const { data: paginatedProducts, isLoading, isError, error } = useProducts(defaultQueryParams);
  const products = paginatedProducts?.data || [];


  return (
    <section id="featured" className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Featured Products
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Handpicked selection of our most popular items. Each product is
            carefully selected for quality and value.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading products...</span>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
            <p className="text-destructive">
              {error?.message || 'Failed to load products. Please try again later.'}
            </p>
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && !isError && products && (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Empty State */}
            {products.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No products available at the moment.</p>
              </div>
            )}
          </>
        )}

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/#featured">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
