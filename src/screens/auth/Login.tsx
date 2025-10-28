// src/screens/auth/Login.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import { useLogin } from '../../hooks/api/auth/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      loginMutation.reset();
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const getErrorMessage = () => {
    const err = loginMutation.error as any;
    console.log('err', err);
    if (!err) return '';

    const message =
      err?.response?.data?.message || err.message || 'Unknown error';

    if (message.includes('Invalid credentials')) {
      return 'Incorrect email or password.';
    }
    if (message.includes('Network Error')) {
      return 'Unable to reach server. Check your internet connection.';
    }
    if (message.toLowerCase().includes('timeout')) {
      return 'Server took too long to respond. Please try again.';
    }
    return 'Something went wrong. Please try again.';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
    >
      <View
        className="flex-1 justify-center items-center"
        style={{
          paddingHorizontal: isTablet ? 80 : 24,
          flexDirection: isLandscape ? 'row' : 'column',
        }}
      >
        <View
          className="bg-white border border-gray-200 rounded-2xl shadow-lg"
          style={{
            width: isTablet ? 480 : '100%',
            padding: isTablet ? 32 : 20,
          }}
        >
          <Text className="text-4xl font-extrabold text-center text-orange-600 mb-2">
            Food Pal
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            Partner Login — Manage your orders efficiently
          </Text>

          {/* Email Input */}
          <TextInput
            placeholder="Email address"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="border border-gray-300 focus:border-orange-500 bg-white text-gray-900 p-3 mb-3 rounded-lg"
          />

          {/* Password Input with toggle */}
          <View className="relative mb-4">
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              className="border border-gray-300 focus:border-orange-500 bg-white text-gray-900 p-3 rounded-lg pr-10"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3"
            >
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={22}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Login button */}
          <TouchableOpacity
            onPress={handleLogin}
            className="bg-orange-500 p-3 rounded-lg active:bg-orange-600"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center font-semibold text-base">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* Error */}
          {loginMutation.isError && (
            <Text className="text-red-500 text-center mt-3 text-sm">
              {getErrorMessage()}
            </Text>
          )}

          <Text className="text-gray-400 text-center mt-6 text-xs">
            © 2025 Food Pal Partners
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
