import { useBuyerOrders } from '../hooks/useBuyerOrders';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ShoppingBag } from 'lucide-react';
import { formatMonthlyPrice } from '../utils/formatPrice';

export default function MyOrdersPage() {
  const { identity } = useInternetIdentity();
  const { orders, isLoading, error } = useBuyerOrders();

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
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-destructive">Failed to load orders. Please try again.</p>
          </div>
        )}

        {!isLoading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              You haven't placed any rental orders yet. Browse rentals to get started!
            </p>
          </div>
        )}

        {!isLoading && !error && orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => {
              const formattedPrice = formatMonthlyPrice(order.rentalPrice);
              
              return (
                <Card key={order.orderId.toString()} className="overflow-hidden rounded-xl shadow-md">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={order.rentalImage}
                      alt={order.rentalTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{order.rentalTitle}</h3>
                    </div>

                    {formattedPrice && (
                      <div className="text-lg font-bold text-primary">
                        {formattedPrice}
                      </div>
                    )}

                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
