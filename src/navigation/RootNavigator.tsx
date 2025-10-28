// src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { ActivityIndicator, View } from 'react-native';
import { NewOrderProvider } from '../contexts/NewOrderProvider';

function Navigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return token ? <AppNavigator /> : <AuthNavigator />;
}

export default function RootNavigator() {
  return (
    <AuthProvider>
      <NewOrderProvider>
        <NavigationContainer>
          <Navigator />
        </NavigationContainer>
      </NewOrderProvider>
    </AuthProvider>
  );
}
