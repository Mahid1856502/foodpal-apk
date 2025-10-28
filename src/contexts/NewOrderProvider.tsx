import React, { createContext, useContext, useState, useCallback } from 'react';
import { useOrdersSocket } from '../hooks/api/orders/useOrdersSocket';
import { useAuth } from './AuthContext';
import { Order } from '../types/base';
import NewOrderModal from '../components/NewOrderModal';
import { useSound } from '../hooks/custom/useSound';
import { useAcceptOrder, useRejectOrder } from '../hooks/api/orders/useOrders';

type NewOrderContextType = {
  latestOrder?: Order;
};

const NewOrderContext = createContext<NewOrderContextType>({});

export function NewOrderProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const branchId = user?.branchId ?? '';
  const { play } = useSound('notification.wav');

  const [visible, setVisible] = useState(false);
  const [latestOrder, setLatestOrder] = useState<Order | undefined>();

  const acceptOrder = useAcceptOrder(branchId);
  const rejectOrder = useRejectOrder(branchId);

  // Open modal when new order event arrives
  const openNewOrderModal = useCallback(
    (order: Order) => {
      setLatestOrder(order);
      setVisible(true);
      play();
    },
    [play],
  );

  // ✅ Socket subscription — fires no matter what screen is active
  useOrdersSocket(branchId, order => {
    console.log('🔥 Global new order received:', order.id);
    openNewOrderModal(order);
  });

  return (
    <>
      {children}
      <NewOrderModal
        visible={visible}
        order={latestOrder}
        onClose={() => setVisible(false)}
        onAccept={(orderId, etaMinutes) =>
          acceptOrder.mutate({ orderId, etaMinutes })
        }
        onReject={orderId => rejectOrder.mutate(orderId)}
      />
    </>
  );
}

export const useNewOrder = () => useContext(NewOrderContext);
