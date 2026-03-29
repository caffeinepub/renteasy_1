import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, DollarSign, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

function statusBadge(status: string) {
  if (status === "Accepted")
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        Accepted
      </Badge>
    );
  if (status === "Rejected")
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
    );
  return (
    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
      Pending
    </Badge>
  );
}

export default function NegotiationsPage() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const ownerQuery = useQuery({
    queryKey: ["ownerNegotiations"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getOwnerNegotiations();
    },
    enabled: !!actor && !isFetching,
  });

  const buyerQuery = useQuery({
    queryKey: ["buyerNegotiations"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getBuyerNegotiations();
    },
    enabled: !!actor && !isFetching,
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: string }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).respondToNegotiation(id, status);
    },
    onSuccess: (_, { status }) => {
      toast.success(`Offer ${status}`);
      queryClient.invalidateQueries({ queryKey: ["ownerNegotiations"] });
    },
    onError: () => {
      toast.error("Failed to respond. Try again.");
    },
  });

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <DollarSign className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Sign in to view negotiations
        </h2>
        <p className="text-muted-foreground">
          Please log in to manage your price negotiations.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-ocid="negotiations.page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-primary" />
          Negotiations
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage price offers for your listings and track your own offers.
        </p>
      </div>

      <Tabs defaultValue="received" data-ocid="negotiations.tab">
        <TabsList className="mb-6">
          <TabsTrigger value="received" data-ocid="negotiations.received.tab">
            Received Offers
          </TabsTrigger>
          <TabsTrigger value="sent" data-ocid="negotiations.sent.tab">
            My Offers
          </TabsTrigger>
        </TabsList>

        {/* Received Offers */}
        <TabsContent value="received">
          {ownerQuery.isLoading ? (
            <div
              className="space-y-3"
              data-ocid="negotiations.received.loading_state"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : !ownerQuery.data || ownerQuery.data.length === 0 ? (
            <div
              className="text-center py-16"
              data-ocid="negotiations.received.empty_state"
            >
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No offers received yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ownerQuery.data.map(([id, neg, rental], i) => (
                <Card
                  key={String(id)}
                  className="border-0 shadow-md"
                  data-ocid={`negotiations.received.item.${i + 1}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">
                        {rental.title}
                      </CardTitle>
                      {statusBadge(neg.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="font-semibold text-primary">
                        Offer: ₹{Number(neg.offerPrice).toLocaleString("en-IN")}
                      </span>
                      <span className="text-muted-foreground">
                        Listed: ₹{Number(rental.price).toLocaleString("en-IN")}
                        /mo
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                      "{neg.message}"
                    </p>
                    {neg.status === "Pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() =>
                            respondMutation.mutate({ id, status: "Accepted" })
                          }
                          disabled={respondMutation.isPending}
                          data-ocid={`negotiations.accept.button.${i + 1}`}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() =>
                            respondMutation.mutate({ id, status: "Rejected" })
                          }
                          disabled={respondMutation.isPending}
                          data-ocid={`negotiations.reject.button.${i + 1}`}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Offers */}
        <TabsContent value="sent">
          {buyerQuery.isLoading ? (
            <div
              className="space-y-3"
              data-ocid="negotiations.sent.loading_state"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : !buyerQuery.data || buyerQuery.data.length === 0 ? (
            <div
              className="text-center py-16"
              data-ocid="negotiations.sent.empty_state"
            >
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                You haven&apos;t sent any offers yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {buyerQuery.data.map(([id, neg, rental], i) => (
                <Card
                  key={String(id)}
                  className="border-0 shadow-md"
                  data-ocid={`negotiations.sent.item.${i + 1}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">
                        {rental.title}
                      </CardTitle>
                      {statusBadge(neg.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="font-semibold text-primary">
                        Your offer: ₹
                        {Number(neg.offerPrice).toLocaleString("en-IN")}
                      </span>
                      <span className="text-muted-foreground">
                        Listed: ₹{Number(rental.price).toLocaleString("en-IN")}
                        /mo
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                      "{neg.message}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
