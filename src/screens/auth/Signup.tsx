// src/screens/auth/Signup.tsx
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
import { useNavigation } from '@react-navigation/native';
import { useSignup } from '../../hooks/api/auth/useAuth';

export default function Signup() {
  const navigation = useNavigation();
  const signupMutation = useSignup();
  const { width, height } = useWindowDimensions();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const isTablet = width >= 768;
  const isLandscape = width > height;

  const handleChange = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSignup = () => {
    signupMutation.mutate(form);
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
            Create your partner account
          </Text>

          {/* Full Name */}
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#9CA3AF"
            value={form.fullName}
            onChangeText={v => handleChange('fullName', v)}
            className="border border-gray-300 focus:border-orange-500 bg-white text-gray-900 p-3 mb-3 rounded-lg"
          />

          {/* Email */}
          <TextInput
            placeholder="Email address"
            placeholderTextColor="#9CA3AF"
            value={form.email}
            onChangeText={v => handleChange('email', v)}
            autoCapitalize="none"
            keyboardType="email-address"
            className="border border-gray-300 focus:border-orange-500 bg-white text-gray-900 p-3 mb-3 rounded-lg"
          />

          {/* Password */}
          <View className="relative mb-4">
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={form.password}
              onChangeText={v => handleChange('password', v)}
              secureTextEntry={!showPassword}
              className="border border-gray-300 focus:border-orange-500 bg-white text-gray-900 p-3 rounded-lg pr-10"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(prev => !prev)}
              className="absolute right-3 top-3"
            >
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={22}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Submit */}
          {signupMutation.isPending ? (
            <ActivityIndicator color="#F97316" />
          ) : (
            <TouchableOpacity
              onPress={handleSignup}
              className="bg-orange-500 p-3 rounded-lg active:bg-orange-600"
            >
              <Text className="text-white text-center font-semibold text-base">
                Sign Up
              </Text>
            </TouchableOpacity>
          )}

          {/* Error */}
          {signupMutation.isError && (
            <Text className="text-red-500 text-center mt-3 text-sm">
              {(signupMutation.error as Error).message}
            </Text>
          )}

          {/* Navigation link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login' as never)}
            className="mt-4"
          >
            <Text className="text-orange-600 text-center font-medium">
              Already have an account? Log in
            </Text>
          </TouchableOpacity>

          <Text className="text-gray-400 text-center mt-6 text-xs">
            © 2025 Food Pal Partners
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
