import { useNavigate } from "@tanstack/react-router";
import { Heart, Loader2 } from "lucide-react";
import { useUserFavorites } from "../hooks/useFavorites";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { formatMonthlyPrice } from "../utils/formatPrice";

function FavoriteRentalCard({
  rental,
  index,
}: {
  rental: any;
  index: number;
}) {
  const imageUrl = rental.image?.getDirectURL?.() ?? "";
  const formattedPrice = formatMonthlyPrice(rental.price);

  return (
    <div
      className="group bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300"
      data-ocid={`favorites.item.${index + 1}`}
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={rental.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg line-clamp-1">{rental.title}</h3>
        {formattedPrice && (
          <div className="text-lg font-bold text-primary">{formattedPrice}</div>
        )}
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  const { identity } = useInternetIdentity();
  const { favorites, loading } = useUserFavorites();
  const navigate = useNavigate();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <Heart className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Please Log In</h3>
            <p className="text-muted-foreground text-center max-w-md">
              You need to be logged in to view your favorites.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-500" fill="#e11d48" />
            My Favorites
          </h1>
          <p className="text-muted-foreground">Rentals you've saved</p>
        </div>

        {loading && (
          <div
            className="flex flex-col items-center justify-center py-16"
            data-ocid="favorites.loading_state"
          >
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading favorites...</p>
          </div>
        )}

        {!loading && favorites.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16"
            data-ocid="favorites.empty_state"
          >
            <Heart className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Browse rentals and save your favorites!
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/search-rental" })}
              className="px-6 py-2 rounded-lg text-white font-medium transition-colors"
              style={{ backgroundColor: "#1E88E5" }}
              data-ocid="favorites.primary_button"
            >
              Browse Rentals
            </button>
          </div>
        )}

        {!loading && favorites.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(({ id, rental }, index) => (
              <FavoriteRentalCard
                key={id.toString()}
                rental={rental}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
