import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import FloatingTabBar from '../../components/FloatingTabBar';
import OrderCard from '../../components/ExpandableOrderCard';
import AdjustEtaModal from '../../components/AdjustEtaModal';
import OrderMenuPopup from '../../components/MenuModal';

import {
  useAcceptOrder,
  useMarkDone,
  useMarkReady,
  useRejectOrder,
  useTodayOrders,
  useAdjustEta,
} from '../../hooks/api/orders/useOrders';

import { useAuth } from '../../contexts/AuthContext';
import useResponsiveLayout from '../../hooks/custom/useResponsiveLayout';
import { Order } from '../../types/base';
import { FeatherIconName } from '@react-native-vector-icons/feather';
// import { useOrdersSocket } from '../../hooks/api/orders/useOrdersSocket';
import NewOrderModal from '../../components/NewOrderModal';
import { PrintOrderDetails } from './printer-settings/PrintOrderDetails';
import { useBluetooth } from '../../contexts/PrinterContext';
import PrintMissingModal from '../../components/PrintMissingModal';

export default function OrderPad() {
  const { user, logout } = useAuth();
  const { isLandscape } = useResponsiveLayout();
  const branchId = user?.branchId ?? '';
  const { connectedDevice } = useBluetooth();
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  // --- Data ---
  const { data: todayOrders, refetch, isFetching } = useTodayOrders(branchId);
  // const { isConnected } = useOrdersSocket(branchId); // ✅ no need to use orders anymore

  // --- UI state ---
  const [activeTab, setActiveTab] = useState<
    'NEW' | 'PREPARING' | 'READY' | 'COMPLETED'
  >('NEW');
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [visible, setVisible] = useState(false);

  // --- ETA modal ---
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [eta, setEta] = useState<number>(15);
  const [showEtaModal, setShowEtaModal] = useState(false);

  // --- Mutations ---
  const acceptOrder = useAcceptOrder(branchId);
  const rejectOrder = useRejectOrder(branchId);
  const markReady = useMarkReady(branchId);
  const markDone = useMarkDone(branchId);
  const adjustEta = useAdjustEta(branchId);

  // --- Refresh handler ---
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // --- Filtered orders ---
  const filteredOrders = useMemo(() => {
    const allOrders = todayOrders?.orders ?? [];
    return allOrders.filter(order => {
      switch (activeTab) {
        case 'NEW':
          return order.status === 'PENDING';
        case 'PREPARING':
          return order.status === 'PREPARING';
        case 'READY':
          return order.status === 'READY';
        case 'COMPLETED':
          return order.status === 'COMPLETED';
        default:
          return true;
      }
    });
  }, [todayOrders, activeTab]);

  // --- Order actions ---
  const handleAccept = useCallback(
    (order: Order) => {
      if (order.status === 'PENDING') {
        setVisible(true);
        setSelectedOrder(order);
        // acceptOrder.mutate({ orderId: order.id, etaMinutes: 15 });
      }
    },
    [acceptOrder],
  );

  const handleReject = useCallback(
    (order: Order) => {
      if (order.status === 'PENDING') {
        rejectOrder.mutate(order.id);
      }
    },
    [rejectOrder],
  );

  const handleMarkReady = useCallback(
    (order: Order) => {
      if (order.status === 'PREPARING') {
        markReady.mutate(order.id);
      }
    },
    [markReady],
  );

  const handleMarkDone = useCallback(
    (order: Order) => {
      if (order.status === 'READY') {
        markDone.mutate(order.id);
      }
    },
    [markDone],
  );

  const handleAdjustEta = (order: Order, minsLeft: number) => {
    setSelectedOrder(order);
    setEta(minsLeft ?? 15);
    setShowEtaModal(true);
  };

  const handleSaveEta = () => {
    if (!selectedOrder) return;
    adjustEta.mutate({
      orderId: selectedOrder.id,
      etaMinutes: eta,
    });
    setShowEtaModal(false);
  };

  // --- Tabs setup ---
  const tabs = useMemo(() => {
    const countNew =
      todayOrders?.orders.filter(o => o.status === 'PENDING').length ?? 0;

    return [
      { label: 'Menu', icon: 'menu' as FeatherIconName, key: 'MENU' },
      {
        label: 'New',
        icon: 'shopping-bag' as FeatherIconName,
        key: 'NEW',
        newOrders: countNew.toString(),
      },
      {
        label: 'Preparing',
        icon: 'clock' as FeatherIconName,
        key: 'PREPARING',
      },
      { label: 'Ready', icon: 'bell' as FeatherIconName, key: 'READY' },
      {
        label: 'Done',
        icon: 'check-circle' as FeatherIconName,
        key: 'COMPLETED',
      },
    ];
  }, [todayOrders]);

  const tabLabels: Record<string, string> = {
    NEW: 'new',
    PREPARING: 'preparing',
    READY: 'ready',
    COMPLETED: 'completed',
  };

  // --- UI ---
  return (
    <View
      className={`flex-1 bg-gray-100 pt-6 ${
        isLandscape ? 'pl-28 pr-4' : 'px-4'
      }`}
    >
      {/* --- Header --- */}
      <View className="flex-row items-center justify-center mb-4">
        <Text className="text-2xl font-bold mr-2 text-center">Order Pad</Text>
        {/* <View
          className={`flex flex-row items-center px-2 py-1 rounded-full ${
            isConnected
              ? 'bg-green-100 border border-green-900'
              : 'bg-red-100 border border-red-900'
          }`}
        >
          <View
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <Text className="text-xs ml-1">
            {isConnected ? 'Online' : 'Offline'}
          </Text>
        </View> */}
      </View>

      {/* --- Order List --- */}
      <ScrollView
        className={`flex-1 ${isLandscape ? 'mb-0' : 'mb-20'}`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={onRefresh} />
        }
      >
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onAccept={() => handleAccept(order)}
              isAccepting={
                acceptOrder.isPending &&
                acceptOrder.variables?.orderId === order.id
              }
              onReject={() => handleReject(order)}
              onMarkReady={() => handleMarkReady(order)}
              onMarkDone={() => handleMarkDone(order)}
              onAdjustEta={minsLeft => handleAdjustEta(order, minsLeft)}
            />
          ))
        ) : (
          <Text className="text-gray-500 text-center mt-10">
            No {tabLabels[activeTab]} orders for today.
          </Text>
        )}
      </ScrollView>

      {/* --- ETA Modal --- */}
      <AdjustEtaModal
        visible={showEtaModal}
        eta={eta}
        onChangeEta={setEta}
        onSave={handleSaveEta}
        onClose={() => setShowEtaModal(false)}
        title="Adjust ETA"
      />

      {/* --- Menu Modal --- */}
      <OrderMenuPopup
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        onLogout={logout}
      />

      {/* --- Floating Tabs --- */}
      <FloatingTabBar
        activeIndex={tabs.findIndex(t => t.key === activeTab) ?? 1}
        tabs={tabs.map(t => ({
          label: t.label,
          icon: t.icon,
          key: t.key,
          newOrders: t.newOrders,
          onPress: () => {
            if (t.key === 'MENU') setIsMenuVisible(true);
            else setActiveTab(t.key as typeof activeTab);
          },
        }))}
      />
      {selectedOrder && (
        <NewOrderModal
          visible={visible}
          order={selectedOrder}
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
            acceptOrder.variables?.orderId === selectedOrder?.id
          }
          onReject={orderId =>
            rejectOrder.mutate(orderId, { onSuccess: () => setVisible(false) })
          }
        />
      )}
      <PrintMissingModal
        showPrinterModal={showPrinterModal}
        setShowPrinterModal={setShowPrinterModal}
      />
    </View>
  );
}
