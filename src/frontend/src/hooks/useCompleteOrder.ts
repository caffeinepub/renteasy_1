import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useCompleteOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) {
        throw new Error("Actor not initialized");
      }
      // completeOrder will be available after backend deployment
      await (actor as any).completeOrder(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyerOrders"] });
    },
    onError: (error: any) => {
      console.error("Failed to complete order:", error);
    },
  });
}
