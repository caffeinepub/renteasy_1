import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useBuyerOrders() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ["buyerOrders"],
    queryFn: async () => {
      if (!actor) return [];
      const rawOrders = await actor.getBuyerOrders();

      return rawOrders.map(
        ([orderId, orderRecord, rentalImage, rentalTitle, rentalPrice]) => {
          const record = orderRecord as any;
          return {
            orderId,
            rentalImage: rentalImage.getDirectURL(),
            rentalTitle,
            rentalPrice,
            status: record.status,
            duration: (record.duration as string) || "",
            totalPrice: (record.totalPrice as bigint) || 0n,
          };
        },
      );
    },
    enabled: !!actor && !actorFetching,
  });

  return {
    orders: query.data || [],
    isLoading: actorFetching || query.isLoading,
    error: query.error,
  };
}
