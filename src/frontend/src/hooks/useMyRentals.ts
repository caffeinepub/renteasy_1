import { useQuery } from "@tanstack/react-query";
import type { Rental } from "../backend";
import { useActor } from "./useActor";

export function useMyRentals() {
  const { actor, isFetching } = useActor();

  const query = useQuery<Rental[]>({
    queryKey: ["myRentals"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getMyRentals() as Promise<Rental[]>;
    },
    enabled: !!actor && !isFetching,
  });

  return {
    rentals: query.data ?? [],
    isLoading: isFetching || query.isLoading,
    error: query.error,
  };
}
