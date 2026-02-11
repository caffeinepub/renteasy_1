import { useState } from 'react';
import { Rental } from '../backend';
import { MapPin, Phone, Trash2 } from 'lucide-react';
import { BuyRentalDialog } from './BuyRentalDialog';
import { formatMonthlyPrice } from '../utils/formatPrice';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useDeleteRental } from '../hooks/useDeleteRental';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface SearchRentalResultCardProps {
  rental: Rental;
  onDeleted?: (title: string) => void;
}

export function SearchRentalResultCard({ rental, onDeleted }: SearchRentalResultCardProps) {
  const imageUrl = rental.image.getDirectURL();
  const formattedPrice = formatMonthlyPrice(rental.price);
  const { identity } = useInternetIdentity();
  const deleteMutation = useDeleteRental();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Check if current user is the owner of this rental
  const isOwner = identity && rental.createdBy.toString() === identity.getPrincipal().toString();

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(rental.title);
      setShowDeleteDialog(false);
      // Notify parent component to remove from list immediately
      if (onDeleted) {
        onDeleted(rental.title);
      }
    } catch (error) {
      // Error is handled in the mutation hook
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
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
          </div>

          {formattedPrice && (
            <div className="text-lg font-bold text-primary">
              {formattedPrice}
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

          <div className="pt-3 space-y-2">
            <BuyRentalDialog rental={rental} />
            
            {isOwner && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDeleteClick}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rental</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
