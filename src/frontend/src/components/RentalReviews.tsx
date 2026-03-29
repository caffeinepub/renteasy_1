import { Loader2, Star } from "lucide-react";
import { useRentalReviews } from "../hooks/useRentalReviews";

interface RentalReviewsProps {
  rentalTitle: string;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className="w-4 h-4"
          fill={rating >= star ? "#f59e0b" : "none"}
          stroke={rating >= star ? "#f59e0b" : "currentColor"}
        />
      ))}
    </div>
  );
}

export function RentalReviews({ rentalTitle }: RentalReviewsProps) {
  const { reviews, averageRating, isLoading } = useRentalReviews(rentalTitle);

  if (isLoading) {
    return (
      <div className="pt-3 border-t flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading reviews...
      </div>
    );
  }

  return (
    <div className="pt-3 border-t space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Reviews</h4>
        {averageRating !== null && (
          <div className="flex items-center gap-1">
            <StarDisplay rating={Math.round(averageRating)} />
            <span className="text-xs text-muted-foreground">
              {averageRating.toFixed(1)} ({reviews.length})
            </span>
          </div>
        )}
      </div>

      {reviews.length === 0 && (
        <p className="text-xs text-muted-foreground">No reviews yet.</p>
      )}

      {reviews.length > 0 && (
        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
          {reviews.map((review) => (
            <div key={review.id.toString()} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">
                  {review.reviewerName}
                </span>
                <StarDisplay rating={review.rating} />
              </div>
              {review.reviewText && (
                <p className="text-xs text-muted-foreground">
                  {review.reviewText}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
