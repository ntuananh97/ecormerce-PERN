"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Home, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useOrderDetail } from "@/hooks/useCheckout";
import { useIsAuthenticated, useIsHydrated } from "@/stores/userStore";

// Helper to format price
const formatPrice = (price: string | number) => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numPrice);
};

// Helper to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper to get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending_payment":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "expired":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper to format status text
const formatStatus = (status: string) => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useIsAuthenticated();
  const isHydrated = useIsHydrated();

  const orderId = searchParams.get("orderId");

  // Fetch order details
  const { data: order, isLoading, isError } = useOrderDetail(orderId || undefined);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [isHydrated, isAuthenticated, router]);

  // No order ID
  if (!orderId) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
        <Package className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">No Order Found</h1>
        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t find an order to display.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  // Loading state
  if (!isHydrated || isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (isError || !order) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
        <Package className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Order Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t load your order details.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  const tax = parseFloat(order.totalAmount) * 0.08;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Success Header */}
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Order Placed Successfully!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Thank you for your order. We&apos;ve received your order and will begin
          processing it soon.
        </p>
      </div>

      {/* Order Details Card */}
      <Card className="mx-auto mt-8 max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Order Details</CardTitle>
              <CardDescription className="mt-1">
                Order ID: {order.id.slice(0, 8).toUpperCase()}
              </CardDescription>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                order.status
              )}`}
            >
              {formatStatus(order.status)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Order Date</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Order Total</p>
              <p className="font-medium">{formatPrice(order.totalAmount)}</p>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="mb-4 font-semibold">Items Ordered</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.lineTotal)}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(parseFloat(order.totalAmount) - tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (8%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/products">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Additional Info */}
      <div className="mx-auto mt-8 max-w-2xl text-center">
        <p className="text-sm text-muted-foreground">
          A confirmation email has been sent to your registered email address.
          <br />
          If you have any questions about your order, please contact our support
          team.
        </p>
      </div>
    </div>
  );
}
