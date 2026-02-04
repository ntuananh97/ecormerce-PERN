/**
 * usePayment Hook
 * Custom hook for payment operations using React Query
 */

'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query';
import { paymentService } from '@/services/payment.service';
import type { ICreatePaymentRequest, IPaymentQueryParams } from '@/types/payment.types';

/**
 * Hook for fetching payment history
 * @param params - Query params (pagination, sorting)
 */
export function usePayments(params?: IPaymentQueryParams) {
  return useQuery({
    queryKey: queryKeys.payments.list(params as Record<string, unknown> | undefined),
    queryFn: () => paymentService.getPayments(params),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook for initiating a payment
 * Returns mutation for creating payment and redirecting to payment URL
 */
export function useInitPayment() {
  const mutation = useMutation({
    mutationFn: (data: ICreatePaymentRequest) => paymentService.initPayment(data),
    onSuccess: (response) => {
      // If payment URL is provided, redirect to payment gateway
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      }
    },
  });

  return {
    initPayment: mutation.mutateAsync,
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

/**
 * Hook for fetching payment status
 * @param paymentId - Payment ID to check status
 */
export function usePaymentStatus(paymentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.payments.status(paymentId!),
    queryFn: () => paymentService.getPaymentStatus(paymentId!),
    enabled: !!paymentId,
    // Poll every 5 seconds for pending payments
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Stop polling if payment is complete or failed
      if (status === 'success' || status === 'failed') {
        return false;
      }
      return 5000; // 5 seconds
    },
  });
}

export default useInitPayment;
