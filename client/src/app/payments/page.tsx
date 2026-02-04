"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  Loader2,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePayments } from "@/hooks/usePayment";
import { useIsAuthenticated, useIsHydrated } from "@/stores/userStore";
import type { IPayment, PaymentStatus } from "@/types/payment.types";

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
  PaymentStatus,
  {
    label: string;
    color: string;
    icon: React.ReactNode;
  }
> = {
  init: {
    label: "Initializing",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  success: {
    label: "Successful",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  failed: {
    label: "Failed",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

// Provider display names
const providerNames: Record<string, string> = {
  stripe: "Stripe",
  paypal: "PayPal",
  vnpay: "VNPay",
};

// Payment Row Component
function PaymentRow({ payment }: { payment: IPayment }) {
  const status = statusConfig[payment.status];

  return (
    <TableRow>
      <TableCell className="font-mono text-sm">
        {payment.id.slice(0, 8).toUpperCase()}
      </TableCell>
      <TableCell>
        <Link
          href={`/orders`}
          className="flex items-center gap-1 text-primary hover:underline"
        >
          {payment.orderId.slice(0, 8).toUpperCase()}
          <ExternalLink className="h-3 w-3" />
        </Link>
      </TableCell>
      <TableCell className="font-medium">{formatPrice(payment.amount)}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {providerNames[payment.provider] || payment.provider}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={`flex w-fit items-center gap-1 ${status.color}`}
        >
          {status.icon}
          {status.label}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(payment.createdAt)}
      </TableCell>
    </TableRow>
  );
}

// Payment Card Component (for mobile view)
function PaymentCard({ payment }: { payment: IPayment }) {
  const status = statusConfig[payment.status];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-mono">
            #{payment.id.slice(0, 8).toUpperCase()}
          </CardTitle>
          <Badge
            variant="outline"
            className={`flex items-center gap-1 ${status.color}`}
          >
            {status.icon}
            {status.label}
          </Badge>
        </div>
        <CardDescription>{formatDate(payment.createdAt)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Order</span>
          <Link
            href={`/orders`}
            className="flex items-center gap-1 text-primary hover:underline"
          >
            {payment.orderId.slice(0, 8).toUpperCase()}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-semibold">{formatPrice(payment.amount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Provider</span>
          <Badge variant="outline" className="capitalize">
            {providerNames[payment.provider] || payment.provider}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentHistoryPage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const isHydrated = useIsHydrated();

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch payments
  const { data: paymentsData, isLoading, isError, error } = usePayments({ page, limit });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push("/login?redirect=/payments");
    }
  }, [isHydrated, isAuthenticated, router]);

  // Loading state
  if (!isHydrated || isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading your payments...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
        <CreditCard className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Unable to Load Payments</h1>
        <p className="mt-2 text-center text-muted-foreground">
          {(error as Error)?.message || "Something went wrong. Please try again."}
        </p>
        <Button onClick={() => window.location.reload()} className="mt-6">
          Try Again
        </Button>
      </div>
    );
  }

  const payments = paymentsData?.data || [];
  const pagination = paymentsData?.pagination;

  // Empty state
  if (payments.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <CreditCard className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">No Payments Yet</h1>
        <p className="mt-2 text-center text-muted-foreground">
          You haven&apos;t made any payments yet. Complete an order to see your
          payment history here.
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
        <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
        <p className="mt-2 text-muted-foreground">
          View all your payment transactions
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {payments.map((payment) => (
          <PaymentCard key={payment.id} payment={payment} />
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
          Showing {payments.length} of {pagination.total} payments
        </p>
      )}
    </div>
  );
}
