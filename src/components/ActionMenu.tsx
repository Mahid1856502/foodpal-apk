import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Modal, Pressable } from 'react-native';
import Icon, { FeatherIconName } from '@react-native-vector-icons/feather';

interface ActionMenuProps {
  actions: {
    label: string;
    icon?: FeatherIconName;
    onPress: () => void;
    color?: string;
  }[];
}

export default function ActionMenu({ actions }: ActionMenuProps) {
  const [visible, setVisible] = useState(false);

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const handlePress = (callback: () => void) => {
    close();
    callback();
  };

  return (
    <View>
      {/* Trigger Button */}
      <TouchableOpacity
        onPress={open}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="p-2"
      >
        <Icon name="more-vertical" size={20} color="#555" />
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={close}
      >
        <View className="flex-1 bg-black/10">
          {/* Background pressable (to close) */}
          <Pressable style={{ flex: 1 }} onPress={close} />

          {/* Floating menu */}
          <View className="absolute right-3 top-12 bg-white rounded-xl shadow-lg p-2 min-w-[150px]">
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handlePress(action.onPress)}
                className="flex-row items-center py-2 px-3 rounded-lg active:bg-gray-100"
              >
                {action.icon && (
                  <Icon
                    name={action.icon}
                    size={16}
                    color={action.color || '#333'}
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text
                  className={`text-sm ${action.color ? '' : 'text-gray-800'}`}
                  style={{ color: action.color || '#333' }}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}
