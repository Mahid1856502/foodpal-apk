import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Linking,
  Permission,
} from 'react-native';
import RNBluetoothClassic, {
  BluetoothDevice,
} from 'react-native-bluetooth-classic';
import { printTest } from './PrintTest';

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
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, // extra safety for some OEMs
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
export default function PrinterList() {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [discovered, setDiscovered] = useState<BluetoothDevice[]>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [busyDevice, setBusyDevice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- INIT ---------------- */
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

  /* ---------------- LOAD BONDED DEVICES ---------------- */
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

  /* ---------------- DISCOVER NEW DEVICES ---------------- */
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

  /* ---------------- PAIR DEVICE ---------------- */
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

  /* ---------------- UNPAIR DEVICE ---------------- */
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

  /* ---------------- CONNECT / DISCONNECT ---------------- */
  const toggleConnection = async (device: BluetoothDevice) => {
    setBusyDevice(device.address);
    try {
      const isConnected = await device.isConnected();

      if (isConnected) {
        await device.disconnect();
        Alert.alert('Disconnected', `${device.name} disconnected`);
      } else {
        // Disconnect any previously connected device
        for (const d of devices) {
          if (d.address !== device.address) {
            const connected = await d.isConnected();
            if (connected) {
              console.log(`[BT] Disconnecting previous device: ${d.name}`);
              await d.disconnect();
            }
          }
        }
        await device.connect();
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

  /* ---------------- UPDATE CONNECTION STATUSES ---------------- */
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
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.status}>Loading Bluetooth...</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={[styles.status, { color: 'red' }]}>Error: {error}</Text>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: '#007aff', marginTop: 12 },
          ]}
          onPress={async () => {
            setError(null);
            setLoading(true);
            await initBluetooth();
          }}
        >
          <Text style={styles.actionText}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Paired Devices</Text>
      <FlatList
        data={devices}
        keyExtractor={item => item.address}
        renderItem={({ item }) => (
          <View style={styles.deviceCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.deviceName}>{item.name || 'Unknown'}</Text>
              <Text style={styles.address}>{item.address}</Text>
              <Text style={styles.statusText}>
                {statuses[item.address] || '⏳ Checking...'}
              </Text>
            </View>

            {busyDevice === item.address ? (
              <ActivityIndicator size="small" />
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => toggleConnection(item)}
                  style={[
                    styles.actionSmallBtn,
                    { backgroundColor: '#007AFF', marginRight: 8 },
                  ]}
                >
                  <Text style={{ color: '#fff' }}>
                    {statuses[item.address]?.includes('Connected')
                      ? 'Disconnect'
                      : 'Connect'}
                  </Text>
                </TouchableOpacity>

                {statuses[item.address]?.includes('Connected') && (
                  <TouchableOpacity
                    onPress={() => printTest(item)}
                    style={[
                      styles.actionSmallBtn,
                      { backgroundColor: '#4CAF50', marginRight: 8 },
                    ]}
                  >
                    <Text style={{ color: '#fff' }}>Print Test</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => unpairDevice(item)}
                  style={[styles.actionSmallBtn, { backgroundColor: '#d33' }]}
                >
                  <Text style={{ color: '#fff' }}>Remove</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: '#007aff' }]}
        onPress={startDiscovery}
      >
        <Text style={styles.actionText}>
          {scanning ? 'Scanning...' : '🔍 Discover New Devices'}
        </Text>
      </TouchableOpacity>

      {discovered.length > 0 && (
        <>
          <Text style={[styles.heading, { marginTop: 16 }]}>
            Discovered Devices
          </Text>
          <FlatList
            data={discovered}
            keyExtractor={item => item.address}
            renderItem={({ item }) => (
              <View style={styles.deviceCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.deviceName}>
                    {item.name || 'Unknown'}
                  </Text>
                  <Text style={styles.address}>{item.address}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => pairDevice(item)}
                  style={[
                    styles.actionSmallBtn,
                    { backgroundColor: '#4CAF50' },
                  ]}
                >
                  <Text style={{ color: '#fff' }}>Pair</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

/* ---------------------------------------------------------
   STYLES
--------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heading: { fontWeight: 'bold', marginBottom: 8, fontSize: 16 },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
  },
  deviceName: { fontWeight: '600' },
  address: { fontSize: 12, color: '#555' },
  statusText: { fontSize: 12, marginTop: 4 },
  actionSmallBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionBtn: {
    marginTop: 12,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: { color: '#fff', fontWeight: 'bold' },
  status: { marginTop: 8 },
});
