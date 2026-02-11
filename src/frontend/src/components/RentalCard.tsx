import { Rental } from '../backend';
import { MapPin, Phone, Tag } from 'lucide-react';
import { formatMonthlyPrice } from '../utils/formatPrice';

interface RentalCardProps {
  rental: Rental;
}

export function RentalCard({ rental }: RentalCardProps) {
  const imageUrl = rental.image.getDirectURL();
  const formattedPrice = formatMonthlyPrice(rental.price);

  return (
    <div className="group bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={rental.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{rental.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{rental.category}</span>
          </div>
        </div>

        {formattedPrice && (
          <div className="text-lg font-bold text-primary">
            {formattedPrice}
          </div>
        )}

        <p className="text-sm text-muted-foreground line-clamp-2">{rental.description}</p>

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
