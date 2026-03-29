import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

interface CreateOrderParams {
  rentalTitle: string;
  buyerPhone: string;
  buyerEmail: string;
  buyerAddress: string;
  buyerName: string;
  duration: string;
  totalPrice: bigint;
  startDate: bigint;
  endDate: bigint;
}

export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateOrderParams) => {
      if (!actor) {
        throw new Error("Actor not initialized");
      }

      return await (actor as any).createOrder(
        params.rentalTitle,
        params.buyerPhone,
        params.buyerEmail,
        params.buyerAddress,
        params.buyerName,
        params.duration,
        params.totalPrice,
        params.startDate,
        params.endDate,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyerOrders"] });
    },
    onError: (error: any) => {
      console.error("Failed to create order:", error);
    },
  });
}
