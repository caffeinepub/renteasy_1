import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { backendInterface } from "../backend.d";
import { useActor } from "./useActor";

export function useRemoveFromCart() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cartId: bigint) =>
      (actor as unknown as backendInterface)!.removeFromCart(cartId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myCart"] });
      qc.invalidateQueries({ queryKey: ["isInCart"] });
    },
  });
}
