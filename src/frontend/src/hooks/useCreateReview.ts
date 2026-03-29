import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useCreateReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rentalTitle,
      rating,
      reviewText,
    }: {
      rentalTitle: string;
      rating: number;
      reviewText: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createReview(rentalTitle, BigInt(rating), reviewText);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["rentalReviews", variables.rentalTitle],
      });
      queryClient.invalidateQueries({
        queryKey: ["hasReviewed", variables.rentalTitle],
      });
      queryClient.invalidateQueries({ queryKey: ["buyerOrders"] });
    },
  });
}
