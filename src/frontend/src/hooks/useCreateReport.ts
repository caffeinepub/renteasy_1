import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useActor } from "./useActor";

interface CreateReportParams {
  rentalTitle: string;
  reportedUser: any;
  reason: string;
}

export function useCreateReport() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: CreateReportParams) => {
      if (!actor) throw new Error("Actor not initialized");
      return (actor as any).createReport(
        params.rentalTitle,
        params.reportedUser,
        params.reason,
      );
    },
    onSuccess: () => {
      toast.success("Report submitted successfully");
    },
    onError: () => {
      toast.error("Failed to submit report");
    },
  });
}
