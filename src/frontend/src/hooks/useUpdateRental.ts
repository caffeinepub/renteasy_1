import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

interface UpdateRentalParams {
  title: string;
  category: string;
  description: string;
  price: bigint | null;
  location: string;
  phone: string;
  image: ExternalBlob;
}

export function useUpdateRental() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateRentalParams) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.updateRental(
        params.title,
        params.category,
        params.description,
        params.price,
        params.location,
        params.phone,
        params.image,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["searchRentals"] });
      queryClient.invalidateQueries({ queryKey: ["myRentals"] });
      toast.success("Product updated successfully");
    },
    onError: () => {
      toast.error("Failed to update product");
    },
  });
}
