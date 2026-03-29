import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, ShoppingBag, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { ReviewForm } from "../components/ReviewForm";
import { useBuyerOrders } from "../hooks/useBuyerOrders";
import { useCancelOrder } from "../hooks/useCancelOrder";
import { useCompleteOrder } from "../hooks/useCompleteOrder";
import { useHasReviewed } from "../hooks/useHasReviewed";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { formatMonthlyPrice } from "../utils/formatPrice";

function OrderCard({
  order,
  index,
  completeOrder,
}: {
  order: {
    orderId: bigint;
    rentalImage: string;
    rentalTitle: string;
    rentalPrice: bigint | null;
    status: string;
    duration: string;
    totalPrice: bigint;
  };
  index: number;
  completeOrder: ReturnType<typeof useCompleteOrder>;
}) {
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const { hasReviewed } = useHasReviewed(order.rentalTitle);
  const formattedPrice = formatMonthlyPrice(order.rentalPrice);
  const cancelOrder = useCancelOrder();

  const showReviewForm =
    order.status === "Completed" && !hasReviewed && !reviewSubmitted;

  const handleMarkReceived = async () => {
    try {
      await completeOrder.mutateAsync(order.orderId);
      toast.success("Order marked as completed");
    } catch (err: any) {
      console.error("Failed to complete order:", err);
      toast.error("Failed to mark order as received. Please try again.");
    }
  };

  const handleCancelOrder = async () => {
    try {
      await cancelOrder.mutateAsync(order.orderId);
      toast.success("Order cancelled");
    } catch {
      toast.error("Failed to cancel order");
    }
  };

  return (
    <Card
      key={order.orderId.toString()}
      className="overflow-hidden rounded-xl shadow-md"
      data-ocid={`orders.item.${index + 1}`}
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={order.rentalImage}
          alt={order.rentalTitle}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">
            {order.rentalTitle}
          </h3>
        </div>

        {formattedPrice && (
          <div className="text-lg font-bold text-primary">{formattedPrice}</div>
        )}

        {/* Duration and Total Price */}
        {order.duration && (
          <div className="text-sm space-y-1 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">{order.duration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold text-primary">
                ₹{Number(order.totalPrice).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}

        <div className="pt-3 border-t space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <OrderStatusBadge status={order.status} />
          </div>

          {order.status === "Accepted" && (
            <Button
              className="w-full"
              size="sm"
              onClick={handleMarkReceived}
              disabled={completeOrder.isPending}
              data-ocid={`orders.confirm_button.${index + 1}`}
            >
              {completeOrder.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Mark as Received
            </Button>
          )}

          {order.status === "Pending" && (
            <Button
              variant="outline"
              size="sm"
              className="w-full border-destructive text-destructive hover:bg-destructive hover:text-white"
              disabled={cancelOrder.isPending}
              onClick={handleCancelOrder}
              data-ocid={`orders.delete_button.${index + 1}`}
            >
              {cancelOrder.isPending ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <XCircle className="w-3 h-3 mr-1" />
              )}
              Cancel Order
            </Button>
          )}

          {showReviewForm && (
            <ReviewForm
              rentalTitle={order.rentalTitle}
              onSubmitted={() => setReviewSubmitted(true)}
            />
          )}

          {order.status === "Completed" && (hasReviewed || reviewSubmitted) && (
            <p className="text-sm text-center text-muted-foreground py-1">
              Thank you for your feedback
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyOrdersPage() {
  const { identity } = useInternetIdentity();
  const { orders, isLoading, error } = useBuyerOrders();
  const completeOrder = useCompleteOrder();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Please Log In</h3>
            <p className="text-muted-foreground text-center max-w-md">
              You need to be logged in to view your orders.
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track your rental requests</p>
        </div>

        {isLoading && (
          <div
            className="flex flex-col items-center justify-center py-16"
            data-ocid="orders.loading_state"
          >
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        )}

        {error && (
          <div
            className="flex flex-col items-center justify-center py-16"
            data-ocid="orders.error_state"
          >
            <p className="text-destructive">
              Failed to load orders. Please try again.
            </p>
          </div>
        )}

        {!isLoading && !error && orders.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16"
            data-ocid="orders.empty_state"
          >
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              You haven't placed any rental orders yet. Browse rentals to get
              started!
            </p>
          </div>
        )}

        {!isLoading && !error && orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order, index) => (
              <OrderCard
                key={order.orderId.toString()}
                order={order}
                index={index}
                completeOrder={completeOrder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
