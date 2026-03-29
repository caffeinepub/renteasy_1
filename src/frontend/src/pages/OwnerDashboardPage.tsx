import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  CheckCircle,
  LayoutDashboard,
  Package,
  ShoppingBag,
} from "lucide-react";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useOwnerOrders } from "../hooks/useOwnerOrders";
import { formatMonthlyPrice } from "../utils/formatPrice";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  isLoading,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  isLoading: boolean;
}) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <p className="text-3xl font-bold text-foreground">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function OwnerDashboardPage() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { orders, isLoading: ordersLoading } = useOwnerOrders();

  const principalStr = identity?.getPrincipal().toString();

  const { data: myRentals = [], isLoading: rentalsLoading } = useQuery({
    queryKey: ["ownerRentals", principalStr],
    queryFn: async () => {
      if (!actor || !principalStr) return [];
      const all = await actor.getRentals(BigInt(0), BigInt(100));
      return all.filter((r: any) => r.createdBy.toString() === principalStr);
    },
    enabled: !!actor && !actorFetching && !!principalStr,
  });

  if (!identity) {
    return (
      <div
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="dashboard.empty_state"
      >
        <LayoutDashboard className="mx-auto h-14 w-14 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Sign in to view your dashboard
        </h2>
        <p className="text-muted-foreground">
          Please log in to see your products and orders.
        </p>
      </div>
    );
  }

  const isLoading = ordersLoading || rentalsLoading;
  const totalProducts = myRentals.length;
  const totalOrders = orders.length;
  const acceptedOrders = orders.filter((o) => o.status === "Accepted").length;
  const completedOrders = orders.filter((o) => o.status === "Completed").length;

  const recentOrders = [...orders].slice(0, 5);
  const recentProducts = [...myRentals].slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-primary">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Owner Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground ml-11">
            Overview of your listings and orders
          </p>
        </div>

        {/* Stat Cards */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          data-ocid="dashboard.section"
        >
          <StatCard
            title="Total Products"
            value={totalProducts}
            icon={Package}
            color="bg-blue-500"
            isLoading={isLoading}
          />
          <StatCard
            title="Total Orders"
            value={totalOrders}
            icon={ShoppingBag}
            color="bg-slate-600"
            isLoading={isLoading}
          />
          <StatCard
            title="Accepted Orders"
            value={acceptedOrders}
            icon={CheckCircle}
            color="bg-green-600"
            isLoading={isLoading}
          />
          <StatCard
            title="Completed Orders"
            value={completedOrders}
            icon={Award}
            color="bg-indigo-600"
            isLoading={isLoading}
          />
        </div>

        {/* Recent sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="border-0 shadow-md" data-ocid="dashboard.panel">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {ordersLoading ? (
                <div className="space-y-3" data-ocid="dashboard.loading_state">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div
                  className="text-center py-8 text-muted-foreground"
                  data-ocid="dashboard.empty_state"
                >
                  <ShoppingBag className="mx-auto h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No orders yet</p>
                </div>
              ) : (
                <ul className="space-y-3" data-ocid="dashboard.list">
                  {recentOrders.map((order, i) => (
                    <li
                      key={order.orderId}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
                      data-ocid={`dashboard.order.item.${i + 1}`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {order.rentalTitle}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {order.buyerPhone}
                        </p>
                      </div>
                      <div className="ml-3 shrink-0">
                        <OrderStatusBadge status={order.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Recent Products */}
          <Card className="border-0 shadow-md" data-ocid="dashboard.panel">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Recent Products
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {rentalsLoading ? (
                <div className="space-y-3" data-ocid="dashboard.loading_state">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : recentProducts.length === 0 ? (
                <div
                  className="text-center py-8 text-muted-foreground"
                  data-ocid="dashboard.empty_state"
                >
                  <Package className="mx-auto h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No products listed yet</p>
                </div>
              ) : (
                <ul className="space-y-3" data-ocid="dashboard.list">
                  {recentProducts.map((rental: any, i: number) => (
                    <li
                      key={`${rental.title}-${i}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
                      data-ocid={`dashboard.product.item.${i + 1}`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {rental.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {rental.category} · {rental.location}
                        </p>
                      </div>
                      <div className="ml-3 shrink-0">
                        <Badge
                          variant="outline"
                          className="text-xs whitespace-nowrap"
                        >
                          {rental.price?.[0] != null
                            ? formatMonthlyPrice(rental.price[0])
                            : "Price TBD"}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
