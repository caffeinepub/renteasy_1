import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useOwnerOrders() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ['ownerOrders'],
    queryFn: async () => {
      if (!actor) return [];
      const rawOrders = await actor.getOwnerOrders();

      return rawOrders.map(([orderId, orderRecord, rentalTitle, buyerPrincipal, buyerPhone, buyerEmail, buyerAddress]) => ({
        orderId,
        rentalTitle,
        buyerPrincipal: buyerPrincipal.toString(),
        buyerPhone,
        buyerEmail,
        buyerAddress,
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
