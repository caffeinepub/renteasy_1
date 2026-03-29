import { useQuery } from "@tanstack/react-query";
import type { backendInterface } from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useIsInCart(rentalTitle: string) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["isInCart", rentalTitle],
    queryFn: () =>
      (actor as unknown as backendInterface)!.isInCart(rentalTitle),
    enabled: !!actor && !!identity,
  });
}
