import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Flag,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ExternalBlob, Rental } from "../backend";
import { useAddToCart } from "../hooks/useAddToCart";
import { useBlockUser } from "../hooks/useBlockUser";
import { useCreateReport } from "../hooks/useCreateReport";
import { useDeleteRental } from "../hooks/useDeleteRental";
import { useFavoriteToggle } from "../hooks/useFavorites";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsInCart } from "../hooks/useIsInCart";
import { useUpdateRental } from "../hooks/useUpdateRental";
import { formatMonthlyPrice } from "../utils/formatPrice";
import { BuyRentalDialog } from "./BuyRentalDialog";
import { ImageUploader } from "./ImageUploader";
import { RentalReviews } from "./RentalReviews";

interface SearchRentalResultCardProps {
  rental: Rental;
  onDeleted?: (title: string) => void;
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

function AddToCartButton({ rental }: { rental: Rental }) {
  const addToCart = useAddToCart();
  const { data: inCart } = useIsInCart(rental.title);

  return (
    <Button
      variant="outline"
      className="w-full"
      disabled={addToCart.isPending || !!inCart}
      onClick={async () => {
        try {
          await addToCart.mutateAsync(rental.title);
          toast.success("Added to cart");
        } catch (err: any) {
          if (err?.message?.includes("Already in cart")) {
            toast.info("Already in cart");
          } else {
            toast.error("Failed to add to cart");
          }
        }
      }}
      data-ocid="rental.button"
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      {inCart ? "In Cart ✓" : "Add to Cart 🛒"}
    </Button>
  );
}

function ReportDialog({ rental }: { rental: Rental }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const createReport = useCreateReport();
  const blockUser = useBlockUser();

  const handleReport = async () => {
    if (!reason.trim()) return;
    await createReport.mutateAsync({
      rentalTitle: rental.title,
      reportedUser: rental.createdBy,
      reason: reason.trim(),
    });
    setOpen(false);
    setReason("");
  };

  const handleBlock = async () => {
    await blockUser.mutateAsync(rental.createdBy);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-muted-foreground hover:text-destructive text-xs"
        onClick={() => setOpen(true)}
        data-ocid="rental.open_modal_button"
      >
        <Flag className="w-3 h-3 mr-1" />
        Report User
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[420px]" data-ocid="rental.dialog">
          <DialogHeader>
            <DialogTitle>Report User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Report the owner of:{" "}
              <span className="font-medium text-foreground">
                {rental.title}
              </span>
            </p>
            <div className="grid gap-2">
              <Label htmlFor="report-reason">Reason</Label>
              <Textarea
                id="report-reason"
                placeholder="Describe the issue..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                data-ocid="rental.textarea"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="rental.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleBlock}
              disabled={blockUser.isPending}
              data-ocid="rental.secondary_button"
            >
              {blockUser.isPending && (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              )}
              Block User
            </Button>
            <Button
              variant="destructive"
              onClick={handleReport}
              disabled={createReport.isPending || !reason.trim()}
              data-ocid="rental.confirm_button"
            >
              {createReport.isPending && (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              )}
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EditProductDialog({
  rental,
  onUpdated,
}: { rental: Rental; onUpdated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(rental.category);
  const [description, setDescription] = useState(rental.description);
  const [price, setPrice] = useState(
    rental.price ? Number(rental.price).toString() : "",
  );
  const [location, setLocation] = useState(rental.location);
  const [phone, setPhone] = useState(rental.phone);
  const [image, setImage] = useState<ExternalBlob | null>(rental.image);
  const updateRental = useUpdateRental();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert("Please select an image");
      return;
    }
    try {
      await updateRental.mutateAsync({
        title: rental.title,
        category,
        description,
        price: price ? BigInt(Math.round(Number(price))) : null,
        location,
        phone,
        image,
      });
      setOpen(false);
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setOpen(true)}
        data-ocid="rental.edit_button"
      >
        <Pencil className="w-4 h-4 mr-2" />
        Edit Product
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
          data-ocid="rental.dialog"
        >
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Title (read-only)</Label>
                <Input value={rental.title} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  data-ocid="rental.input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  data-ocid="rental.textarea"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price (₹ per month)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  data-ocid="rental.input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  data-ocid="rental.input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  data-ocid="rental.input"
                />
                <p className="text-xs text-muted-foreground">
                  Enter without +91 or spaces
                </p>
              </div>
              <div className="grid gap-2">
                <Label>Image</Label>
                <ImageUploader
                  onImageChange={(blob) => setImage(blob ?? rental.image)}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-ocid="rental.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateRental.isPending}
                data-ocid="rental.save_button"
              >
                {updateRental.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function SearchRentalResultCard({
  rental,
  onDeleted,
}: SearchRentalResultCardProps) {
  const imageUrl = rental.image.getDirectURL();
  const formattedPrice = formatMonthlyPrice(rental.price);
  const { identity } = useInternetIdentity();
  const deleteMutation = useDeleteRental();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isLoggedIn = !!identity;

  const isOwner =
    identity &&
    rental.createdBy.toString() === identity.getPrincipal().toString();

  const handleDeleteClick = () => setShowDeleteDialog(true);

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(rental.title);
      setShowDeleteDialog(false);
      if (onDeleted) onDeleted(rental.title);
    } catch (_error) {
      setShowDeleteDialog(false);
    }
  };

  const handleWhatsApp = () => {
    const cleanPhone = rental.phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Hi, I am interested in your rental product: ${rental.title}`,
    );
    window.open(`https://wa.me/91${cleanPhone}?text=${message}`, "_blank");
  };

  return (
    <>
      <div className="group bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="aspect-[4/3] overflow-hidden bg-muted relative">
          <img
            src={imageUrl}
            alt={rental.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <FavoriteButton rentalTitle={rental.title} isLoggedIn={isLoggedIn} />
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">
              {rental.title}
            </h3>
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

            <Button
              className="w-full text-white font-medium rounded-lg"
              style={{ backgroundColor: "#25D366" }}
              onClick={handleWhatsApp}
              data-ocid="rental.secondary_button"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat on WhatsApp
            </Button>

            {isOwner && (
              <>
                <EditProductDialog rental={rental} />
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDeleteClick}
                  disabled={deleteMutation.isPending}
                  data-ocid="rental.delete_button"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            )}

            {isLoggedIn && !isOwner && (
              <>
                <AddToCartButton rental={rental} />
                <ReportDialog rental={rental} />
              </>
            )}
            {rental.phone && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(rental.phone);
                  toast.success("Phone number copied");
                }}
                data-ocid="rental.button"
              >
                📋 Copy Phone
              </Button>
            )}
          </div>

          <RentalReviews rentalTitle={rental.title} />
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
            <AlertDialogCancel data-ocid="rental.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="rental.confirm_button"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
