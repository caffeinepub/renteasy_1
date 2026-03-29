import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useBlockedUsers() {
  const { actor, isFetching } = useActor();

  const query = useQuery<any[]>({
    queryKey: ["blockedUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getBlockedUsers() as Promise<any[]>;
    },
    enabled: !!actor && !isFetching,
  });

  return {
    blockedUsers: query.data ?? [],
    isLoading: isFetching || query.isLoading,
  };
}
