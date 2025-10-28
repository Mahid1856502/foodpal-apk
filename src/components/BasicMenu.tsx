import React from 'react';
import { Text, View } from 'react-native';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import Icon, { FeatherIconName } from '@react-native-vector-icons/feather';

export interface MenuItem {
  icon?: FeatherIconName;
  iconColor?: string;
  label: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
}

type MenuSize = 'small' | 'base';

interface BasicMenuProps {
  items: MenuItem[];
  triggerLabel?: string;
  triggerIcon?: FeatherIconName;
  style?: string;
  size?: MenuSize;
}

export const BasicMenu = ({
  items,
  triggerLabel,
  triggerIcon,
  style,
  size = 'base', // 👈 default
}: BasicMenuProps) => {
  const isSmall = size === 'small';

  return (
    <View className={style}>
      <Menu>
        <MenuTrigger
          style={{
            padding: isSmall ? 4 : 6,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: '#ddd',
          }}
        >
          {triggerIcon ? (
            <Icon name={triggerIcon} color="#333" size={20} />
          ) : (
            <Text
              className={`text-blue-500 ${
                isSmall ? 'text-sm px-1.5 py-1' : 'text-base px-2 py-1.5'
              }`}
            >
              {triggerLabel || 'Open Menu'}
            </Text>
          )}
        </MenuTrigger>

        <MenuOptions
          customStyles={{
            optionsContainer: {
              borderRadius: 12,
              paddingVertical: isSmall ? 4 : 8,
            },
          }}
        >
          {items.map((item, index) => (
            <MenuOption
              key={index}
              onSelect={item.onPress}
              disabled={item.disabled}
            >
              <View className="flex-row items-center p-2 px-3">
                {item?.icon && (
                  <Icon
                    name={item?.icon}
                    color={item?.iconColor || '#333'}
                    size={16}
                  />
                )}
                <Text
                  className={`px-2 ${
                    isSmall ? 'text-sm py-1.5' : 'text-base py-2'
                  } ${item.disabled ? 'text-gray-400' : 'text-gray-800'} ${
                    item.color ? '' : ''
                  }`}
                  style={item.color ? { color: item.color } : undefined}
                >
                  {item.label}
                </Text>
              </View>
            </MenuOption>
          ))}
        </MenuOptions>
      </Menu>
    </View>
  );
};
