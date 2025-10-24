// src/navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import OrderPadScreen from '../screens/main/OrderPadScreen';
// import OrdersSummaryScreen from '../screens/main/OrdersSummaryScreen';
// import TakeOffMenuScreen from '../screens/main/TakeOffMenuScreen';
// import StopOrdersScreen from '../screens/main/StopOrdersScreen';
// import SettingsScreen from '../screens/main/SettingsScreen';
// import ProfileScreen from '../screens/main/ProfileScreen';
import { useAuth } from '../contexts/AuthContext';
import OrderPad from '../screens/main/OrderPad';

export type AppTabParamList = {
  OrderPad: undefined;
  OrdersSummary: undefined;
  TakeOffMenu: undefined;
  StopOrders: undefined;
  Settings: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppNavigator() {
  const { logout } = useAuth();
  console.log('OrderPad', OrderPad);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // optional if you don’t want the header either
        tabBarStyle: { display: 'none' }, // hides tab bar globally
      }}
    >
      <Tab.Screen name="OrderPad" component={OrderPad} />
      {/* <Tab.Screen name="OrdersSummary" component={OrdersSummaryScreen} />
      <Tab.Screen name="TakeOffMenu" component={TakeOffMenuScreen} />
      <Tab.Screen name="StopOrders" component={StopOrdersScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerRight: () => <Button title="Logout" onPress={logout} />,
        }}
      /> */}
    </Tab.Navigator>
  );
}
