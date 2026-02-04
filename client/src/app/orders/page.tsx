"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Loader2,
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOrders } from "@/hooks/useCheckout";
import { useInitPayment } from "@/hooks/usePayment";
import { useIsAuthenticated, useIsHydrated } from "@/stores/userStore";
import type { IOrder, OrderStatus } from "@/types/checkout.types";

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
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Status configuration
const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    icon: React.ReactNode;
  }
> = {
  pending_payment: {
    label: "Pending Payment",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  paid: {
    label: "Paid",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  expired: {
    label: "Expired",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
};

// Order Card Component
function OrderCard({
  order,
  onPayNow,
  processingOrderId,
}: {
  order: IOrder;
  onPayNow: (orderId: string) => void;
  processingOrderId: string | null;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = statusConfig[order.status];
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const isThisOrderProcessing = processingOrderId === order.id;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </CardTitle>
              <Badge
                variant="outline"
                className={`flex items-center gap-1 ${status.color}`}
              >
                {status.icon}
                {status.label}
              </Badge>
            </div>
            <CardDescription>{formatDate(order.createdAt)}</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
              <p className="text-lg font-semibold">
                {formatPrice(order.totalAmount)}
              </p>
            </div>
            {order.status === "pending_payment" && (
              <Button
                onClick={() => onPayNow(order.id)}
                disabled={isThisOrderProcessing}
                className="whitespace-nowrap"
              >
                {isThisOrderProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Pay Now
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Expandable Items Section */}
      <CardContent className="pt-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between text-muted-foreground hover:text-foreground"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>View order details</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <Separator />

            {/* Order Items */}
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(item.lineTotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Order Summary */}
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Payment Info for Paid Orders */}
            {order.paidAt && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Paid on {formatDate(order.paidAt)}</span>
                </div>
              </div>
            )}

            {/* Cancelled Info */}
            {order.cancelledAt && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  <span>Cancelled on {formatDate(order.cancelledAt)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const isHydrated = useIsHydrated();

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 10;

  // Track which order is being processed
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  // Fetch orders
  const { data: ordersData, isLoading, isError, error } = useOrders({ page, limit });
  console.log("🚀 ~ OrderHistoryPage ~ ordersData:", ordersData)

  // Payment mutation
  const {
    initPayment,
    isLoading: isPaymentLoading,
    isError: isPaymentError,
    error: paymentError,
    isSuccess: isPaymentSuccess,
    data: paymentData,
  } = useInitPayment();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push("/login?redirect=/orders");
    }
  }, [isHydrated, isAuthenticated, router]);

  // Handle Pay Now click
  const handlePayNow = async (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      const result = await initPayment({
        orderId,
        provider: "stripe", // Default payment provider
      });

      // If no payment URL returned (backend TODO), show success message
      if (!result.paymentUrl) {
        alert(`Payment initiated! Payment ID: ${result.paymentId}\n\nNote: Payment gateway integration is pending.`);
      }
      // If payment URL exists, redirect happens automatically in the hook
    } catch (err) {
      console.error("Payment initiation failed:", err);
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Loading state
  if (!isHydrated || isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
        <Package className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Unable to Load Orders</h1>
        <p className="mt-2 text-center text-muted-foreground">
          {(error as Error)?.message || "Something went wrong. Please try again."}
        </p>
        <Button onClick={() => window.location.reload()} className="mt-6">
          Try Again
        </Button>
      </div>
    );
  }

  const orders = ordersData?.data || [];
  const pagination = ordersData?.pagination;

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">No Orders Yet</h1>
        <p className="mt-2 text-center text-muted-foreground">
          You haven&apos;t placed any orders yet. Start shopping to see your
          orders here.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">
            Start Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage your orders
        </p>
      </div>

      {/* Payment Error Alert */}
      {isPaymentError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {(paymentError as Error)?.message || "Failed to initiate payment. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onPayNow={handlePayNow}
            processingOrderId={processingOrderId}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="px-4 text-sm text-muted-foreground">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Summary Info */}
      {pagination && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Showing {orders.length} of {pagination.total} orders
        </p>
      )}
    </div>
  );
}
