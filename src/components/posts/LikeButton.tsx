import { LikeInfo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { useToast } from "@/components/ui/use-toast";

export default function LikeButton({
  postId,
  initialState,
  className,
}: {
  postId: string;
  initialState: LikeInfo;
  className?: string;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ["liked-info", postId];
  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/likes`).json<LikeInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isLikedByUser
        ? kyInstance.delete(`/api/posts/${postId}/likes`).json<LikeInfo>()
        : kyInstance.post(`/api/posts/${postId}/likes`).json<LikeInfo>(),
    onMutate: () => {
      queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<LikeInfo>(queryKey);
      queryClient.setQueryData(queryKey, () => ({
        likes: (prev?.likes ?? 0) + (data.isLikedByUser ? -1 : 1),
        isLikedByUser: !prev?.isLikedByUser,
      }));

      return { prev };
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.prev);
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    },
  });
  return (
    <div className="flex flex-col items-center"><Button variant="ghost" onClick={() => mutate()} className={className}>
      {data.isLikedByUser ? (
        <ThumbsUp color="#ff8585" fill="#ff8585" />
      ) : (
        <ThumbsUp />
      )}
    </Button><div className="text-sm font-medium">{data.likes} likes</div></div>
    
  );
}
