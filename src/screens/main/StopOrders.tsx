import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

export default function StopOrders() {
  const [selected, setSelected] = useState<string | null>(null);
  const navigation = useNavigation();

  const options = [
    { label: 'Rest of the day', value: 'day' },
    { label: '1 hour', value: 'hour' },
    { label: '20 minutes', value: '20min' },
  ];

  const handlePress = (value: string) => {
    setSelected(value);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top bar */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity
          onPress={() => navigation.navigate('OrderPad' as never)}
          className="py-2"
        >
          <Text className="text-sm text-neutral-600 font-medium">
            &larr; Back to orders
          </Text>
        </TouchableOpacity>

        {/* Spacer for symmetry */}
        <View className="w-20" />
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-center text-gray-700 mb-6 text-base">
          How long do you want to stop taking orders for?
        </Text>

        {/* Options */}
        <View className="w-full max-w-lg flex-col gap-y-4 mb-8">
          {options.map(option => {
            const isSelected = selected === option.value;
            const scale = useSharedValue(1);

            const animatedStyle = useAnimatedStyle(() => ({
              transform: [{ scale: scale.value }],
            }));

            const handleTap = () => {
              scale.value = withSpring(0.95, {}, () => {
                scale.value = withSpring(1);
              });
              handlePress(option.value);
            };

            return (
              <Animated.View key={option.value} style={animatedStyle}>
                <TouchableOpacity
                  onPress={handleTap}
                  className={`h-16 px-6 rounded-xl border text-base font-medium 
                    ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-gray-100 text-gray-800 border-transparent'
                    }`}
                >
                  <View className="flex-1 justify-center items-center">
                    <Text
                      className={`text-lg font-medium ${
                        isSelected ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Confirm button */}
        <TouchableOpacity
          disabled={!selected}
          className={`w-full max-w-lg h-16 rounded-xl justify-center items-center 
            ${selected ? 'bg-orange-500' : 'bg-gray-300'}`}
        >
          <Text
            className={`text-lg font-semibold ${
              selected ? 'text-white' : 'text-gray-500'
            }`}
          >
            Confirm
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
