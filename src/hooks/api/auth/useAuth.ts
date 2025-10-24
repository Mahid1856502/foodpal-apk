// src/hooks/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { apiRequest } from '../../../utils/api';

interface AuthResponse {
  message: string;
  user: any;
  token: string;
}

export function useLogin() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiRequest<AuthResponse>('POST', '/auth/login', data),
    onSuccess: async res => {
      await login(res.token, res.user);
    },
  });
}

export function useSignup() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (data: { email: string; password: string; fullName: string }) =>
      apiRequest<AuthResponse>('POST', '/auth/signup', data),
    onSuccess: async res => {
      await login(res.token, res.user);
    },
  });
}
