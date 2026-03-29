import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Inbox, Loader2 } from "lucide-react";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { useAcceptOrder } from "../hooks/useAcceptOrder";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useOwnerOrders } from "../hooks/useOwnerOrders";
import { useUserProfile } from "../hooks/useUserProfile";

export default function OwnerMessagesPage() {
  const { identity } = useInternetIdentity();
  const { orders, isLoading, error } = useOwnerOrders();
  const acceptOrder = useAcceptOrder();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <Inbox className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Please Log In</h3>
            <p className="text-muted-foreground text-center max-w-md">
              You need to be logged in to view your owner messages.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleAcceptOrder = async (orderId: bigint) => {
    try {
      await acceptOrder.mutateAsync(orderId);
      alert("Order Accepted Successfully");
    } catch (error: any) {
      console.error("Failed to accept order:", error);
      if (error.message?.includes("Unauthorized")) {
        alert("You are not authorized to accept this order");
      } else {
        alert("Failed to accept order. Please try again.");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Owner Messages
          </h1>
          <p className="text-muted-foreground">
            Manage orders for your rental listings
          </p>
        </div>

        {isLoading && (
          <div
            className="flex flex-col items-center justify-center py-16"
            data-ocid="owner_messages.loading_state"
          >
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        )}

        {error && (
          <div
            className="flex flex-col items-center justify-center py-16"
            data-ocid="owner_messages.error_state"
          >
            <p className="text-destructive">
              Failed to load orders. Please try again.
            </p>
          </div>
        )}

        {!isLoading && !error && orders.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16"
            data-ocid="owner_messages.empty_state"
          >
            <Inbox className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              You haven't received any orders for your rentals yet.
            </p>
          </div>
        )}

        {!isLoading && !error && orders.length > 0 && (
          <div className="space-y-4" data-ocid="owner_messages.list">
            {orders.map((order) => (
              <OrderCard
                key={order.orderId.toString()}
                order={order}
                onAccept={handleAcceptOrder}
                isAccepting={acceptOrder.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface OrderCardProps {
  order: {
    orderId: bigint;
    rentalTitle: string;
    buyerPrincipal: string;
    buyerPhone: string;
    buyerEmail: string;
    buyerAddress: string;
    status: string;
  };
  onAccept: (orderId: bigint) => void;
  isAccepting: boolean;
}

function OrderCard({ order, onAccept, isAccepting }: OrderCardProps) {
  const { buyerName } = useUserProfile(order.buyerPrincipal);

  return (
    <Card className="rounded-xl shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{order.rentalTitle}</CardTitle>
            <div className="flex items-center gap-2">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
          {order.status === "Pending" && (
            <Button
              onClick={() => onAccept(order.orderId)}
              disabled={isAccepting}
              size="sm"
              className="rounded-lg shadow-sm"
              data-ocid="owner_messages.confirm_button"
            >
              {isAccepting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept Order
            </Button>
          )}
          {order.status === "Completed" && (
            <p className="text-sm text-muted-foreground italic">
              Completed by buyer
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Buyer Name</p>
            <p className="font-medium">{buyerName || "Loading..."}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Phone</p>
            <p className="font-medium">{order.buyerPhone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Email</p>
            <p className="font-medium break-all">{order.buyerEmail}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Address</p>
            <p className="font-medium">{order.buyerAddress}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
