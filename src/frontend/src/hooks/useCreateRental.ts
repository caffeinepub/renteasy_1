import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '../backend';

interface CreateRentalParams {
  title: string;
  category: string;
  description: string;
  price: bigint | null;
  location: string;
  phone: string;
  image: ExternalBlob;
}

export function useCreateRental() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateRentalParams) => {
      if (!actor) {
        throw new Error('Actor not initialized');
      }

      return await actor.createRental(
        params.title,
        params.category,
        params.description,
        params.price,
        params.location,
        params.phone,
        params.image
      );
    },
    onSuccess: () => {
      // Invalidate rentals query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
    },
    onError: (error: any) => {
      console.error('Failed to create rental:', error);
      if (error.message?.includes('Unauthorized')) {
        alert('You must be logged in to create a rental');
      } else {
        alert('Failed to create rental. Please try again.');
      }
    },
  });
}
