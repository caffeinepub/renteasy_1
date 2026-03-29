import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Rental } from "../backend";
import { useCreateOrder } from "../hooks/useCreateOrder";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { NegotiateDialog } from "./NegotiateDialog";

interface BuyRentalDialogProps {
  rental: Rental;
}

export function BuyRentalDialog({ rental }: BuyRentalDialogProps) {
  const [open, setOpen] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [negotiateOpen, setNegotiateOpen] = useState(false);

  // OTP state
  const [generatedOTP, setGeneratedOTP] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");

  const { identity } = useInternetIdentity();
  const createOrder = useCreateOrder();

  const hasPrice = rental.price !== null && rental.price !== undefined;

  const { totalPrice, totalMonths, dateError } = useMemo(() => {
    if (!startDateStr || !endDateStr)
      return { totalPrice: null, totalMonths: 0, dateError: "" };
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (end <= start)
      return {
        totalPrice: null,
        totalMonths: 0,
        dateError: "End date must be after start date",
      };
    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const months = Math.max(totalDays / 30, 1);
    const price = hasPrice ? Math.round(Number(rental.price) * months) : null;
    return { totalPrice: price, totalMonths: months, dateError: "" };
  }, [startDateStr, endDateStr, hasPrice, rental.price]);

  const handleSendOTP = () => {
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOTP(otp);
    setOtpInput("");
    setOtpError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error("Please log in to create an order");
      return;
    }

    if (isSubmitting) return;

    if (
      !buyerName.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !address.trim()
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    if (!startDateStr || !endDateStr) {
      toast.error("Please select start and end dates");
      return;
    }

    if (dateError) {
      toast.error(dateError);
      return;
    }

    // OTP verification
    if (!generatedOTP) {
      setOtpError("Please send OTP first");
      return;
    }
    if (otpInput.trim() !== generatedOTP) {
      setOtpError("Invalid OTP. Please try again.");
      return;
    }

    setOtpError("");
    setIsSubmitting(true);

    try {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      await createOrder.mutateAsync({
        rentalTitle: rental.title,
        buyerPhone: phone.trim(),
        buyerEmail: email.trim(),
        buyerAddress: address.trim(),
        buyerName: buyerName.trim(),
        duration: "",
        totalPrice: totalPrice !== null ? BigInt(Math.round(totalPrice)) : 0n,
        startDate: BigInt(startDate.getTime()),
        endDate: BigInt(endDate.getTime()),
      });

      toast.success("Request sent successfully");
      setOpen(false);
      setBuyerName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setStartDateStr("");
      setEndDateStr("");
      setGeneratedOTP(null);
      setOtpInput("");
      setOtpError("");
    } catch (error: any) {
      console.error("Order creation failed:", error);
      if (error.message?.includes("Unauthorized")) {
        toast.error("You must be logged in to create an order");
      } else {
        toast.error("Something went wrong, please try again");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <NegotiateDialog
        rentalTitle={rental.title}
        rentalPrice={rental.price ?? undefined}
        open={negotiateOpen}
        onOpenChange={setNegotiateOpen}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="flex gap-2">
          <DialogTrigger asChild>
            <Button
              className="flex-1"
              size="lg"
              data-ocid="buy_rental.open_modal_button"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy Rental
            </Button>
          </DialogTrigger>
          {hasPrice && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setNegotiateOpen(true)}
              data-ocid="negotiate.open_modal_button"
            >
              Negotiate Price
            </Button>
          )}
        </div>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Buy Rental: {rental.title}</DialogTitle>
              <DialogDescription>
                Please provide your contact information and rental schedule.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="buyerName">Full Name</Label>
                <Input
                  id="buyerName"
                  type="text"
                  placeholder="Enter your full name"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  required
                  disabled={isSubmitting}
                  data-ocid="buy_rental.input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your full address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDateStr}
                    onChange={(e) => setStartDateStr(e.target.value)}
                    required
                    disabled={isSubmitting}
                    data-ocid="buy_rental.input"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDateStr}
                    onChange={(e) => setEndDateStr(e.target.value)}
                    required
                    disabled={isSubmitting}
                    data-ocid="buy_rental.input"
                    min={startDateStr || new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {dateError && (
                <p
                  className="text-sm text-destructive"
                  data-ocid="buy_rental.error_state"
                >
                  {dateError}
                </p>
              )}

              {/* Total Price Display */}
              <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
                <p className="text-sm font-medium text-blue-800">
                  Total Price:{" "}
                  <span className="text-lg font-bold">
                    {totalPrice !== null
                      ? `₹${totalPrice.toLocaleString("en-IN")}`
                      : !startDateStr || !endDateStr
                        ? "Select dates to calculate"
                        : "Price not set"}
                  </span>
                </p>
                {totalPrice !== null && totalMonths > 0 && (
                  <p className="text-xs text-blue-600 mt-0.5">
                    ₹{Number(rental.price).toLocaleString("en-IN")} ×{" "}
                    {totalMonths.toFixed(1)} months
                  </p>
                )}
              </div>

              {/* OTP Section */}
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 grid gap-3">
                <div className="flex items-center justify-between">
                  <Label className="text-yellow-800 font-semibold">
                    OTP Verification
                  </Label>
                  <span className="text-xs text-yellow-600 italic">
                    For demo purpose only
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter OTP"
                    value={otpInput}
                    onChange={(e) => {
                      setOtpInput(e.target.value);
                      setOtpError("");
                    }}
                    disabled={isSubmitting}
                    maxLength={4}
                    className="flex-1"
                    data-ocid="buy_rental.otp_input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendOTP}
                    disabled={isSubmitting}
                    className="border-yellow-400 text-yellow-800 hover:bg-yellow-100"
                    data-ocid="buy_rental.send_otp_button"
                  >
                    Send OTP
                  </Button>
                </div>
                {generatedOTP && (
                  <p className="text-sm font-medium text-yellow-800 bg-yellow-100 rounded-lg px-3 py-2">
                    Your OTP is:{" "}
                    <span className="font-bold text-yellow-900 tracking-widest">
                      {generatedOTP}
                    </span>
                  </p>
                )}
                {otpError && (
                  <p
                    className="text-sm text-red-600 font-medium"
                    data-ocid="buy_rental.otp_error"
                  >
                    {otpError}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
                data-ocid="buy_rental.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                data-ocid="buy_rental.submit_button"
              >
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Confirm Order
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
