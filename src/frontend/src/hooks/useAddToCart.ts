import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { backendInterface } from "../backend.d";
import { useActor } from "./useActor";

export function useAddToCart() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rentalTitle: string) =>
      (actor as unknown as backendInterface)!.addToCart(rentalTitle),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myCart"] });
      qc.invalidateQueries({ queryKey: ["isInCart"] });
    },
  });
}
