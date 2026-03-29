import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Clock, History, Search } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSearchHistory } from "../hooks/useSearchHistory";

function formatDate(timestampMs: bigint): string {
  // Motoko timestamps are nanoseconds
  const date = new Date(Number(timestampMs / 1_000_000n));
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SearchHistoryPage() {
  const { identity } = useInternetIdentity();
  const { history, isLoading } = useSearchHistory();
  const navigate = useNavigate();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <History className="mx-auto h-14 w-14 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Sign in to see search history
        </h2>
        <p className="text-muted-foreground">
          Log in to view your recent searches.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary">
            <History className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Search History</h1>
            <p className="text-sm text-muted-foreground">
              Your recent searches
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3" data-ocid="search_history.loading_state">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div
            className="text-center py-16"
            data-ocid="search_history.empty_state"
          >
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No search history yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your searches will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(([id, entry], i) => (
              <Card
                key={id.toString()}
                className="border-0 shadow-sm"
                data-ocid={`search_history.item.${i + 1}`}
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{entry.searchText}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate({
                        to: "/search-rental",
                      })
                    }
                    data-ocid="search_history.button"
                  >
                    <Search className="w-3 h-3 mr-1" />
                    Search Again
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
