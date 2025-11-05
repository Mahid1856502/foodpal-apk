import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { Order } from '../../../types/base';
import { BASE_URL } from '../../../utils/api';
import { TodayOrdersResponse } from '../../../types/order';

let socket: Socket | null = null;

export function useOrdersSocket(
  branchId: string,
  onNewOrder?: (order: Order) => void,
) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!branchId) return;

    if (!socket) {
      socket = io(BASE_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
      });
    }

    const handleConnect = () => {
      console.log('✅ Connected to socket server');
      setIsConnected(true);
      socket?.emit('joinBranch', { branchId });
    };

    const handleDisconnect = () => {
      console.log('⚠️ Disconnected from socket');
      setIsConnected(false);
    };

    /** 🔥 Handle new order */
    const handleNewOrder = (order: Order) => {
      console.log('🔥 New order received:', order.id, order.etaMinutes);

      setOrders(prev => [order, ...prev]);
      onNewOrder?.(order);

      // ✅ Update React Query cache
      queryClient.setQueryData<TodayOrdersResponse>(
        ['orders', 'today', branchId],
        old => {
          const prevOrders = old?.orders ?? [];
          // avoid duplicates
          if (prevOrders.some(o => o.id === order.id)) return old;
          return {
            ...(old ?? {
              count: 0,
              date: new Date().toISOString().slice(0, 10),
              orders: [],
            }),
            count: (old?.count ?? 0) + 1,
            orders: [order, ...prevOrders],
          };
        },
      );
    };

    /** 🔄 Handle order updates (e.g. PREPARING, READY, etc.) */
    const handleUpdateOrder = (updatedOrder: Order) => {
      queryClient.setQueryData<TodayOrdersResponse>(
        ['orders', 'today', branchId],
        old => {
          if (!old) return old;
          return {
            ...old,
            orders: old.orders.map(o =>
              o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o,
            ),
          };
        },
      );
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('newOrder', handleNewOrder);
    socket.on('updateOrder', handleUpdateOrder);

    return () => {
      socket?.off('connect', handleConnect);
      socket?.off('disconnect', handleDisconnect);
      socket?.off('newOrder', handleNewOrder);
      socket?.off('updateOrder', handleUpdateOrder);
    };
  }, [branchId, onNewOrder, queryClient]);

  return { orders, isConnected };
}
