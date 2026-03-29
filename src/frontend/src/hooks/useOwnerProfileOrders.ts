import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";

export interface OwnerProfileOrderEntry {
  orderId: bigint;
  orderRecord: any;
  rental: any;
}

export function useOwnerProfileOrders() {
  const { actor, isFetching } = useActor();

  const query = useQuery<[bigint, any, any][]>({
    queryKey: ["ownerProfileOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getOwnerProfileOrders() as Promise<
        [bigint, any, any][]
      >;
    },
    enabled: !!actor && !isFetching,
  });

  return {
    orders: query.data ?? [],
    isLoading: isFetching || query.isLoading,
    error: query.error,
  };
}
