import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useMyLocation() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const query = useQuery<string | null>({
    queryKey: ["myLocation"],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as any).getMyLocation() as Promise<string | null>;
    },
    enabled: !!actor && !isFetching,
  });

  const save = useMutation({
    mutationFn: async (location: string) => {
      if (!actor) throw new Error("Actor not ready");
      await (actor as any).saveMyLocation(location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myLocation"] });
    },
  });

  return {
    location: query.data ?? null,
    isLoading: isFetching || query.isLoading,
    saveLocation: save.mutateAsync,
    isSaving: save.isPending,
  };
}
