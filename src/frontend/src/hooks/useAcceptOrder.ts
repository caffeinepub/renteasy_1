import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useAcceptOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) {
        throw new Error("Actor not initialized");
      }

      await actor.acceptOrder(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ownerOrders"] });
      queryClient.invalidateQueries({ queryKey: ["buyerOrders"] });
    },
    onError: (error: any) => {
      console.error("Failed to accept order:", error);
    },
  });
}
