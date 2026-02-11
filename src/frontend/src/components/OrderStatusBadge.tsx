import { Badge } from '@/components/ui/badge';

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  if (status === 'Pending') {
    return (
      <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
        Pending
      </Badge>
    );
  }

  if (status === 'Accepted') {
    return (
      <Badge className="bg-green-600 hover:bg-green-700 text-white">
        Accepted
      </Badge>
    );
  }

  return <Badge variant="outline">{status}</Badge>;
}
