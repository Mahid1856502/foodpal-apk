import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DatePicker from 'react-native-date-picker';
import Icon from '@react-native-vector-icons/feather';
interface Props {
  date: Date;
  onConfirm: (date: Date) => void;
}

export default function DatePickerModal({ date, onConfirm }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View className="flex-row justify-center items-center">
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="bg-white border border-neutral-300 rounded-lg px-4 py-2 flex-row items-center gap-x-2"
      >
        <Icon name="filter" size={18} />
        <Text className="text-neutral-800 text-base">
          {date.toISOString().split('T')[0]}
        </Text>
      </TouchableOpacity>

      <DatePicker
        modal
        open={open}
        date={date}
        mode="date"
        onConfirm={selectedDate => {
          setOpen(false);
          onConfirm(selectedDate);
        }}
        onCancel={() => setOpen(false)}
      />
    </View>
  );
}
