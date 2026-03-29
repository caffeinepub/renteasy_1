import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useHasReviewed(rentalTitle: string) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery({
    queryKey: ["hasReviewed", rentalTitle],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasUserReviewedRental(rentalTitle);
    },
    enabled: !!actor && !actorFetching && !!identity && !!rentalTitle,
  });

  return {
    hasReviewed: query.data ?? false,
    isLoading: actorFetching || query.isLoading,
  };
}
