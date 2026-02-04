"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, ShoppingBag, AlertCircle, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCheckout } from "@/hooks/useCheckout";
import { useIsAuthenticated, useIsHydrated } from "@/stores/userStore";
import { CheckoutMode } from "@/types/checkout.types";

// Helper to format price
const formatPrice = (price: string | number) => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numPrice);
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useIsAuthenticated();
  const isHydrated = useIsHydrated();

  // Get checkout params from URL
  const mode = searchParams.get("mode") as CheckoutMode | null;
  const cartItemIds = useMemo(
    () => searchParams.get("cartItemIds")?.split(",").filter(Boolean),
    [searchParams]
  );
  const productId = searchParams.get("productId");
  const quantity = parseInt(searchParams.get("quantity") || "1", 10);

  // Checkout hook
  const {
    session,
    initializeCheckout,
    isSessionLoading,
    sessionError,
    isSessionError,
    placeOrder,
    isOrderLoading,
    orderError,
    isOrderError,
  } = useCheckout();

  // Track if session has been initialized
  const [isInitialized, setIsInitialized] = useState(false);
  console.log("🚀 ~ CheckoutPage ~ isInitialized:", isInitialized)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isHydrated, isAuthenticated, router]);

  // Initialize checkout session
  useEffect(() => {
    if (!isHydrated || !isAuthenticated || isInitialized) return;
    if (!mode) return;

    const init = async () => {
      if (mode === CheckoutMode.CART && cartItemIds?.length) {
        await initializeCheckout(mode, cartItemIds);
      } else if (mode === CheckoutMode.DIRECT && productId) {
        await initializeCheckout(mode, undefined, productId, quantity);
      }
      setIsInitialized(true);
    };
    console.log('init');

    init();
    // initializeCheckout is stable and doesn't need to be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isHydrated,
    isAuthenticated,
    isInitialized,
    mode,
    cartItemIds,
    productId,
    quantity,
  ]);

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!mode) return;

    try {
      if (mode === CheckoutMode.CART && cartItemIds?.length) {
        await placeOrder(mode, cartItemIds);
      } else if (mode === CheckoutMode.DIRECT && productId) {
        await placeOrder(mode, undefined, productId, quantity);
      }
    } catch (error) {
      console.error("Failed to place order:", error);
    }
  };

  // Loading state while checking auth
  if (!isHydrated) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not authenticated - will redirect
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-semibold">Please log in to checkout</h1>
        <p className="mt-2 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  // Invalid checkout params
  if (!mode || (mode === CheckoutMode.CART && !cartItemIds?.length) || (mode === CheckoutMode.DIRECT && !productId)) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">Invalid Checkout</h1>
        <p className="mt-2 text-center text-muted-foreground">
          No items found for checkout. Please add items to your cart first.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Browse Products
          </Link>
        </Button>
      </div>
    );
  }

  // Loading session
  if (isSessionLoading || !session) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
          <p className="mt-2 text-muted-foreground">Loading your order...</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="animate-pulse space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4 rounded-lg border p-4">
                  <div className="h-20 w-20 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-4 w-1/4 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="animate-pulse rounded-lg border p-6">
              <div className="h-6 w-1/2 rounded bg-muted" />
              <div className="mt-4 space-y-3">
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Session error
  if (isSessionError) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Alert variant="destructive" className="max-w-xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Checkout Error</AlertTitle>
          <AlertDescription>
            {sessionError instanceof Error
              ? sessionError.message
              : "Failed to load checkout. Please try again."}
          </AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link href="/cart">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Cart
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Items not valid
  if (!session.valid) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Alert variant="destructive" className="max-w-xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Items Unavailable</AlertTitle>
          <AlertDescription>
            Some items in your order are no longer available or out of stock.
            Please return to your cart and update your items.
          </AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link href="/cart">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Cart
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { items, breakdown } = session;
  const tax = breakdown.totalAmount * 0.08;
  const finalTotal = breakdown.totalAmount + tax + breakdown.shippingCost - breakdown.discount;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="mt-2 text-muted-foreground">
          Review your order and complete your purchase
        </p>
      </div>

      {/* Order Error Alert */}
      {isOrderError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Order Failed</AlertTitle>
          <AlertDescription>
            {orderError instanceof Error
              ? orderError.message
              : "Failed to place order. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">Product</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                              <Image
                                src={item.image || "/placeholder.png"}
                                alt={item.productName}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">
                                In stock: {item.stock}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPrice(item.price)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(item.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="space-y-4 md:hidden">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 rounded-lg border p-4"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={item.image || "/placeholder.png"}
                        alt={item.productName}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} x {formatPrice(item.price)}
                      </p>
                      <p className="mt-auto font-semibold">
                        {formatPrice(item.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Back to Cart Link */}
          <div className="mt-6">
            <Button asChild variant="ghost">
              <Link href="/cart">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cart
              </Link>
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(breakdown.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {breakdown.shippingCost > 0
                    ? formatPrice(breakdown.shippingCost)
                    : "Free"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              {breakdown.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(breakdown.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isOrderLoading}
              >
                {isOrderLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Place Order
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                By placing your order, you agree to our Terms of Service and
                Privacy Policy.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
