import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { submitPost } from "@/components/posts/editor/action";

export function useSubmitPostMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: ["post-feed", "for-you"],
        }),
        queryClient.refetchQueries({
          queryKey: ["user-posts", newPost.user.id],
        }),
      ]);

      toast({
        description: "Post created",
        duration: 3000,
      });
    },
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
