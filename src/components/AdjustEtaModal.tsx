import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import Icon from '@react-native-vector-icons/feather';

interface AdjustEtaModalProps {
  visible: boolean;
  eta: number;
  onChangeEta: (newEta: number) => void;
  onSave: () => void;
  onClose: () => void;
  title?: string;
}

const AdjustEtaModal = ({
  visible,
  eta,
  onChangeEta,
  onSave,
  onClose,
  title = 'Adjust Time Estimate',
}: AdjustEtaModalProps) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-center items-center bg-black/40">
        <View className="bg-white p-6 rounded-2xl w-80">
          <Text className="text-xl font-semibold text-center mb-6">
            {title}
          </Text>

          {/* ETA Control Row */}
          <View className="flex-row items-center justify-center mb-6">
            <TouchableOpacity
              onPress={() => onChangeEta(Math.max(5, eta - 5))}
              className="bg-gray-200 h-10 w-10 flex items-center justify-center rounded-full"
            >
              <Icon name="minus" size={18} color="#333" />
            </TouchableOpacity>

            <Text className="mx-4 text-lg font-semibold">ETA: {eta} mins</Text>

            <TouchableOpacity
              onPress={() => onChangeEta(eta + 5)}
              className="bg-gray-200 h-10 w-10 flex items-center justify-center rounded-full"
            >
              <Icon name="plus" size={18} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            onPress={onSave}
            className="bg-green-200 border border-green-700 p-3 rounded-lg mb-3"
          >
            <Text className="text-green-950 text-center font-semibold text-lg">
              Save
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} className="p-2 rounded-lg">
            <Text className="text-gray-600 text-center font-medium">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AdjustEtaModal;
