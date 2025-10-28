import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useMenu, useToggleAvailability } from '../../hooks/api/menu/useMenu';
import useResponsiveLayout from '../../hooks/custom/useResponsiveLayout';

export default function TakeOffMenu() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { isLandscape } = useResponsiveLayout();
  const { mutate: toggleAvailability, isPending } = useToggleAvailability();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const { data: menu, isLoading } = useMenu(user?.restaurantId ?? undefined);

  const [activeCategory, setActiveCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [showUnavailable, setShowUnavailable] = useState(false);

  /** Group menu items by category */
  const categories = useMemo(() => {
    if (!menu?.foodItems?.length) return [];
    const grouped: Record<string, typeof menu.foodItems> = {};
    menu.foodItems.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });
    const result = Object.entries(grouped).map(([name, items]) => ({
      name,
      items,
    }));
    if (!activeCategory && result.length > 0) {
      setActiveCategory(result[0].name);
    }
    return result;
  }, [menu]);

  const currentItems =
    categories.find(cat => cat.name === activeCategory)?.items ?? [];

  /** Filter items by search + availability */
  const filteredItems = useMemo(() => {
    return currentItems.filter(i => {
      const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
      const matchesAvailability = showUnavailable ? !i.isAvailable : true;
      return matchesSearch && matchesAvailability;
    });
  }, [currentItems, search, showUnavailable]);

  /** Toggle availability with optimistic update */
  const toggleItem = (
    category: string,
    itemId: string,
    currentValue: boolean,
  ) => {
    setLoadingItemId(itemId);
    toggleAvailability(
      {
        foodItemId: itemId,
        isAvailable: !currentValue,
        restaurantId: user?.restaurantId!,
      },
      {
        onSettled: () => setLoadingItemId(null),
      },
    );
  };

  /** LOADING STATE */
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#fb923c" />
        <Text className="text-gray-500 mt-3 text-base">Loading menu...</Text>
      </SafeAreaView>
    );
  }

  /** EMPTY MENU */
  if (!categories.length) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-4">
        <Icon name="clipboard" size={40} color="#9ca3af" />
        <Text className="text-gray-500 text-base mt-4 text-center">
          No menu items found.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={() => navigation.navigate('OrderPad' as never)}
          className="flex-row items-center"
        >
          <Icon name="arrow-left" size={20} color="#4b5563" />
          <Text className="ml-2 text-base font-medium text-gray-700">Back</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Manage Menu</Text>
        <View className="w-8" />
      </View>

      {/* SEARCH + FILTER BAR */}
      <View className="flex-row items-center justify-between px-5 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center flex-1 bg-gray-100 rounded-xl px-3 py-2 mr-3">
          <Icon name="search" size={18} color="#9ca3af" />
          <TextInput
            placeholder="Search items..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 text-gray-800"
          />
        </View>

        <TouchableOpacity
          onPress={() => setShowUnavailable(!showUnavailable)}
          className="flex-row items-center"
        >
          <Icon
            name={showUnavailable ? 'eye-off' : 'eye'}
            size={18}
            color={showUnavailable ? '#ef4444' : '#4b5563'}
          />
          <Text
            className={`ml-1 text-sm font-medium ${
              showUnavailable ? 'text-red-500' : 'text-gray-600'
            }`}
          >
            {showUnavailable ? 'Unavailable' : 'All'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MAIN CONTENT */}
      <View className="flex-1 flex-row">
        {/* TABLET: Sidebar categories */}
        {isLandscape && (
          <ScrollView
            className="w-52 bg-white border-r border-gray-200"
            showsVerticalScrollIndicator={false}
          >
            {categories.map(cat => {
              const offCount = cat.items.filter(i => !i.isAvailable).length;
              return (
                <TouchableOpacity
                  key={cat.name}
                  onPress={() => setActiveCategory(cat.name)}
                  className={`flex-row justify-between items-center px-5 py-4 border-l-4 ${
                    activeCategory === cat.name
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-transparent'
                  }`}
                >
                  <Text
                    className={`text-base font-medium ${
                      activeCategory === cat.name
                        ? 'text-orange-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {cat.name}
                  </Text>
                  {offCount > 0 && (
                    <View className="bg-red-100 px-2 py-0.5 rounded-full">
                      <Text className="text-xs text-red-600 font-semibold">
                        {offCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* CONTENT AREA */}
        <ScrollView
          className="flex-1 px-5 py-4"
          showsVerticalScrollIndicator={false}
        >
          {/* MOBILE: Category Chips */}
          {!isLandscape && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {categories.map(cat => {
                const offCount = cat.items.filter(i => !i.isAvailable).length;
                return (
                  <TouchableOpacity
                    key={cat.name}
                    onPress={() => setActiveCategory(cat.name)}
                    className={`px-4 py-2 rounded-full mr-2 border ${
                      activeCategory === cat.name
                        ? 'bg-orange-500 border-orange-500'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        activeCategory === cat.name
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {cat.name} {offCount > 0 ? `(${offCount})` : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* ITEM LIST */}
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <View
                key={item.id}
                className={`bg-white p-4 mb-3 rounded-2xl border border-gray-100 shadow-sm flex-row items-center justify-between ${
                  loadingItemId === item.id ? 'opacity-50' : ''
                }`}
              >
                <View className="flex-1 mr-4">
                  <View className="flex flex-row items-center">
                    {loadingItemId === item.id && (
                      <ActivityIndicator size="small" color="#f97316" />
                    )}
                    <Text className="text-base font-medium text-gray-900 ml-3">
                      {item.name}
                    </Text>
                  </View>
                  {!item.isAvailable && (
                    <View className="flex-row items-center mt-1">
                      <Icon
                        name="alert-circle"
                        size={14}
                        color="#ef4444"
                        style={{ marginRight: 4 }}
                      />
                      <Text className="text-sm text-gray-500">
                        Temporarily unavailable
                      </Text>
                    </View>
                  )}
                </View>

                <Switch
                  trackColor={{ false: '#f87171', true: '#86efac' }}
                  thumbColor="#fff"
                  value={item.isAvailable}
                  disabled={isPending || loadingItemId === item.id}
                  onValueChange={() =>
                    toggleItem(activeCategory, item.id, item.isAvailable)
                  }
                />
              </View>
            ))
          ) : (
            <View className="items-center justify-center py-16">
              <Icon name="inbox" size={36} color="#9ca3af" />
              <Text className="text-gray-500 mt-2">
                No matching items found
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
