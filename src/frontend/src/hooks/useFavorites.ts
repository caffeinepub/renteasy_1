import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useFavoriteToggle(rentalTitle: string, isLoggedIn: boolean) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const { data: favorited = false, isLoading: checkLoading } = useQuery({
    queryKey: ["isFavorited", rentalTitle],
    queryFn: async () => {
      if (!actor) return false;
      return (actor as any).isFavorited(rentalTitle) as Promise<boolean>;
    },
    enabled: !!actor && !isFetching && isLoggedIn,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await (actor as any).addFavorite(rentalTitle);
    },
    onSuccess: () => {
      queryClient.setQueryData(["isFavorited", rentalTitle], true);
      queryClient.invalidateQueries({ queryKey: ["userFavorites"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await (actor as any).removeFavorite(rentalTitle);
    },
    onSuccess: () => {
      queryClient.setQueryData(["isFavorited", rentalTitle], false);
      queryClient.invalidateQueries({ queryKey: ["userFavorites"] });
    },
  });

  const toggle = async () => {
    if (!isLoggedIn) return;
    if (favorited) {
      await removeMutation.mutateAsync();
    } else {
      await addMutation.mutateAsync();
    }
  };

  return {
    isFavorited: favorited,
    toggle,
    loading: checkLoading || addMutation.isPending || removeMutation.isPending,
  };
}

export function useUserFavorites() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["userFavorites"],
    queryFn: async () => {
      if (!actor) return [];
      const results = (await (actor as any).getUserFavorites()) as Array<
        [bigint, any, any]
      >;
      return results.map(([id, favorite, rental]) => ({
        id,
        favorite,
        rental,
      }));
    },
    enabled: !!actor && !isFetching,
  });

  return {
    favorites: query.data ?? [],
    loading: query.isLoading,
    refetch: () =>
      queryClient.invalidateQueries({ queryKey: ["userFavorites"] }),
  };
}
