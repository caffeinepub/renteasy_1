import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useNotifications() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await actor.getMyNotifications();
      return raw.map(([id, notif]) => ({
        id,
        message: notif.message,
        relatedOrder: notif.relatedOrder,
        isRead: notif.isRead,
        createdAt: notif.createdAt,
      }));
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });

  return {
    notifications: query.data || [],
    isLoading: actorFetching || query.isLoading,
    error: query.error,
  };
}

export function useUnreadNotificationCount() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ["unreadNotificationCount"],
    queryFn: async () => {
      if (!actor) return 0n;
      return await actor.getUnreadNotificationCount();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 15000,
  });

  return Number(query.data ?? 0n);
}

export function useMarkNotificationRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notifId: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.markNotificationRead(notifId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });
}
