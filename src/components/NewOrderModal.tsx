import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Order } from '../types/base';
import Icon from '@react-native-vector-icons/feather';

interface NewOrderModalProps {
  visible: boolean;
  order?: Order;
  isAccepting?: boolean;
  onClose: () => void;
  onAccept: (order: Order, etaMinutes: number) => void;
  onReject: (orderId: string) => void;
}

export default function NewOrderModal({
  visible,
  order,
  onClose,
  onAccept,
  isAccepting,
  onReject,
}: NewOrderModalProps) {
  const [eta, setEta] = useState(45);

  useEffect(() => {
    if (order?.etaMinutes) setEta(order.etaMinutes);
  }, [order?.etaMinutes]);

  if (!order) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl w-11/12 max-h-[85%] p-6">
          <Text className="text-xl font-bold mb-5 text-center">New Order</Text>

          {/* --- ETA + Accept Button --- */}
          <View className="mb-6">
            <View className="flex-row items-center justify-center mb-4">
              <TouchableOpacity
                onPress={() => setEta(prev => Math.max(5, prev - 5))}
                className="bg-gray-200 h-10 w-10 flex items-center justify-center rounded-full"
              >
                <Icon name="minus" size={18} color="#333" />
              </TouchableOpacity>

              <Text className="mx-4 text-lg font-semibold">
                ETA: {eta} mins
              </Text>

              <TouchableOpacity
                onPress={() => setEta(prev => prev + 5)}
                className="bg-gray-200 h-10 w-10 flex items-center justify-center rounded-full"
              >
                <Icon name="plus" size={18} color="#333" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-green-200 border border-green-700 p-3 rounded-lg flex-row items-center justify-center"
              onPress={() => {
                onAccept(order, eta);
              }}
              disabled={isAccepting}
            >
              {isAccepting && <ActivityIndicator />}
              <Text className="text-green-950 text-center font-semibold text-lg">
                Accept Order
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* --- Customer Info --- */}
            <View className="mb-5 border-t border-gray-200 pt-4">
              <Text className="font-semibold text-base mb-2">
                Customer Details
              </Text>
              <View className="flex-row items-center mb-1">
                <Icon name="user" size={16} color="#555" />
                <Text className="ml-2">{order.user?.fullName}</Text>
              </View>
              <View className="flex-row items-center mb-1">
                <Icon name="phone" size={16} color="#555" />
                <Text className="ml-2">{order.user?.mobileNumber}</Text>
              </View>
              <View className="flex-row items-center">
                <Icon name="clock" size={16} color="#555" />
                <Text className="ml-2">
                  Pickup Time: {order.pickupTimeSlot || 'N/A'}
                </Text>
              </View>
            </View>

            {/* --- Order Items --- */}
            <View className="border-t border-gray-200 pt-4 mb-5">
              <Text className="font-semibold text-base mb-2">
                Order Details
              </Text>
              {order.items.map(item => (
                <View key={item.id} className="mb-3">
                  <View className="flex-row justify-between">
                    <Text className="font-medium">
                      {item?.foodItem?.name}{' '}
                      <Text className="font-normal text-gray-600">
                        (£{item?.foodItem?.price})
                      </Text>
                    </Text>
                    <Text>x{item.quantity}</Text>
                  </View>

                  {/* --- Add-ons --- */}
                  {item.addOns && item.addOns.length > 0 && (
                    <View className="ml-4 mt-1">
                      {item.addOns.map(addOn => (
                        <View
                          key={addOn.id}
                          className="flex-row items-center mb-0.5"
                        >
                          <Icon name="plus-circle" size={14} color="#777" />
                          <Text className="ml-1 text-gray-700 text-sm">
                            {addOn?.addOn?.name} +({addOn?.addOn?.quantity} x £
                            {addOn?.addOn?.price})
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
              <Text className="font-bold mt-3">
                Total: £{order.totalAmount}
              </Text>
            </View>

            {/* --- Actions --- */}
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-red-400 border border-red-700  flex-1 p-3 rounded-lg mr-2"
                onPress={() => {
                  onReject(order.id);
                }}
              >
                <Text className="text-center font-bold text-white ">
                  Reject
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gray-200 flex-1 p-3 rounded-lg ml-2"
                onPress={onClose}
              >
                <Text className="text-center font-semibold text-gray-700">
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
