import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { updatePost } from "./action";

export function useSavePostMutation() {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: updatePost,
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to post. Please try again.",
        duration: 3000,
      });
    },
  });
  return mutation;
}
