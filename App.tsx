import './global.css';
import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/utils/queryClient';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { MenuProvider } from 'react-native-popup-menu';
import { BluetoothProvider } from './src/contexts/PrinterContext';
import { preloadSound } from './src/utils/soundManager';

export default function App() {
  useEffect(() => {
    // 🔊 Preload notification sound at startup
    preloadSound('notification.wav')
      .then(() => console.log('🔊 Sound ready for instant play'))
      .catch(err => console.log('⚠️ Sound preload failed', err));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BluetoothProvider>
          <MenuProvider>
            <RootNavigator />
          </MenuProvider>
        </BluetoothProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
