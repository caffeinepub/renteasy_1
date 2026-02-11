import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Rental } from '../backend';
import { useState } from 'react';

const PAGE_SIZE = 12;

export function useRentals() {
  const { actor, isFetching: actorFetching } = useActor();
  const [page, setPage] = useState(0);

  const query = useQuery<Rental[]>({
    queryKey: ['rentals', page],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getRentals(BigInt(page), BigInt(PAGE_SIZE));
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30000, // 30 seconds
  });

  // Accumulate all pages
  const [allRentals, setAllRentals] = useState<Rental[]>([]);

  // Update accumulated rentals when new data arrives
  if (query.data && query.isSuccess) {
    if (page === 0) {
      // Reset on first page
      if (allRentals.length !== query.data.length || allRentals[0]?.title !== query.data[0]?.title) {
        setAllRentals(query.data);
      }
    } else {
      // Append new page
      const lastRental = allRentals[allRentals.length - 1];
      const firstNewRental = query.data[0];
      if (query.data.length > 0 && lastRental?.title !== firstNewRental?.title) {
        setAllRentals((prev) => [...prev, ...query.data]);
      }
    }
  }

  const hasMore = query.data ? query.data.length === PAGE_SIZE : false;

  const loadMore = () => {
    if (hasMore && !query.isFetching) {
      setPage((p) => p + 1);
    }
  };

  return {
    rentals: allRentals,
    isLoading: page === 0 && (actorFetching || query.isLoading),
    isLoadingMore: page > 0 && query.isFetching,
    error: query.error,
    hasMore,
    loadMore,
  };
}
