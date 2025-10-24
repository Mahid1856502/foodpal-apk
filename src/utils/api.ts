// src/utils/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryFunction } from '@tanstack/react-query';

export const BASE_URL = 'https://nagawings.com';

// --------------------
// Helper: Error throwing
// --------------------
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// --------------------
// Helper: Get token safely
// --------------------
async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem('token');
}

// --------------------
// API request wrapper
// --------------------
export async function apiRequest<T>(
  method: string,
  url: string,
  data?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = await getToken();

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (data) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}/api${url}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (res.status === 401) {
    throw new Error('Unauthorized. Please log in again.');
  }

  await throwIfResNotOk(res);
  return res.json();
}

// --------------------
// Query function for TanStack Query
// --------------------
type UnauthorizedBehavior = 'returnNull' | 'throw';

export const getQueryFn =
  <T>({ on401 }: { on401: UnauthorizedBehavior }): QueryFunction<T> =>
  async ({ queryKey }) => {
    const path = queryKey.join('/') as string;
    const headers: Record<string, string> = {};
    const token = await getToken();

    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, { headers });

    if (res.status === 401) {
      if (on401 === 'returnNull') return null as T;
      throw new Error('Unauthorized');
    }

    await throwIfResNotOk(res);
    return res.json();
  };

// --------------------
// Global Query Client
// --------------------
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: 'throw' }),
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: false,
    },
  },
});
