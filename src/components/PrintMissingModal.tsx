import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

const PrintMissingModal = ({
  showPrinterModal,
  setShowPrinterModal,
}: {
  showPrinterModal: boolean;
  setShowPrinterModal: (state: boolean) => void;
}) => {
  const navigation = useNavigation();
  return (
    <Modal
      visible={showPrinterModal}
      animationType="fade"
      transparent
      onRequestClose={() => setShowPrinterModal(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '80%',
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 20,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
            No Printer Connected
          </Text>
          <Text
            style={{ textAlign: 'center', color: '#555', marginBottom: 20 }}
          >
            Please connect a Bluetooth printer before printing receipts.
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: '#007AFF',
              paddingHorizontal: 24,
              paddingVertical: 10,
              borderRadius: 8,
              marginBottom: 10,
            }}
            onPress={() => {
              setShowPrinterModal(false);
              navigation.navigate('Settings' as never);
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>
              Go to Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowPrinterModal(false)}>
            <Text style={{ color: '#007AFF' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PrintMissingModal;
