// src/screens/auth/ForgetPassword.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../../utils/api';
import { useNavigation } from '@react-navigation/native';

interface ForgotPasswordResponse {
  message: string;
}

export default function ForgetPassword() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');

  const forgotMutation = useMutation({
    mutationFn: (data: { email: string }) =>
      apiRequest<ForgotPasswordResponse>('POST', '/auth/forgot-password', data),
  });

  const handleSubmit = () => {
    forgotMutation.mutate({ email });
  };

  return (
    <View className="flex-1 justify-center px-6">
      <Text className="text-2xl font-bold mb-4">Reset Password</Text>

      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        className="border p-3 mb-3 rounded-lg"
      />

      {forgotMutation.isPending ? (
        <ActivityIndicator />
      ) : (
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-blue-600 p-3 rounded-lg"
        >
          <Text className="text-white text-center">Send Reset Link</Text>
        </TouchableOpacity>
      )}

      {forgotMutation.isSuccess && (
        <Text className="text-green-600 mt-3 text-center">
          {forgotMutation.data.message}
        </Text>
      )}

      {forgotMutation.isError && (
        <Text className="text-red-500 mt-3 text-center">
          {(forgotMutation.error as Error).message}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => navigation.navigate('Login' as never)}
        className="mt-4"
      >
        <Text className="text-blue-600 text-center">Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}
