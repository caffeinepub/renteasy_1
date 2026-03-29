import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useState } from "react";
import { useCreateReview } from "../hooks/useCreateReview";

interface ReviewFormProps {
  rentalTitle: string;
  onSubmitted: () => void;
}

export function ReviewForm({ rentalTitle, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const createReview = useCreateReview();

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a star rating.");
      return;
    }
    try {
      await createReview.mutateAsync({ rentalTitle, rating, reviewText });
      alert("Review submitted successfully");
      onSubmitted();
    } catch (err: any) {
      alert(err?.message || "Failed to submit review. Please try again.");
    }
  };

  return (
    <div className="mt-3 pt-3 border-t space-y-3">
      <p className="text-sm font-medium text-muted-foreground">
        Rate your experience
      </p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none"
          >
            <Star
              className="w-6 h-6 transition-colors"
              fill={(hovered || rating) >= star ? "#f59e0b" : "none"}
              stroke={(hovered || rating) >= star ? "#f59e0b" : "currentColor"}
            />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Write your experience..."
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        rows={3}
        className="text-sm"
      />
      <Button
        className="w-full"
        size="sm"
        onClick={handleSubmit}
        disabled={createReview.isPending}
      >
        {createReview.isPending ? "Submitting..." : "Submit Review"}
      </Button>
    </div>
  );
}
