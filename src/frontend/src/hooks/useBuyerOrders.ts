import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useBuyerOrders() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ['buyerOrders'],
    queryFn: async () => {
      if (!actor) return [];
      const rawOrders = await actor.getBuyerOrders();

      return rawOrders.map(([orderId, orderRecord, rentalImage, rentalTitle, rentalPrice]) => ({
        orderId,
        rentalImage: rentalImage.getDirectURL(),
        rentalTitle,
        rentalPrice,
        status: orderRecord.status,
      }));
    },
    enabled: !!actor && !actorFetching,
  });

  return {
    orders: query.data || [],
    isLoading: actorFetching || query.isLoading,
    error: query.error,
  };
}
