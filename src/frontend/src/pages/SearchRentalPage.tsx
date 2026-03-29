import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { List, Loader2, MapPin, Package, Search } from "lucide-react";
import { Map as MapIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Rental } from "../backend";
import { SearchRentalResultCard } from "../components/SearchRentalResultCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyLocation } from "../hooks/useMyLocation";
import { useRentals } from "../hooks/useRentals";
import { useSaveSearchHistory } from "../hooks/useSaveSearchHistory";
import { useSearchRentals } from "../hooks/useSearchRentals";
import { formatMonthlyPrice } from "../utils/formatPrice";

type RentalWithCoords = Rental & { latitude?: number; longitude?: number };

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function RentalMapView({ rentals }: { rentals: Rental[] }) {
  const mappedRentals = (rentals as RentalWithCoords[]).filter(
    (r) => r.latitude != null && r.longitude != null,
  );

  if (mappedRentals.length === 0) {
    return (
      <div className="rounded-xl border bg-muted/30 flex flex-col items-center justify-center py-16">
        <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground font-medium">
          No rentals with location data
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Add rentals with GPS location to see them on the map
        </p>
      </div>
    );
  }

  const firstRental = mappedRentals[0];
  const lat = firstRental.latitude as number;
  const lng = firstRental.longitude as number;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 2},${lat - 2},${lng + 2},${lat + 2}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl overflow-hidden shadow-md border"
        style={{ height: "400px" }}
      >
        <iframe
          title="Rental Map"
          src={mapUrl}
          style={{ width: "100%", height: "100%", border: 0 }}
          loading="lazy"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mappedRentals.map((rental) => (
          <div
            key={rental.title}
            className="flex items-start gap-3 p-3 rounded-xl border bg-card"
          >
            <img
              src={rental.image.getDirectURL()}
              alt={rental.title}
              className="w-16 h-16 rounded-lg object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="font-semibold text-sm line-clamp-1">
                {rental.title}
              </p>
              <p className="text-xs text-primary font-medium">
                {formatMonthlyPrice(rental.price)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {rental.location}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(rental as RentalWithCoords).latitude?.toFixed(4)},{" "}
                {(rental as RentalWithCoords).longitude?.toFixed(4)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SearchRentalPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deletedRentals, setDeletedRentals] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedDistance, setSelectedDistance] = useState<string>("all");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [distanceMsg, setDistanceMsg] = useState("");

  const saveSearchHistory = useSaveSearchHistory();
  const { identity } = useInternetIdentity();
  const { location: savedProfileLocation } = useMyLocation();
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { rentals: searchResults, isLoading: isSearching } =
    useSearchRentals(searchQuery);
  const { rentals: allRentals, isLoading: isLoadingAll } = useRentals();

  const baseRentals = searchQuery ? searchResults : allRentals;
  const isLoading = searchQuery ? isSearching : isLoadingAll;

  // Fetch user location when distance filter changes
  useEffect(() => {
    if (selectedDistance === "all") {
      setDistanceMsg("");
      return;
    }
    if (userLocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setDistanceMsg("");
      },
      () => {
        // GPS denied — check profile location
        if (savedProfileLocation) {
          setDistanceMsg(
            "Enable GPS for distance filtering, or set lat/lng in your rentals.",
          );
        } else {
          setDistanceMsg("Please enable GPS or set your location in Profile.");
        }
        setSelectedDistance("all");
        toast.error(
          "Could not get your location. Please enable location access.",
        );
      },
    );
  }, [selectedDistance, userLocation, savedProfileLocation]);

  const rentals = useMemo(() => {
    let filtered = baseRentals.filter(
      (rental) => !deletedRentals.has(rental.title),
    );

    if (selectedDistance !== "all" && userLocation) {
      const maxKm = Number(selectedDistance);
      filtered = filtered.filter((rental) => {
        const r = rental as RentalWithCoords;
        if (r.latitude == null || r.longitude == null) return false;
        return (
          haversineKm(
            userLocation.lat,
            userLocation.lng,
            r.latitude,
            r.longitude,
          ) <= maxKm
        );
      });
    }

    return filtered;
  }, [baseRentals, deletedRentals, selectedDistance, userLocation]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (identity && value.trim()) {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => {
        saveSearchHistory.mutate(value.trim());
      }, 1500);
    }
  };

  const handleRentalDeleted = (title: string) => {
    setDeletedRentals((prev) => new Set(prev).add(title));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Search Rentals
          </h1>
          <p className="text-muted-foreground">
            Find the perfect rental for your needs
          </p>
        </div>

        {/* Search + Distance + View Toggle Row */}
        <div className="mb-2 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title, category, or location"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-6 text-base rounded-xl shadow-sm focus:shadow-md transition-shadow"
              data-ocid="search.search_input"
            />
          </div>

          <div className="shrink-0">
            <Select
              value={selectedDistance}
              onValueChange={setSelectedDistance}
            >
              <SelectTrigger
                className="w-[150px] h-full min-h-[46px]"
                data-ocid="search.select"
              >
                <SelectValue placeholder="Distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Distances</SelectItem>
                <SelectItem value="5">Within 5 km</SelectItem>
                <SelectItem value="10">Within 10 km</SelectItem>
                <SelectItem value="20">Within 20 km</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors border ${
                viewMode === "list"
                  ? "bg-[#1E88E5] text-white border-[#1E88E5] shadow-md"
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
              data-ocid="search.list.tab"
            >
              <List className="w-4 h-4" />
              View List
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors border ${
                viewMode === "map"
                  ? "bg-[#1E88E5] text-white border-[#1E88E5] shadow-md"
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
              data-ocid="search.map.tab"
            >
              <MapIcon className="w-4 h-4" />
              View Map
            </button>
          </div>
        </div>

        {/* Helper text for distance */}
        <div className="mb-6 flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">
            💡 Set your location in{" "}
            <a
              href="/owner-profile"
              className="text-primary underline underline-offset-2"
            >
              Profile
            </a>{" "}
            for faster nearby search
          </p>
          {distanceMsg && (
            <p
              className="text-xs text-amber-600 font-medium"
              data-ocid="search.error_state"
            >
              {distanceMsg}
            </p>
          )}
        </div>

        {isLoading && (
          <div
            className="flex flex-col items-center justify-center py-16"
            data-ocid="search.loading_state"
          >
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading rentals...</p>
          </div>
        )}

        {!isLoading && viewMode === "map" && (
          <RentalMapView rentals={rentals} />
        )}

        {!isLoading && viewMode === "list" && rentals.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16"
            data-ocid="search.empty_state"
          >
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? "No results found" : "No rentals available"}
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchQuery
                ? "Try adjusting your search terms"
                : selectedDistance !== "all"
                  ? "No rentals found within the selected distance"
                  : "Be the first to add a rental to the marketplace!"}
            </p>
          </div>
        )}

        {!isLoading && viewMode === "list" && rentals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentals.map((rental, index) => (
              <SearchRentalResultCard
                key={`${rental.title}-${index}`}
                rental={rental}
                onDeleted={handleRentalDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
