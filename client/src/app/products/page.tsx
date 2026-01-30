'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ProductCard } from '@/components/features/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { DEFAULT_QUERY_PARAMS } from '@/constants/common.constants';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL params
  const initialPage = Number(searchParams.get('page')) || DEFAULT_QUERY_PARAMS.PAGE;
  const initialSearch = searchParams.get('name') || '';
  const initialCategory = searchParams.get('category') || '';

  // Local state for form inputs
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Debounce search input with 200ms delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Build query params
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: DEFAULT_QUERY_PARAMS.LIMIT,
    ...(debouncedSearch && { name: debouncedSearch }),
    ...(selectedCategory && { category: selectedCategory }),
  }), [currentPage, debouncedSearch, selectedCategory]);

  // Fetch products and categories
  const { 
    data: paginatedProducts, 
    isLoading: isLoadingProducts, 
    isError: isProductsError, 
    error: productsError 
  } = useProducts(queryParams);

  const { 
    data: paginatedCategories, 
    isLoading: isLoadingCategories 
  } = useCategories();

  const products = paginatedProducts?.data || [];
  const pagination = paginatedProducts?.pagination;
  const categories = paginatedCategories?.data || [];

  // Update URL with current filters
  const updateURL = useCallback((params: {
    page?: number;
    name?: string;
    category?: string;
  }) => {
    const url = new URL(window.location.href);
    
    if (params.page && params.page > 1) {
      url.searchParams.set('page', String(params.page));
    } else {
      url.searchParams.delete('page');
    }
    
    if (params.name) {
      url.searchParams.set('name', params.name);
    } else {
      url.searchParams.delete('name');
    }
    
    if (params.category) {
      url.searchParams.set('category', params.category);
    } else {
      url.searchParams.delete('category');
    }
    
    router.push(url.pathname + url.search, { scroll: false });
  }, [router]);

  // Handle search
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    updateURL({ page: 1, name: searchInput, category: selectedCategory });
  }, [searchInput, selectedCategory, updateURL]);

  // Handle category change
  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setCurrentPage(1);
    updateURL({ page: 1, name: searchInput, category });
  }, [searchInput, updateURL]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updateURL({ page, name: searchInput, category: selectedCategory });
    // Scroll to top of product list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchInput, selectedCategory, updateURL]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchInput('');
    setSelectedCategory('');
    setCurrentPage(1);
    updateURL({ page: 1, name: '', category: '' });
  }, [updateURL]);

  // Check if any filters are active
  const hasActiveFilters = debouncedSearch || selectedCategory;

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            All Products
          </h1>
          <p className="mt-2 text-muted-foreground">
            Browse our complete collection of quality products
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters Section */}
        <div className="mb-8 rounded-lg border bg-card p-4 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {/* Search Input */}
            <div className="flex-1">
              <label htmlFor="search" className="mb-2 block text-sm font-medium text-foreground">
                Search Products
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by product name..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="sm:w-48">
              <label htmlFor="category" className="mb-2 block text-sm font-medium text-foreground">
                Category
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Select
                  id="category"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="pl-10"
                  disabled={isLoadingCategories}
                >
                  <option value="">All Categories</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Search Button */}
            <Button type="submit" className="sm:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </form>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchInput && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                  Search: &quot;{searchInput}&quot;
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                  Category: {categories?.find(c => c.id === selectedCategory)?.name || selectedCategory}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoadingProducts && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg text-muted-foreground">Loading products...</span>
          </div>
        )}

        {/* Error State */}
        {isProductsError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-lg text-destructive">
              {productsError?.message || 'Failed to load products. Please try again later.'}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {!isLoadingProducts && !isProductsError && (
          <>
            {/* Results Count */}
            {pagination && (
              <div className="mb-4 text-sm text-muted-foreground">
                Showing {products.length} of {pagination.total} products
                {pagination.totalPages > 1 && ` (Page ${pagination.page} of ${pagination.totalPages})`}
              </div>
            )}

            {/* Product Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No products found</h3>
                <p className="mt-2 text-muted-foreground">
                  {hasActiveFilters
                    ? 'Try adjusting your search or filter criteria'
                    : 'No products are available at the moment'}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                )}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline ml-1">Previous</span>
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          )
        ))}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span className="hidden sm:inline mr-1">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
