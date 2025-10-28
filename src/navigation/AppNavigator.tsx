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
import PrinterList from '../screens/main/printer-settings/PrinterList';
import OrdersSummary from '../screens/main/OrdersSummary';
import StopOrders from '../screens/main/StopOrders';
import TakeOffMenu from '../screens/main/TakeOffMenu';

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
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // optional if you don’t want the header either
        tabBarStyle: { display: 'none' }, // hides tab bar globally
      }}
    >
      <Tab.Screen name="OrderPad" component={OrderPad} />
      <Tab.Screen name="Settings" component={PrinterList} />
      <Tab.Screen name="OrdersSummary" component={OrdersSummary} />
      <Tab.Screen name="StopOrders" component={StopOrders} />
      <Tab.Screen name="TakeOffMenu" component={TakeOffMenu} />
      {/* <Tab.Screen name="OrdersSummary" component={OrdersSummaryScreen} />
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
