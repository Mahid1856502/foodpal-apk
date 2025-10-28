import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../utils/api';
import { MenuResponse } from '../../../types/food';

export function useMenu(restaurantId?: string) {
  return useQuery<MenuResponse, Error>({
    queryKey: ['menu', restaurantId],
    queryFn: () =>
      apiRequest<MenuResponse>('GET', `/menu/restaurant/${restaurantId}`),
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false, // 👈 this prevents flicker when mutation completes
  });
}

type ToggleAvailabilityInput = {
  foodItemId: string;
  isAvailable: boolean;
  restaurantId: string;
};

export function useToggleAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ foodItemId, isAvailable }: ToggleAvailabilityInput) =>
      apiRequest('PATCH', `/menu/item/${foodItemId}/availability`, {
        isAvailable,
      }),

    onMutate: async ({ foodItemId, isAvailable, restaurantId }) => {
      await queryClient.cancelQueries({ queryKey: ['menu', restaurantId] });

      const previousData = queryClient.getQueryData<MenuResponse>([
        'menu',
        restaurantId,
      ]);

      if (previousData) {
        queryClient.setQueryData<MenuResponse>(['menu', restaurantId], {
          ...previousData,
          foodItems: previousData.foodItems.map(item =>
            item.id === foodItemId ? { ...item, isAvailable } : item,
          ),
        });
      }

      return { previousData, restaurantId };
    },

    onError: (err, _vars, context) => {
      if (context?.previousData && context.restaurantId) {
        queryClient.setQueryData<MenuResponse>(
          ['menu', context.restaurantId],
          context.previousData,
        );
      }
    },

    // onSuccess: (_data, { foodItemId, isAvailable, restaurantId }) => {
    //   // ✅ update cache to reflect server-confirmed state (no refetch)
    //   const currentData = queryClient.getQueryData<MenuResponse>([
    //     'menu',
    //     restaurantId,
    //   ]);
    //   if (currentData) {
    //     queryClient.setQueryData<MenuResponse>(['menu', restaurantId], {
    //       ...currentData,
    //       foodItems: currentData.foodItems.map(item =>
    //         item.id === foodItemId ? { ...item, isAvailable } : item,
    //       ),
    //     });
    //   }
    // },
  });
}
