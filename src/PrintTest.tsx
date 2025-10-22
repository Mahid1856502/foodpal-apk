import { Alert } from 'react-native';
import { BluetoothDevice } from 'react-native-bluetooth-classic';

export const printTest = async (device: BluetoothDevice) => {
  try {
    // Ensure connected
    let connected = await device.isConnected();
    if (!connected) {
      await device.connect();
    }

    // ESC/POS command examples
    const init = '\x1B\x40'; // Initialize printer
    const boldOn = '\x1B\x45\x01'; // Bold on
    const boldOff = '\x1B\x45\x00'; // Bold off
    const newLine = '\n';
    const cut = '\x1D\x56\x42\x00'; // Full cut (may vary per printer)

    const message =
      init + boldOn + 'Test Print\n' + boldOff + newLine + newLine + cut;

    // Send to printer
    await device.write(message);
    Alert.alert('Printed!', 'Test message sent to printer.');
  } catch (e) {
    console.error('[BT] Print error:', e);
    Alert.alert('Print error', String(e));
  }
};
