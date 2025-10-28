import React, { useEffect, useRef } from 'react';
import {
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  View,
  Text,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import { useNavigation } from '@react-navigation/native';

interface OrderMenuPopupProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const OrderMenuPopup: React.FC<OrderMenuPopupProps> = ({
  visible,
  onClose,
  onLogout,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const navigation = useNavigation();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View
        className="flex-1 bg-black/60 justify-center items-center"
        style={{ opacity: fadeAnim }}
      >
        <Animated.View
          className="w-11/12 max-w-sm bg-white rounded-2xl p-6"
          style={{ transform: [{ scale: scaleAnim }] }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-lg font-semibold text-neutral-900">
              Menu Options
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={22} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Options List */}
          <View className="space-y-5">
            <TouchableOpacity
              className="active:opacity-70"
              onPress={() => navigation.navigate('OrdersSummary' as never)}
            >
              <Text className="text-base font-medium text-neutral-900">
                View today’s sales
              </Text>
              <Text className="text-sm text-neutral-400 mt-1">
                9 orders – 1 compensation request
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="active:opacity-70"
              onPress={() => navigation.navigate('TakeOffMenu' as never)}
            >
              <Text className="text-base font-medium text-neutral-900">
                Take items off menu
              </Text>
              <Text className="text-sm text-neutral-400 mt-1">
                All items are currently available.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="active:opacity-70"
              onPress={() => navigation.navigate('StopOrders' as never)}
            >
              <Text className="text-base font-medium text-neutral-900">
                Stop taking orders
              </Text>
              <Text className="text-sm text-neutral-400 mt-1">
                You’re currently ready to accept new orders.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="active:opacity-70 mt-3"
              onPress={() => navigation.navigate('Settings' as never)}
            >
              <Text className="text-base font-medium text-neutral-900">
                Settings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="active:opacity-70 mt-4"
              onPress={onLogout}
            >
              <Text className="text-base font-medium text-red-500">Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default OrderMenuPopup;
