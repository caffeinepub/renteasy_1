import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Rental } from '../backend';

export function useSearchRentals(searchTerm: string) {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Rental[]>({
    queryKey: ['searchRentals', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      const [, rentals] = await actor.searchRentals(searchTerm);
      return rentals;
    },
    enabled: !!actor && !actorFetching && searchTerm.length > 0,
    staleTime: 10000, // 10 seconds
  });

  return {
    rentals: query.data || [],
    isLoading: actorFetching || query.isLoading,
    error: query.error,
  };
}
