import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Order } from '../../../types/base';
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
    mutationFn: ({ orderId, etaMinutes }) =>
      apiRequest<Order>('POST', `/orders/${orderId}/accept`, { etaMinutes }),

    // ✅ Optimistic update
    onMutate: async ({ orderId }) => {
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
              o.id === orderId ? { ...o, status: 'PREPARING' } : o,
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
      queryClient.invalidateQueries({
        queryKey: ['orders', 'today', branchId],
      });
    },
  });
}

/** -----------------------------
 * Mark order as ready (preparing → delivering)
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
              o.id === orderId ? { ...o, status: 'DELIVERING' } : o,
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
 * Mark order as done (delivering → completed)
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
