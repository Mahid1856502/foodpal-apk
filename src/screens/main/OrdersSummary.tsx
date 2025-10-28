import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useGroupedOrders } from '../../hooks/api/orders/useOrders';
import { useSalesSummary } from '../../hooks/api/orders/useOrders'; // ✅ import the hook
import OrderCard from '../../components/ExpandableOrderCard';

export default function OrdersSummary() {
  const [activeTab, setActiveTab] = useState<
    'summary' | 'details' | 'cancelled'
  >('summary');
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();
  const { user } = useAuth();
  const branchId = user?.branchId ?? '';

  // --- Queries ---
  const {
    data: cancelledOrders,
    isLoading,
    isError,
    refetch: refetchCancelled,
  } = useGroupedOrders(branchId, 'CANCELLED');

  const {
    data: allOrders,
    isLoading: isAllLoading,
    refetch: refetchAll,
  } = useGroupedOrders(branchId);

  // ✅ new sales summary query
  const {
    data: salesSummary,
    isLoading: isSalesLoading,
    refetch: refetchSales,
  } = useSalesSummary(branchId);

  /** -----------------------------
   * Pull-to-Refresh
   * ----------------------------- */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchAll(), refetchCancelled(), refetchSales()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchAll, refetchCancelled, refetchSales]);

  const tabs = ['summary', 'details', 'cancelled'] as const;

  /** -----------------------------
   * Render Tab Content
   * ----------------------------- */
  const renderContent = () => {
    if (activeTab === 'summary') {
      if (isSalesLoading) {
        return (
          <View className="items-center mt-10">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="text-neutral-500 mt-3">Loading summary...</Text>
          </View>
        );
      }

      if (!salesSummary) {
        return (
          <View className="items-center mt-10">
            <Text className="text-neutral-500 text-base">
              No summary data available.
            </Text>
          </View>
        );
      }

      const { totalSales, totalOrders, paymentBreakdown, orderTypeBreakdown } =
        salesSummary;

      return (
        <View className="mt-6 gap-y-6">
          {/* Sales Card */}
          <View className="p-6 bg-white rounded-2xl shadow border border-neutral-200">
            <View className="items-center space-y-3">
              <Text className="text-4xl">💷</Text>
              <Text className="text-lg font-semibold text-neutral-800">
                Sales
              </Text>
              <Text className="text-3xl font-bold text-neutral-900">
                £{totalSales.toFixed(2)}
              </Text>
              <View className="items-center">
                <Text className="text-neutral-600">
                  {paymentBreakdown.card} card
                </Text>
                <Text className="text-neutral-600">
                  {paymentBreakdown.cash} cash
                </Text>
              </View>
            </View>
          </View>

          {/* Orders Card */}
          <View className="p-6 bg-white rounded-2xl shadow border border-neutral-200">
            <View className="items-center space-y-3">
              <Text className="text-4xl">🖥️</Text>
              <Text className="text-lg font-semibold text-neutral-800">
                Orders
              </Text>
              <Text className="text-3xl font-bold text-neutral-900">
                {totalOrders}
              </Text>
              <View className="items-center">
                <Text className="text-neutral-600">
                  {orderTypeBreakdown.delivered} delivery
                </Text>
                <Text className="text-neutral-600">
                  {orderTypeBreakdown.pickedUp} pickup
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    }

    // --- Details tab
    if (activeTab === 'details') {
      if (isAllLoading) {
        return (
          <View className="items-center mt-10">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="text-neutral-500 mt-3">Loading orders...</Text>
          </View>
        );
      }

      if (!allOrders || allOrders.length === 0) {
        return (
          <View className="items-center mt-10">
            <Text className="text-neutral-500 text-base">No orders found.</Text>
          </View>
        );
      }

      return (
        <View className="mt-6 space-y-6">
          {allOrders.map(group => (
            <View key={group.date}>
              <Text className="text-lg font-bold text-neutral-700 mb-3">
                {group.date}
              </Text>
              {group.orders.map(order => (
                <OrderCard order={order} key={order?.id} />
              ))}
            </View>
          ))}
        </View>
      );
    }

    // --- Cancelled tab
    if (activeTab === 'cancelled') {
      if (isLoading) {
        return (
          <View className="items-center mt-10">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="text-neutral-500 mt-3">
              Loading cancelled orders...
            </Text>
          </View>
        );
      }

      if (isError) {
        return (
          <View className="items-center mt-10">
            <Text className="text-red-500 text-base">
              Failed to fetch cancelled orders.
            </Text>
          </View>
        );
      }

      if (!cancelledOrders || cancelledOrders.length === 0) {
        return (
          <View className="items-center mt-10">
            <Text className="text-neutral-500 text-base">
              No cancelled orders found.
            </Text>
          </View>
        );
      }

      return (
        <View className="mt-6 space-y-6">
          {cancelledOrders.map(group => (
            <View key={group.date}>
              <Text className="text-lg font-bold text-neutral-700 mb-3">
                {group.date}
              </Text>
              {group.orders.map(order => (
                <OrderCard order={order} key={order?.id} />
              ))}
            </View>
          ))}
        </View>
      );
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-neutral-100 px-4 pt-8"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity
          onPress={() => navigation.navigate('OrderPad' as never)}
          className="flex flex-row items-center"
        >
          <Icon name="arrow-left" size={20} color="#000" />
          <Text className="text-neutral-600 text-base font-medium ml-2">
            Back to orders
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-2xl font-bold text-center mb-4">Today's Sales</Text>

      {/* Tabs */}
      <View className="flex-row justify-center border-b border-neutral-300">
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`pb-3 mx-4 ${
              activeTab === tab
                ? 'border-b-2 border-blue-600'
                : 'border-b-2 border-transparent'
            }`}
          >
            <Text
              className={`capitalize font-medium ${
                activeTab === tab ? 'text-blue-600' : 'text-neutral-500'
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Dynamic Tab Content */}
      {renderContent()}
    </ScrollView>
  );
}
