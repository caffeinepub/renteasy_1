import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";

export interface SearchHistoryEntry {
  user: any;
  searchText: string;
  createdAt: bigint;
}

export function useSearchHistory() {
  const { actor, isFetching } = useActor();

  const query = useQuery<[bigint, SearchHistoryEntry][]>({
    queryKey: ["searchHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getMySearchHistory() as Promise<
        [bigint, SearchHistoryEntry][]
      >;
    },
    enabled: !!actor && !isFetching,
  });

  return {
    history: query.data ?? [],
    isLoading: isFetching || query.isLoading,
    error: query.error,
  };
}
