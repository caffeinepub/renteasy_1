import { Rental } from '../backend';
import { MapPin, Phone } from 'lucide-react';
import { BuyRentalDialog } from './BuyRentalDialog';

interface SearchRentalResultCardProps {
  rental: Rental;
}

export function SearchRentalResultCard({ rental }: SearchRentalResultCardProps) {
  const imageUrl = rental.image.getDirectURL();

  return (
    <div className="group bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
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
        </div>

        {rental.price !== undefined && rental.price !== null && (
          <div className="text-xl font-bold text-primary">
            ${Number(rental.price).toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground">/day</span>
          </div>
        )}

        <div className="pt-3 border-t space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="line-clamp-1">{rental.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>{rental.phone}</span>
          </div>
        </div>

        <div className="pt-3">
          <BuyRentalDialog rental={rental} />
        </div>
      </div>
    </div>
  );
}
