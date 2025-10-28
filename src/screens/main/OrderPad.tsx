import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import FloatingTabBar from '../../components/FloatingTabBar';
import OrderCard from '../../components/ExpandableOrderCard';

import {
  useAcceptOrder,
  useMarkDone,
  useMarkReady,
  useRejectOrder,
  useTodayOrders,
} from '../../hooks/api/orders/useOrders';

import { useAuth } from '../../contexts/AuthContext';
import useResponsiveLayout from '../../hooks/custom/useResponsiveLayout';
import { Order } from '../../types/base';
import { FeatherIconName } from '@react-native-vector-icons/feather';
import OrderMenuPopup from '../../components/MenuModal';

export default function OrderPad() {
  const { user, logout } = useAuth();
  const { isLandscape } = useResponsiveLayout();

  const branchId = user?.branchId ?? '';

  const [activeTab, setActiveTab] = useState<
    'NEW' | 'PREPARING' | 'READY' | 'COMPLETED'
  >('NEW');
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // --- Fetch and refresh orders ---
  const { data, refetch, isFetching } = useTodayOrders(branchId);
  const orders = data?.orders || [];

  // --- Order mutations ---
  const acceptOrder = useAcceptOrder(branchId);
  const rejectOrder = useRejectOrder(branchId);
  const markReady = useMarkReady(branchId);
  const markDone = useMarkDone(branchId);

  // --- Refresh handler ---
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // --- Order action handlers ---
  const handleAccept = (order: Order) => {
    if (order.status !== 'PENDING') return;
    acceptOrder.mutate({ orderId: order.id, etaMinutes: 15 });
  };

  const handleReject = (order: Order) => {
    if (order.status !== 'PENDING') return;
    rejectOrder.mutate(order.id);
  };

  const handleMarkReady = (order: Order) => {
    if (order.status !== 'PREPARING') return;
    markReady.mutate(order.id);
  };

  const handleMarkDone = (order: Order) => {
    if (order.status !== 'READY') return;
    markDone.mutate(order.id);
  };

  // --- Tab filtering ---
  const filteredOrders = orders.filter(order => {
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

  const tabLabels: Record<string, string> = {
    NEW: 'new',
    PREPARING: 'preparing',
    READY: 'ready',
    COMPLETED: 'completed',
  };

  const tabs = [
    { label: 'Menu', icon: 'menu' as FeatherIconName, key: 'MENU' },
    {
      label: 'New',
      icon: 'shopping-bag' as FeatherIconName,
      key: 'NEW',
      newOrders: orders.filter(o => o.status === 'PENDING').length.toString(),
    },
    { label: 'Preparing', icon: 'clock' as FeatherIconName, key: 'PREPARING' },
    { label: 'Ready', icon: 'bell' as FeatherIconName, key: 'READY' },
    {
      label: 'Done',
      icon: 'check-circle' as FeatherIconName,
      key: 'COMPLETED',
    },
  ];

  return (
    <View
      className={`flex-1 bg-gray-100 pt-6 ${
        isLandscape ? 'pl-28 pr-4' : 'px-4'
      }`}
    >
      <Text className="text-2xl font-bold mb-4 text-center">Order Pad</Text>
      <ScrollView
        className={`flex-1 ${isLandscape ? 'mb-0' : 'mb-20'}`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={onRefresh} />
        }
      >
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order: Order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAccept={() => handleAccept(order)}
              onReject={() => handleReject(order)}
              onMarkReady={() => handleMarkReady(order)}
              onMarkDone={() => handleMarkDone(order)}
            />
          ))
        ) : (
          <Text className="text-gray-500 text-center mt-10">
            No {tabLabels[activeTab]} orders for today.
          </Text>
        )}
      </ScrollView>

      {/* --- Menu Modal --- */}

      <OrderMenuPopup
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        onLogout={logout}
      />

      {/* --- Floating Tab Bar --- */}
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
    </View>
  );
}
