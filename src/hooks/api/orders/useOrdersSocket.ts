import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Order } from '../../../types/base';
import { BASE_URL } from '../../../utils/api';

let socket: Socket;

export function useOrdersSocket(
  branchId: string,
  onNewOrder?: (order: Order) => void,
) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!socket) {
      socket = io(BASE_URL, { transports: ['websocket'] });
    }

    socket.emit('joinBranch', { branchId });

    socket.on('newOrder', (order: Order) => {
      console.log('new Order', order?.id);
      setOrders(prev => [order, ...prev]);
      onNewOrder?.(order); // triggers sound + modal
      console.log('new Order', order?.id);
    });

    socket.on('updateOrder', (updatedOrder: Order) => {
      setOrders(prev =>
        prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)),
      );
    });

    return () => {
      socket.off('newOrder');
      socket.off('updateOrder');
    };
  }, [branchId]);

  return { orders };
}
