import { useQuery } from "@tanstack/react-query";
import type { backendInterface } from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useMyCart() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["myCart"],
    queryFn: () => (actor as unknown as backendInterface)!.getMyCart(),
    enabled: !!actor && !!identity,
  });
}
