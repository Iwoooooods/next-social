import { Button } from "@/components/ui/button";
import { CollectionInfo } from "@/lib/types";
import { BookMarked, Bookmark } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";

export default function CollectionButton({
  postId,
  initialState,
  className,
}: {
  postId: string;
  initialState: CollectionInfo;
  className?: string;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ["collection-info", postId];
  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/collects`).json<CollectionInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });
  const { mutate } = useMutation({
    mutationFn: () =>
      data.isCollectedByUser
        ? kyInstance
            .delete(`/api/posts/${postId}/collects`)
            .json<CollectionInfo>()
        : kyInstance
            .post(`/api/posts/${postId}/collects`)
            .json<CollectionInfo>(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<CollectionInfo>(queryKey);
      queryClient.setQueryData<CollectionInfo>(queryKey, () => ({
        isCollectedByUser: !prev?.isCollectedByUser,
      }));
      return { prev };
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.prev);
      toast({
        title: "Error",
        description: "Failed to collect post",
        variant: "destructive",
      });
    },
  });
  return (
    <Button variant="ghost" onClick={() => mutate()} className={className}>
      {data.isCollectedByUser ? (
        <Bookmark color="#ff8585" fill="#ff8585" />
      ) : (
        <Bookmark />
      )}
    </Button>
  );
}
