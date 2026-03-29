import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useActor } from "./useActor";

export function useBlockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blockedUser: any) => {
      if (!actor) throw new Error("Actor not initialized");
      return (actor as any).blockUser(blockedUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
      toast.success("User blocked successfully");
    },
    onError: () => {
      toast.error("Failed to block user");
    },
  });
}
