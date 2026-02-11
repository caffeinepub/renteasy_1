import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

interface CreateOrderParams {
  rentalTitle: string;
  buyerPhone: string;
  buyerEmail: string;
  buyerAddress: string;
}

export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateOrderParams) => {
      if (!actor) {
        throw new Error('Actor not initialized');
      }

      return await actor.createOrder(
        params.rentalTitle,
        params.buyerPhone,
        params.buyerEmail,
        params.buyerAddress
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyerOrders'] });
    },
    onError: (error: any) => {
      console.error('Failed to create order:', error);
    },
  });
}
