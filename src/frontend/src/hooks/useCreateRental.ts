import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

interface CreateRentalParams {
  title: string;
  category: string;
  description: string;
  price: bigint | null;
  location: string;
  phone: string;
  image: ExternalBlob;
  latitude?: number | null;
  longitude?: number | null;
}

export function useCreateRental() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateRentalParams) => {
      if (!actor) {
        throw new Error("Actor not initialized");
      }

      // Cast to any to support new backend signature with latitude, longitude
      return await (actor as any).createRental(
        params.title,
        params.category,
        params.description,
        params.price,
        params.location,
        params.phone,
        params.image,
        params.latitude ?? null,
        params.longitude ?? null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
    },
    onError: (error: any) => {
      console.error("Failed to create rental:", error);
      if (error.message?.includes("Unauthorized")) {
        alert("You must be logged in to create a rental");
      } else {
        alert("Failed to create rental. Please try again.");
      }
    },
  });
}
