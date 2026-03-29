import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  CheckCircle,
  Clock,
  History,
  Loader2,
  MapPin,
  Moon,
  Navigation,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { useActor } from "../hooks/useActor";
import { useBuyerOrders } from "../hooks/useBuyerOrders";
import { useClearSearchHistory } from "../hooks/useClearSearchHistory";
import { useDarkMode } from "../hooks/useDarkMode";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyCart } from "../hooks/useMyCart";
import { useMyLocation } from "../hooks/useMyLocation";
import { useMyRentals } from "../hooks/useMyRentals";
import { useRemoveFromCart } from "../hooks/useRemoveFromCart";
import { useSearchHistory } from "../hooks/useSearchHistory";
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
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-12" />
        ) : (
          <p className="text-3xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

function LocationTab() {
  const { location, isLoading, saveLocation, isSaving } = useMyLocation();
  const [inputValue, setInputValue] = useState("");
  const [geoStatus, setGeoStatus] = useState("");

  const handleSave = async () => {
    if (!inputValue.trim()) return;
    try {
      await saveLocation(inputValue.trim());
      toast.success("Location saved");
      setInputValue("");
    } catch {
      toast.error("Failed to save location");
    }
  };

  const handleGps = () => {
    setGeoStatus("Detecting location...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const data = await res.json();
          const displayName =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.display_name ||
            `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setInputValue(displayName);
          setGeoStatus("");
          // auto-save
          await saveLocation(displayName);
          toast.success("Location detected and saved");
        } catch {
          setGeoStatus("");
          toast.error("Could not reverse-geocode location");
        }
      },
      () => {
        setGeoStatus("Location permission denied. Please enter manually.");
      },
    );
  };

  return (
    <Card className="border-0 shadow-md max-w-lg">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          My Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            <p className="text-sm text-muted-foreground mb-1">
              Current saved location
            </p>
            <p className="font-medium">
              {location || (
                <span className="text-muted-foreground italic">
                  No location set
                </span>
              )}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Input
            placeholder="Enter your city or address"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            data-ocid="profile.location.input"
          />
          {geoStatus && (
            <p className="text-sm text-muted-foreground">{geoStatus}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving || !inputValue.trim()}
            className="flex-1"
            data-ocid="profile.location.save_button"
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Location
          </Button>
          <Button
            variant="outline"
            onClick={handleGps}
            disabled={isSaving}
            className="flex-1"
            data-ocid="profile.location.secondary_button"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Use GPS
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OwnerProfilePage() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { rentals, isLoading: rentalsLoading } = useMyRentals();
  const { orders, isLoading: ordersLoading } = useBuyerOrders();
  const { isDark, toggle } = useDarkMode();
  const { location } = useMyLocation();

  const principalStr = identity?.getPrincipal().toString();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <User className="mx-auto h-14 w-14 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Sign in to view your profile
        </h2>
        <p className="text-muted-foreground">
          Please log in to see your profile and orders.
        </p>
      </div>
    );
  }

  const displayName = profileLoading ? "..." : profile?.name || "My Profile";
  const initial =
    displayName !== "..." ? displayName.charAt(0).toUpperCase() : "?";

  const acceptedCount = orders.filter((o) => o.status === "Accepted").length;
  const completedCount = orders.filter((o) => o.status === "Completed").length;
  const completedOrders = orders.filter((o) => o.status === "Completed");
  const statsLoading = ordersLoading || rentalsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Profile Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-md shrink-0">
            <span className="text-2xl font-bold text-white">{initial}</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <p className="text-xs text-muted-foreground truncate max-w-xs">
              {principalStr}
            </p>
            {location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-primary shrink-0" />
                <p className="text-sm text-muted-foreground truncate">
                  {location}
                </p>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" data-ocid="profile.overview.tab">
              Overview
            </TabsTrigger>
            <TabsTrigger value="products" data-ocid="profile.products.tab">
              <Package className="w-3.5 h-3.5 mr-1.5" />
              My Products
            </TabsTrigger>
            <TabsTrigger value="orders" data-ocid="profile.orders.tab">
              <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
              My Orders
            </TabsTrigger>
            <TabsTrigger value="history" data-ocid="profile.history.tab">
              <History className="w-3.5 h-3.5 mr-1.5" />
              Order History
            </TabsTrigger>
            <TabsTrigger value="location" data-ocid="profile.location.tab">
              <MapPin className="w-3.5 h-3.5 mr-1.5" />
              My Location
            </TabsTrigger>
            <TabsTrigger
              value="search-history"
              data-ocid="profile.search_history.tab"
            >
              <Search className="w-3.5 h-3.5 mr-1.5" />
              Search History
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
              data-ocid="profile.overview.panel"
            >
              <StatCard
                title="Total Products"
                value={rentals.length}
                icon={Package}
                color="bg-blue-500"
                isLoading={statsLoading}
              />
              <StatCard
                title="Total Orders"
                value={orders.length}
                icon={ShoppingBag}
                color="bg-slate-600"
                isLoading={statsLoading}
              />
              <StatCard
                title="Accepted Orders"
                value={acceptedCount}
                icon={CheckCircle}
                color="bg-green-600"
                isLoading={statsLoading}
              />
              <StatCard
                title="Completed Orders"
                value={completedCount}
                icon={Award}
                color="bg-indigo-600"
                isLoading={statsLoading}
              />

              {/* Dark Mode Toggle */}
              <div className="mt-6 flex items-center justify-between rounded-xl border bg-card px-5 py-4 shadow-sm max-w-sm">
                <div className="flex items-center gap-3">
                  {isDark ? (
                    <Moon className="w-5 h-5 text-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium text-sm">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">
                      {isDark ? "Dark theme active" : "Light theme active"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isDark}
                  onCheckedChange={toggle}
                  data-ocid="profile.darkmode.switch"
                />
              </div>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            {rentalsLoading ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                data-ocid="profile.products.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : rentals.length === 0 ? (
              <div
                className="text-center py-16"
                data-ocid="profile.products.empty_state"
              >
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No products yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rentals.map((rental, i) => (
                  <Card
                    key={rental.title}
                    className="overflow-hidden border-0 shadow-md"
                    data-ocid={`profile.product.item.${i + 1}`}
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={rental.image.getDirectURL()}
                        alt={rental.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-1">
                        {rental.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {rental.category}
                      </p>
                      {rental.price != null && (
                        <p className="text-sm font-bold text-primary mt-1">
                          {formatMonthlyPrice(rental.price)}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {rental.location}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Orders Tab */}
          <TabsContent value="orders">
            <OrderList
              orders={orders}
              isLoading={ordersLoading}
              ocidPrefix="profile.orders"
            />
          </TabsContent>

          {/* Order History Tab */}
          <TabsContent value="history">
            <OrderList
              orders={completedOrders}
              isLoading={ordersLoading}
              ocidPrefix="profile.history"
              emptyLabel="No completed orders yet"
            />
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location">
            <LocationTab />
          </TabsContent>

          {/* Search History Tab */}
          <TabsContent value="search-history">
            <SearchHistoryTab />
          </TabsContent>

          {/* Cart Tab */}
          <TabsContent value="cart">
            <CartTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

type BuyerOrder = {
  orderId: bigint;
  rentalImage: string;
  rentalTitle: string;
  rentalPrice: bigint | null;
  status: string;
  duration: string;
  totalPrice: bigint;
};

function OrderList({
  orders,
  isLoading,
  ocidPrefix,
  emptyLabel = "No orders yet",
}: {
  orders: BuyerOrder[];
  isLoading: boolean;
  ocidPrefix: string;
  emptyLabel?: string;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3" data-ocid={`${ocidPrefix}.loading_state`}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }
  if (orders.length === 0) {
    return (
      <div
        className="text-center py-16"
        data-ocid={`${ocidPrefix}.empty_state`}
      >
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{emptyLabel}</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {orders.map((order, i) => (
        <Card
          key={order.orderId.toString()}
          className="border-0 shadow-sm"
          data-ocid={`${ocidPrefix}.item.${i + 1}`}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <img
              src={order.rentalImage}
              alt={order.rentalTitle}
              className="w-14 h-14 rounded-lg object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold line-clamp-1">{order.rentalTitle}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {order.totalPrice > 0n && (
                  <span className="text-sm font-medium text-primary">
                    ₹{Number(order.totalPrice).toLocaleString("en-IN")}
                  </span>
                )}
                {order.duration && (
                  <Badge variant="outline" className="text-xs">
                    {order.duration}
                  </Badge>
                )}
              </div>
            </div>
            <div className="shrink-0">
              <OrderStatusBadge status={order.status} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function formatSearchDate(timestampMs: bigint): string {
  const date = new Date(Number(timestampMs / 1_000_000n));
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SearchHistoryTab() {
  const { history, isLoading } = useSearchHistory();
  const clearHistory = useClearSearchHistory();

  const handleClear = () => {
    clearHistory.mutate(undefined, {
      onSuccess: () => toast.success("Search history cleared"),
      onError: () => toast.error("Failed to clear history"),
    });
  };

  if (isLoading) {
    return (
      <div
        className="space-y-3"
        data-ocid="profile.search_history.loading_state"
      >
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Search History</h2>
        {history.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={clearHistory.isPending}
            className="text-destructive border-destructive hover:bg-destructive hover:text-white"
            data-ocid="profile.search_history.clear_button"
          >
            {clearHistory.isPending ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            )}
            Clear History
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div
          className="text-center py-16"
          data-ocid="profile.search_history.empty_state"
        >
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No search history yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your searches on the Search Rentals page will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map(([id, entry], i) => (
            <Card
              key={id.toString()}
              className="border-0 shadow-sm"
              data-ocid={`profile.search_history.item.${i + 1}`}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{entry.searchText}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSearchDate(entry.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CartTab() {
  const { data: cartItems, isLoading } = useMyCart();
  const removeFromCart = useRemoveFromCart();

  if (isLoading) {
    return (
      <div className="text-center py-8" data-ocid="cart.loading_state">
        <Loader2 className="animate-spin mx-auto" />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div
        className="text-center py-12 text-muted-foreground"
        data-ocid="cart.empty_state"
      >
        <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="font-medium">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cartItems.map(([cartId, , rental], i) => (
        <Card
          key={cartId.toString()}
          className="overflow-hidden rounded-xl shadow-md"
          data-ocid={`cart.item.${i + 1}`}
        >
          <div className="aspect-[4/3] overflow-hidden bg-muted">
            <img
              src={rental.image.getDirectURL()}
              alt={rental.title}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold line-clamp-1">{rental.title}</h3>
            {rental.price && (
              <p className="text-primary font-bold">
                ₹ {Number(rental.price).toLocaleString()} / month
              </p>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">{rental.location}</span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="w-full mt-2"
              disabled={removeFromCart.isPending}
              onClick={() => removeFromCart.mutate(cartId)}
              data-ocid={`cart.delete_button.${i + 1}`}
            >
              <Trash2 className="w-3 h-3 mr-1" /> Remove
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
