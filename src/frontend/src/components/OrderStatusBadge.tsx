import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  if (status === "Pending") {
    return (
      <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
        Pending
      </Badge>
    );
  }

  if (status === "Accepted") {
    return (
      <Badge className="bg-green-600 hover:bg-green-700 text-white">
        Accepted
      </Badge>
    );
  }

  if (status === "Completed") {
    return (
      <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
        Completed
      </Badge>
    );
  }

  if (status === "Cancelled") {
    return (
      <Badge className="bg-gray-500 hover:bg-gray-600 text-white">
        Cancelled
      </Badge>
    );
  }

  return <Badge variant="outline">{status}</Badge>;
}
