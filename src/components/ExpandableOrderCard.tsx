import React, { Activity, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { Order } from '../types/base';
import { progressFor } from '../utils/helpers';
import { BasicMenu, MenuItem } from './BasicMenu';
import { PrintOrderDetails } from '../screens/main/printer-settings/PrintOrderDetails';
import { useBluetooth } from '../contexts/PrinterContext';
import PrintMissingModal from './PrintMissingModal';

function colorFor(pct: number) {
  if (pct > 0.5) return 'bg-blue-100 border-blue-500';
  if (pct > 0.2) return 'bg-amber-100 border-amber-500';
  return 'bg-red-100 border-red-500';
}

function progressColor(pct: number) {
  if (pct > 0.5) return '#2563eb';
  if (pct > 0.2) return '#f59e0b';
  return '#ef4444';
}

interface OrderCardProps {
  order: Order;
  onAccept?: () => void;
  isAccepting?: boolean;
  onReject?: () => void;
  onMarkReady?: () => void;
  onMarkDone?: () => void;
  onAdjustEta?: (minsLeft: number) => void;
}

export default function OrderCard({
  order,
  onAccept,
  isAccepting,
  onReject,
  onMarkReady,
  onMarkDone,
  onAdjustEta,
}: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showPrinterModal, setShowPrinterModal] = useState(false);

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const { connectedDevice } = useBluetooth();

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const pct = progressFor(order);
  const minsLeft =
    order.acceptedAt && order.etaMinutes
      ? Math.max(
          0,
          Math.ceil(
            order.etaMinutes -
              (Date.now() - new Date(order.acceptedAt).getTime()) / 60000,
          ),
        )
      : order.etaMinutes;

  // -------------------------------
  // HANDLE PRINT CLICK
  // -------------------------------
  const handlePrint = () => {
    if (!connectedDevice) {
      setShowPrinterModal(true);
      return;
    }
    PrintOrderDetails(connectedDevice, order);
  };

  // -------------------------------
  // MENU ITEMS
  // -------------------------------
  const menuItems: MenuItem[] = [
    {
      icon: 'clock',
      label: 'Add Time',
      onPress: () => onAdjustEta && onAdjustEta(minsLeft),
    },
    {
      icon: 'printer',
      label: 'Print Receipt',
      onPress: handlePrint,
    },
    {
      icon: 'x',
      label: 'Cancel Order',
      onPress: () => onReject && onReject(),
      color: 'red',
      iconColor: 'red',
    },
  ];

  // -------------------------------
  // BUTTON RENDERING LOGIC
  // -------------------------------
  const renderActionButtons = () => {
    const buttons = [];

    if (order.status === 'PENDING' && onAccept) {
      buttons.push(
        <TouchableOpacity
          key="accept"
          onPress={onAccept}
          disabled={isAccepting}
          className="bg-green-200 border border-green-600 rounded-full mb-2 px-4 py-2 mr-2 flex-row items-center justify-center"
        >
          {isAccepting && <ActivityIndicator />}
          <Text className="text-green-800 font-semibold text-sm">Accept</Text>
        </TouchableOpacity>,
      );
    }

    if (order.status === 'PREPARING' && onMarkReady) {
      buttons.push(
        <TouchableOpacity
          key="ready"
          onPress={onMarkReady}
          className="border border-yellow-500 bg-yellow-100 rounded-full mb-2 px-4 py-2 mr-2"
        >
          <Text className="text-yellow-500 font-bold text-sm">Mark Ready</Text>
        </TouchableOpacity>,
      );
    }

    if (order.status === 'READY' && onMarkDone) {
      buttons.push(
        <TouchableOpacity
          key="done"
          onPress={onMarkDone}
          className="border border-blue-600 bg-blue-100 rounded-full mb-2 px-4 py-2 mr-2"
        >
          <Text className="text-blue-600 font-semibold text-sm">Mark Done</Text>
        </TouchableOpacity>,
      );
    }

    if (order.status === 'COMPLETED') {
      buttons.push(
        <TouchableOpacity
          key="print"
          onPress={handlePrint}
          className="border border-green-600 bg-green-100 rounded-full mb-2 px-4 py-2 mr-2"
        >
          <Text className="text-green-600 font-semibold text-sm">Print</Text>
        </TouchableOpacity>,
      );
    }

    if (buttons.length === 0) return null;
    return (
      <View className="flex-row justify-end mt-3 space-x-2">{buttons}</View>
    );
  };

  return (
    <>
      <View className="bg-white rounded-2xl shadow-md mb-4 overflow-hidden">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4">
          <TouchableOpacity
            onPress={toggleExpand}
            activeOpacity={0.8}
            className="flex-1 flex-row items-center"
          >
            {/* Timer */}
            {['PREPARING', 'READY'].includes(order.status) && (
              <View
                className={`w-14 h-14 rounded-xl border-2 ${colorFor(
                  pct,
                )} items-center justify-center mr-3`}
              >
                <Text
                  className={`font-semibold ${
                    pct < 0.2
                      ? 'text-red-600'
                      : pct < 0.5
                        ? 'text-amber-600'
                        : 'text-blue-700'
                  }`}
                >
                  {order.acceptedAt ? minsLeft : '--'}
                </Text>
                <Text className="text-[10px] text-gray-500">
                  {order.acceptedAt ? 'mins' : 'ETA'}
                </Text>
              </View>
            )}
            {/* Basic Info */}
            <View className="flex-1">
              <Text className="text-base font-semibold" numberOfLines={1}>
                {order.user?.fullName}
              </Text>
              <Text className="text-gray-600 text-xs">
                {order.orderType} • #{order.id.slice(0, 8)}
              </Text>
              <Text className="text-gray-700 mt-1 font-medium">
                £{order.totalAmount}
              </Text>
            </View>
          </TouchableOpacity>

          {renderActionButtons()}

          {!['COMPLETED', 'CANCELLED']?.includes(order.status) && (
            <BasicMenu items={menuItems} triggerIcon="more-vertical" />
          )}
        </View>

        {/* Progress bar */}
        {['PREPARING', 'READY'].includes(order.status) && (
          <View className="h-1 bg-gray-100 w-full">
            <View
              style={{
                height: 4,
                width: `${(1 - pct) * 100}%`,
                backgroundColor: progressColor(pct),
              }}
            />
          </View>
        )}

        {/* Expanded details */}
        {expanded && (
          <View
            className={`border-t border-gray-200 p-4 ${
              isLandscape ? 'flex-row justify-between' : 'flex-col'
            }`}
          >
            {/* Items list */}
            <View className={isLandscape ? 'flex-1 pr-4' : ''}>
              <Text className="text-sm text-gray-600 mb-2">
                Pickup: {order.pickupTimeSlot || 'N/A'} | Type:{' '}
                {order.orderType}
              </Text>

              {order.items.map(item => (
                <View key={item.id} className="mb-3">
                  <View className="flex-row items-center">
                    {item.foodItem?.image && (
                      <Image
                        source={{ uri: item.foodItem.image }}
                        className="w-12 h-12 rounded-lg mr-3"
                      />
                    )}
                    <View>
                      <Text className="font-medium">{item.foodItem?.name}</Text>
                      <Text className="text-gray-500 text-xs">
                        Qty: {item.quantity} |{' '}
                        <Text className="text-black text-xs font-bold">
                          £{item.price}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {(item.addOns ?? []).length > 0 && (
                    <View className="ml-14 mt-1">
                      <Text className="text-xs text-gray-600 font-semibold">
                        Add-ons:
                      </Text>
                      {(item.addOns ?? []).map(addon => (
                        <Text key={addon.id} className="text-xs text-gray-500">
                          - {addon.addOn?.name} (£{addon.addOn?.price})
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Customer details */}
            <View
              className={`${
                isLandscape ? 'w-1/3' : 'mt-4'
              } bg-gray-50 rounded-2xl p-3`}
            >
              <Text className="text-base font-semibold mb-2 text-gray-800">
                Customer Details
              </Text>
              <View className="mb-2">
                <Text className="text-xs text-gray-500">Name</Text>
                <Text className="text-sm font-medium text-gray-700">
                  {order.user?.fullName || 'N/A'}
                </Text>
              </View>
              <View className="mb-2">
                <Text className="text-xs text-gray-500">Phone</Text>
                <Text className="text-sm font-medium text-gray-700">
                  {order.user?.mobileNumber || 'N/A'}
                </Text>
              </View>
              <View className="mb-2">
                <Text className="text-xs text-gray-500">Email</Text>
                <Text className="text-sm font-medium text-gray-700">
                  {order.user?.email || 'N/A'}
                </Text>
              </View>
              {order.deliveryAddress && (
                <View className="mb-2">
                  <Text className="text-xs text-gray-500">Address</Text>
                  <Text className="text-sm font-medium text-gray-700">
                    {order.deliveryAddress?.streetName || 'N/A'},{' '}
                    {order.deliveryAddress?.postcode || ''}
                  </Text>
                </View>
              )}
              <View className="flex-row justify-between mt-2">
                <View>
                  <Text className="text-xs text-gray-500">Payment</Text>
                  <Text className="text-sm font-medium text-gray-700">
                    {order.paymentStatus}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-gray-500">Method</Text>
                  <Text className="text-sm font-medium text-gray-700">
                    {order.paymentMethod || 'N/A'}
                  </Text>
                </View>
              </View>
              <View className="mt-3 border-t border-gray-200 pt-2">
                <Text className="text-xs text-gray-500">Order Status</Text>
                <Text className="text-sm font-medium text-blue-700">
                  {order.status}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
      <PrintMissingModal
        showPrinterModal={showPrinterModal}
        setShowPrinterModal={setShowPrinterModal}
      />
    </>
  );
}
