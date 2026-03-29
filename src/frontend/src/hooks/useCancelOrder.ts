import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { backendInterface } from "../backend.d";
import { useActor } from "./useActor";

export function useCancelOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: bigint) =>
      (actor as unknown as backendInterface)!.cancelOrder(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["buyerOrders"] });
    },
  });
}
