import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface NegotiateDialogProps {
  rentalTitle: string;
  rentalPrice: bigint | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NegotiateDialog({
  rentalTitle,
  rentalPrice,
  open,
  onOpenChange,
}: NegotiateDialogProps) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [offerPrice, setOfferPrice] = useState(
    rentalPrice !== undefined ? String(rentalPrice) : "",
  );
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !identity) return;
    if (!offerPrice || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    try {
      await (actor as any).createNegotiation(
        rentalTitle,
        BigInt(offerPrice),
        message.trim(),
      );
      toast.success("Offer sent successfully!");
      onOpenChange(false);
      setOfferPrice(rentalPrice !== undefined ? String(rentalPrice) : "");
      setMessage("");
    } catch (_err: any) {
      toast.error("Failed to send offer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!identity) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Negotiate Price</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground py-4">
            Please sign in to negotiate.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Negotiate Price</DialogTitle>
            <DialogDescription>
              Send a price offer to the owner of &quot;{rentalTitle}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="offerPrice">Offer Price (₹)</Label>
              <Input
                id="offerPrice"
                type="number"
                min={1}
                placeholder="Enter your offer price"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                required
                disabled={isSubmitting}
                data-ocid="negotiate.input"
              />
              {rentalPrice !== undefined && (
                <p className="text-xs text-muted-foreground">
                  Listed price: ₹{Number(rentalPrice).toLocaleString("en-IN")}
                  /month
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="negotiateMsg">Message</Label>
              <Textarea
                id="negotiateMsg"
                placeholder="Explain your offer..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={isSubmitting}
                rows={3}
                data-ocid="negotiate.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              data-ocid="negotiate.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              data-ocid="negotiate.submit_button"
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Send Offer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
