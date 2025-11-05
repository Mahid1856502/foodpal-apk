import React, { createContext, useContext, useState, useCallback } from 'react';
import { useOrdersSocket } from '../hooks/api/orders/useOrdersSocket';
import { useAuth } from './AuthContext';
import { Order } from '../types/base';
import NewOrderModal from '../components/NewOrderModal';
import { useSound } from '../hooks/custom/useSound';
import { useAcceptOrder, useRejectOrder } from '../hooks/api/orders/useOrders';
import { PrintOrderDetails } from '../screens/main/printer-settings/PrintOrderDetails';
import PrintMissingModal from '../components/PrintMissingModal';
import { useBluetooth } from './PrinterContext';

type NewOrderContextType = {
  latestOrder?: Order;
};

const NewOrderContext = createContext<NewOrderContextType>({});

export function NewOrderProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const branchId = user?.branchId ?? '';
  const { play } = useSound('notification.wav');
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const { connectedDevice } = useBluetooth();

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
        onAccept={(order, etaMinutes) => {
          if (!connectedDevice) {
            setShowPrinterModal(true);
          } else {
            PrintOrderDetails(connectedDevice, order);
          }
          acceptOrder.mutate(
            { orderId: order.id, etaMinutes },
            { onSuccess: () => setVisible(false) },
          );
        }}
        isAccepting={
          acceptOrder.isPending &&
          acceptOrder.variables?.orderId === latestOrder?.id
        }
        onReject={orderId =>
          rejectOrder.mutate(orderId, { onSuccess: () => setVisible(false) })
        }
      />
      <PrintMissingModal
        showPrinterModal={showPrinterModal}
        setShowPrinterModal={setShowPrinterModal}
      />
    </>
  );
}

export const useNewOrder = () => useContext(NewOrderContext);
