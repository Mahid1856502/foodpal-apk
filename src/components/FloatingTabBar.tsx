import React from 'react';
import { View, TouchableOpacity, Text, Platform } from 'react-native';
import Icon, { FeatherIconName } from '@react-native-vector-icons/feather';
import useResponsiveLayout from '../hooks/custom/useResponsiveLayout';

type TabItem = {
  label: string;
  icon: FeatherIconName;
  onPress: () => void;
};

interface FloatingTabBarProps {
  tabs: TabItem[];
  activeIndex?: number;
}

export default function FloatingTabBar({
  tabs,
  activeIndex = 0,
}: FloatingTabBarProps) {
  const { isLandscape } = useResponsiveLayout();

  return (
    <View
      className={`absolute z-[999] bg-white rounded-2xl shadow-2xl  p-3 gap-3 ${
        isLandscape
          ? 'top-[10%] left-4 w-20 flex-col'
          : `${
              Platform.OS === 'ios' ? 'bottom-10' : 'bottom-5'
            } left-[5%] right-[5%] flex-row justify-around py-2`
      }`}
    >
      {tabs.map((tab, i) => {
        const active = activeIndex === i;
        return (
          <TouchableOpacity
            key={i}
            onPress={tab.onPress}
            className={`flex items-center ${
              isLandscape ? 'p-4' : 'py-2 px-3'
            } ${active ? 'bg-blue-100 rounded-xl' : ''}`}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={active ? '#007bff' : '#333'}
            />
            {!isLandscape && (
              <Text
                className={`text-xs font-medium ${
                  active ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                {tab.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
