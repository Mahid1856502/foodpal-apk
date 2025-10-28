import React, { createContext, useContext, useState } from 'react';
import { BluetoothDevice } from 'react-native-bluetooth-classic';

type BluetoothContextType = {
  connectedDevice: BluetoothDevice | null;
  setConnectedDevice: (device: BluetoothDevice | null) => void;
};

const BluetoothContext = createContext<BluetoothContextType>({
  connectedDevice: null,
  setConnectedDevice: () => {},
});

export const BluetoothProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [connectedDevice, setConnectedDevice] =
    useState<BluetoothDevice | null>(null);

  return (
    <BluetoothContext.Provider value={{ connectedDevice, setConnectedDevice }}>
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => useContext(BluetoothContext);
