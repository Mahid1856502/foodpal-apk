import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Permission,
} from 'react-native';
import RNBluetoothClassic, {
  BluetoothDevice,
} from 'react-native-bluetooth-classic';
import Icon from '@react-native-vector-icons/feather';
import { useBluetooth } from '../../../contexts/PrinterContext';

/* ---------------------------------------------------------
   REQUEST BLUETOOTH PERMISSIONS
--------------------------------------------------------- */
async function requestPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const permissions: Permission[] = [];

  if (Platform.Version >= 31) {
    permissions.push(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
  } else {
    permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  }

  const granted = await PermissionsAndroid.requestMultiple(permissions);
  console.log('🔐 Granted permissions:', granted);

  const denied = Object.entries(granted).filter(
    ([, result]) => result !== PermissionsAndroid.RESULTS.GRANTED,
  );

  if (denied.length > 0) {
    const permanentlyDenied = denied.some(
      ([, result]) => result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
    );

    if (permanentlyDenied) {
      Alert.alert(
        'Bluetooth Permissions Needed',
        'You have permanently denied Bluetooth permissions. Please enable them in system settings to continue.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
    } else {
      Alert.alert(
        'Bluetooth Permissions Needed',
        'Please grant Bluetooth permissions to use this feature.',
      );
    }
    return false;
  }

  return true;
}

/* ---------------------------------------------------------
   PRINTER LIST COMPONENT
--------------------------------------------------------- */
export default function PrinterList({ navigation }: any) {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [discovered, setDiscovered] = useState<BluetoothDevice[]>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [busyDevice, setBusyDevice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setConnectedDevice } = useBluetooth();

  useEffect(() => {
    initBluetooth();
  }, []);

  const initBluetooth = async () => {
    console.log('🔵 Initializing Bluetooth...');
    const ok = await requestPermissions();

    if (!ok) {
      setError('Bluetooth permissions not granted');
      setLoading(false);
      return;
    }

    try {
      let enabled = await RNBluetoothClassic.isBluetoothEnabled();
      if (!enabled) {
        const userEnabled = await RNBluetoothClassic.requestBluetoothEnabled();
        if (!userEnabled) throw new Error('Bluetooth not enabled');
      }
      await loadBondedDevices();
    } catch (e: any) {
      console.error('[BT] Init error:', e);
      setError(e.message || 'Unknown Bluetooth error');
    } finally {
      setLoading(false);
    }
  };

  const loadBondedDevices = useCallback(async () => {
    try {
      const bonded = await RNBluetoothClassic.getBondedDevices();
      setDevices(bonded);
      console.log('[BT] Bonded devices:', bonded);
      await updateStatuses(bonded);
    } catch (e) {
      console.error('[BT] Error loading bonded devices', e);
    }
  }, []);

  const startDiscovery = async () => {
    if (scanning) return;
    try {
      console.log('[BT] Starting discovery...');
      setScanning(true);
      setDiscovered([]);
      const found = await RNBluetoothClassic.startDiscovery();
      console.log(`[BT] Found ${found.length} devices`);
      setDiscovered(found);
    } catch (e) {
      console.error('[BT] Discovery error:', e);
      Alert.alert('Scan Error', String(e));
    } finally {
      setScanning(false);
    }
  };

  const pairDevice = async (device: BluetoothDevice) => {
    setBusyDevice(device.address);
    try {
      const paired = await RNBluetoothClassic.pairDevice(device.address);
      Alert.alert('Paired', `${paired.name} is now bonded`);
      await loadBondedDevices();
    } catch (e) {
      console.error('[BT] Pair error:', e);
      Alert.alert('Pairing failed', String(e));
    } finally {
      setBusyDevice(null);
    }
  };

  const unpairDevice = async (device: BluetoothDevice) => {
    setBusyDevice(device.address);
    try {
      await RNBluetoothClassic.unpairDevice(device.address);
      Alert.alert('Unpaired', `${device.name} removed from bonded list`);
      await loadBondedDevices();
    } catch (e) {
      console.error('[BT] Unpair error:', e);
      Alert.alert('Unpair failed', String(e));
    } finally {
      setBusyDevice(null);
    }
  };

  const toggleConnection = async (device: BluetoothDevice) => {
    setBusyDevice(device.address);
    try {
      const isConnected = await device.isConnected();

      if (isConnected) {
        await device.disconnect();
        setConnectedDevice(null);
        Alert.alert('Disconnected', `${device.name} disconnected`);
      } else {
        for (const d of devices) {
          if (d.address !== device.address) {
            const connected = await d.isConnected();
            if (connected) await d.disconnect();
          }
        }

        await device.connect();
        setConnectedDevice(device);
        Alert.alert('Connected', `${device.name} connected`);
      }

      await updateStatuses(devices);
    } catch (e) {
      console.error('[BT] Connection toggle error:', e);
      Alert.alert('Connection error', String(e));
    } finally {
      setBusyDevice(null);
    }
  };

  const updateStatuses = async (deviceList: BluetoothDevice[]) => {
    const newStatuses: Record<string, string> = {};
    for (const d of deviceList) {
      try {
        const connected = await d.isConnected();
        newStatuses[d.address] = connected ? '🟢 Connected' : '🔵 Paired';
      } catch {
        newStatuses[d.address] = '⚫ Unknown';
      }
    }
    setStatuses(newStatuses);
  };

  /* ---------------- UI ---------------- */
  if (loading)
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-2 text-gray-600">Loading Bluetooth...</Text>
      </View>
    );

  if (error)
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-600 font-medium">Error: {error}</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
          onPress={async () => {
            setError(null);
            setLoading(true);
            await initBluetooth();
          }}
        >
          <Text className="text-white font-semibold">Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View className="flex-1 p-4 bg-white">
      {/* Header */}
      <View className="flex-row items-center gap-3 mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">Paired Devices</Text>
      </View>

      {/* Bonded Devices List */}
      <FlatList
        data={devices}
        keyExtractor={item => item.address}
        renderItem={({ item }) => (
          <View className="flex-row items-center p-3 border border-gray-300 rounded-xl mb-3">
            <View className="flex-1">
              <Text className="font-semibold text-gray-900">
                {item.name || 'Unknown'}
              </Text>
              <Text className="text-xs text-gray-500">{item.address}</Text>
              <Text className="text-xs mt-1">
                {statuses[item.address] || '⏳ Checking...'}
              </Text>
            </View>

            {busyDevice === item.address ? (
              <ActivityIndicator size="small" />
            ) : (
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => toggleConnection(item)}
                  className="bg-blue-500 px-3 py-2 rounded-md"
                >
                  <Text className="text-white text-sm font-medium">
                    {statuses[item.address]?.includes('Connected')
                      ? 'Disconnect'
                      : 'Connect'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => unpairDevice(item)}
                  className="bg-red-600 px-3 py-2 rounded-md"
                >
                  <Text className="text-white text-sm font-medium">Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      {/* Discover Button */}
      <TouchableOpacity
        className="bg-blue-600 mt-4 py-3 rounded-xl items-center"
        onPress={startDiscovery}
      >
        <Text className="text-white font-semibold text-base">
          {scanning ? 'Scanning...' : '🔍 Discover New Devices'}
        </Text>
      </TouchableOpacity>

      {/* Discovered Devices */}
      {discovered.length > 0 && (
        <>
          <Text className="text-lg font-bold mt-5 mb-2 text-gray-800">
            Discovered Devices
          </Text>
          <FlatList
            data={discovered}
            keyExtractor={item => item.address}
            renderItem={({ item }) => (
              <View className="flex-row items-center p-3 border border-gray-300 rounded-xl mb-3">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">
                    {item.name || 'Unknown'}
                  </Text>
                  <Text className="text-xs text-gray-500">{item.address}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => pairDevice(item)}
                  className="bg-green-500 px-3 py-2 rounded-md"
                >
                  <Text className="text-white text-sm font-medium">Pair</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}
