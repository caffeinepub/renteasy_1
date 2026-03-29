import { Heart, MapPin, Phone, Tag } from "lucide-react";
import type { Rental } from "../backend";
import { useFavoriteToggle } from "../hooks/useFavorites";
import { formatMonthlyPrice } from "../utils/formatPrice";

interface RentalCardProps {
  rental: Rental;
  showFavorite?: boolean;
  isLoggedIn?: boolean;
}

function FavoriteButton({
  rentalTitle,
  isLoggedIn,
}: {
  rentalTitle: string;
  isLoggedIn: boolean;
}) {
  const { isFavorited, toggle, loading } = useFavoriteToggle(
    rentalTitle,
    isLoggedIn,
  );

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) return;
    toggle();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      data-ocid="rental.toggle"
      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors disabled:opacity-60"
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className="w-4 h-4"
        fill={isFavorited ? "#e11d48" : "none"}
        stroke={isFavorited ? "#e11d48" : "currentColor"}
        strokeWidth={2}
      />
    </button>
  );
}

export function RentalCard({
  rental,
  showFavorite = false,
  isLoggedIn = false,
}: RentalCardProps) {
  const imageUrl = rental.image.getDirectURL();
  const formattedPrice = formatMonthlyPrice(rental.price);

  return (
    <div className="group bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
        <img
          src={imageUrl}
          alt={rental.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {showFavorite && (
          <FavoriteButton rentalTitle={rental.title} isLoggedIn={isLoggedIn} />
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{rental.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {rental.category}
            </span>
          </div>
        </div>

        {formattedPrice && (
          <div className="text-lg font-bold text-primary">{formattedPrice}</div>
        )}

        <p className="text-sm text-muted-foreground line-clamp-2">
          {rental.description}
        </p>

        <div className="pt-3 border-t space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="line-clamp-1">{rental.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>{rental.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
