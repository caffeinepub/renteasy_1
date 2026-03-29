import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useRentalReviews(rentalTitle: string) {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ["rentalReviews", rentalTitle],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await actor.getReviewsForRental(rentalTitle);
      return raw.map(([id, review, reviewerName]) => ({
        id,
        rentalTitle: review.rental,
        reviewer: review.reviewer,
        reviewerName,
        rating: Number(review.rating),
        reviewText: review.reviewText,
        createdAt: review.createdAt,
      }));
    },
    enabled: !!actor && !actorFetching && !!rentalTitle,
  });

  const reviews = query.data || [];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return {
    reviews,
    averageRating,
    isLoading: actorFetching || query.isLoading,
    error: query.error,
  };
}
