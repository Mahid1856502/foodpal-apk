import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Order, OrderStatus } from '../../../types/base';
import { TodayOrdersResponse } from '../../../types/order';
import { apiRequest } from '../../../utils/api';

export function useTodayOrders(branchId?: string) {
  return useQuery<TodayOrdersResponse, Error>({
    queryKey: ['orders', 'today', branchId],
    queryFn: () =>
      apiRequest<TodayOrdersResponse>(
        'GET',
        `/orders/branch/${branchId}/today`,
      ),
    enabled: !!branchId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/** -----------------------------
 * Accept order (incoming → preparing)
 * ----------------------------- */
export function useAcceptOrder(branchId?: string) {
  const queryClient = useQueryClient();

  return useMutation<
    Order,
    Error,
    { orderId: string; etaMinutes?: number },
    { previousData?: TodayOrdersResponse }
  >({
    // ✅ Accept optional etaMinutes
    mutationFn: ({ orderId, etaMinutes }) => {
      console.log('orderId, etaMinutes', orderId, etaMinutes);
      return apiRequest<Order>('POST', `/orders/${orderId}/accept`, {
        etaMinutes,
      });
    },

    // ✅ Optimistic update
    onMutate: async ({ orderId, etaMinutes }) => {
      await queryClient.cancelQueries({
        queryKey: ['orders', 'today', branchId],
      });

      const previousData = queryClient.getQueryData<TodayOrdersResponse>([
        'orders',
        'today',
        branchId,
      ]);

      if (previousData) {
        queryClient.setQueryData<TodayOrdersResponse>(
          ['orders', 'today', branchId],
          {
            ...previousData,
            orders: previousData.orders.map(o =>
              o.id === orderId
                ? {
                    ...o,
                    status: 'PREPARING',
                    acceptedAt: new Date()?.toString(),
                    etaMinutes: etaMinutes ?? o.etaMinutes,
                  }
                : o,
            ),
          },
        );
      }

      return { previousData };
    },

    // ✅ Rollback if failed
    onError: (err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['orders', 'today', branchId],
          context.previousData,
        );
      }
    },

    // ✅ Always refetch
    onSettled: () => {
      // queryClient.invalidateQueries({
      //   queryKey: ['orders', 'today', branchId],
      // });
    },
  });
}

/** -----------------------------
 * Adjust ETA of an order
 * ----------------------------- */
export function useAdjustEta(branchId?: string) {
  const queryClient = useQueryClient();

  return useMutation<
    Order,
    Error,
    { orderId: string; etaMinutes: number },
    { previousData?: TodayOrdersResponse }
  >({
    mutationFn: ({ orderId, etaMinutes }) => {
      console.log('orderId etaMinutes', orderId, etaMinutes);
      return apiRequest<Order>('POST', `/orders/${orderId}/adjust-eta`, {
        minutes: etaMinutes,
      });
    },

    onMutate: async ({ orderId, etaMinutes }) => {
      await queryClient.cancelQueries({
        queryKey: ['orders', 'today', branchId],
      });

      const previousData = queryClient.getQueryData<TodayOrdersResponse>([
        'orders',
        'today',
        branchId,
      ]);
      if (previousData) {
        queryClient.setQueryData<TodayOrdersResponse>(
          ['orders', 'today', branchId],
          {
            ...previousData,
            orders: previousData.orders.map(o =>
              o.id === orderId ? { ...o, etaMinutes } : o,
            ),
          },
        );
      }

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['orders', 'today', branchId],
          context.previousData,
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['orders', 'today', branchId],
      });
    },
  });
}

/** -----------------------------
 * Mark order as ready (preparing → ready)
 * ----------------------------- */
export function useMarkReady(branchId?: string) {
  const queryClient = useQueryClient();

  return useMutation<
    Order,
    Error,
    string,
    { previousData?: TodayOrdersResponse }
  >({
    mutationFn: (orderId: string) =>
      apiRequest<Order>('POST', `/orders/${orderId}/mark-ready`),

    onMutate: async (orderId: string) => {
      await queryClient.cancelQueries({
        queryKey: ['orders', 'today', branchId],
      });

      const previousData = queryClient.getQueryData<TodayOrdersResponse>([
        'orders',
        'today',
        branchId,
      ]);

      if (previousData) {
        queryClient.setQueryData<TodayOrdersResponse>(
          ['orders', 'today', branchId],
          {
            ...previousData,
            orders: previousData.orders.map(o =>
              o.id === orderId ? { ...o, status: 'READY' } : o,
            ),
          },
        );
      }

      return { previousData };
    },

    onError: (err, orderId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['orders', 'today', branchId],
          context.previousData,
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['orders', 'today', branchId],
      });
    },
  });
}

/** -----------------------------
 * Mark order as done (ready → completed)
 * ----------------------------- */
export function useMarkDone(branchId?: string) {
  const queryClient = useQueryClient();

  return useMutation<
    Order,
    Error,
    string,
    { previousData?: TodayOrdersResponse }
  >({
    mutationFn: (orderId: string) =>
      apiRequest<Order>('POST', `/orders/${orderId}/mark-done`),

    onMutate: async (orderId: string) => {
      await queryClient.cancelQueries({
        queryKey: ['orders', 'today', branchId],
      });

      const previousData = queryClient.getQueryData<TodayOrdersResponse>([
        'orders',
        'today',
        branchId,
      ]);

      if (previousData) {
        queryClient.setQueryData<TodayOrdersResponse>(
          ['orders', 'today', branchId],
          {
            ...previousData,
            orders: previousData.orders.map(o =>
              o.id === orderId ? { ...o, status: 'COMPLETED' } : o,
            ),
          },
        );
      }

      return { previousData };
    },

    onError: (err, orderId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['orders', 'today', branchId],
          context.previousData,
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['orders', 'today', branchId],
      });
    },
  });
}

/** -----------------------------
 * Reject order (cancel → cancelled)
 * ----------------------------- */
export function useRejectOrder(branchId?: string) {
  const queryClient = useQueryClient();

  return useMutation<
    Order,
    Error,
    string,
    { previousData?: TodayOrdersResponse }
  >({
    mutationFn: (orderId: string) =>
      apiRequest<Order>('POST', `/orders/${orderId}/reject`),

    // Optimistic update
    onMutate: async (orderId: string) => {
      await queryClient.cancelQueries({
        queryKey: ['orders', 'today', branchId],
      });

      const previousData = queryClient.getQueryData<TodayOrdersResponse>([
        'orders',
        'today',
        branchId,
      ]);

      if (previousData) {
        queryClient.setQueryData<TodayOrdersResponse>(
          ['orders', 'today', branchId],
          {
            ...previousData,
            orders: previousData.orders.map(o =>
              o.id === orderId ? { ...o, status: 'CANCELLED' } : o,
            ),
          },
        );
      }

      return { previousData };
    },

    // Rollback if failed
    onError: (err, orderId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['orders', 'today', branchId],
          context.previousData,
        );
      }
    },

    // Revalidate data after success or error
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['orders', 'today', branchId],
      });
    },
  });
}

/**
 * Response type for cancelled orders grouped by date
 */
export interface GroupedOrders {
  date: string;
  count: number;
  orders: Order[];
}

/**
 * ✅ Fetch grouped orders filtered by status (and optionally branch)
 * Example:
 *   const { data, isLoading } = useGroupedOrders(branchId, OrderStatus.CANCELLED);
 */
export function useGroupedOrders(branchId?: string, status?: OrderStatus) {
  return useQuery<GroupedOrders[], Error>({
    queryKey: ['orders', 'grouped', status, branchId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (branchId) params.append('branchId', branchId);
      if (status) params.append('status', status);

      return apiRequest<GroupedOrders[]>(
        'GET',
        `/orders/grouped${params.toString() ? `?${params.toString()}` : ''}`,
      );
    },
    enabled: !!branchId, // only fetch when both exist
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/** -----------------------------
 * 📊 Fetch daily sales summary
 * ----------------------------- */
export interface SalesSummary {
  date: string;
  branchId: string;
  totalOrders: number;
  totalSales: number;
  paymentBreakdown: {
    card: number;
    cash: number;
  };
  orderTypeBreakdown: {
    delivered: number;
    pickedUp: number;
  };
}

/**
 * Usage:
 *   const { data, isLoading } = useSalesSummary(branchId, '2025-10-27');
 */
export function useSalesSummary(branchId?: string, date?: string) {
  return useQuery<SalesSummary, Error>({
    queryKey: ['sales', 'summary', branchId, date],
    queryFn: () => {
      const params = new URLSearchParams();
      if (branchId) params.append('branchId', branchId);
      if (date) params.append('date', date);

      return apiRequest<SalesSummary>(
        'GET',
        `/orders/sales-summary${params.toString() ? `?${params.toString()}` : ''}`,
      );
    },
    enabled: !!branchId, // only fetch if branchId is provided
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    refetchOnWindowFocus: false,
  });
}
