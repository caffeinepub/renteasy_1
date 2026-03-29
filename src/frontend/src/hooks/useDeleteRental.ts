import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useDeleteRental() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) {
        throw new Error("Actor not initialized");
      }

      await actor.deleteRental(title);
    },
    onSuccess: () => {
      // Invalidate all rental-related queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["searchRentals"] });
    },
    onError: (error: any) => {
      console.error("Failed to delete rental:", error);
      if (error.message?.includes("Unauthorized")) {
        alert("You are not authorized to delete this rental");
      } else {
        alert("Failed to delete rental. Please try again.");
      }
    },
  });
}
