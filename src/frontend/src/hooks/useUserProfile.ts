import { Principal } from "@dfinity/principal";
import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useUserProfile(principalString: string) {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ["userProfile", principalString],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const principal = Principal.fromText(principalString);
        return await actor.getUserProfile(principal);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!principalString,
    retry: false,
  });

  return {
    buyerName: query.data?.name || null,
    isLoading: actorFetching || query.isLoading,
  };
}
