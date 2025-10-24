import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Modal,
  TouchableOpacity,
} from 'react-native';
import FloatingTabBar from '../../components/FloatingTabBar';
import ExpandableOrderCard from '../../components/ExpandableOrderCard';
import { useNavigation } from '@react-navigation/native';
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

export default function OrderPad() {
  const { user } = useAuth();
  const branchId = user?.branchId ?? '';
  const { data, refetch, isFetching } = useTodayOrders(branchId);
  const navigation = useNavigation();
  const { isLandscape } = useResponsiveLayout();

  const [refreshing, setRefreshing] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const orders = data?.orders || [];

  const acceptOrder = useAcceptOrder(branchId);
  const rejectOrder = useRejectOrder(branchId);
  const markReady = useMarkReady(branchId);
  const markDone = useMarkDone(branchId);

  const handleAccept = (orderId: string) => {
    acceptOrder.mutate({ orderId, etaMinutes: 15 });
  };

  const handleReject = (orderId: string) => {
    rejectOrder.mutate(orderId);
  };

  const handleMarkReady = (orderId: string) => {
    markReady.mutate(orderId);
  };

  const handleMarkDone = (orderId: string) => {
    markDone.mutate(orderId);
  };

  return (
    <View
      className={`flex-1 bg-gray-100 pt-6 ${
        isLandscape ? 'pl-28 pr-4' : 'px-4'
      }`}
    >
      <Text className="text-2xl font-bold mb-4 text-center">Order Pad</Text>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isFetching}
            onRefresh={onRefresh}
          />
        }
      >
        {orders.length > 0 ? (
          orders.map((order: Order) => (
            <ExpandableOrderCard
              key={order.id}
              order={order}
              onAccept={() => handleAccept(order.id)}
              onReject={() => handleReject(order.id)}
              onMarkReady={() => handleMarkReady(order.id)}
              onMarkDone={() => handleMarkDone(order.id)}
            />
          ))
        ) : (
          <Text className="text-gray-500 text-center mt-10">
            No orders for today.
          </Text>
        )}
      </ScrollView>

      {/* Menu modal */}
      <Modal
        visible={isMenuVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl w-4/5 p-6">
            <Text className="text-lg font-semibold mb-4 text-center">
              Menu Actions
            </Text>

            {/* Example options */}
            <TouchableOpacity
              onPress={() => {
                setIsMenuVisible(false);
                navigation.navigate('OrdersSummary' as never);
              }}
              className="bg-blue-600 p-3 rounded-lg mb-3"
            >
              <Text className="text-white text-center font-semibold">
                Go to Orders Summary
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsMenuVisible(false)}
              className="bg-gray-300 p-3 rounded-lg"
            >
              <Text className="text-gray-800 text-center font-semibold">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Floating tab bar */}
      <FloatingTabBar
        activeIndex={1}
        tabs={[
          {
            label: 'Menu',
            icon: 'list',
            onPress: () => setIsMenuVisible(true),
          },
          {
            label: 'New Orders',
            icon: 'shopping-bag',
            onPress: () => navigation.navigate('NewOrders' as never),
          },
          {
            label: 'Preparing',
            icon: 'clock',
            onPress: () => navigation.navigate('Preparing' as never),
          },
          {
            label: 'Done',
            icon: 'check-circle',
            onPress: () => navigation.navigate('DoneOrders' as never),
          },
        ]}
      />
    </View>
  );
}
